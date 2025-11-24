import { NextRequest } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

const revisionSchema = z.object({
    feedback: z.string().min(10).max(1000),
});

export const POST = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const videoId = params.id;
        const body = await request.json();

        const validation = revisionSchema.safeParse(body);
        if (!validation.success) {
            return ApiResponse.error('Validation failed', 400, validation.error.errors);
        }

        const { feedback } = validation.data;

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
            return ApiResponse.error('Video is not in a state that can be revised', 400);
        }

        // Create revision record
        await db.revision.create({
            data: {
                videoId,
                requestedBy: user.userId,
                feedback,
                priority: 'significant',
                deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            },
        });

        // Update video status
        const updatedVideo = await db.video.update({
            where: { id: videoId },
            data: {
                status: 'REVISION_REQUESTED',
            },
        });

        // TODO: Send notification to creator
        // TODO: Send email to creator with feedback

        return ApiResponse.success({
            message: 'Revision requested successfully',
            video: {
                id: updatedVideo.id,
                status: updatedVideo.status,
            },
        });
    } catch (error) {
        console.error('Error requesting revision:', error);
        return ApiResponse.error('Failed to request revision', 500);
    }
});
