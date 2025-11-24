import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;

        // Verify ownership
        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign) {
            return ApiResponse.error('Campaign not found', 404);
        }

        if (campaign.founderId !== user.userId) {
            return ApiResponse.error('Unauthorized', 403);
        }

        const applications = await db.application.findMany({
            where: { campaignId },
            include: {
                creator: {
                    include: {
                        creatorProfile: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return ApiResponse.success({
            applications,
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        return ApiResponse.error('Failed to fetch applications', 500);
    }
});
