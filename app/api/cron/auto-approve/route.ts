import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { ApiResponse } from '@/lib/api-middleware';

/**
 * Cron Job: Auto-Approve Content (Deadline Exceeded)
 * 
 * This endpoint should be called every 4 hours to check for revision requests
 * that have exceeded their deadline and auto-approve them.
 * 
 * Setup with Vercel Cron:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/auto-approve",
 *     "schedule": "0 */4 * * * "
    *   }]
 * }
 * 
 * Runs every 4 hours
    */

export async function GET(request: NextRequest) {
    try {
        // Verify cron secret for security
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return ApiResponse.error('Unauthorized', 401);
        }

        console.log('Starting auto-approve job...');

        const now = new Date();

        // Find all videos with REVISION_REQUESTED status where deadline has passed
        const expiredRevisions = await db.video.findMany({
            where: {
                status: 'REVISION_REQUESTED',
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true,
                        founderId: true,
                    }
                },
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    }
                },
                revisions: {
                    where: {
                        resolvedAt: null, // Unresolved revisions
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                }
            },
        });

        // Filter for those where the latest revision deadline has passed
        const videosToAutoApprove = expiredRevisions.filter(video => {
            if (video.revisions.length === 0) return false;
            const latestRevision = video.revisions[0];
            return latestRevision.deadline && latestRevision.deadline < now;
        });

        console.log(`Found ${videosToAutoApprove.length} videos to auto-approve`);

        if (videosToAutoApprove.length === 0) {
            return ApiResponse.success({
                message: 'No videos to auto-approve',
                autoApproved: 0,
            });
        }

        let successCount = 0;
        let failureCount = 0;
        const autoApprovedVideos: any[] = [];

        for (const video of videosToAutoApprove) {
            try {
                const latestRevision = video.revisions[0];

                // Update video status to APPROVED
                await db.video.update({
                    where: { id: video.id },
                    data: {
                        status: 'APPROVED',
                        approvedAt: new Date(),
                    },
                });

                // Mark revision as resolved
                await db.revision.update({
                    where: { id: latestRevision.id },
                    data: {
                        resolvedAt: new Date(),
                    },
                });

                // Trigger Phase 1 Payout (Base Fee)
                // Check if base fee already paid
                if (!video.baseFeePaid && video.baseFeeAmount) {
                    await db.payment.create({
                        data: {
                            campaignId: video.campaignId,
                            videoId: video.id,
                            recipientId: video.creatorId!,
                            amount: video.baseFeeAmount,
                            type: 'BASE_FEE',
                            status: 'COMPLETED',
                            metadata: {
                                autoApproved: true,
                                reason: 'Revision deadline exceeded',
                            }
                        }
                    });

                    // Mark base fee as paid
                    await db.video.update({
                        where: { id: video.id },
                        data: { baseFeePaid: true },
                    });
                }

                // Create notifications
                // Notification to creator
                await db.notification.create({
                    data: {
                        userId: video.creatorId!,
                        type: 'VIDEO_STATUS',
                        title: 'Draft Auto-Approved! 🎉',
                        message: `Your draft for "${video.campaign.name}" was auto-approved because the revision deadline passed. Base fee has been paid!`,
                        link: `/creator/tasks/${video.id}`,
                    }
                });

                // Notification to founder
                await db.notification.create({
                    data: {
                        userId: video.campaign.founderId,
                        type: 'VIDEO_STATUS',
                        title: 'Draft Auto-Approved',
                        message: `The draft for "${video.campaign.name}" by ${video.creator?.fullName} was auto-approved per your policy (revision deadline passed).`,
                        link: `/founder/campaigns/${video.campaignId}/review`,
                    }
                });

                successCount++;
                autoApprovedVideos.push({
                    videoId: video.id,
                    campaignName: video.campaign.name,
                    creatorName: video.creator?.fullName,
                    revisionDeadline: latestRevision.deadline,
                    baseFeeAmount: video.baseFeeAmount,
                });

                console.log(`Auto-approved video ${video.id} for campaign "${video.campaign.name}"`);
            } catch (error) {
                console.error(`Failed to auto-approve video ${video.id}:`, error);
                failureCount++;
            }
        }

        console.log(`Auto-approve job complete: ${successCount} approved, ${failureCount} failures`);

        return ApiResponse.success({
            message: 'Auto-approval completed',
            totalVideos: videosToAutoApprove.length,
            successCount,
            failureCount,
            autoApprovedVideos,
        });
    } catch (error) {
        console.error('Error in auto-approve cron job:', error);
        return ApiResponse.error('Failed to auto-approve videos', 500);
    }
}

// Allow POST as well for manual triggering
export async function POST(request: NextRequest) {
    return GET(request);
}
