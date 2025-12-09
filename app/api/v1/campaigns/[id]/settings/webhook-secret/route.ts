import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(['FOUNDER', 'ADMIN'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;
        const campaign = await db.campaign.findUnique({ where: { id: campaignId } });

        if (!campaign) return ApiResponse.error("Campaign not found", 404);
        if (user.role === 'FOUNDER' && campaign.founderId !== user.userId) {
            return ApiResponse.error("Unauthorized", 403);
        }

        return ApiResponse.success({ secret: campaign.webhookSecret });

    } catch (error) {
        console.error('Error fetching secret:', error);
        return ApiResponse.error('Internal Server Error', 500);
    }
});
