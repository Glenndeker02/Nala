import { prisma } from "@/lib/prisma";
import { startOfDay, subDays, endOfDay } from "date-fns";

export class AnalyticsService {

    /**
     * Update analytics snapshots for a video based on its current total views
     */
    async updateVideoMetrics(videoId: string, currentTotalViews: number, engagementRate: number) {
        const today = startOfDay(new Date());

        // 1. Get the latest previous snapshot to calculate delta
        const lastSnapshot = await prisma.analyticsSnapshot.findFirst({
            where: {
                entityType: 'video',
                entityId: videoId,
                period: 'daily',
                periodStart: { lt: today }
            },
            orderBy: { periodStart: 'desc' }
        });

        // If no previous snapshot, assume all views happened today (or it's a new video)
        const previousTotalViews = lastSnapshot?.metadata ? (lastSnapshot.metadata as any).totalViews || 0 : 0;

        const viewsToday = Math.max(0, currentTotalViews - previousTotalViews);

        // 2. Upsert today's snapshot
        await prisma.analyticsSnapshot.upsert({
            where: {
                entityType_entityId_period_periodStart: {
                    entityType: 'video',
                    entityId: videoId,
                    period: 'daily',
                    periodStart: today
                }
            },
            update: {
                views: viewsToday,
                engagement: engagementRate,
                metadata: { totalViews: currentTotalViews }
            },
            create: {
                entityType: 'video',
                entityId: videoId,
                period: 'daily',
                periodStart: today,
                periodEnd: endOfDay(today),
                views: viewsToday,
                engagement: engagementRate,
                metadata: { totalViews: currentTotalViews }
            }
        });
    }

    /**
     * Update analytics snapshots for a campaign based on its videos
     */
    async updateCampaignMetrics(campaignId: string) {
        const today = startOfDay(new Date());

        // 1. Aggregate metrics from all videos in the campaign
        const videos = await prisma.video.findMany({
            where: { campaignId }
        });

        const currentTotalViews = videos.reduce((sum, v) => sum + v.currentViewCount, 0);

        // Calculate average engagement (simplified)
        // In reality, we'd weight this by views or fetch from snapshots
        // For now, we use a placeholder or calculate if we had engagement on video
        const totalEngagement = videos.reduce((sum, v) => sum + 0, 0); // Placeholder
        const avgEngagement = videos.length > 0 ? totalEngagement / videos.length : 0;

        // 2. Get previous snapshot
        const lastSnapshot = await prisma.analyticsSnapshot.findFirst({
            where: {
                entityType: 'campaign',
                entityId: campaignId,
                period: 'daily',
                periodStart: { lt: today }
            },
            orderBy: { periodStart: 'desc' }
        });

        const previousTotalViews = lastSnapshot?.metadata ? (lastSnapshot.metadata as any).totalViews || 0 : 0;
        const viewsToday = Math.max(0, currentTotalViews - previousTotalViews);

        // 3. Upsert snapshot
        await prisma.analyticsSnapshot.upsert({
            where: {
                entityType_entityId_period_periodStart: {
                    entityType: 'campaign',
                    entityId: campaignId,
                    period: 'daily',
                    periodStart: today
                }
            },
            update: {
                views: viewsToday,
                engagement: avgEngagement,
                metadata: { totalViews: currentTotalViews }
            },
            create: {
                entityType: 'campaign',
                entityId: campaignId,
                period: 'daily',
                periodStart: today,
                periodEnd: endOfDay(today),
                views: viewsToday,
                engagement: avgEngagement,
                metadata: { totalViews: currentTotalViews }
            }
        });
    }

    /**
     * Get analytics for a specific entity
     */
    async getEntityAnalytics(entityType: string, entityId: string, period: 'daily' | 'weekly' | 'monthly', startDate: Date, endDate: Date) {
        return await prisma.analyticsSnapshot.findMany({
            where: {
                entityType,
                entityId,
                period,
                periodStart: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { periodStart: 'asc' }
        });
    }
}

export const analyticsService = new AnalyticsService();
