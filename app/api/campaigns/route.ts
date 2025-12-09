import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(['CREATOR', 'FOUNDER'], async (request: NextRequest, user) => {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const role = user.role;

        let whereClause: any = {};

        if (role === 'FOUNDER') {
            // Founders see their own campaigns
            whereClause = { founderId: user.userId };
            if (status) whereClause.status = status;
        } else if (role === 'CREATOR') {
            // Creators see campaigns they can apply to
            // Include both ACTIVE and ACTIVE_ACCEPTING_APPLICATIONS statuses
            whereClause = {
                status: {
                    in: ['ACTIVE', 'ACTIVE_ACCEPTING_APPLICATIONS']
                },
                // In a real app, we'd filter out ones they are already assigned to
            };
        }

        const campaigns = await db.campaign.findMany({
            where: whereClause,
            include: {
                founder: {
                    select: {
                        fullName: true,
                        companyName: true,
                    },
                },
                _count: {
                    select: { videos: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const formattedCampaigns = campaigns.map(campaign => ({
            ...campaign,
            totalBudget: campaign.totalBudget.toNumber(),
            baseFeeBudget: campaign.baseFeeBudget.toNumber(),
            performanceBudget: campaign.performanceBudget.toNumber(),
            escrowBalance: campaign.escrowBalance.toNumber(),
        }));

        return ApiResponse.success({
            campaigns: formattedCampaigns,
        });
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        return ApiResponse.error('Failed to fetch campaigns', 500);
    }
});
