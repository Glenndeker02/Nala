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
            const { creatorId } = body;

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

            // Update application status
            await db.application.update({
                where: { id: applicationId },
                data: { status: 'ACCEPTED' },
            });

            // Create a video assignment for this creator
            // Find the first unassigned video or create a new one
            let video = campaign.videos.find(v => !v.creatorId);

            if (!video) {
                // Create a new video entry
                video = await db.video.create({
                    data: {
                        campaignId,
                        creatorId,
                        status: 'PENDING',
                    },
                });
            } else {
                // Assign existing video to creator
                await db.video.update({
                    where: { id: video.id },
                    data: { creatorId },
                });
            }

            // TODO: Send notification to creator
            // TODO: Send email to creator

            return ApiResponse.success({
                message: 'Application accepted successfully',
                video: {
                    id: video.id,
                    creatorId: video.creatorId,
                },
            });
        } catch (error) {
            console.error('Error accepting application:', error);
            return ApiResponse.error('Failed to accept application', 500);
        }
    }
);
