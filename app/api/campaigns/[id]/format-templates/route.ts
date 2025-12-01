import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { z } from 'zod';

// Schema for creating format template
const createTemplateSchema = z.object({
    name: z.string().min(1, 'Template name is required'),
    description: z.string().optional(),
    sourceVideoId: z.string().min(1, 'Source video is required'),
    formatData: z.object({
        hookStyle: z.string().optional(),
        pacing: z.string().optional(),
        visualStyle: z.string().optional(),
        musicStyle: z.string().optional(),
        transitions: z.array(z.string()).optional(),
        textOverlays: z.boolean().optional(),
        duration: z.number().optional(),
        aspectRatio: z.string().optional(),
    }),
    tags: z.array(z.string()).optional(),
    isPublic: z.boolean().default(false),
});

// GET - List format templates for a campaign
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

        // Fetch format templates
        const templates = await db.formatTemplate.findMany({
            where: { campaignId },
            include: {
                sourceVideo: {
                    select: {
                        id: true,
                        thumbnailUrl: true,
                        finalPostUrl: true,
                        currentViewCount: true,
                        likes: true,
                        comments: true,
                        shares: true,
                    },
                },
                adoptedFormats: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                fullName: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        adoptedFormats: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return ApiResponse.success(templates);
    } catch (error: any) {
        console.error('Error fetching format templates:', error);
        return ApiResponse.error(error.message || 'Failed to fetch format templates', 500);
    }
}

// POST - Create new format template
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireRole(req, ['FOUNDER', 'ADMIN']);
        const campaignId = params.id;
        const body = await req.json();

        // Validate request body
        const validation = createTemplateSchema.safeParse(body);
        if (!validation.success) {
            return ApiResponse.error('Validation failed', 400, validation.error.errors);
        }

        const { name, description, sourceVideoId, formatData, tags, isPublic } = validation.data;

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

        // Verify source video belongs to this campaign
        const sourceVideo = await db.video.findUnique({
            where: { id: sourceVideoId, campaignId },
        });

        if (!sourceVideo) {
            return ApiResponse.error('Source video not found or does not belong to this campaign', 400);
        }

        // Create format template
        const template = await db.formatTemplate.create({
            data: {
                campaignId,
                name,
                description,
                sourceVideoId,
                formatData,
                tags: tags || [],
                isPublic,
            },
            include: {
                sourceVideo: {
                    select: {
                        id: true,
                        thumbnailUrl: true,
                        finalPostUrl: true,
                        currentViewCount: true,
                    },
                },
            },
        });

        return ApiResponse.success(template, 201);
    } catch (error: any) {
        console.error('Error creating format template:', error);
        return ApiResponse.error(error.message || 'Failed to create format template', 500);
    }
}
