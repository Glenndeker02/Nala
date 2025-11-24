import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { ApiResponse } from '@/lib/api-middleware';

/**
 * Cron Job: Lock Videos After 7 Days
 * 
 * This endpoint should be called daily to check for videos that have reached
 * their 7-day tracking window and lock them for final payment processing.
 * 
 * Setup with Vercel Cron:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/lock-videos",
 *     "schedule": "0 1 * * *"
 *   }]
 * }
 * 
 * Runs at 1:00 AM daily (after view updates at midnight)
 */

export async function GET(request: NextRequest) {
    try {
        // Verify cron secret for security
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return ApiResponse.error('Unauthorized', 401);
        }

        console.log('Starting video lock job...');

        const now = new Date();

        // Find all POSTED videos where lockedAt date has passed
        const videosToLock = await db.video.findMany({
            where: {
                status: 'POSTED',
                lockedAt: {
                    lte: now, // Lock date is less than or equal to now
                },
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        performanceBudget: true,
                        videosRequested: true,
                    },
                },
            },
        });

        console.log(`Found ${videosToLock.length} videos to lock`);

        if (videosToLock.length === 0) {
            return ApiResponse.success({
                message: 'No videos to lock',
                locked: 0,
            });
        }

        let successCount = 0;
        let failureCount = 0;
        const lockedVideos: any[] = [];

        for (const video of videosToLock) {
            try {
                // Calculate performance bonus
                const performanceBonusAmount = calculatePerformanceBonus(
                    video.currentViewCount || 0,
                    video.campaign.performanceBudget,
                    video.campaign.videosRequested
                );

                // Update video with locked status
                const updatedVideo = await db.video.update({
                    where: { id: video.id },
                    data: {
                        status: 'LOCKED',
                        lockedViewCount: video.currentViewCount,
                        performanceBonusAmount,
                        performanceBonusPaid: false, // Will be set to true after payment
                    },
                });

                // TODO: Trigger performance bonus payment via Stripe
                // TODO: Send notification to creator
                // TODO: Send notification to founder

                successCount++;
                lockedVideos.push({
                    videoId: video.id,
                    finalViews: video.currentViewCount,
                    performanceBonus: performanceBonusAmount,
                });

                console.log(`Locked video ${video.id} with ${video.currentViewCount} views, bonus: $${performanceBonusAmount}`);
            } catch (error) {
                console.error(`Failed to lock video ${video.id}:`, error);
                failureCount++;
            }
        }

        console.log(`Lock job complete: ${successCount} locked, ${failureCount} failures`);

        return ApiResponse.success({
            message: 'Videos locked successfully',
            totalVideos: videosToLock.length,
            successCount,
            failureCount,
            lockedVideos,
        });
    } catch (error) {
        console.error('Error in lock-videos cron job:', error);
        return ApiResponse.error('Failed to lock videos', 500);
    }
}

/**
 * Calculate performance bonus based on view count
 * 
 * Formula (simplified):
 * - Performance budget is split equally among all videos
 * - Each video gets a portion based on its view performance
 * - Minimum threshold: 1000 views to qualify for bonus
 * - Bonus scales linearly with views up to a cap
 */
function calculatePerformanceBonus(
    viewCount: number,
    totalPerformanceBudget: number,
    totalVideos: number
): number {
    // Minimum views to qualify for any bonus
    const MIN_VIEWS = 1000;

    if (viewCount < MIN_VIEWS) {
        return 0;
    }

    // Each video's max potential bonus (equal split)
    const maxBonusPerVideo = totalPerformanceBudget / totalVideos;

    // Simple linear scaling: $5 per 1000 views, capped at maxBonusPerVideo
    const bonusRate = 0.005; // $5 per 1000 views = $0.005 per view
    const calculatedBonus = viewCount * bonusRate;

    // Cap at the maximum allocated budget per video
    return Math.min(calculatedBonus, maxBonusPerVideo);
}

// Allow POST as well for manual triggering
export async function POST(request: NextRequest) {
    return GET(request);
}
