import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export const GET = requireRole(['FOUNDER'], async (request: NextRequest, user) => {
    try {
        const suggestions: any[] = [];
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);

        // Get founder's campaigns and videos
        const campaigns = await prisma.campaign.findMany({
            where: {
                founderId: user.userId,
                status: {
                    in: ['ACTIVE', 'IN_PROGRESS', 'ACTIVE_ACCEPTING_APPLICATIONS']
                }
            },
            include: {
                videos: {
                    where: {
                        status: {
                            in: ['POSTED', 'COMPLETED']
                        }
                    },
                    include: {
                        creator: {
                            select: {
                                id: true,
                                fullName: true
                            }
                        }
                    }
                }
            }
        });

        // 1. Check for declining performance
        campaigns.forEach(campaign => {
            const recentVideos = campaign.videos.filter(v =>
                v.updatedAt >= weekAgo
            );
            const olderVideos = campaign.videos.filter(v =>
                v.updatedAt < weekAgo
            );

            if (recentVideos.length > 0 && olderVideos.length > 0) {
                const recentAvgViews = recentVideos.reduce((sum, v) => sum + (v.views || 0), 0) / recentVideos.length;
                const olderAvgViews = olderVideos.reduce((sum, v) => sum + (v.views || 0), 0) / olderVideos.length;

                if (recentAvgViews < olderAvgViews * 0.7) { // 30% decline
                    suggestions.push({
                        type: 'PERFORMANCE_DECLINE',
                        priority: 9,
                        title: `Performance declining for ${campaign.name}`,
                        description: `Views dropped ${Math.round((1 - recentAvgViews / olderAvgViews) * 100)}% this week`,
                        actionType: 'view_campaign',
                        actionData: { campaignId: campaign.id },
                        actionUrl: `/founder/campaigns/${campaign.id}`
                    });
                }
            }
        });

        // 2. Identify high-performing creators
        const creatorPerformance = new Map<string, { name: string; avgViews: number; videoCount: number }>();

        campaigns.forEach(campaign => {
            campaign.videos.forEach(video => {
                if (video.creator) {
                    const existing = creatorPerformance.get(video.creator.id) || {
                        name: video.creator.fullName || 'Unknown',
                        avgViews: 0,
                        videoCount: 0
                    };
                    existing.avgViews = (existing.avgViews * existing.videoCount + (video.views || 0)) / (existing.videoCount + 1);
                    existing.videoCount++;
                    creatorPerformance.set(video.creator.id, existing);
                }
            });
        });

        // Find top performer
        let topCreator: { id: string; name: string; avgViews: number } | null = null;
        creatorPerformance.forEach((data, id) => {
            if (data.videoCount >= 2 && (!topCreator || data.avgViews > topCreator.avgViews)) {
                topCreator = { id, name: data.name, avgViews: data.avgViews };
            }
        });

        if (topCreator && topCreator.avgViews > 5000) {
            suggestions.push({
                type: 'CREATOR_PERFORMANCE',
                priority: 7,
                title: `${topCreator.name} is performing well`,
                description: `Averaging ${Math.round(topCreator.avgViews).toLocaleString()} views per video`,
                actionType: 'create_campaign_with_creator',
                actionData: { creatorId: topCreator.id },
                actionUrl: `/founder/campaigns/create?creatorId=${topCreator.id}`
            });
        }

        // 3. Check for upcoming deadlines
        const urgentDeadlines = await prisma.video.count({
            where: {
                campaign: {
                    founderId: user.userId
                },
                status: 'PENDING_REVIEW',
                deadline: {
                    gte: now,
                    lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) // Next 24 hours
                }
            }
        });

        if (urgentDeadlines > 0) {
            suggestions.push({
                type: 'DEADLINE_APPROACHING',
                priority: 10,
                title: `${urgentDeadlines} video${urgentDeadlines > 1 ? 's' : ''} need review`,
                description: 'Deadlines within 24 hours',
                actionType: 'view_deadlines',
                actionData: {},
                actionUrl: '/founder/dashboard'
            });
        }

        // 4. Budget optimization
        const lowBudgetCampaigns = campaigns.filter(c =>
            Number(c.escrowBalance) < Number(c.totalBudget) * 0.2
        );

        if (lowBudgetCampaigns.length > 0) {
            suggestions.push({
                type: 'BUDGET_OPTIMIZATION',
                priority: 6,
                title: 'Low budget on active campaigns',
                description: `${lowBudgetCampaigns.length} campaign${lowBudgetCampaigns.length > 1 ? 's' : ''} running low on funds`,
                actionType: 'add_budget',
                actionData: { campaignId: lowBudgetCampaigns[0].id },
                actionUrl: `/founder/campaigns/${lowBudgetCampaigns[0].id}`
            });
        }

        // 5. Platform-specific insights
        const platformStats = new Map<string, { views: number; count: number }>();
        campaigns.forEach(campaign => {
            campaign.videos.forEach(video => {
                if (video.platform) {
                    const existing = platformStats.get(video.platform) || { views: 0, count: 0 };
                    existing.views += video.views || 0;
                    existing.count++;
                    platformStats.set(video.platform, existing);
                }
            });
        });

        let bestPlatform: { platform: string; avgViews: number } | null = null;
        platformStats.forEach((data, platform) => {
            const avgViews = data.views / data.count;
            if (data.count >= 3 && (!bestPlatform || avgViews > bestPlatform.avgViews)) {
                bestPlatform = { platform, avgViews };
            }
        });

        if (bestPlatform && bestPlatform.avgViews > 3000) {
            suggestions.push({
                type: 'FORMAT_TRENDING',
                priority: 8,
                title: `${bestPlatform.platform} performing well`,
                description: `Averaging ${Math.round(bestPlatform.avgViews).toLocaleString()} views`,
                actionType: 'create_campaign',
                actionData: { platform: bestPlatform.platform },
                actionUrl: `/founder/campaigns/create?platform=${bestPlatform.platform.toLowerCase()}`
            });
        }

        // Sort by priority and return top 5
        const topSuggestions = suggestions
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 5)
            .map(s => ({
                ...s,
                id: `suggestion-${Date.now()}-${Math.random()}`,
                createdAt: now.toISOString()
            }));

        return NextResponse.json({
            success: true,
            data: {
                suggestions: topSuggestions
            }
        });

    } catch (error: any) {
        console.error('Error generating suggestions:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
