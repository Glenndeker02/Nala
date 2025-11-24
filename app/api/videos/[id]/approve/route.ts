import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const POST = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const videoId = params.id;

        // Fetch video with campaign info
        const video = await db.video.findUnique({
            where: { id: videoId },
            include: {
                campaign: true,
            },
        });

        if (!video) {
            return ApiResponse.error('Video not found', 404);
        }

        // Verify campaign ownership
        if (video.campaign.founderId !== user.userId) {
            return ApiResponse.error('Unauthorized', 403);
        }

        // Verify video is in correct state
        if (video.status !== 'DRAFT_SUBMITTED') {
            return ApiResponse.error('Video is not in a state that can be approved', 400);
        }

        // Update video status
        const updatedVideo = await db.video.update({
            where: { id: videoId },
            data: {
                status: 'APPROVED',
                approvedAt: new Date(),
                baseFeePaid: false, // Will be set to true when payment is processed
                baseFeeAmount: video.campaign.baseFeeeBudget / video.campaign.videosRequested, // Calculate per-video base fee
            },
        });

        // TODO: Trigger base fee payment via Stripe
        // TODO: Send notification to creator
        // TODO: Send email to creator

        return ApiResponse.success({
            message: 'Video approved successfully',
            video: {
                id: updatedVideo.id,
                status: updatedVideo.status,
                baseFeeAmount: updatedVideo.baseFeeAmount,
            },
        });
    } catch (error) {
        console.error('Error approving video:', error);
        return ApiResponse.error('Failed to approve video', 500);
    }
});
