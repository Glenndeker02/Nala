import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/api-response";

export async function GET(
    req: NextRequest,
    { params }: { params: { abId: string } }
) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return ApiResponse.unauthorized();
        }

        const testId = params.abId;

        // Fetch the A/B test with all variants and their videos
        const test = await prisma.aBTest.findUnique({
            where: { id: testId },
            include: {
                campaign: true,
                variants: {
                    include: {
                        video: true,
                        creator: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        if (!test) {
            return ApiResponse.notFound("A/B test not found");
        }

        // Calculate metrics for each variant
        const variantsWithMetrics = test.variants.map(variant => {
            const video = variant.video;
            const views = video?.currentViewCount || variant.views || 0;
            const likes = video?.likes || 0;
            const comments = video?.comments || 0;
            const shares = video?.shares || 0;
            const totalEngagement = likes + comments + shares;
            const engagementRate = views > 0 ? (totalEngagement / views) * 100 : 0;

            return {
                id: variant.id,
                variantName: variant.variantName,
                label: variant.label,
                variantType: variant.variantType,
                creator: variant.creator,
                metrics: {
                    views,
                    likes,
                    comments,
                    shares,
                    conversions: variant.conversions,
                    engagement: totalEngagement,
                    engagementRate,
                    performanceScore: variant.performanceScore || 0
                }
            };
        });

        // Determine winner based on performance score
        const sortedVariants = [...variantsWithMetrics].sort(
            (a, b) => Number(b.metrics.performanceScore) - Number(a.metrics.performanceScore)
        );

        const winner = sortedVariants[0];
        const runnerUp = sortedVariants[1];

        // Calculate improvement percentage
        let improvement = null;
        if (winner && runnerUp) {
            const winnerScore = Number(winner.metrics.performanceScore);
            const runnerUpScore = Number(runnerUp.metrics.performanceScore);
            if (runnerUpScore > 0) {
                improvement = ((winnerScore - runnerUpScore) / runnerUpScore) * 100;
            }
        }

        // Generate recommendation
        let recommendation = null;
        if (test.status === 'COMPLETED' && winner && improvement) {
            recommendation = `Variant ${winner.variantName} shows ${improvement.toFixed(1)}% higher performance. Recommended for scaling.`;
        }

        return NextResponse.json({
            success: true,
            data: {
                test: {
                    id: test.id,
                    name: test.name,
                    description: test.description,
                    testGoal: test.testGoal,
                    successMetric: test.successMetric,
                    status: test.status,
                    startDate: test.startDate,
                    endDate: test.endDate,
                    winnerVariantId: test.winnerVariantId,
                    confidence: test.confidence
                },
                variants: variantsWithMetrics,
                winner: winner ? {
                    variantId: winner.id,
                    variantName: winner.variantName,
                    improvement: improvement ? `+${improvement.toFixed(1)}%` : null
                } : null,
                recommendation
            }
        });

    } catch (error) {
        console.error("Error fetching A/B test results:", error);
        return ApiResponse.error("Failed to fetch A/B test results", 500);
    }
}
