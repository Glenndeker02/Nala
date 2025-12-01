import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const POST = requireRole(
    ['FOUNDER'],
    async (
        request: NextRequest,
        user,
        { params }: { params: { id: string; applicationId: string } }
    ) => {
        try {
            const campaignId = params.id;
            const applicationId = params.applicationId;
            const body = await request.json();
            const { creatorId, instructions, deadline } = body;

            // Verify campaign ownership
            const campaign = await db.campaign.findUnique({
                where: { id: campaignId },
                include: {
                    videos: true,
                },
            });

            if (!campaign) {
                return ApiResponse.error('Campaign not found', 404);
            }

            if (campaign.founderId !== user.userId) {
                return ApiResponse.error('Unauthorized', 403);
            }

            // Verify application exists and is pending
            const application = await db.application.findUnique({
                where: { id: applicationId },
            });

            if (!application) {
                return ApiResponse.error('Application not found', 404);
            }

            if (application.status !== 'PENDING') {
                return ApiResponse.error('Application has already been processed', 400);
            }

            // Check if we still need creators (haven't assigned all videos yet)
            const assignedVideosCount = campaign.videos.filter(v => v.creatorId).length;
            if (assignedVideosCount >= campaign.videosRequested) {
                return ApiResponse.error('All video slots have been filled', 400);
            }

            // Update application status and assign creator to campaign in transaction
            const result = await db.$transaction(async (tx) => {
                // Update application status with instructions
                await tx.application.update({
                    where: { id: applicationId },
                    data: {
                        status: 'ACCEPTED',
                        acceptanceInstructions: instructions || null,
                        acceptanceDeadline: deadline ? new Date(deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        acceptedAt: new Date()
                    },
                });

                // Assign creator to campaign
                await tx.campaign.update({
                    where: { id: campaignId },
                    data: {
                        creatorId,
                        status: 'ACTIVE' // Update status to ACTIVE when creator is assigned
                    },
                });

                // Create a video assignment for this creator
                let video = campaign.videos.find(v => !v.creatorId);

                if (!video) {
                    // Create a new video entry
                    video = await tx.video.create({
                        data: {
                            campaignId,
                            creatorId,
                            status: 'PENDING',
                            platform: campaign.platform,
                        },
                    });
                } else {
                    // Assign existing video to creator
                    await tx.video.update({
                        where: { id: video.id },
                        data: { creatorId },
                    });
                }

                // Get creator details for notification
                const creator = await tx.user.findUnique({
                    where: { id: creatorId },
                    select: { fullName: true, email: true }
                });

                // Calculate deadline
                const acceptanceDeadline = deadline ? new Date(deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                const deadlineStr = acceptanceDeadline.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                // Build notification message
                let notificationMessage = `Congratulations! You have been accepted for the campaign "${campaign.name}".\n\n`;

                if (instructions) {
                    notificationMessage += `📋 INSTRUCTIONS FROM FOUNDER:\n${instructions}\n\n`;
                }

                notificationMessage += `📋 NEXT STEPS:\n1. Review the campaign brief and requirements\n2. Create your video content following the guidelines\n3. Submit your draft video for review\n\n⏰ DEADLINE: ${deadlineStr}\n\n⚠️ Important: Failure to submit by the deadline or comply with requirements may result in removal from the campaign.\n\nClick here to get started!`;

                // Create notification for creator with detailed instructions
                await tx.notification.create({
                    data: {
                        userId: creatorId,
                        type: 'APPLICATION_UPDATE',
                        title: 'Application Accepted! 🎉',
                        message: notificationMessage,
                        link: `/creator/campaigns/${campaignId}`,
                        isRead: false
                    }
                });

                return { video, creator };
            });

            return ApiResponse.success({
                message: 'Application accepted successfully',
                video: {
                    id: result.video.id,
                    creatorId: result.video.creatorId,
                },
                creator: result.creator
            });
        } catch (error) {
            console.error('Error accepting application:', error);
            return ApiResponse.error('Failed to accept application', 500);
        }
    }
);
