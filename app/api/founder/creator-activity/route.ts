import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export const GET = requireRole(['FOUNDER'], async (request: NextRequest, user) => {
    try {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);

        const activities: any[] = [];

        // Get recent video uploads (drafts and revisions)
        const recentVideos = await prisma.video.findMany({
            where: {
                campaign: {
                    founderId: user.userId
                },
                updatedAt: {
                    gte: weekStart
                },
                status: {
                    in: ['PENDING_REVIEW', 'REVISION_REQUESTED', 'APPROVED', 'POSTED']
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
                        id: true,
                        fullName: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            },
            take: 20
        });

        recentVideos.forEach(video => {
            let activityType = 'DRAFT_UPLOADED';
            let title = `${video.creator.fullName} uploaded draft`;
            let actionUrl = `/founder/campaigns/${video.campaign.id}/review`;

            if (video.status === 'POSTED') {
                activityType = 'VIDEO_POSTED';
                title = `${video.creator.fullName} posted video`;
                actionUrl = `/founder/campaigns/${video.campaign.id}`;
            } else if (video.status === 'REVISION_REQUESTED') {
                activityType = 'REVISION_UPLOADED';
                title = `${video.creator.fullName} uploaded revision`;
            }

            activities.push({
                id: `video-${video.id}`,
                activityType,
                title,
                description: `Campaign: ${video.campaign.name}`,
                actionUrl,
                timestamp: video.updatedAt.toISOString(),
                creator: {
                    id: video.creator.id,
                    name: video.creator.fullName
                }
            });
        });

        // Get recent payments
        const recentPayments = await prisma.payment.findMany({
            where: {
                campaign: {
                    founderId: user.userId
                },
                createdAt: {
                    gte: weekStart
                },
                status: 'COMPLETED'
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                recipient: {
                    select: {
                        id: true,
                        fullName: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        });

        recentPayments.forEach(payment => {
            const isBonus = payment.type === 'PERFORMANCE_BONUS';
            activities.push({
                id: `payment-${payment.id}`,
                activityType: isBonus ? 'BONUS_TRIGGERED' : 'PAYMENT_RECEIVED',
                title: isBonus
                    ? `Bonus paid to ${payment.recipient.fullName}`
                    : `Payment completed for ${payment.recipient.fullName}`,
                description: `$${Number(payment.amount).toFixed(2)} - ${payment.campaign.name}`,
                actionUrl: `/founder/campaigns/${payment.campaign.id}`,
                timestamp: payment.createdAt.toISOString(),
                creator: {
                    id: payment.recipient.id,
                    name: payment.recipient.fullName
                }
            });
        });

        // Get recent applications
        const recentApplications = await prisma.application.findMany({
            where: {
                campaign: {
                    founderId: user.userId
                },
                createdAt: {
                    gte: weekStart
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
                        id: true,
                        fullName: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        });

        recentApplications.forEach(app => {
            activities.push({
                id: `app-${app.id}`,
                activityType: 'APPLICATION_SUBMITTED',
                title: `${app.creator.fullName} applied`,
                description: `Campaign: ${app.campaign.name}`,
                actionUrl: `/founder/campaigns/${app.campaign.id}/applicants`,
                timestamp: app.createdAt.toISOString(),
                creator: {
                    id: app.creator.id,
                    name: app.creator.fullName
                }
            });
        });

        // Sort all activities by timestamp and take top 5
        const sortedActivities = activities
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);

        return NextResponse.json({
            success: true,
            data: {
                activities: sortedActivities
            }
        });

    } catch (error: any) {
        console.error('Error fetching creator activity:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
