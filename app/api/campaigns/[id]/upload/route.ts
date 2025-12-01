import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const POST = requireRole(['CREATOR'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;
        const { videoUrl, notes } = await request.json();

        if (!videoUrl) {
            return ApiResponse.error('Video URL is required', 400);
        }

        // Find the video record for this creator and campaign
        const video = await db.video.findFirst({
            where: {
                campaignId,
                creatorId: user.userId
            }
        });

        if (!video) {
            return ApiResponse.error('No assigned video found for this campaign', 404);
        }

        // Update video status and URL
        const updatedVideo = await db.video.update({
            where: { id: video.id },
            data: {
                draftVideoUrl: videoUrl,
                status: 'DRAFT_SUBMITTED',
                submittedAt: new Date(),
                // We could also store notes in a new field or a separate Revision model
                // For now, let's assume we just update the video
            },
            include: {
                campaign: {
                    select: {
                        name: true,
                        founderId: true
                    }
                },
                creator: {
                    select: {
                        fullName: true
                    }
                }
            }
        });

        // Create notification for founder
        await db.notification.create({
            data: {
                userId: updatedVideo.campaign.founderId,
                type: 'APPLICATION_UPDATE', // Using existing enum
                title: 'New Draft Submitted',
                message: `${updatedVideo.creator?.fullName} submitted a draft for ${updatedVideo.campaign.name}`,
                metadata: {
                    campaignId,
                    videoId: updatedVideo.id,
                    creatorId: user.userId,
                    notes
                }
            }
        });

        return ApiResponse.success({ video: updatedVideo });
    } catch (error) {
        console.error('Error submitting draft:', error);
        return ApiResponse.error('Failed to submit draft', 500);
    }
});
