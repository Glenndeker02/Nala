import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireAuth, ApiResponse } from '@/lib/api-middleware';

export const GET = requireAuth(async (request: NextRequest, user) => {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        const whereClause: any = {
            userId: user.userId,
        };

        if (unreadOnly) {
            whereClause.isRead = false;
        }

        const [notifications, totalCount, unreadCount] = await Promise.all([
            db.notification.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            db.notification.count({ where: whereClause }),
            db.notification.count({
                where: {
                    userId: user.userId,
                    isRead: false
                }
            })
        ]);

        return ApiResponse.success({
            notifications,
            pagination: {
                total: totalCount,
                limit,
                offset,
                hasMore: offset + notifications.length < totalCount
            },
            unreadCount
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return ApiResponse.error('Failed to fetch notifications', 500);
    }
});
