import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(['FOUNDER', 'ADMIN'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;

        const campaign = await db.campaign.findUnique({
            where: { id: campaignId }
        });

        if (!campaign) {
            return ApiResponse.error("Campaign not found", 404);
        }

        if (user.role === 'FOUNDER' && campaign.founderId !== user.userId) {
            return ApiResponse.error("Unauthorized", 403);
        }

        // Aggregate Metrics
        // 1. Total Views (Sum of current view counts of all videos in campaign)
        const videos = await db.video.aggregate({
            where: { campaignId },
            _sum: { currentViewCount: true },
            _count: true
        });

        // 2. Redemptions by Type
        const redemptions = await db.codeRedemption.groupBy({
            by: ['eventType'],
            where: { campaignId },
            _count: { _all: true }
        });

        // 3. Subscription Revenue / Events
        const subscriptions = await db.subscriptionEvent.aggregate({
            where: { campaignId },
            _sum: {
                planPrice: true,
                creatorBonus: true,
                platformFee: true
            },
            _count: true
        });

        // 4. Breakdown by Creator
        // This might be expensive if many creators. Limit or paginate?
        // Or specific endpoint for breakdown?
        // Let's provide top level stats and top 5 creators?
        // For now, simpler aggregate.

        const report = {
            totalVideos: videos._count,
            totalViews: videos._sum.currentViewCount || 0,
            redemptions: redemptions.reduce((acc, curr) => {
                acc[curr.eventType] = curr._count._all;
                return acc;
            }, {} as Record<string, number>),
            subscriptions: {
                count: subscriptions._count,
                totalRevenue: subscriptions._sum.planPrice || 0,
                creatorPayouts: subscriptions._sum.creatorBonus || 0,
                platformFees: subscriptions._sum.platformFee || 0,
            }
        };

        return ApiResponse.success({ report });

    } catch (error) {
        console.error('Error fetching attribution report:', error);
        return ApiResponse.error('Internal Server Error', 500);
    }
});
