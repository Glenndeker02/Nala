import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;

        // Verify campaign ownership
        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign) {
            return ApiResponse.error('Campaign not found', 404);
        }

        if (campaign.founderId !== user.userId) {
            return ApiResponse.error('Unauthorized', 403);
        }

        // Fetch all videos for this campaign
        const videos = await db.video.findMany({
            where: { campaignId },
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return ApiResponse.success({
            videos,
        });
    } catch (error) {
        console.error('Error fetching campaign videos:', error);
        return ApiResponse.error('Failed to fetch videos', 500);
    }
});
