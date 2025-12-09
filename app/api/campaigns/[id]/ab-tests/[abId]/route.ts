import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { z } from 'zod';

// Schema for updating A/B test
const updateABTestSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
});

// GET - Get specific A/B test with detailed results
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string; abId: string } }
) {
    try {
        const user = await requireRole(req, ['FOUNDER', 'ADMIN']);
        const { id: campaignId, abId } = params;

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

        // Fetch A/B test with detailed variant data
        const abTest = await db.aBTest.findUnique({
            where: { id: abId, campaignId },
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
                                status: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!abTest) {
            return ApiResponse.error('A/B test not found', 404);
        }

        // Calculate results and winner
        const results = calculateABTestResults(abTest);

        return ApiResponse.success({
            ...abTest,
            results,
        });
    } catch (error: any) {
        console.error('Error fetching A/B test:', error);
        return ApiResponse.error(error.message || 'Failed to fetch A/B test', 500);
    }
}

// PATCH - Update A/B test
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string; abId: string } }
) {
    try {
        const user = await requireRole(req, ['FOUNDER', 'ADMIN']);
        const { id: campaignId, abId } = params;
        const body = await req.json();

        // Validate request body
        const validation = updateABTestSchema.safeParse(body);
        if (!validation.success) {
            return ApiResponse.error('Validation failed', 400, validation.error.errors);
        }

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

        // Update A/B test
        const updatedTest = await db.aBTest.update({
            where: { id: abId, campaignId },
            data: validation.data,
            include: {
                variants: {
                    include: {
                        video: true,
                    },
                },
            },
        });

        return ApiResponse.success(updatedTest);
    } catch (error: any) {
        console.error('Error updating A/B test:', error);
        return ApiResponse.error(error.message || 'Failed to update A/B test', 500);
    }
}

// DELETE - Delete A/B test
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string; abId: string } }
) {
    try {
        const user = await requireRole(req, ['FOUNDER', 'ADMIN']);
        const { id: campaignId, abId } = params;

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

        // Delete A/B test (variants will be cascade deleted)
        await db.aBTest.delete({
            where: { id: abId, campaignId },
        });

        return ApiResponse.success({ message: 'A/B test deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting A/B test:', error);
        return ApiResponse.error(error.message || 'Failed to delete A/B test', 500);
    }
}

// Helper function to calculate A/B test results
function calculateABTestResults(abTest: any) {
    const variants = abTest.variants || [];

    if (variants.length === 0) {
        return {
            winner: null,
            confidence: 0,
            metrics: [],
        };
    }

    // Calculate metrics for each variant
    const variantMetrics = variants.map((variant: any) => {
        const video = variant.video;
        const views = video?.currentViewCount || 0;
        const likes = video?.likes || 0;
        const comments = video?.comments || 0;
        const shares = video?.shares || 0;
        const engagementRate = views > 0 ? ((likes + comments + shares) / views) * 100 : 0;

        return {
            variantId: variant.id,
            variantName: variant.variantName,
            views,
            likes,
            comments,
            shares,
            engagementRate,
            totalEngagement: likes + comments + shares,
        };
    });

    // Determine winner based on weighted score
    const weightedScores = variantMetrics.map((metric) => ({
        ...metric,
        score: (
            metric.views * 1 +
            metric.likes * 2 +
            metric.comments * 3 +
            metric.shares * 4 +
            metric.engagementRate * 10
        ),
    }));

    weightedScores.sort((a, b) => b.score - a.score);
    const winner = weightedScores[0];
    const secondPlace = weightedScores[1];

    // Calculate confidence (simple percentage difference)
    const confidence = secondPlace
        ? ((winner.score - secondPlace.score) / winner.score) * 100
        : 100;

    return {
        winner: {
            variantId: winner.variantId,
            variantName: winner.variantName,
            score: winner.score,
        },
        confidence: Math.min(confidence, 100),
        metrics: variantMetrics,
        rankings: weightedScores.map((v, index) => ({
            rank: index + 1,
            variantId: v.variantId,
            variantName: v.variantName,
            score: v.score,
        })),
    };
}
