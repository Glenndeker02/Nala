import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { ApiResponse } from '@/lib/api-middleware';
import { batchFetchViewCounts } from '@/lib/social-apis/view-tracker';

/**
 * Cron Job: Update View Counts
 * 
 * This endpoint should be called daily (e.g., at midnight) to update view counts
 * for all POSTED videos that haven't been locked yet.
 * 
 * Setup with Vercel Cron:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/update-views",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 * 
 * Or use external cron service (e.g., cron-job.org) to call this endpoint daily.
 * 
 * Security: Verify cron secret to prevent unauthorized access
 */

export async function GET(request: NextRequest) {
    try {
        // Verify cron secret for security
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return ApiResponse.error('Unauthorized', 401);
        }

        console.log('Starting view count update job...');

        // Fetch all POSTED videos that haven't been locked
        const videos = await db.video.findMany({
            where: {
                status: 'POSTED',
                platform: {
                    in: ['TIKTOK', 'INSTAGRAM', 'FACEBOOK'],
                },
                platformVideoId: {
                    not: null,
                },
            },
            select: {
                id: true,
                platform: true,
                platformVideoId: true,
                finalPostUrl: true,
                currentViewCount: true,
            },
        });

        console.log(`Found ${videos.length} videos to update`);

        if (videos.length === 0) {
            return ApiResponse.success({
                message: 'No videos to update',
                updated: 0,
            });
        }

        // Batch fetch view counts
        const viewResults = await batchFetchViewCounts(
            videos.map(v => ({
                id: v.id,
                platform: v.platform as 'TIKTOK' | 'INSTAGRAM' | 'FACEBOOK',
                platformVideoId: v.platformVideoId!,
                postUrl: v.finalPostUrl || undefined,
            }))
        );

        let successCount = 0;
        let failureCount = 0;
        const updates: any[] = [];

        // Update database with new view counts
        for (const video of videos) {
            const result = viewResults.get(video.id);

            if (result?.success && result.viewCount !== null) {
                try {
                    // Update video record
                    await db.video.update({
                        where: { id: video.id },
                        data: {
                            currentViewCount: result.viewCount,
                            lastViewUpdate: new Date(),
                        },
                    });

                    // Create view snapshot
                    await db.viewSnapshot.create({
                        data: {
                            videoId: video.id,
                            viewCount: result.viewCount,
                            dataSource: result.dataSource,
                            snapshotAt: new Date(),
                        },
                    });

                    successCount++;
                    updates.push({
                        videoId: video.id,
                        previousViews: video.currentViewCount,
                        newViews: result.viewCount,
                        change: result.viewCount - (video.currentViewCount || 0),
                    });
                } catch (error) {
                    console.error(`Failed to update video ${video.id}:`, error);
                    failureCount++;
                }
            } else {
                console.warn(`Failed to fetch views for video ${video.id}:`, result?.error);
                failureCount++;
            }
        }

        console.log(`View update complete: ${successCount} success, ${failureCount} failures`);

        return ApiResponse.success({
            message: 'View counts updated',
            totalVideos: videos.length,
            successCount,
            failureCount,
            updates: updates.slice(0, 10), // Return first 10 updates for logging
        });
    } catch (error) {
        console.error('Error in update-views cron job:', error);
        return ApiResponse.error('Failed to update view counts', 500);
    }
}

// Allow POST as well for manual triggering
export async function POST(request: NextRequest) {
    return GET(request);
}
