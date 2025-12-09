import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { z } from 'zod';

// POST - Conclude A/B test and select winner
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string; abId: string } }
) {
    try {
        const user = await requireRole(req, ['FOUNDER', 'ADMIN']);
        const { id: campaignId, abId } = params;
        const body = await req.json();

        const concludeSchema = z.object({
            winnerVariantId: z.string(),
            conclusionNotes: z.string().optional(),
            adoptAction: z.enum(['CONVERT_TO_FORMAT', 'REQUEST_MORE', 'REPLACE_LOSING']).optional(),
        });

        const validation = concludeSchema.safeParse(body);
        if (!validation.success) {
            return ApiResponse.error('Validation failed', 400, validation.error.errors);
        }

        const { winnerVariantId, conclusionNotes, adoptAction } = validation.data;

        // Verify test exists
        const test = await db.aBTest.findUnique({
            where: { id: abId },
            include: {
                campaign: {
                    select: { founderId: true },
                },
                variants: true,
            },
        });

        if (!test || test.campaignId !== campaignId) {
            return ApiResponse.error('A/B test not found', 404);
        }

        // Verify campaign ownership
        if (test.campaign.founderId !== user.id && user.role !== 'ADMIN') {
            return ApiResponse.error('Unauthorized', 403);
        }

        // Verify winner variant exists
        const winnerVariant = test.variants.find(v => v.id === winnerVariantId);
        if (!winnerVariant) {
            return ApiResponse.error('Winner variant not found', 400);
        }

        // Update test
        const updatedTest = await db.aBTest.update({
            where: { id: abId },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                winnerVariantId,
                conclusionNotes,
                adoptAction,
            },
        });

        // Notify assigned creators with test summary
        for (const creatorId of test.assignedCreatorIds) {
            await db.notification.create({
                data: {
                    userId: creatorId,
                    type: 'AB_TEST_COMPLETED',
                    title: 'A/B Test Completed',
                    message: `The A/B test "${test.name}" has been concluded. Winner: ${winnerVariant.variantName}`,
                    link: `/creator/ab-tests/${abId}`,
                },
            });
        }

        return ApiResponse.success(updatedTest);
    } catch (error: any) {
        console.error('Error concluding A/B test:', error);
        return ApiResponse.error(error.message || 'Failed to conclude A/B test', 500);
    }
}
