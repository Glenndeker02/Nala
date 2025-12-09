import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/api-middleware';

// GET - Attribution comparison for A/B test variants
export const GET = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { abId: string } }) => {
    try {
        const testId = params.abId;

        // Fetch A/B test with variants
        const test = await prisma.aBTest.findFirst({
            where: {
                id: testId,
                campaign: {
                    founderId: user.userId
                }
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                variants: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                fullName: true
                            }
                        },
                        creatorCodes: {
                            select: {
                                id: true,
                                code: true,
                                platform: true
                            }
                        },
                        _count: {
                            select: {
                                redemptions: true
                            }
                        }
                    }
                }
            }
        });

        if (!test) {
            return NextResponse.json(
                { success: false, error: 'A/B Test not found' },
                { status: 404 }
            );
        }

        // Get redemption stats per variant
        const variantStats = await Promise.all(
            test.variants.map(async (variant) => {
                const redemptions = await prisma.redemption.findMany({
                    where: { variantId: variant.id },
                    select: {
                        convertedToPaid: true,
                        amountPaidByUser: true
                    }
                });

                const totalRedemptions = redemptions.length;
                const conversions = redemptions.filter(r => r.convertedToPaid);
                const totalConversions = conversions.length;
                const attributedRevenue = conversions.reduce((sum, r) => sum + (Number(r.amountPaidByUser) || 0), 0);

                const conversionRate = variant.views > 0 ? (totalConversions / variant.views) * 100 : 0;
                const redemptionRate = variant.views > 0 ? (totalRedemptions / variant.views) * 100 : 0;

                return {
                    id: variant.id,
                    name: variant.variantName,
                    label: variant.label,
                    variantType: variant.variantType,
                    creator: variant.creator ? {
                        id: variant.creator.id,
                        name: variant.creator.fullName
                    } : null,
                    codes: variant.creatorCodes,
                    metrics: {
                        views: variant.views,
                        redemptions: totalRedemptions,
                        conversions: totalConversions,
                        attributedRevenue: attributedRevenue.toFixed(2),
                        redemptionRate: redemptionRate.toFixed(4),
                        conversionRate: conversionRate.toFixed(4),
                        performanceScore: Number(variant.performanceScore) || 0
                    }
                };
            })
        );

        // Calculate totals
        const totalViews = variantStats.reduce((sum, v) => sum + v.metrics.views, 0);
        const totalRedemptions = variantStats.reduce((sum, v) => sum + v.metrics.redemptions, 0);
        const totalConversions = variantStats.reduce((sum, v) => sum + v.metrics.conversions, 0);
        const totalRevenue = variantStats.reduce((sum, v) => sum + parseFloat(v.metrics.attributedRevenue), 0);

        // Determine winner based on conversion rate
        const sortedByConversion = [...variantStats].sort(
            (a, b) => parseFloat(b.metrics.conversionRate) - parseFloat(a.metrics.conversionRate)
        );
        const winner = sortedByConversion[0];
        const isStatisticallySignificant = totalConversions >= 20; // Simple significance check

        return NextResponse.json({
            success: true,
            data: {
                test: {
                    id: test.id,
                    name: test.name,
                    status: test.status,
                    goal: test.goal,
                    campaign: test.campaign
                },
                summary: {
                    totalVariants: variantStats.length,
                    totalViews,
                    totalRedemptions,
                    totalConversions,
                    totalAttributedRevenue: totalRevenue.toFixed(2),
                    winner: winner ? {
                        id: winner.id,
                        name: winner.name,
                        conversionRate: winner.metrics.conversionRate,
                        isStatisticallySignificant
                    } : null
                },
                variants: variantStats
            }
        });

    } catch (error: any) {
        console.error('Error fetching A/B test attribution:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
