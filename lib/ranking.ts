import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Creator Ranking Algorithm
 * Calculates a score from 0-100 based on multiple factors
 */

interface RankingFactors {
    videoQualityScore: number;      // 0-20 points
    conversionRate: number;          // 0-15 points
    selectionRate: number;           // 0-15 points
    responseTimeScore: number;       // 0-15 points
    reviewScore: number;             // 0-15 points
    participationScore: number;      // 0-10 points
    disputePenalty: number;          // negative points
}

export async function calculateCreatorRanking(creatorId: string): Promise<{
    score: number;
    factors: RankingFactors;
    change: number;
    reason: string;
}> {
    // Fetch creator profile and related data
    const creator = await prisma.user.findUnique({
        where: { id: creatorId },
        include: {
            creatorProfile: true,
            assignedVideos: {
                include: {
                    campaign: true,
                },
            },
            applications: true,
            initiatedDisputes: {
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
                    },
                },
            },
        },
    });

    if (!creator || !creator.creatorProfile) {
        throw new Error('Creator not found');
    }

    const profile = creator.creatorProfile;
    const previousScore = profile.rankingScore;

    // 1. Video Quality Score (0-20 points)
    const approvedVideos = creator.assignedVideos.filter(v => v.status === 'APPROVED' || v.status === 'POSTED');
    const totalVideos = creator.assignedVideos.length;
    const approvalRate = totalVideos > 0 ? approvedVideos.length / totalVideos : 0;
    const videoQualityScore = Math.min(20, approvalRate * 20);

    // 2. Conversion Rate (0-15 points)
    // Based on performance bonus eligibility
    const videosWithBonus = creator.assignedVideos.filter(v => v.performanceBonusPaid);
    const conversionRate = totalVideos > 0 ? videosWithBonus.length / totalVideos : 0;
    const conversionScore = Math.min(15, conversionRate * 15);

    // 3. Selection Rate (0-15 points)
    const totalApplications = creator.applications.length;
    const acceptedApplications = creator.applications.filter(a => a.status === 'ACCEPTED').length;
    const selectionRate = totalApplications > 0 ? acceptedApplications / totalApplications : 0;
    const selectionScore = Math.min(15, selectionRate * 15);

    // 4. Response Time (0-15 points)
    const avgResponseTimeHours = profile.avgResponseTimeHours;
    let responseTimeScore = 0;
    if (avgResponseTimeHours < 6) {
        responseTimeScore = 15;
    } else if (avgResponseTimeHours < 24) {
        responseTimeScore = 10;
    } else if (avgResponseTimeHours < 48) {
        responseTimeScore = 5;
    }

    // 5. Reviews & Feedback (0-15 points)
    const avgRating = Number(profile.avgRating);
    const reviewScore = Math.min(15, (avgRating / 5) * 15);

    // 6. Campaign Participation (0-10 points)
    const completedCampaigns = creator.assignedVideos.filter(
        v => v.status === 'POSTED' || v.status === 'LOCKED'
    ).length;
    const participationRate = totalVideos > 0 ? completedCampaigns / totalVideos : 0;
    const participationScore = Math.min(10, participationRate * 10);

    // 7. Disputes (negative weight)
    const activeDisputes = creator.initiatedDisputes.filter(d => d.status === 'PENDING' || d.status === 'UNDER_REVIEW');
    const resolvedDisputes = creator.initiatedDisputes.filter(d => d.status === 'RESOLVED');
    const disputePenalty = (activeDisputes.length * 5) + (resolvedDisputes.length * 2);

    // Calculate total score
    const factors: RankingFactors = {
        videoQualityScore,
        conversionRate: conversionScore,
        selectionRate: selectionScore,
        responseTimeScore,
        reviewScore,
        participationScore,
        disputePenalty,
    };

    let totalScore =
        videoQualityScore +
        conversionScore +
        selectionScore +
        responseTimeScore +
        reviewScore +
        participationScore -
        disputePenalty;

    // Ensure score is between 0 and 100
    totalScore = Math.max(0, Math.min(100, totalScore));

    // Calculate change
    const change = totalScore - previousScore;

    // Generate reason for change
    let reason = '';
    if (change > 0) {
        const topFactor = Object.entries(factors)
            .filter(([key]) => key !== 'disputePenalty')
            .sort(([, a], [, b]) => b - a)[0];
        reason = `Improved ${topFactor[0].replace(/Score$/, '')}`;
    } else if (change < 0) {
        if (disputePenalty > 0) {
            reason = 'Dispute filed';
        } else {
            reason = 'Performance metrics decreased';
        }
    } else {
        reason = 'No change';
    }

    return {
        score: Math.round(totalScore),
        factors,
        change: Math.round(change),
        reason,
    };
}

/**
 * Update creator ranking and create notification if changed
 */
export async function updateCreatorRanking(
    creatorId: string,
    reason?: string
): Promise<void> {
    const ranking = await calculateCreatorRanking(creatorId);

    // Update creator profile
    const profile = await prisma.creatorProfile.findUnique({
        where: { userId: creatorId },
    });

    if (!profile) return;

    // Update ranking history
    const history = (profile.rankingHistory as any[]) || [];
    history.push({
        date: new Date().toISOString(),
        score: ranking.score,
        reason: reason || ranking.reason,
    });

    // Keep only last 30 entries
    const recentHistory = history.slice(-30);

    await prisma.creatorProfile.update({
        where: { userId: creatorId },
        data: {
            rankingScore: ranking.score,
            videoQualityScore: ranking.factors.videoQualityScore,
            conversionRate: ranking.factors.conversionRate,
            selectionRate: ranking.factors.selectionRate,
            avgResponseTimeHours: profile.avgResponseTimeHours,
            campaignParticipationRate: ranking.factors.participationScore * 10, // Convert back to percentage
            disputeCount: await prisma.dispute.count({
                where: { initiatorId: creatorId },
            }),
            rankingHistory: recentHistory,
            lastRankingUpdate: new Date(),
        },
    });

    // Create notification if ranking changed significantly
    if (Math.abs(ranking.change) >= 2) {
        const message = ranking.change > 0
            ? `🎉 Ranking increased (+${ranking.change}): ${reason || ranking.reason}`
            : `⚠️ Ranking decreased (${ranking.change}): ${reason || ranking.reason}`;

        await prisma.notification.create({
            data: {
                userId: creatorId,
                type: 'PERFORMANCE_ALERT',
                title: 'Ranking Updated',
                message,
                link: '/creator/dashboard',
                metadata: {
                    previousScore: profile.rankingScore,
                    newScore: ranking.score,
                    change: ranking.change,
                },
            },
        });
    }
}

/**
 * Get category average ranking for comparison
 */
export async function getCategoryAverageRanking(categories: string[]): Promise<number> {
    if (categories.length === 0) return 50;

    const profiles = await prisma.creatorProfile.findMany({
        where: {
            categories: {
                hasSome: categories,
            },
        },
        select: {
            rankingScore: true,
        },
    });

    if (profiles.length === 0) return 50;

    const sum = profiles.reduce((acc, p) => acc + p.rankingScore, 0);
    return Math.round(sum / profiles.length);
}
