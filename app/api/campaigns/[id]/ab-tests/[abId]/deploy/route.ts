import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';

// POST - Deploy A/B test (start tracking)
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string; abId: string } }
) {
    try {
        const user = await requireRole(req, ['FOUNDER', 'ADMIN']);
        const { id: campaignId, abId } = params;

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

        // Verify all variants are approved
        const allApproved = test.variants.every(v => v.approvalStatus === 'APPROVED');
        if (!allApproved) {
            return ApiResponse.error('All variants must be approved before deployment', 400);
        }

        // Update test and variants to deployed status
        const updatedTest = await db.aBTest.update({
            where: { id: abId },
            data: {
                status: 'ACTIVE',
                deployedAt: new Date(),
            },
        });

        // Update all variants
        await db.aBTestVariant.updateMany({
            where: { testId: abId },
            data: {
                approvalStatus: 'DEPLOYED',
                deployedAt: new Date(),
            },
        });

        // Notify assigned creators
        for (const creatorId of test.assignedCreatorIds) {
            await db.notification.create({
                data: {
                    userId: creatorId,
                    type: 'AB_TEST_DEPLOYED',
                    title: 'A/B Test is Live!',
                    message: `The A/B test "${test.name}" is now live and tracking performance`,
                    link: `/creator/ab-tests/${abId}`,
                },
            });
        }

        return ApiResponse.success(updatedTest);
    } catch (error: any) {
        console.error('Error deploying A/B test:', error);
        return ApiResponse.error(error.message || 'Failed to deploy A/B test', 500);
    }
}
