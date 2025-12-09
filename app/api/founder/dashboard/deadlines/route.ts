import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { formatDistanceToNow, addDays, isBefore, isToday, isTomorrow } from 'date-fns';

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
        const now = new Date();

        // Get campaigns with upcoming deadlines
        const upcomingCampaigns = await prisma.campaign.findMany({
            where: {
                founderId: userId,
                deadline: { gte: now },
                status: { in: ['ACTIVE', 'IN_PROGRESS', 'PENDING_CREATOR'] }
            },
            orderBy: { deadline: 'asc' },
            take: 5
        });

        // Get videos needing review
        const videosNeedingReview = await prisma.video.findMany({
            where: {
                campaign: { founderId: userId },
                status: { in: ['IN_REVIEW', 'DRAFT_SUBMITTED'] }
            },
            include: {
                campaign: true
            },
            orderBy: { submittedAt: 'asc' },
            take: 5
        });

        // Get revisions requested
        const revisionsRequested = await prisma.revision.findMany({
            where: {
                video: {
                    campaign: { founderId: userId }
                },
                resolvedAt: null
            },
            include: {
                video: {
                    include: {
                        campaign: true
                    }
                }
            },
            orderBy: { deadline: 'asc' },
            take: 3
        });

        // Combine and format deadlines
        const deadlines: any[] = [];

        // Add campaign deadlines
        upcomingCampaigns.forEach(campaign => {
            if (!campaign.deadline) return;

            let priority: 'high' | 'medium' | 'low' = 'low';
            let dateStr = '';

            if (isToday(campaign.deadline)) {
                priority = 'high';
                dateStr = 'Today';
            } else if (isTomorrow(campaign.deadline)) {
                priority = 'high';
                dateStr = 'Tomorrow';
            } else if (isBefore(campaign.deadline, addDays(now, 7))) {
                priority = 'medium';
                dateStr = formatDistanceToNow(campaign.deadline, { addSuffix: true });
            } else {
                priority = 'low';
                dateStr = formatDistanceToNow(campaign.deadline, { addSuffix: true });
            }

            deadlines.push({
                id: campaign.id,
                task: `Campaign deadline: ${campaign.name}`,
                date: dateStr,
                priority,
                actionUrl: `/founder/campaigns/${campaign.id}`
            });
        });

        // Add video review deadlines
        videosNeedingReview.forEach(video => {
            deadlines.push({
                id: video.id,
                task: `Review video for "${video.campaign.name}"`,
                date: video.submittedAt ? formatDistanceToNow(video.submittedAt, { addSuffix: true }) : 'Recently',
                priority: 'high' as const,
                actionUrl: `/founder/campaigns/${video.campaignId}`
            });
        });

        // Add revision deadlines
        revisionsRequested.forEach(revision => {
            if (!revision.deadline) return;

            let priority: 'high' | 'medium' | 'low' = 'medium';
            if (isBefore(revision.deadline, addDays(now, 2))) {
                priority = 'high';
            }

            deadlines.push({
                id: revision.id,
                task: `Revision due: ${revision.video.campaign.name}`,
                date: formatDistanceToNow(revision.deadline, { addSuffix: true }),
                priority,
                actionUrl: `/founder/campaigns/${revision.video.campaignId}`
            });
        });

        // Sort by priority and date
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        deadlines.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        return NextResponse.json({
            success: true,
            data: {
                deadlines: deadlines.slice(0, 10)
            }
        });

    } catch (error: any) {
        console.error('Error fetching deadlines:', error);

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
