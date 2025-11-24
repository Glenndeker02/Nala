import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, ApiResponse } from '@/lib/api-middleware';

export const GET = requireAuth(async (request: NextRequest, user) => {
    try {
        const recommendations = await db.formatRecommendation.findMany({
            where: {
                creatorId: user.userId,
                dismissed: false,
            },
            include: {
                format: true,
            },
            orderBy: {
                compatibilityScore: 'desc',
            },
            take: 5,
        });

        return ApiResponse.success({ recommendations });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return ApiResponse.error('Failed to fetch recommendations', 500);
    }
});
