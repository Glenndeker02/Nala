import { prisma } from "@/lib/prisma";

interface CreatorProfile {
    niche?: string;
    avgViews?: number;
    engagementRate?: number;
    completedCampaigns?: number;
}

export class RecommendationService {

    /**
     * Calculate similarity score between creator and campaign
     */
    private calculateCampaignMatch(
        creator: any,
        campaign: any,
        creatorStats: { avgViews: number; engagementRate: number; completedCount: number; avgConversionRate: number }
    ): number {
        let score = 0;

        // 1. Niche/Industry Match (40 points)
        const niche = creator.CreatorProfile?.niche?.toLowerCase() || '';
        const industry = campaign.industry?.toLowerCase() || '';

        if (niche && industry) {
            if (niche === industry) {
                score += 40; // Perfect match
            } else if (niche.includes(industry) || industry.includes(niche)) {
                score += 25; // Partial match
            } else {
                score += 5; // Different but still possible
            }
        } else {
            score += 10; // No data, neutral score
        }

        // 2. Budget Alignment (20 points)
        const budgetPerVideo = Number(campaign.totalBudget) / (campaign.numberOfVideos || 1);
        if (budgetPerVideo >= 500) score += 20;
        else if (budgetPerVideo >= 200) score += 15;
        else if (budgetPerVideo >= 100) score += 10;
        else score += 5;

        // 3. Creator Performance Match (20 points)
        // Higher engagement creators get matched with premium campaigns
        if (creatorStats.engagementRate > 5 && budgetPerVideo > 300) {
            score += 20;
        } else if (creatorStats.engagementRate > 3 && budgetPerVideo > 150) {
            score += 15;
        } else {
            score += 10;
        }

        // 4. Platform Match (10 points)
        const creatorPlatforms = creator.CreatorProfile?.platforms || [];
        const campaignPlatform = campaign.platform;
        if (campaignPlatform && creatorPlatforms.includes(campaignPlatform)) {
            score += 10;
        } else if (creatorPlatforms.length === 0) {
            score += 5; // No platform data
        }

        // 5. Success History Bonus (10 points)
        if (creatorStats.completedCount > 10) {
            score += 10;
        } else if (creatorStats.completedCount > 5) {
            score += 7;
        } else if (creatorStats.completedCount > 0) {
            score += 5;
        }

        // 6. Conversion Capability (20 points)
        // If campaign has high budget, prioritize high conversion creators
        if (budgetPerVideo > 400) {
            if (creatorStats.avgConversionRate > 5) score += 20;
            else if (creatorStats.avgConversionRate > 2) score += 10;
        } else {
            // For lower budget, conversion is less critical but still good
            if (creatorStats.avgConversionRate > 3) score += 10;
        }

        return Math.min(100, score); // Cap at 100
    }

    /**
     * Get creator statistics for better matching
     */
    private async getCreatorStats(creatorId: string) {
        const videos = await prisma.video.findMany({
            where: {
                creatorId,
                status: { in: ['POSTED', 'LOCKED'] }
            }
        });

        const completedCampaigns = await prisma.video.findMany({
            where: {
                creatorId,
                status: 'LOCKED'
            },
            distinct: ['campaignId']
        });

        const avgViews = videos.length > 0
            ? videos.reduce((sum: number, v: any) => sum + v.currentViewCount, 0) / videos.length
            : 0;

        // Mock engagement rate - in production, calculate from analytics
        const engagementRate = avgViews > 50000 ? 5.5 : avgViews > 10000 ? 3.5 : 2.0;

        const variants = await prisma.uGCVariant.findMany({
            where: { creatorId, status: 'ACTIVE' },
            include: { metrics: { orderBy: { date: 'desc' }, take: 1 } }
        });

        let avgConversionRate = 0;
        if (variants.length > 0) {
            const total = variants.reduce((sum: number, v: any) => sum + Number(v.metrics[0]?.conversionRate || 0), 0);
            avgConversionRate = total / variants.length;
        }

        return {
            avgViews,
            engagementRate,
            completedCount: completedCampaigns.length,
            avgConversionRate
        };
    }

    /**
     * Generate campaign recommendations for a creator using advanced matching
     */
    async recommendCampaignsForCreator(creatorId: string) {
        // 1. Fetch creator profile with all relevant data
        const creator = await prisma.user.findUnique({
            where: { id: creatorId },
            include: {
                CreatorProfile: true,
                videos: {
                    where: { status: { in: ['POSTED', 'LOCKED'] } },
                    take: 10,
                    orderBy: { postedAt: 'desc' }
                }
            }
        });

        if (!creator) return;

        // 2. Get creator statistics
        const creatorStats = await this.getCreatorStats(creatorId);

        // 3. Fetch active campaigns (exclude ones creator already applied to)
        const existingApplications = await prisma.application.findMany({
            where: { creatorId },
            select: { campaignId: true }
        });

        const excludedCampaignIds = existingApplications.map((app: any) => app.campaignId);

        const campaigns = await prisma.campaign.findMany({
            where: {
                status: 'ACTIVE',
                id: { notIn: excludedCampaignIds }
            },
            include: {
                founder: {
                    select: { fullName: true, companyName: true }
                }
            }
        });

        const recommendations = [];

        // 4. Score each campaign
        for (const campaign of campaigns) {
            const score = this.calculateCampaignMatch(creator, campaign, creatorStats);

            // Generate personalized reason
            let reason = '';
            if (score >= 80) {
                reason = `Perfect match! This ${campaign.industry || 'campaign'} aligns with your niche and budget range.`;
            } else if (score >= 60) {
                reason = `Great opportunity in ${campaign.industry || 'your field'} with competitive compensation.`;
            } else if (score >= 40) {
                reason = `Good fit based on your profile and past performance.`;
            } else {
                reason = `Explore this opportunity to diversify your portfolio.`;
            }

            // Only recommend if score is above threshold
            if (score >= 30) {
                recommendations.push({
                    userId: creatorId,
                    type: 'CAMPAIGN',
                    targetId: campaign.id,
                    score,
                    reason,
                    metadata: {
                        campaignTitle: campaign.title,
                        industry: campaign.industry,
                        budget: Number(campaign.totalBudget),
                        founderName: campaign.founder.companyName || campaign.founder.fullName
                    },
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days validity
                });
            }
        }

        // 5. Delete old campaign recommendations
        await prisma.recommendation.deleteMany({
            where: { userId: creatorId, type: 'CAMPAIGN' }
        });

        // 6. Save top recommendations
        if (recommendations.length > 0) {
            recommendations.sort((a, b) => b.score - a.score);
            const topRecommendations = recommendations.slice(0, 15); // Top 15

            await prisma.recommendation.createMany({
                data: topRecommendations.map(r => ({
                    userId: r.userId,
                    type: 'CAMPAIGN',
                    targetId: r.targetId,
                    score: r.score,
                    reason: r.reason,
                    metadata: r.metadata,
                    expiresAt: r.expiresAt
                }))
            });
        }
    }

    /**
     * Recommend creators for a campaign (for founders)
     */
    async recommendCreatorsForCampaign(campaignId: string, founderId: string) {
        // 1. Fetch campaign details
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId }
        });

        if (!campaign) return;

        // 2. Fetch all creators
        const creators = await prisma.user.findMany({
            where: { role: 'CREATOR' },
            include: {
                CreatorProfile: true,
                videos: {
                    where: { status: { in: ['POSTED', 'LOCKED'] } },
                    take: 5
                }
            }
        });

        const recommendations = [];

        // 3. Score each creator
        for (const creator of creators) {
            const creatorStats = await this.getCreatorStats(creator.id);
            const score = this.calculateCampaignMatch(creator, campaign, creatorStats);

            if (score >= 40) {
                recommendations.push({
                    userId: founderId,
                    type: 'CREATOR',
                    targetId: creator.id,
                    score,
                    reason: `Highly rated creator with ${creatorStats.completedCount} completed campaigns`,
                    metadata: {
                        creatorName: creator.fullName,
                        avgViews: creatorStats.avgViews,
                        engagementRate: creatorStats.engagementRate
                    },
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                });
            }
        }

        // 4. Save recommendations
        if (recommendations.length > 0) {
            recommendations.sort((a, b) => b.score - a.score);
            const topRecommendations = recommendations.slice(0, 10);

            // Delete old creator recommendations for this founder
            await prisma.recommendation.deleteMany({
                where: { userId: founderId, type: 'CREATOR' }
            });

            await prisma.recommendation.createMany({
                data: topRecommendations.map(r => ({
                    userId: r.userId,
                    type: 'CREATOR',
                    targetId: r.targetId,
                    score: r.score,
                    reason: r.reason,
                    metadata: r.metadata,
                    expiresAt: r.expiresAt
                }))
            });
        }
    }

    /**
     * Update all recommendations (called by background job)
     */
    async updateAllRecommendations() {
        console.log("Starting recommendation refresh...");

        // Update creator recommendations
        const creators = await prisma.user.findMany({
            where: { role: 'CREATOR' }
        });

        console.log(`Generating recommendations for ${creators.length} creators...`);

        for (const creator of creators) {
            try {
                await this.recommendCampaignsForCreator(creator.id);
            } catch (err) {
                console.error(`Error generating recommendations for creator ${creator.id}:`, err);
            }
        }

        // Update founder recommendations
        const activeCampaigns = await prisma.campaign.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true, founderId: true }
        });

        console.log(`Generating creator recommendations for ${activeCampaigns.length} campaigns...`);

        for (const campaign of activeCampaigns) {
            try {
                await this.recommendCreatorsForCampaign(campaign.id, campaign.founderId);
            } catch (err) {
                console.error(`Error generating creator recommendations for campaign ${campaign.id}:`, err);
            }
        }

        console.log("Recommendation refresh complete.");
    }
}

export const recommendationService = new RecommendationService();
