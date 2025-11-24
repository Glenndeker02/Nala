import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(['CREATOR'], async (request: NextRequest, user) => {
    try {
        const connections = await db.socialConnection.findMany({
            where: {
                userId: user.userId,
            },
            select: {
                id: true,
                platform: true,
                platformUserId: true,
                isActive: true,
                connectedAt: true,
                expiresAt: true,
            },
            orderBy: {
                connectedAt: 'desc',
            },
        });

        return ApiResponse.success({
            connections,
        });
    } catch (error) {
        console.error('Error fetching connections:', error);
        return ApiResponse.error('Failed to fetch connections', 500);
    }
});
