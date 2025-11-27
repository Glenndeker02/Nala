import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { formatDistanceToNow } from 'date-fns';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        // Extract and verify JWT token
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
            userId: string;
            role: string;
        };

        if (decoded.role !== 'CREATOR') {
            return NextResponse.json(
                { success: false, error: 'Access denied. Creator role required.' },
                { status: 403 }
            );
        }

        const userId = decoded.userId;

        // Get query parameters
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '10');
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        // Fetch notifications for creator
        const notifications = await prisma.notification.findMany({
            where: {
                userId: userId,
                ...(unreadOnly && { isRead: false })
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        // Count unread notifications
        const unreadCount = await prisma.notification.count({
            where: {
                userId: userId,
                isRead: false
            }
        });

        // Format notifications
        const formattedNotifications = notifications.map(notif => ({
            id: notif.id,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            time: formatDistanceToNow(notif.createdAt, { addSuffix: true }),
            isRead: notif.isRead,
            link: notif.link
        }));

        return NextResponse.json({
            success: true,
            data: {
                notifications: formattedNotifications,
                unreadCount
            }
        });

    } catch (error: any) {
        console.error('Error fetching creator notifications:', error);

        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json(
                { success: false, error: 'Invalid token' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
