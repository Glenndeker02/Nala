import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireAuth, ApiResponse } from '@/lib/api-middleware';

// GET: Fetch notifications
export const GET = requireAuth(async (request: NextRequest, user) => {
    try {
        const notifications = await db.notification.findMany({
            where: { userId: user.userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        const unreadCount = await db.notification.count({
            where: {
                userId: user.userId,
                isRead: false,
            },
        });

        return ApiResponse.success({
            notifications,
            unreadCount,
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return ApiResponse.error('Failed to fetch notifications', 500);
    }
});

// PUT: Mark as read
export const PUT = requireAuth(async (request: NextRequest, user) => {
    try {
        const body = await request.json();
        const { notificationId, markAll } = body;

        if (markAll) {
            await db.notification.updateMany({
                where: { userId: user.userId, isRead: false },
                data: { isRead: true },
            });
        } else if (notificationId) {
            await db.notification.update({
                where: { id: notificationId, userId: user.userId },
                data: { isRead: true },
            });
        }

        return ApiResponse.success({ message: 'Notifications updated' });
    } catch (error) {
        console.error('Error updating notifications:', error);
        return ApiResponse.error('Failed to update notifications', 500);
    }
});
