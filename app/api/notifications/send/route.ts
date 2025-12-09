import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitToUser } from '@/lib/websocket';

// Internal API for sending notifications
// This should only be called from other backend endpoints, not directly from frontend
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, type, message, actionRoute, metadata } = body;

        if (!userId || !type || !message) {
            return NextResponse.json(
                { success: false, error: 'userId, type, and message are required' },
                { status: 400 }
            );
        }

        // Create notification in database
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                message,
                actionRoute: actionRoute || null,
                metadata: metadata || null,
                isRead: false
            }
        });

        // Send real-time notification via WebSocket
        try {
            emitToUser(userId, 'notification', {
                id: notification.id,
                type: notification.type,
                message: notification.message,
                actionRoute: notification.actionRoute,
                createdAt: notification.createdAt.toISOString(),
                isRead: false
            });
        } catch (wsError) {
            console.error('WebSocket emit error:', wsError);
            // Continue even if WebSocket fails - notification is still in DB
        }

        // TODO: Send email notification if user preferences allow
        // const user = await prisma.user.findUnique({
        //     where: { id: userId },
        //     include: { notificationPreferences: true }
        // });
        // 
        // if (user?.notificationPreferences?.emailNotifications) {
        //     await sendEmail({
        //         to: user.email,
        //         subject: `Tupstory: ${type}`,
        //         body: message
        //     });
        // }

        return NextResponse.json({
            success: true,
            data: {
                notificationId: notification.id,
                sentAt: notification.createdAt.toISOString()
            }
        });

    } catch (error: any) {
        console.error('Error sending notification:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
