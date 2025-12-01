import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';
import { z } from 'zod';

// Schema for updating a founder video
const updateFounderVideoSchema = z.object({
    videoUrl: z.string().url().optional(),
    thumbnailUrl: z.string().url().optional(),
    caption: z.string().optional(),
    description: z.string().optional(),
    platform: z.enum(['TIKTOK', 'INSTAGRAM', 'FACEBOOK']).optional(),
    status: z.enum(['DRAFT', 'READY_TO_POST', 'POSTED', 'ARCHIVED']).optional(),
    finalPostUrl: z.string().url().optional(),
    platformVideoId: z.string().optional(),
    postedAt: z.string().datetime().optional(),
});

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string; videoId: string } }
) {
    try {
        const user = await requireRole(['FOUNDER', 'ADMIN']);
        if (!user) {
            return ApiResponse.unauthorized();
        }

        const { id: campaignId, videoId } = params;

        // Verify campaign ownership
        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign) {
            return ApiResponse.notFound('Campaign not found');
        }

        if (campaign.founderId !== user.id && user.role !== 'ADMIN') {
            return ApiResponse.forbidden('You do not have access to this campaign');
        }

        const video = await db.founderVideo.findUnique({
            where: { id: videoId },
            include: {
                viewSnapshots: {
                    orderBy: { snapshotAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!video) {
            return ApiResponse.notFound('Video not found');
        }

        if (video.campaignId !== campaignId) {
            return ApiResponse.error('Video does not belong to this campaign', 400);
        }

        return ApiResponse.success(video);
    } catch (error) {
        console.error('[FounderVideos] Error fetching video:', error);
        return ApiResponse.error('Failed to fetch founder video');
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string; videoId: string } }
) {
    try {
        const user = await requireRole(['FOUNDER', 'ADMIN']);
        if (!user) {
            return ApiResponse.unauthorized();
        }

        const { id: campaignId, videoId } = params;
        const body = await req.json();

        // Validate request body
        const validation = updateFounderVideoSchema.safeParse(body);
        if (!validation.success) {
            return ApiResponse.error('Validation failed', 400, validation.error.errors);
        }

        const data = validation.data;

        // Verify campaign ownership
        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign) {
            return ApiResponse.notFound('Campaign not found');
        }

        if (campaign.founderId !== user.id && user.role !== 'ADMIN') {
            return ApiResponse.forbidden('You do not have access to this campaign');
        }

        // Verify video exists
        const existingVideo = await db.founderVideo.findUnique({
            where: { id: videoId },
        });

        if (!existingVideo) {
            return ApiResponse.notFound('Video not found');
        }

        if (existingVideo.campaignId !== campaignId) {
            return ApiResponse.error('Video does not belong to this campaign', 400);
        }

        // Update founder video
        const video = await db.founderVideo.update({
            where: { id: videoId },
            data: {
                ...data,
                isDraft: data.status ? data.status === 'DRAFT' : undefined,
            },
        });

        return ApiResponse.success(video);
    } catch (error) {
        console.error('[FounderVideos] Error updating video:', error);
        return ApiResponse.error('Failed to update founder video');
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string; videoId: string } }
) {
    try {
        const user = await requireRole(['FOUNDER', 'ADMIN']);
        if (!user) {
            return ApiResponse.unauthorized();
        }

        const { id: campaignId, videoId } = params;

        // Verify campaign ownership
        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign) {
            return ApiResponse.notFound('Campaign not found');
        }

        if (campaign.founderId !== user.id && user.role !== 'ADMIN') {
            return ApiResponse.forbidden('You do not have access to this campaign');
        }

        // Verify video exists
        const existingVideo = await db.founderVideo.findUnique({
            where: { id: videoId },
        });

        if (!existingVideo) {
            return ApiResponse.notFound('Video not found');
        }

        if (existingVideo.campaignId !== campaignId) {
            return ApiResponse.error('Video does not belong to this campaign', 400);
        }

        // Delete founder video
        await db.founderVideo.delete({
            where: { id: videoId },
        });

        return ApiResponse.success({ success: true });
    } catch (error) {
        console.error('[FounderVideos] Error deleting video:', error);
        return ApiResponse.error('Failed to delete founder video');
    }
}
