import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { z } from 'zod';

// POST - Founder reviews and approves/requests revision for a variant
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string; abId: string; variantId: string } }
) {
    try {
        const user = await requireRole(req, ['FOUNDER', 'ADMIN']);
        const { id: campaignId, abId, variantId } = params;
        const body = await req.json();

        const reviewSchema = z.object({
            action: z.enum(['APPROVE', 'REQUEST_REVISION']),
            feedback: z.string().optional(),
            revisionDeadline: z.string().datetime().optional(),
        });

        const validation = reviewSchema.safeParse(body);
        if (!validation.success) {
            return ApiResponse.error('Validation failed', 400, validation.error.errors);
        }

        const { action, feedback, revisionDeadline } = validation.data;

        // Verify test and variant exist
        const variant = await db.aBTestVariant.findUnique({
            where: { id: variantId },
            include: {
                test: {
                    include: {
                        campaign: {
                            select: { founderId: true },
                        },
                    },
                },
            },
        });

        if (!variant || variant.test.campaignId !== campaignId || variant.testId !== abId) {
            return ApiResponse.error('Variant not found', 404);
        }

        // Verify campaign ownership
        if (variant.test.campaign.founderId !== user.id && user.role !== 'ADMIN') {
            return ApiResponse.error('Unauthorized', 403);
        }

        // Update variant based on action
        const updateData: any = {};

        if (action === 'APPROVE') {
            updateData.approvalStatus = 'APPROVED';
            updateData.approvedAt = new Date();
            updateData.founderFeedback = null;
            updateData.revisionDeadline = null;
        } else {
            updateData.approvalStatus = 'REVISION_REQUESTED';
            updateData.founderFeedback = feedback || 'Revision requested';
            updateData.revisionDeadline = revisionDeadline ? new Date(revisionDeadline) : null;
        }

        const updatedVariant = await db.aBTestVariant.update({
            where: { id: variantId },
            data: updateData,
        });

        // Notify creator
        const notificationType = action === 'APPROVE' ? 'AB_TEST_APPROVED' : 'AB_TEST_REVISION_REQUESTED';
        const notificationTitle = action === 'APPROVE' ? 'Video Approved!' : 'Revision Requested';
        const notificationMessage = action === 'APPROVE'
            ? `Your ${variant.variantName} video for "${variant.test.name}" has been approved`
            : `Revision requested for ${variant.variantName} in "${variant.test.name}"`;

        // Get creator ID from test's assigned creators
        for (const creatorId of variant.test.assignedCreatorIds) {
            await db.notification.create({
                data: {
                    userId: creatorId,
                    type: notificationType,
                    title: notificationTitle,
                    message: notificationMessage,
                    link: `/creator/ab-tests/${abId}`,
                },
            });
        }

        return ApiResponse.success(updatedVariant);
    } catch (error: any) {
        console.error('Error reviewing variant:', error);
        return ApiResponse.error(error.message || 'Failed to review variant', 500);
    }
}
