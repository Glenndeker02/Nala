import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireAuth, ApiResponse } from '@/lib/api-middleware';

export const PATCH = requireAuth(async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const notificationId = params.id;

        const notification = await db.notification.findUnique({
            where: { id: notificationId },
        });

        if (!notification) {
            return ApiResponse.error('Notification not found', 404);
        }

        if (notification.userId !== user.userId) {
            return ApiResponse.error('Unauthorized', 403);
        }

        const updatedNotification = await db.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });

        return ApiResponse.success(updatedNotification);
    } catch (error) {
        console.error('Error updating notification:', error);
        return ApiResponse.error('Failed to update notification', 500);
    }
});
