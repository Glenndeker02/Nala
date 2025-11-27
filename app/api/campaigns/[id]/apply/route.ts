import { NextRequest } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

const applySchema = z.object({
    message: z.string().max(500).optional(),
    portfolioLinks: z.array(z.string().url()).optional(),
});

export const POST = requireRole(['CREATOR'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;
        const body = await request.json();

        const validation = applySchema.safeParse(body);
        if (!validation.success) {
            return ApiResponse.error('Validation failed', 400, validation.error.errors);
        }

        const { message, portfolioLinks } = validation.data;

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

        if (!campaign) {
            return ApiResponse.error('Campaign not found', 404);
        }

        if (campaign.status !== 'ACTIVE') {
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

        if (existingApplication) {
            return ApiResponse.error('You have already applied to this campaign', 400);
        }

        // Get creator details for notification
        const creator = await db.user.findUnique({
            where: { id: user.userId },
            select: { fullName: true, email: true }
        });

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

            // Create notification for founder
            await tx.notification.create({
                data: {
                    userId: campaign.founderId,
                    type: 'APPLICATION_RECEIVED',
                    title: 'New Campaign Application',
                    message: `${creator?.fullName || 'A creator'} applied to your campaign "${campaign.title || campaign.name}"`,
                    metadata: {
                        campaignId: campaign.id,
                        campaignName: campaign.title || campaign.name,
                        creatorId: user.userId,
                        creatorName: creator?.fullName,
                        applicationId: application.id
                    },
                    read: false
                }
            });

            return application;
        });

        return ApiResponse.success({
            application: result,
            message: 'Application submitted successfully',
        });
    } catch (error) {
        console.error('Application error:', error);
        return ApiResponse.error('Failed to submit application', 500);
    }
});
