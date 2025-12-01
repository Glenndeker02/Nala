import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';
import { z } from 'zod';

// Schema for creating a founder video
const createFounderVideoSchema = z.object({
    videoUrl: z.string().url(),
    thumbnailUrl: z.string().url().optional(),
    caption: z.string().optional(),
    description: z.string().optional(),
    platform: z.enum(['TIKTOK', 'INSTAGRAM', 'FACEBOOK']),
    status: z.enum(['DRAFT', 'READY_TO_POST', 'POSTED', 'ARCHIVED']).optional(),
});

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireRole(['FOUNDER', 'ADMIN']);
        if (!user) {
            return ApiResponse.unauthorized();
        }

        const campaignId = params.id;

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

        const videos = await db.founderVideo.findMany({
            where: { campaignId },
            orderBy: { createdAt: 'desc' },
            include: {
                viewSnapshots: {
                    orderBy: { snapshotAt: 'desc' },
                    take: 1,
                },
            },
        });

        return ApiResponse.success(videos);
    } catch (error) {
        console.error('[FounderVideos] Error fetching videos:', error);
        return ApiResponse.error('Failed to fetch founder videos');
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireRole(['FOUNDER', 'ADMIN']);
        if (!user) {
            return ApiResponse.unauthorized();
        }

        const campaignId = params.id;
        const body = await req.json();

        // Validate request body
        const validation = createFounderVideoSchema.safeParse(body);
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

        // Create founder video
        const video = await db.founderVideo.create({
            data: {
                campaignId,
                founderId: user.id,
                videoUrl: data.videoUrl,
                thumbnailUrl: data.thumbnailUrl,
                caption: data.caption,
                description: data.description,
                platform: data.platform,
                status: (data.status as any) || 'DRAFT',
                isDraft: data.status === 'DRAFT' || !data.status,
            },
        });

        return ApiResponse.success(video);
    } catch (error) {
        console.error('[FounderVideos] Error creating video:', error);
        return ApiResponse.error('Failed to create founder video');
    }
}
