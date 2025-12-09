import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireRole } from '@/lib/auth';

export const GET = requireRole(['FOUNDER'], async (request: NextRequest, user) => {
    try {
        // Calculate weekly date range
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);

        // Get total spent this week
        const weeklyPayments = await prisma.payment.aggregate({
            where: {
                campaign: {
                    founderId: user.userId
                },
                createdAt: {
                    gte: weekStart
                },
                status: {
                    in: ['COMPLETED', 'PROCESSING']
                }
            },
            _sum: {
                amount: true
            }
        });

        const totalSpent = Number(weeklyPayments._sum.amount || 0);

        // Get new videos this week
        const newVideos = await prisma.video.count({
            where: {
                campaign: {
                    founderId: user.userId
                },
                createdAt: {
                    gte: weekStart
                }
            }
        });

        // Get active creators this week
        const activeCreators = await prisma.video.findMany({
            where: {
                campaign: {
                    founderId: user.userId
                },
                updatedAt: {
                    gte: weekStart
                }
            },
            select: {
                creatorId: true
            },
            distinct: ['creatorId']
        });

        // Get views achieved this week
        const videosThisWeek = await prisma.video.findMany({
            where: {
                campaign: {
                    founderId: user.userId,
                    status: {
                        in: ['ACTIVE', 'IN_PROGRESS', 'ACTIVE_ACCEPTING_APPLICATIONS']
                    }
                },
                status: {
                    in: ['POSTED', 'COMPLETED']
                }
            },
            select: {
                views: true,
                campaign: {
                    select: {
                        targetViews: true
                    }
                }
            }
        });

        let viewsAchieved = 0;
        let targetViews = 0;

        videosThisWeek.forEach(video => {
            viewsAchieved += video.views || 0;
            targetViews += Number(video.campaign.targetViews || 0);
        });

        // If no target views set, calculate based on active campaigns
        if (targetViews === 0) {
            const activeCampaigns = await prisma.campaign.findMany({
                where: {
                    founderId: user.userId,
                    status: {
                        in: ['ACTIVE', 'IN_PROGRESS', 'ACTIVE_ACCEPTING_APPLICATIONS']
                    }
                },
                select: {
                    targetViews: true
                }
            });

            targetViews = activeCampaigns.reduce((sum, campaign) => {
                return sum + Number(campaign.targetViews || 0);
            }, 0);
        }

        return NextResponse.json({
            success: true,
            data: {
                totalSpent,
                newVideos,
                activeCreators: activeCreators.length,
                viewsAchieved,
                targetViews
            }
        });

    } catch (error: any) {
        console.error('Error fetching weekly summary:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
