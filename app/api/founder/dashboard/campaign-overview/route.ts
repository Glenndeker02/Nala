import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireRole } from '@/lib/auth';

export const GET = requireRole(['FOUNDER'], async (request: NextRequest, user) => {
    try {
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'weekly'; // weekly, monthly, yearly

        // Calculate date range
        const now = new Date();
        let startDate: Date;

        switch (period) {
            case 'monthly':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'yearly':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case 'weekly':
            default:
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
        }

        // Get active campaigns
        const activeCampaigns = await db.campaign.count({
            where: {
                founderId: user.userId,
                status: {
                    in: ['ACTIVE', 'IN_PROGRESS', 'ACTIVE_ACCEPTING_APPLICATIONS']
                }
            }
        });

        // Get completed campaigns
        const completedCampaigns = await db.campaign.count({
            where: {
                founderId: user.userId,
                status: 'COMPLETED'
            }
        });

        // Get total budget and spent
        const budgetData = await db.campaign.aggregate({
            where: {
                founderId: user.userId,
                status: {
                    in: ['ACTIVE', 'IN_PROGRESS', 'COMPLETED', 'ACTIVE_ACCEPTING_APPLICATIONS']
                }
            },
            _sum: {
                totalBudget: true,
                escrowBalance: true
            }
        });

        const totalBudget = Number(budgetData._sum.totalBudget || 0);
        const budgetSpent = totalBudget - Number(budgetData._sum.escrowBalance || 0);

        // Calculate average engagement rate from videos
        const videos = await db.video.findMany({
            where: {
                campaign: {
                    founderId: user.userId
                },
                status: {
                    in: ['POSTED', 'COMPLETED']
                }
            },
            select: {
                views: true,
                performanceMetrics: true
            }
        });

        let totalEngagement = 0;
        let videoCount = 0;

        videos.forEach(video => {
            if (video.performanceMetrics && typeof video.performanceMetrics === 'object') {
                const metrics = video.performanceMetrics as any;
                if (metrics.engagementRate) {
                    totalEngagement += Number(metrics.engagementRate);
                    videoCount++;
                }
            }
        });

        const avgEngagementRate = videoCount > 0
            ? Number((totalEngagement / videoCount).toFixed(1))
            : 0;

        return NextResponse.json({
            success: true,
            data: {
                activeCampaigns,
                completedCampaigns,
                totalBudget,
                budgetSpent,
                avgEngagementRate,
                period
            }
        });

    } catch (error: any) {
        console.error('Error fetching campaign overview:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
