import db from '@/lib/db';
import { metricsScraperService } from '@/lib/services/metrics-scraper';

/**
 * Metrics Updater Cron Job
 * Runs periodically to update metrics for founder videos and competitor videos.
 */
export async function runMetricsUpdate() {
    console.log('[Metrics Update] Starting metrics update job...');

    try {
        // 1. Update Founder Video Metrics
        const founderVideos = await db.founderVideo.findMany({
            where: {
                platformVideoId: { not: null },
            },
        });

        console.log(`[Metrics Update] Found ${founderVideos.length} founder videos to update`);

        for (const video of founderVideos) {
            if (!video.platformVideoId || !video.platform) continue;

            try {
                // Construct a dummy URL since the scraper expects it
                const dummyUrl = `https://example.com/video/${video.platformVideoId}`;

                const metrics = await metricsScraperService.scrapeMetrics(
                    dummyUrl,
                    video.platform
                );

                await db.founderVideo.update({
                    where: { id: video.id },
                    data: {
                        viewCount: metrics.viewCount,
                        likeCount: metrics.likes,
                        commentCount: metrics.comments,
                        shareCount: metrics.shares,
                        lastScrapedAt: new Date(),
                    },
                });

                console.log(`[Metrics Update] Updated founder video ${video.id}`);
            } catch (error) {
                console.error(`[Metrics Update] Failed to update founder video ${video.id}:`, error);
            }
        }

        // 2. Update Competitor Video Metrics
        const competitorVideos = await db.competitorVideo.findMany({
            where: {
                platformVideoId: { not: null },
            },
        });

        console.log(`[Metrics Update] Found ${competitorVideos.length} competitor videos to update`);

        for (const video of competitorVideos) {
            if (!video.platformVideoId || !video.platform) continue;

            try {
                const dummyUrl = `https://example.com/video/${video.platformVideoId}`;

                const metrics = await metricsScraperService.scrapeMetrics(
                    dummyUrl,
                    video.platform
                );

                await db.competitorVideo.update({
                    where: { id: video.id },
                    data: {
                        viewCount: metrics.viewCount,
                        likeCount: metrics.likes,
                        commentCount: metrics.comments,
                        shareCount: metrics.shares,
                        lastScrapedAt: new Date(),
                    },
                });

                console.log(`[Metrics Update] Updated competitor video ${video.id}`);
            } catch (error) {
                console.error(`[Metrics Update] Failed to update competitor video ${video.id}:`, error);
            }
        }

        console.log('[Metrics Update] Job completed');
    } catch (error) {
        console.error('[Metrics Update] Fatal error:', error);
    }
}
