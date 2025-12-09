import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { z } from 'zod';

// POST - Creator uploads video for a specific variant
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string; abId: string; variantId: string } }
) {
    try {
        const user = await requireRole(req, ['CREATOR']);
        const { id: campaignId, abId, variantId } = params;
        const body = await req.json();

        const uploadSchema = z.object({
            videoUrl: z.string().url('Valid video URL is required'),
        });

        const validation = uploadSchema.safeParse(body);
        if (!validation.success) {
            return ApiResponse.error('Validation failed', 400, validation.error.errors);
        }

        const { videoUrl } = validation.data;

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

        // Verify creator is assigned to this test
        if (!variant.test.assignedCreatorIds.includes(user.id)) {
            return ApiResponse.error('You are not assigned to this A/B test', 403);
        }

        // Update variant with upload
        const updatedVariant = await db.aBTestVariant.update({
            where: { id: variantId },
            data: {
                videoUploadUrl: videoUrl,
                uploadedAt: new Date(),
                approvalStatus: 'PENDING_REVIEW',
            },
        });

        // Update test status if all variants uploaded
        const allVariants = await db.aBTestVariant.findMany({
            where: { testId: abId },
        });

        const allUploaded = allVariants.every(v => v.approvalStatus !== 'PENDING_UPLOAD');
        if (allUploaded) {
            await db.aBTest.update({
                where: { id: abId },
                data: { status: 'IN_REVIEW' },
            });
        }

        // Notify founder
        await db.notification.create({
            data: {
                userId: variant.test.campaign.founderId,
                type: 'AB_TEST_UPLOAD_RECEIVED',
                title: 'A/B Test Video Uploaded',
                message: `${user.fullName} uploaded a video for ${variant.variantName} in "${variant.test.name}"`,
                link: `/founder/campaigns/${campaignId}/ab-tests/${abId}`,
            },
        });

        return ApiResponse.success(updatedVariant);
    } catch (error: any) {
        console.error('Error uploading variant video:', error);
        return ApiResponse.error(error.message || 'Failed to upload video', 500);
    }
}
