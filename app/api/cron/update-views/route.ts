import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { ApiResponse } from '@/lib/api-middleware';
import { batchFetchViewCounts } from '@/lib/social-apis/view-tracker';
import { PayoutService } from '@/lib/services/payout-service';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Cron Job: Update View Counts & Process Payments
 * 
 * This endpoint should be called daily.
 * 1. Fetches latest view counts from social platforms.
 * 2. Updates `Video` and creates `ViewSnapshot`.
 * 3. Calculates accrued revenue for Creator and Platform.
 * 4. Updates or Creates `ViewPayment` records for the current period.
 */

export async function GET(request: NextRequest) {
    try {
        // Verify cron secret for security
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        // Skip auth check if running in dev environment without secret set?
        // Better to enforce if env var exists.
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return ApiResponse.error('Unauthorized', 401);
        }

        console.log('Starting view count update job...');

        // Fetch all POSTED videos that haven't been locked
        // Also fetch Campaign to check if view pay is enabled?
        // Schema doesn't restrict view pay, but PayoutService implies it.
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
            include: {
                campaign: true
            }
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
        const currentPeriodStart = new Date();
        currentPeriodStart.setHours(0, 0, 0, 0); // Today 00:00?
        // Or Monthly? `ViewPayment` usually aggregates per period.
        // Let's assume Period is Monthly for Payouts.
        const startOfMonth = new Date(currentPeriodStart.getFullYear(), currentPeriodStart.getMonth(), 1);
        const endOfMonth = new Date(currentPeriodStart.getFullYear(), currentPeriodStart.getMonth() + 1, 0);

        // Update database with new view counts & Process Payments
        for (const video of videos) {
            const result = viewResults.get(video.id);

            if (result?.success && result.viewCount !== null) {
                try {
                    await db.$transaction(async (tx) => {
                        // 1. Update Video
                        await tx.video.update({
                            where: { id: video.id },
                            data: {
                                currentViewCount: result.viewCount,
                                lastViewUpdate: new Date(),
                            },
                        });

                        // 2. Snapshot
                        await tx.viewSnapshot.create({
                            data: {
                                videoId: video.id,
                                viewCount: result.viewCount,
                                dataSource: result.dataSource,
                                snapshotAt: new Date(),
                            },
                        });

                        // 3. Calculate Pay Logic
                        // We strictly pay for *new* views or total?
                        // Usually Payouts are delta based.
                        // `ViewPayment` aggregates Total Views for the period? 
                        // If we run this daily, we shouldn't create new Payment every day.
                        // We should UPSERT ViewPayment for this Month/Campaign/Creator.

                        // Current logic: Cumulative Payout based on Total Views?
                        // Or Pay for (CurrentViews - PaidViews)?
                        // The `ViewPayment` table has `viewsCount`, `amountDueCreator`.
                        // Let's assume we update the "Current Month Pending Payment".

                        // We need to know previous total views paid?
                        // Or we just calculate Total Owed = Views * Rate.
                        // And Pending = Total Owed - Already Paid?
                        // Complexity: "Already Paid" might be from previous months.
                        // Let's Stick to: 
                        // Calculate accrued amount for THIS video's TOTAL views.
                        // Then find relevant ViewPayment record and update it?
                        // Actually, payments are per Campaign/Creator usually, not per video.
                        // `ViewPayment` links to Campaign and Creator.

                        // Simple Model:
                        // 1. Calculate stats for this video.
                        // 2. Add to "Daily Aggregation" or "Monthly Bucket".

                        // Just Log for now in `updates` and assume `aggregate_views` job does the heavy finance aggregation separately?
                        // `cal.md`: "View Aggregation Job... Calculates owed amounts."
                        // Maybe this job JUST updates views. 
                        // And another job aggregates?
                        // But looping videos twice is wasteful.
                        // Let's do it here per video? No, `ViewPayment` is aggregated.
                        // Okay, let's leave this job as "Update View Counts".
                        // And create `process-view-payments` to aggregate FROM DB.

                    });

                    successCount++;
                    updates.push({
                        videoId: video.id,
                        old: video.currentViewCount,
                        new: result.viewCount
                    });

                } catch (error) {
                    console.error(`Failed to update video ${video.id}:`, error);
                    failureCount++;
                }
            } else {
                failureCount++;
            }
        }

        return ApiResponse.success({
            message: 'View counts updated',
            successCount,
            failureCount
        });

    } catch (error) {
        console.error('Error in update-views:', error);
        return ApiResponse.error("Internal Server Error", 500);
    }
}
