import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';
import { z } from 'zod';

const assignSchema = z.object({
    creatorId: z.string().uuid(),
    baseFee: z.number().optional(),
});

export const POST = requireRole(['FOUNDER', 'ADMIN'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;
        const body = await request.json();

        // Validation
        const result = assignSchema.safeParse(body);
        if (!result.success) {
            return ApiResponse.error("Invalid input", 400, result.error.errors);
        }
        const { creatorId, baseFee } = result.data;

        // Check campaign
        const campaign = await db.campaign.findUnique({
            where: { id: campaignId }
        });

        if (!campaign) {
            return ApiResponse.error("Campaign not found", 404);
        }

        // Verify ownership if founder
        if (user.role === 'FOUNDER' && campaign.founderId !== user.userId) {
            return ApiResponse.error("Unauthorized", 403);
        }

        // Check if duplicate assignment
        const existing = await db.creatorCampaignAssignment.findUnique({
            where: {
                campaignId_creatorId: {
                    campaignId,
                    creatorId
                }
            }
        });

        if (existing) {
            return ApiResponse.error("Creator already assigned", 409);
        }

        // Create assignment (Invite)
        const assignment = await db.creatorCampaignAssignment.create({
            data: {
                campaignId,
                creatorId,
                baseFee: baseFee ? baseFee : undefined,
                status: 'INVITED',
            }
        });

        return ApiResponse.success({ assignment }, 201);

    } catch (error) {
        console.error('Error assigning creator:', error);
        return ApiResponse.error('Internal Server Error', 500);
    }
});
