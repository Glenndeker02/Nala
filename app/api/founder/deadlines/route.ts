import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export const GET = requireRole(['FOUNDER'], async (request: NextRequest, user) => {
    try {
        const now = new Date();
        const deadlines: any[] = [];

        // Get application acceptance deadlines
        const applications = await prisma.application.findMany({
            where: {
                campaign: {
                    founderId: user.userId
                },
                status: 'PENDING',
                acceptanceDeadline: {
                    gte: now
                }
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                creator: {
                    select: {
                        fullName: true
                    }
                }
            },
            orderBy: {
                acceptanceDeadline: 'asc'
            }
        });

        applications.forEach(app => {
            if (app.acceptanceDeadline) {
                const hoursUntil = (app.acceptanceDeadline.getTime() - now.getTime()) / (1000 * 60 * 60);
                deadlines.push({
                    id: `app-${app.id}`,
                    type: 'application_acceptance',
                    title: `Review application from ${app.creator.fullName}`,
                    dueDate: app.acceptanceDeadline.toISOString(),
                    urgency: hoursUntil < 24 ? 'urgent' : hoursUntil < 72 ? 'approaching' : 'normal',
                    actionUrl: `/founder/campaigns/${app.campaign.id}/applicants`,
                    relatedEntity: {
                        type: 'application',
                        id: app.id,
                        name: app.campaign.name
                    }
                });
            }
        });

        // Get video review deadlines
        const videosToReview = await prisma.video.findMany({
            where: {
                campaign: {
                    founderId: user.userId
                },
                status: 'PENDING_REVIEW',
                deadline: {
                    gte: now
                }
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                creator: {
                    select: {
                        fullName: true
                    }
                }
            },
            orderBy: {
                deadline: 'asc'
            }
        });

        videosToReview.forEach(video => {
            if (video.deadline) {
                const hoursUntil = (video.deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
                deadlines.push({
                    id: `video-${video.id}`,
                    type: 'review_deadline',
                    title: `Review draft for ${video.campaign.name}`,
                    dueDate: video.deadline.toISOString(),
                    urgency: hoursUntil < 24 ? 'urgent' : hoursUntil < 72 ? 'approaching' : 'normal',
                    actionUrl: `/founder/campaigns/${video.campaign.id}/review`,
                    relatedEntity: {
                        type: 'video',
                        id: video.id,
                        name: video.title || `Video ${video.videoNumber}`
                    }
                });
            }
        });

        // Get revision deadlines
        const revisions = await prisma.video.findMany({
            where: {
                campaign: {
                    founderId: user.userId
                },
                status: 'REVISION_REQUESTED',
                revisionDeadline: {
                    gte: now
                }
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                creator: {
                    select: {
                        fullName: true
                    }
                }
            },
            orderBy: {
                revisionDeadline: 'asc'
            }
        });

        revisions.forEach(video => {
            if (video.revisionDeadline) {
                const hoursUntil = (video.revisionDeadline.getTime() - now.getTime()) / (1000 * 60 * 60);
                deadlines.push({
                    id: `revision-${video.id}`,
                    type: 'revision_deadline',
                    title: `Revision due for ${video.campaign.name}`,
                    dueDate: video.revisionDeadline.toISOString(),
                    urgency: hoursUntil < 24 ? 'urgent' : hoursUntil < 72 ? 'approaching' : 'normal',
                    actionUrl: `/founder/campaigns/${video.campaign.id}/review`,
                    relatedEntity: {
                        type: 'video',
                        id: video.id,
                        name: video.title || `Video ${video.videoNumber}`
                    }
                });
            }
        });

        // Get posting deadlines
        const videosToPost = await prisma.video.findMany({
            where: {
                campaign: {
                    founderId: user.userId
                },
                status: 'APPROVED',
                deadline: {
                    gte: now
                }
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                creator: {
                    select: {
                        fullName: true
                    }
                }
            },
            orderBy: {
                deadline: 'asc'
            }
        });

        videosToPost.forEach(video => {
            if (video.deadline) {
                const hoursUntil = (video.deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
                deadlines.push({
                    id: `posting-${video.id}`,
                    type: 'posting_deadline',
                    title: `${video.creator.fullName} should post ${video.campaign.name}`,
                    dueDate: video.deadline.toISOString(),
                    urgency: hoursUntil < 24 ? 'urgent' : hoursUntil < 72 ? 'approaching' : 'normal',
                    actionUrl: `/founder/campaigns/${video.campaign.id}`,
                    relatedEntity: {
                        type: 'video',
                        id: video.id,
                        name: video.title || `Video ${video.videoNumber}`
                    }
                });
            }
        });

        // Sort by urgency and date, return top 5
        const sortedDeadlines = deadlines
            .sort((a, b) => {
                // Sort by urgency first
                const urgencyOrder = { urgent: 0, approaching: 1, normal: 2 };
                const urgencyDiff = urgencyOrder[a.urgency as keyof typeof urgencyOrder] -
                    urgencyOrder[b.urgency as keyof typeof urgencyOrder];
                if (urgencyDiff !== 0) return urgencyDiff;

                // Then by date
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            })
            .slice(0, 5);

        return NextResponse.json({
            success: true,
            data: {
                deadlines: sortedDeadlines
            }
        });

    } catch (error: any) {
        console.error('Error fetching deadlines:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
