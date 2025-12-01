import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { z } from 'zod';

// Schema for creating A/B test
const createABTestSchema = z.object({
    name: z.string().min(1, 'Test name is required'),
    description: z.string().optional(),
    videoIds: z.array(z.string()).min(2, 'At least 2 videos required for A/B testing').max(5, 'Maximum 5 videos allowed'),
    testDurationDays: z.number().min(1).max(30).default(7),
    metrics: z.array(z.enum(['views', 'likes', 'comments', 'shares', 'engagement_rate'])).optional(),
});

// GET - List all A/B tests for a campaign
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

        // Fetch A/B tests with variants
        const abTests = await db.aBTest.findMany({
            where: { campaignId },
            include: {
                variants: {
                    include: {
                        video: {
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
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return ApiResponse.success(abTests);
    } catch (error: any) {
        console.error('Error fetching A/B tests:', error);
        return ApiResponse.error(error.message || 'Failed to fetch A/B tests', 500);
    }
}

// POST - Create new A/B test
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireRole(req, ['FOUNDER', 'ADMIN']);
        const campaignId = params.id;
        const body = await req.json();

        // Validate request body
        const validation = createABTestSchema.safeParse(body);
        if (!validation.success) {
            return ApiResponse.error('Validation failed', 400, validation.error.errors);
        }

        const { name, description, videoIds, testDurationDays, metrics } = validation.data;

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

        // Verify all videos belong to this campaign
        const videos = await db.video.findMany({
            where: {
                id: { in: videoIds },
                campaignId,
            },
        });

        if (videos.length !== videoIds.length) {
            return ApiResponse.error('One or more videos not found or do not belong to this campaign', 400);
        }

        // Create A/B test with variants
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + testDurationDays);

        const abTest = await db.aBTest.create({
            data: {
                campaignId,
                name,
                description,
                status: 'ACTIVE',
                startDate: new Date(),
                endDate,
                variants: {
                    create: videoIds.map((videoId, index) => ({
                        videoId,
                        variantName: `Variant ${String.fromCharCode(65 + index)}`, // A, B, C, etc.
                        status: 'ACTIVE',
                    })),
                },
            },
            include: {
                variants: {
                    include: {
                        video: {
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
                    },
                },
            },
        });

        return ApiResponse.success(abTest, 201);
    } catch (error: any) {
        console.error('Error creating A/B test:', error);
        return ApiResponse.error(error.message || 'Failed to create A/B test', 500);
    }
}
