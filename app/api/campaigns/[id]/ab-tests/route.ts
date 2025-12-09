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

// POST - Create new A/B test with guided workflow
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireRole(req, ['FOUNDER', 'ADMIN']);
        const campaignId = params.id;
        const body = await req.json();

        // Validate request body
        const createSchema = z.object({
            name: z.string().min(1, 'Test name is required'),
            hypothesis: z.string().optional(),
            testGoal: z.enum(['BEST_HOOK', 'BEST_CREATOR', 'BEST_FORMAT', 'BEST_CTA', 'BEST_OVERALL']),
            successMetric: z.enum(['VIEW_THROUGH_RATE', 'CONVERSION_RATE', 'ENGAGEMENT_RATE', 'COST_PER_VIEW', 'TOTAL_VIEWS']),
            testVariables: z.object({
                variantA: z.object({
                    title: z.string(),
                    description: z.string(),
                    talkingPoints: z.array(z.string()),
                    tone: z.string(),
                    visualStyle: z.string().optional(),
                    requiredLength: z.string().optional(),
                }),
                variantB: z.object({
                    title: z.string(),
                    description: z.string(),
                    talkingPoints: z.array(z.string()),
                    tone: z.string(),
                    visualStyle: z.string().optional(),
                    requiredLength: z.string().optional(),
                }),
            }),
            assignedCreatorIds: z.array(z.string()).min(1, 'At least one creator must be assigned'),
            trackingMetrics: z.array(z.string()).optional(),
            testDurationDays: z.number().min(1).max(30).default(7),
        });

        const validation = createSchema.safeParse(body);
        if (!validation.success) {
            return ApiResponse.error('Validation failed', 400, validation.error.errors);
        }

        const {
            name,
            hypothesis,
            testGoal,
            successMetric,
            testVariables,
            assignedCreatorIds,
            trackingMetrics,
            testDurationDays
        } = validation.data;

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

        // Verify all assigned creators exist
        const creators = await db.user.findMany({
            where: {
                id: { in: assignedCreatorIds },
                role: 'CREATOR',
            },
        });

        if (creators.length !== assignedCreatorIds.length) {
            return ApiResponse.error('One or more creators not found', 400);
        }

        // Create A/B test with variants
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + testDurationDays);

        const abTest = await db.aBTest.create({
            data: {
                campaignId,
                name,
                hypothesis,
                testGoal,
                successMetric,
                testVariables,
                assignedCreatorIds,
                trackingMetrics,
                status: 'PENDING_CONTENT',
                startDate: new Date(),
                endDate,
                variants: {
                    create: [
                        {
                            variantName: 'Variant A',
                            label: testVariables.variantA.title,
                            description: testVariables.variantA.description,
                            variantType: 'CUSTOM',
                            variantInstructions: testVariables.variantA,
                            approvalStatus: 'PENDING_UPLOAD',
                        },
                        {
                            variantName: 'Variant B',
                            label: testVariables.variantB.title,
                            description: testVariables.variantB.description,
                            variantType: 'CUSTOM',
                            variantInstructions: testVariables.variantB,
                            approvalStatus: 'PENDING_UPLOAD',
                        },
                    ],
                },
            },
            include: {
                variants: true,
            },
        });

        // Send notifications to assigned creators
        for (const creatorId of assignedCreatorIds) {
            await db.notification.create({
                data: {
                    userId: creatorId,
                    type: 'AB_TEST_ASSIGNED',
                    title: 'New A/B Test Assignment',
                    message: `You've been assigned to A/B test: ${name}`,
                    link: `/creator/ab-tests/${abTest.id}`,
                },
            });
        }

        return ApiResponse.success(abTest, 201);
    } catch (error: any) {
        console.error('Error creating A/B test:', error);
        return ApiResponse.error(error.message || 'Failed to create A/B test', 500);
    }
}
