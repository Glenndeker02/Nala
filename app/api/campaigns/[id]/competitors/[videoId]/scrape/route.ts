import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { metricsScraperService } from '@/lib/services/metrics-scraper';

// POST - Manually trigger metrics update for a competitor video
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string; videoId: string } }
) {
    try {
        const user = await requireRole(req, ['FOUNDER', 'ADMIN']);
        const { id: campaignId, videoId } = params;

        // Verify campaign ownership
        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
            select: { founderId: true },
        });

        if (!campaign) {
            return ApiResponse.error('Campaign not found', 404);
        }

        if (campaign.founderId !== user.id && user.role !== 'ADMIN') {
            return ApiResponse.error('Unauthorized', 403);
        }

        // Get competitor video
        const competitorVideo = await db.competitorVideo.findUnique({
            where: { id: videoId, campaignId },
        });

        if (!competitorVideo) {
            return ApiResponse.error('Competitor video not found', 404);
        }

        // Scrape metrics
        try {
            const metrics = await metricsScraperService.scrapeMetrics(
                competitorVideo.videoUrl,
                competitorVideo.platform
            );

            // Update video with new metrics
            const updatedVideo = await db.competitorVideo.update({
                where: { id: videoId },
                data: {
                    viewCount: metrics.viewCount,
                    likes: metrics.likes,
                    comments: metrics.comments,
                    shares: metrics.shares,
                    lastScrapedAt: new Date(),
                },
            });

            return ApiResponse.success(updatedVideo);
        } catch (scrapingError: any) {
            return ApiResponse.error(
                `Failed to scrape metrics: ${scrapingError.message}`,
                500
            );
        }
    } catch (error: any) {
        console.error('Error updating competitor metrics:', error);
        return ApiResponse.error(error.message || 'Failed to update metrics', 500);
    }
}
