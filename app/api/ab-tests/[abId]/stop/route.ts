import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// POST - Stop AB test and compute final winner
export const POST = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { abId: string } }) => {
    try {
        const { abId } = params;

        // Get AB test with campaign
        const abTest = await prisma.aBTest.findUnique({
            where: { id: abId },
            include: {
                campaign: {
                    select: {
                        founderId: true
                    }
                },
                variants: true
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

        if (abTest.status === 'COMPLETED' || abTest.status === 'CANCELLED') {
            return NextResponse.json(
                { success: false, error: 'AB test is already stopped' },
                { status: 400 }
            );
        }

        // Determine winner based on success metric
        let winnerId: string | null = null;
        let maxScore = -Infinity;

        abTest.variants.forEach(variant => {
            let score = 0;

            switch (abTest.successMetric) {
                case 'VIEW_THROUGH_RATE':
                case 'CONVERSION_RATE':
                    score = variant.views > 0 ? variant.conversions / variant.views : 0;
                    break;
                case 'ENGAGEMENT_RATE':
                    score = Number(variant.performanceScore || 0);
                    break;
                case 'COST_PER_VIEW':
                    score = variant.views > 0 ? -(Number(variant.costPerView || 0)) : 0; // Negative because lower is better
                    break;
                case 'TOTAL_VIEWS':
                    score = variant.views;
                    break;
                default:
                    score = variant.views;
            }

            if (score > maxScore) {
                maxScore = score;
                winnerId = variant.id;
            }
        });

        // Calculate confidence (simplified)
        const confidence = maxScore > 0 ? Math.min(0.95, maxScore / (maxScore + 1)) : 0;

        // Update AB test
        const updated = await prisma.aBTest.update({
            where: { id: abId },
            data: {
                status: 'COMPLETED',
                winnerVariantId: winnerId,
                confidence: confidence,
                completedAt: new Date()
            },
            include: {
                variants: true
            }
        });

        const winner = updated.variants.find(v => v.id === winnerId);

        return NextResponse.json({
            success: true,
            message: 'AB test stopped successfully',
            data: {
                abTestId: updated.id,
                status: updated.status,
                winnerId,
                winnerName: winner?.variantName || 'Unknown',
                confidence: Number((confidence * 100).toFixed(2)),
                completedAt: updated.completedAt?.toISOString()
            }
        });

    } catch (error: any) {
        console.error('Error stopping AB test:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
