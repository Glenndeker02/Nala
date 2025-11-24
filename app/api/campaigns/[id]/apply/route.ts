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

        // Create application
        const application = await db.application.create({
            data: {
                campaignId,
                creatorId: user.userId,
                message,
                portfolioLinks: portfolioLinks || [],
                status: 'PENDING',
            },
        });

        return ApiResponse.success({
            application,
            message: 'Application submitted successfully',
        });
    } catch (error) {
        console.error('Application error:', error);
        return ApiResponse.error('Failed to submit application', 500);
    }
});
