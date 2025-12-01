import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const POST = requireRole(
    ['FOUNDER'],
    async (
        request: NextRequest,
        user,
        { params }: { params: { id: string; creatorId: string } }
    ) => {
        try {
            const campaignId = params.id;
            const creatorId = params.creatorId;
            const body = await request.json();
            const { reason } = body; // Reason for removal

            // Verify campaign ownership
            const campaign = await db.campaign.findUnique({
                where: { id: campaignId },
                include: {
                    videos: {
                        where: { creatorId }
                    }
                },
            });

            if (!campaign) {
                return ApiResponse.error('Campaign not found', 404);
            }

            if (campaign.founderId !== user.userId) {
                return ApiResponse.error('Unauthorized', 403);
            }

            // Check if creator is assigned to this campaign
            if (campaign.creatorId !== creatorId) {
                return ApiResponse.error('Creator is not assigned to this campaign', 400);
            }

            // Remove creator from campaign in transaction
            await db.$transaction(async (tx) => {
                // Unassign creator from campaign
                await tx.campaign.update({
                    where: { id: campaignId },
                    data: {
                        creatorId: null,
                        status: 'PENDING_CREATOR' // Revert to pending creator
                    },
                });

                // Unassign creator from all videos in this campaign
                await tx.video.updateMany({
                    where: {
                        campaignId,
                        creatorId
                    },
                    data: {
                        creatorId: null,
                        status: 'PENDING'
                    }
                });

                // Update application status to rejected
                await tx.application.updateMany({
                    where: {
                        campaignId,
                        creatorId,
                        status: 'ACCEPTED'
                    },
                    data: {
                        status: 'REJECTED'
                    }
                });

                // Create notification for creator
                await tx.notification.create({
                    data: {
                        userId: creatorId,
                        type: 'APPLICATION_UPDATE',
                        title: 'Removed from Campaign',
                        message: `You have been removed from the campaign "${campaign.name}".\n\nReason: ${reason || 'Not specified'}\n\nIf you believe this was a mistake, please contact support.`,
                        link: `/creator/campaigns`,
                        isRead: false
                    }
                });

                // Create notification for founder
                await tx.notification.create({
                    data: {
                        userId: campaign.founderId,
                        type: 'CAMPAIGN_INVITE',
                        title: 'Creator Removed',
                        message: `Creator has been removed from "${campaign.name}". The campaign is now open for new applications.`,
                        link: `/founder/campaigns/${campaignId}/applications`,
                        isRead: false
                    }
                });
            });

            return ApiResponse.success({
                message: 'Creator removed successfully from campaign'
            });
        } catch (error) {
            console.error('Error removing creator:', error);
            return ApiResponse.error('Failed to remove creator', 500);
        }
    }
);
