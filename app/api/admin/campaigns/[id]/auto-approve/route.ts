import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole } from "@/lib/api-middleware";

/**
 * POST /api/admin/campaigns/[id]/auto-approve
 * Auto-approve pending videos when founder is unresponsive
 */
export const POST = requireRole('ADMIN', async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
        const { id } = params;
        const body = await request.json();
        const { reason, videoIds } = body;

        if (!reason) {
            return ApiResponse.error('Reason is required', 400);
        }

        // Get campaign with pending videos
        const campaign = await db.campaign.findUnique({
            where: { id },
            include: {
                founder: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                    },
                },
                videos: {
                    where: {
                        status: {
                            in: ['DRAFT_SUBMITTED', 'IN_REVIEW'],
                        },
                        ...(videoIds ? { id: { in: videoIds } } : {}),
                    },
                    include: {
                        creator: {
                            select: {
                                id: true,
                                email: true,
                                fullName: true,
                            },
                        },
                    },
                },
            },
        });

        if (!campaign) {
            return ApiResponse.error('Campaign not found', 404);
        }

        if (campaign.videos.length === 0) {
            return ApiResponse.error('No videos to approve', 400);
        }

        const now = new Date();
        const approvedVideos = [];

        // Approve all pending videos
        for (const video of campaign.videos) {
            const updated = await db.video.update({
                where: { id: video.id },
                data: {
                    status: 'APPROVED',
                    approvedAt: now,
                },
            });

            approvedVideos.push(updated);

            // Trigger base fee payment
            if (!video.baseFeePaid && video.baseFeeAmount) {
                await db.payment.create({
                    data: {
                        campaignId: campaign.id,
                        videoId: video.id,
                        recipientId: video.creatorId!,
                        amount: video.baseFeeAmount,
                        type: 'BASE_FEE',
                        status: 'PENDING',
                        description: `Base fee for video (auto-approved by admin)`,
                    },
                });

                await db.video.update({
                    where: { id: video.id },
                    data: { baseFeePaid: true },
                });
            }

            // Notify creator
            await db.notification.create({
                data: {
                    userId: video.creatorId!,
                    type: 'VIDEO_STATUS',
                    title: 'Video Approved',
                    message: `Your video for "${campaign.name}" has been approved. You can now post it!`,
                    link: `/creator/tasks/${video.id}`,
                },
            });
        }

        // Notify founder about auto-approval
        await db.notification.create({
            data: {
                userId: campaign.founderId,
                type: 'SYSTEM',
                title: 'Videos Auto-Approved',
                message: `${approvedVideos.length} video(s) for "${campaign.name}" were auto-approved due to inactivity. Reason: ${reason}`,
                link: `/founder/campaigns/${campaign.id}`,
            },
        });

        // Update campaign status if needed
        if (campaign.status === 'IN_REVIEW') {
            await db.campaign.update({
                where: { id },
                data: { status: 'IN_PROGRESS' },
            });
        }

        return ApiResponse.success({
            approvedCount: approvedVideos.length,
            videos: approvedVideos.map(v => ({
                id: v.id,
                status: v.status,
            })),
            message: `Successfully auto-approved ${approvedVideos.length} video(s)`,
        });
    } catch (error) {
        console.error('Auto-approve videos error:', error);
        return ApiResponse.error('Failed to auto-approve videos', 500);
    }
});
