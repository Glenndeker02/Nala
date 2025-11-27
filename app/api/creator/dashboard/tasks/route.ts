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

        if (decoded.role !== 'CREATOR') {
            return NextResponse.json(
                { success: false, error: 'Access denied. Creator role required.' },
                { status: 403 }
            );
        }

        const userId = decoded.userId;
        const now = new Date();

        const tasks: any[] = [];

        // Get pending video submissions
        const pendingVideos = await prisma.video.findMany({
            where: {
                creatorId: userId,
                status: { in: ['PENDING', 'REVISION_REQUESTED'] }
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true,
                        deadline: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        pendingVideos.forEach(video => {
            let priority: 'high' | 'medium' | 'low' = 'medium';
            let dueDate = 'No deadline';

            if (video.campaign.deadline) {
                const deadline = video.campaign.deadline;

                if (isToday(deadline)) {
                    priority = 'high';
                    dueDate = 'Today';
                } else if (isTomorrow(deadline)) {
                    priority = 'high';
                    dueDate = 'Tomorrow';
                } else if (isBefore(deadline, addDays(now, 3))) {
                    priority = 'high';
                    dueDate = formatDistanceToNow(deadline, { addSuffix: true });
                } else if (isBefore(deadline, addDays(now, 7))) {
                    priority = 'medium';
                    dueDate = formatDistanceToNow(deadline, { addSuffix: true });
                } else {
                    priority = 'low';
                    dueDate = formatDistanceToNow(deadline, { addSuffix: true });
                }
            }

            const taskType = video.status === 'REVISION_REQUESTED' ? 'Submit revision' : 'Submit video';

            tasks.push({
                id: video.id,
                task: `${taskType}: ${video.campaign.name}`,
                dueDate,
                priority,
                type: video.status === 'REVISION_REQUESTED' ? 'revision' : 'submission',
                campaignId: video.campaignId
            });
        });

        // Get active revision requests
        const revisions = await prisma.revision.findMany({
            where: {
                video: {
                    creatorId: userId
                },
                resolvedAt: null
            },
            include: {
                video: {
                    include: {
                        campaign: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: { deadline: 'asc' },
            take: 5
        });

        revisions.forEach(revision => {
            let priority: 'high' | 'medium' | 'low' = 'medium';
            let dueDate = 'No deadline';

            if (revision.deadline) {
                if (isBefore(revision.deadline, addDays(now, 2))) {
                    priority = 'high';
                }
                dueDate = formatDistanceToNow(revision.deadline, { addSuffix: true });
            }

            tasks.push({
                id: revision.id,
                task: `Address feedback: ${revision.video.campaign.name}`,
                dueDate,
                priority,
                type: 'revision',
                campaignId: revision.video.campaignId
            });
        });

        // Sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        return NextResponse.json({
            success: true,
            data: {
                tasks: tasks.slice(0, 10)
            }
        });

    } catch (error: any) {
        console.error('Error fetching creator tasks:', error);

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
