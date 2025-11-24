import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(['CREATOR'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const videoId = params.id;

        const video = await db.video.findUnique({
            where: { id: videoId },
            include: {
                campaign: {
                    include: {
                        founder: {
                            select: {
                                fullName: true,
                                companyName: true,
                            },
                        },
                    },
                },
            },
        });

        if (!video) {
            return ApiResponse.error('Video not found', 404);
        }

        // Verify ownership
        if (video.creatorId !== user.userId) {
            return ApiResponse.error('Unauthorized', 403);
        }

        return ApiResponse.success({
            video,
        });
    } catch (error) {
        console.error('Error fetching video:', error);
        return ApiResponse.error('Failed to fetch video', 500);
    }
});
