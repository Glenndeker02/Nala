import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// Helper function to calculate Wilson score confidence interval
function wilsonScore(successes: number, trials: number, zScore: number = 1.96): { lower: number; upper: number } {
    if (trials === 0) return { lower: 0, upper: 0 };

    const p = successes / trials;
    const z2 = zScore * zScore;
    const denominator = 1 + z2 / trials;
    const center = (p + z2 / (2 * trials)) / denominator;
    const margin = (zScore * Math.sqrt((p * (1 - p) + z2 / (4 * trials)) / trials)) / denominator;

    return {
        lower: Math.max(0, center - margin),
        upper: Math.min(1, center + margin)
    };
}

// Helper function to perform z-test for two proportions
function zTest(successes1: number, trials1: number, successes2: number, trials2: number): { zScore: number; pValue: number; significant: boolean } {
    if (trials1 === 0 || trials2 === 0) {
        return { zScore: 0, pValue: 1, significant: false };
    }

    const p1 = successes1 / trials1;
    const p2 = successes2 / trials2;
    const pooledP = (successes1 + successes2) / (trials1 + trials2);

    const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / trials1 + 1 / trials2));

    if (se === 0) {
        return { zScore: 0, pValue: 1, significant: false };
    }

    const zScore = (p1 - p2) / se;

    // Approximate p-value using standard normal distribution
    const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));

    return {
        zScore,
        pValue,
        significant: pValue < 0.05 // 95% confidence
    };
}

// Helper function for normal CDF approximation
function normalCDF(x: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - prob : prob;
}

// GET - Get AB test results with statistical analysis
export const GET = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { id: string; abId: string } }) => {
    try {
        const { abId } = params;

        // Get AB test with variants and campaign
        const abTest = await prisma.aBTest.findUnique({
            where: { id: abId },
            include: {
                campaign: {
                    select: {
                        founderId: true
                    }
                },
                variants: {
                    include: {
                        video: {
                            select: {
                                currentViewCount: true,
                                performanceMetrics: true
                            }
                        }
                    }
                }
            }
        });

        if (!abTest) {
            return NextResponse.json(
                { success: false, error: 'AB test not found' },
                { status: 404 }
            );
        }

        if (abTest.campaign.founderId !== user.userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Calculate metrics for each variation
        const variationResults = abTest.variants.map(variant => {
            const views = variant.views || (variant.video?.currentViewCount || 0);
            const conversions = variant.conversions || 0;
            const conversionRate = views > 0 ? conversions / views : 0;
            const revenue = Number(variant.costPerView || 0) * views;

            // Calculate confidence interval
            const confidenceInterval = wilsonScore(conversions, views, 1.96); // 95% confidence

            return {
                id: variant.id,
                label: variant.label || variant.variantName,
                variantName: variant.variantName,
                views,
                conversions,
                conversionRate: Number((conversionRate * 100).toFixed(2)), // Convert to percentage
                revenue: Number(revenue.toFixed(2)),
                confidenceInterval: [
                    Number((confidenceInterval.lower * 100).toFixed(2)),
                    Number((confidenceInterval.upper * 100).toFixed(2))
                ],
                performanceScore: Number(variant.performanceScore || 0)
            };
        });

        // Determine winner using statistical testing
        let winnerId = abTest.winnerVariantId;
        let confidence = abTest.confidence ? Number(abTest.confidence) : null;
        let recommendation = '';

        if (variationResults.length >= 2 && !winnerId) {
            // Sort by conversion rate
            const sorted = [...variationResults].sort((a, b) => b.conversionRate - a.conversionRate);
            const best = sorted[0];
            const secondBest = sorted[1];

            // Find the actual variants for z-test
            const bestVariant = abTest.variants.find(v => v.id === best.id);
            const secondBestVariant = abTest.variants.find(v => v.id === secondBest.id);

            if (bestVariant && secondBestVariant) {
                const zTestResult = zTest(
                    bestVariant.conversions || 0,
                    bestVariant.views || 0,
                    secondBestVariant.conversions || 0,
                    secondBestVariant.views || 0
                );

                if (zTestResult.significant) {
                    winnerId = best.id;
                    confidence = 1 - zTestResult.pValue; // Convert p-value to confidence

                    const improvement = ((best.conversionRate - secondBest.conversionRate) / secondBest.conversionRate * 100).toFixed(1);
                    recommendation = `Adopt ${best.label} - ${improvement}% higher conversion rate with ${(confidence * 100).toFixed(0)}% confidence`;
                } else {
                    recommendation = `Continue testing - no statistically significant winner yet (p-value: ${zTestResult.pValue.toFixed(3)})`;
                }
            }
        } else if (winnerId) {
            const winner = variationResults.find(v => v.id === winnerId);
            if (winner) {
                recommendation = `Winner: ${winner.label} with ${winner.conversionRate}% conversion rate`;
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                abTestId: abTest.id,
                name: abTest.name,
                description: abTest.description,
                status: abTest.status,
                testGoal: abTest.testGoal,
                successMetric: abTest.successMetric,
                startDate: abTest.startDate?.toISOString(),
                endDate: abTest.endDate?.toISOString(),
                variations: variationResults,
                winner: winnerId,
                confidence: confidence ? Number((confidence * 100).toFixed(2)) : null, // Convert to percentage
                recommendation
            }
        });

    } catch (error: any) {
        console.error('Error fetching AB test results:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
