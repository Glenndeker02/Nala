import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';

// POST - Complete/finalize an A/B test
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string; testId: string } }
) {
    try {
        const user = await requireRole(req, ['FOUNDER', 'ADMIN']);
        const { id: campaignId, testId } = params;

        // Verify campaign ownership
        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
            select: { founderId: true, foundationId: true },
        });

        if (!campaign) {
            return ApiResponse.error('Campaign not found', 404);
        }

        if (campaign.founderId !== user.id && user.role !== 'ADMIN') {
            return ApiResponse.error('Unauthorized', 403);
        }

        // Fetch A/B test with variants
        const abTest = await db.aBTest.findUnique({
            where: { id: testId, campaignId },
            include: {
                variants: {
                    include: {
                        video: {
                            select: {
                                id: true,
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

        if (!abTest) {
            return ApiResponse.error('A/B test not found', 404);
        }

        if (abTest.status === 'COMPLETED') {
            return ApiResponse.error('A/B test is already completed', 400);
        }

        // Calculate winner
        const variants = abTest.variants || [];
        const variantMetrics = variants.map((variant: any) => {
            const video = variant.video;
            const views = video?.currentViewCount || 0;
            const likes = video?.likes || 0;
            const comments = video?.comments || 0;
            const shares = video?.shares || 0;
            const engagementRate = views > 0 ? ((likes + comments + shares) / views) * 100 : 0;

            return {
                variantId: variant.id,
                videoId: variant.videoId,
                views,
                likes,
                comments,
                shares,
                engagementRate,
                score: (
                    views * 1 +
                    likes * 2 +
                    comments * 3 +
                    shares * 4 +
                    engagementRate * 10
                ),
            };
        });

        variantMetrics.sort((a, b) => b.score - a.score);
        const winner = variantMetrics[0];
        const secondPlace = variantMetrics[1];

        const confidence = secondPlace
            ? ((winner.score - secondPlace.score) / winner.score) * 100
            : 100;

        // Update A/B test status and set winner
        const updatedTest = await db.aBTest.update({
            where: { id: testId },
            data: {
                status: 'COMPLETED',
                winnerVariantId: winner.variantId,
                completedAt: new Date(),
                results: {
                    winner: {
                        variantId: winner.variantId,
                        videoId: winner.videoId,
                        score: winner.score,
                    },
                    confidence: Math.min(confidence, 100),
                    metrics: variantMetrics,
                },
            },
            include: {
                variants: {
                    include: {
                        video: true,
                    },
                },
            },
        });

        // Create notification for founder
        if (campaign.founderId) {
            await db.notification.create({
                data: {
                    userId: campaign.founderId,
                    type: 'SYSTEM',
                    title: 'A/B Test Completed',
                    message: `Your A/B test "${abTest.name}" has been completed. Check the results to see which variant performed best.`,
                    link: `/founder/campaigns/${campaignId}?tab=ab-testing`,
                    isRead: false,
                },
            });
        }

        return ApiResponse.success({
            ...updatedTest,
            results: {
                winner: {
                    variantId: winner.variantId,
                    videoId: winner.videoId,
                    score: winner.score,
                },
                confidence: Math.min(confidence, 100),
                metrics: variantMetrics,
            },
        });
    } catch (error: any) {
        console.error('Error completing A/B test:', error);
        return ApiResponse.error(error.message || 'Failed to complete A/B test', 500);
    }
}
