import { NextRequest } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

const applySchema = z.object({
    message: z.string().max(500).optional(),
    portfolioLinks: z.array(z.string()).optional(),
});

export const POST = requireRole(['CREATOR'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;
        console.log('[Apply] Campaign ID:', campaignId);
        console.log('[Apply] User:', user);

        const body = await request.json();
        console.log('[Apply] Request body:', body);

        const validation = applySchema.safeParse(body);
        if (!validation.success) {
            console.error('[Apply] Validation failed:', validation.error.errors);
            return ApiResponse.error('Validation failed', 400, validation.error.errors);
        }

        const { message, portfolioLinks } = validation.data;
        console.log('[Apply] Validated data:', { message, portfolioLinks });

        // Check if campaign exists and is active
        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
            include: {
                founder: {
                    select: {
                        id: true,
                        fullName: true
                    }
                }
            }
        });

        console.log('[Apply] Campaign found:', campaign ? { id: campaign.id, status: campaign.status } : 'NOT FOUND');

        if (!campaign) {
            return ApiResponse.error('Campaign not found', 404);
        }

        // Phase 2: Support ACTIVE_ACCEPTING_APPLICATIONS status
        if (campaign.status !== 'ACTIVE' && campaign.status !== 'ACTIVE_ACCEPTING_APPLICATIONS' && campaign.status !== 'PENDING_CREATOR') {
            console.error('[Apply] Campaign status not accepting applications:', campaign.status);
            return ApiResponse.error('Campaign is not accepting applications', 400);
        }

        // Check if already applied
        const existingApplication = await db.application.findUnique({
            where: {
                campaignId_creatorId: {
                    campaignId,
                    creatorId: user.userId,
                },
            },
        });

        console.log('[Apply] Existing application:', existingApplication ? 'FOUND' : 'NONE');

        if (existingApplication) {
            return ApiResponse.error('You have already applied to this campaign', 400);
        }

        // Get creator details for notification
        const creator = await db.user.findUnique({
            where: { id: user.userId },
            select: { fullName: true, email: true }
        });

        console.log('[Apply] Creator details:', creator);

        // Create application and notification in a transaction
        const result = await db.$transaction(async (tx) => {
            // Create application
            const application = await tx.application.create({
                data: {
                    campaignId,
                    creatorId: user.userId,
                    message,
                    portfolioLinks: portfolioLinks || [],
                    status: 'PENDING',
                },
            });

            console.log('[Apply] Application created:', application.id);

            // Create notification for founder
            await tx.notification.create({
                data: {
                    userId: campaign.founderId,
                    type: 'APPLICATION_UPDATE',
                    title: 'New Campaign Application',
                    message: `${creator?.fullName || 'A creator'} applied to your campaign "${campaign.name}"`,
                    link: `/founder/campaigns/${campaign.id}/applications`,
                    isRead: false
                }
            });

            console.log('[Apply] Notification created');

            return application;
        });

        console.log('[Apply] Transaction completed successfully');

        return ApiResponse.success({
            application: result,
            message: 'Application submitted successfully',
        });
    } catch (error) {
        console.error('[Apply] Error details:', error);
        console.error('[Apply] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return ApiResponse.error('Failed to submit application', 500);
    }
});
