import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { z } from 'zod';

// Schema for adding competitor video
const addCompetitorSchema = z.object({
    videoUrl: z.string().url('Invalid video URL'),
    platform: z.enum(['TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'FACEBOOK']),
    competitorName: z.string().min(1, 'Competitor name is required'),
    notes: z.string().optional(),
});

// GET - List competitor videos for a campaign
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireRole(req, ['FOUNDER', 'ADMIN']);
        const campaignId = params.id;

        // Verify campaign ownership
        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
            select: { founderId: true },
        });

        if (!campaign) {
            return ApiResponse.error('Campaign not found', 404);
        }

        if (campaign.founderId !== user.id && user.role !== 'ADMIN') {
            return ApiResponse.error('Unauthorized', 403);
        }

        // Fetch competitor videos
        const competitorVideos = await db.competitorVideo.findMany({
            where: { campaignId },
            orderBy: { createdAt: 'desc' },
        });

        return ApiResponse.success(competitorVideos);
    } catch (error: any) {
        console.error('Error fetching competitor videos:', error);
        return ApiResponse.error(error.message || 'Failed to fetch competitor videos', 500);
    }
}

// POST - Add competitor video
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireRole(req, ['FOUNDER', 'ADMIN']);
        const campaignId = params.id;
        const body = await req.json();

        // Validate request body
        const validation = addCompetitorSchema.safeParse(body);
        if (!validation.success) {
            return ApiResponse.error('Validation failed', 400, validation.error.errors);
        }

        const { videoUrl, platform, competitorName, notes } = validation.data;

        // Verify campaign ownership
        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
            select: { founderId: true },
        });

        if (!campaign) {
            return ApiResponse.error('Campaign not found', 404);
        }

        if (campaign.founderId !== user.id && user.role !== 'ADMIN') {
            return ApiResponse.error('Unauthorized', 403);
        }

        // Create competitor video
        const competitorVideo = await db.competitorVideo.create({
            data: {
                campaignId,
                videoUrl,
                platform,
                competitorName,
                notes,
                // Initial metrics will be populated by scraper
                viewCount: 0,
                likes: 0,
                comments: 0,
                shares: 0,
            },
        });

        return ApiResponse.success(competitorVideo, 201);
    } catch (error: any) {
        console.error('Error adding competitor video:', error);
        return ApiResponse.error(error.message || 'Failed to add competitor video', 500);
    }
}
