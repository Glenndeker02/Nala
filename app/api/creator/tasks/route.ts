import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(['CREATOR'], async (request: NextRequest, user) => {
    try {
        const videos = await db.video.findMany({
            where: {
                creatorId: user.userId,
            },
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
            orderBy: {
                createdAt: 'desc',
            },
        });

        return ApiResponse.success({
            videos,
        });
    } catch (error) {
        console.error('Error fetching creator tasks:', error);
        return ApiResponse.error('Failed to fetch tasks', 500);
    }
});
