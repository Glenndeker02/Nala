import { NextRequest } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

const submitUrlSchema = z.object({
    postUrl: z.string().url(),
    platform: z.enum(['TIKTOK', 'INSTAGRAM', 'FACEBOOK']),
    platformVideoId: z.string(),
    postedAt: z.string().datetime(),
});

export const POST = requireRole(['CREATOR'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const videoId = params.id;
        const body = await request.json();

        const validation = submitUrlSchema.safeParse(body);
        if (!validation.success) {
            return ApiResponse.error('Validation failed', 400, validation.error.errors);
        }

        const { postUrl, platform, platformVideoId, postedAt } = validation.data;

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

        // Verify ownership
        if (video.creatorId !== user.userId) {
            return ApiResponse.error('Unauthorized', 403);
        }

        // Verify video is in correct state (APPROVED)
        if (video.status !== 'APPROVED') {
            return ApiResponse.error('Video must be approved before submitting post URL', 400);
        }

        // Validate posting date is not in the future
        const postedDate = new Date(postedAt);
        if (postedDate > new Date()) {
            return ApiResponse.error('Posting date cannot be in the future', 400);
        }

        // Calculate 7-day lock time
        const lockedAt = new Date(postedDate);
        lockedAt.setDate(lockedAt.getDate() + 7);

        // Update video record
        const updatedVideo = await db.video.update({
            where: { id: videoId },
            data: {
                finalPostUrl: postUrl,
                platform,
                platformVideoId,
                postedAt: postedDate,
                lockedAt,
                status: 'POSTED',
                currentViewCount: 0, // Will be updated by cron job
            },
        });

        // Create initial view snapshot
        await db.viewSnapshot.create({
            data: {
                videoId,
                viewCount: 0,
                dataSource: 'manual',
                snapshotAt: new Date(),
            },
        });

        // TODO: Add to view polling queue
        // TODO: Send notification to founder
        // TODO: Schedule first view count update (within 1 hour)

        return ApiResponse.success({
            message: 'Post URL submitted successfully. View tracking has started.',
            video: {
                id: updatedVideo.id,
                status: updatedVideo.status,
                postedAt: updatedVideo.postedAt,
                lockedAt: updatedVideo.lockedAt,
            },
        });
    } catch (error) {
        console.error('Error submitting post URL:', error);
        return ApiResponse.error('Failed to submit post URL', 500);
    }
});
