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

        if (decoded.role !== 'FOUNDER') {
            return NextResponse.json(
                { success: false, error: 'Access denied. Founder role required.' },
                { status: 403 }
            );
        }

        const userId = decoded.userId;

        // Get recent video submissions
        const recentVideos = await prisma.video.findMany({
            where: {
                campaign: { founderId: userId },
                creatorId: { not: null }
            },
            include: {
                creator: true,
                campaign: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        // Get recent applications
        const recentApplications = await prisma.application.findMany({
            where: {
                campaign: { founderId: userId }
            },
            include: {
                creator: true,
                campaign: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        // Combine activities
        const activities: any[] = [];

        recentVideos.forEach(video => {
            if (!video.creator) return;

            let action = 'uploaded a video';
            if (video.status === 'DRAFT_SUBMITTED') {
                action = 'submitted a draft';
            } else if (video.status === 'POSTED') {
                action = 'posted a video';
            }

            activities.push({
                id: video.id,
                creator: video.creator.fullName,
                action,
                time: formatDistanceToNow(video.createdAt, { addSuffix: true }),
                campaignId: video.campaignId,
                timestamp: video.createdAt,
                actionUrl: `/founder/campaigns/${video.campaignId}`
            });
        });

        recentApplications.forEach(app => {
            activities.push({
                id: app.id,
                creator: app.creator.fullName,
                action: 'applied to campaign',
                time: formatDistanceToNow(app.createdAt, { addSuffix: true }),
                campaignId: app.campaignId,
                timestamp: app.createdAt,
                actionUrl: `/founder/campaigns/${app.campaignId}/applications`
            });
        });

        // Sort by timestamp
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        // Remove timestamp before sending
        const formattedActivities = activities.slice(0, 10).map(({ timestamp, ...rest }) => rest);

        return NextResponse.json({
            success: true,
            data: {
                activities: formattedActivities
            }
        });

    } catch (error: any) {
        console.error('Error fetching creator activity:', error);

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
