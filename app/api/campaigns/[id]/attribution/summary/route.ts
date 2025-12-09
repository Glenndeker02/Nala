import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

/**
 * GET /api/campaigns/:id/attribution/summary
 * Get comprehensive attribution analytics for a campaign
 * Auth: Founder only
 */
export const GET = requireRole(['FOUNDER'], async (req: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;

        // Check campaign exists and user owns it
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            select: {
                id: true,
                founderId: true,
                name: true,
                totalBudget: true,
                conversionCommission: true
            }
        });

        if (!campaign) {
            return ApiResponse.error('Campaign not found', 404);
        }

        if (campaign.founderId !== user.userId) {
            return ApiResponse.error('Unauthorized - not campaign owner', 403);
        }

        // Get all redemptions for this campaign
        const redemptions = await prisma.redemption.findMany({
            where: { campaignId },
            include: {
                creatorCode: {
                    select: {
                        code: true,
                        platform: true,
                        creatorId: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        fullName: true
                    }
                }
            }
        });

        // Calculate overview metrics
        const totalRedemptions = redemptions.length;
        const conversions = redemptions.filter(r => r.convertedToPaid);
        const totalConversions = conversions.length;
        const conversionRate = totalRedemptions > 0
            ? ((totalConversions / totalRedemptions) * 100).toFixed(2)
            : '0.00';

        const totalRevenue = conversions.reduce((sum, r) =>
            sum + Number(r.amountPaidByUser || 0), 0
        );

        const totalCommissionOwed = totalConversions * Number(campaign.conversionCommission || 0);

        // Calculate CAC (Customer Acquisition Cost)
        const cac = totalConversions > 0
            ? (Number(campaign.totalBudget) / totalConversions).toFixed(2)
            : '0.00';

        // Group by creator
        const byCreatorMap = redemptions.reduce((acc, r) => {
            const creatorId = r.creatorId;
            if (!acc[creatorId]) {
                acc[creatorId] = {
                    creatorId,
                    creatorName: r.creator.fullName,
                    redemptions: 0,
                    conversions: 0,
                    revenue: 0,
                    commissionOwed: 0,
                    lastRedemption: r.redeemedAt
                };
            }
            acc[creatorId].redemptions++;
            if (r.convertedToPaid) {
                acc[creatorId].conversions++;
                acc[creatorId].revenue += Number(r.amountPaidByUser || 0);
                acc[creatorId].commissionOwed += Number(campaign.conversionCommission || 0);
            }
            if (r.redeemedAt > acc[creatorId].lastRedemption) {
                acc[creatorId].lastRedemption = r.redeemedAt;
            }
            return acc;
        }, {} as Record<string, any>);

        const byCreator = Object.values(byCreatorMap).map((c: any) => ({
            ...c,
            conversionRate: c.redemptions > 0
                ? ((c.conversions / c.redemptions) * 100).toFixed(2)
                : '0.00'
        }));

        // Group by platform
        const byPlatformMap = redemptions.reduce((acc, r) => {
            const platform = r.creatorCode.platform;
            if (!acc[platform]) {
                acc[platform] = {
                    platform,
                    redemptions: 0,
                    conversions: 0,
                    revenue: 0
                };
            }
            acc[platform].redemptions++;
            if (r.convertedToPaid) {
                acc[platform].conversions++;
                acc[platform].revenue += Number(r.amountPaidByUser || 0);
            }
            return acc;
        }, {} as Record<string, any>);

        const byPlatform = Object.values(byPlatformMap).map((p: any) => ({
            ...p,
            conversionRate: p.redemptions > 0
                ? ((p.conversions / p.redemptions) * 100).toFixed(2)
                : '0.00'
        }));

        // Timeline data (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentRedemptions = redemptions.filter(r => r.redeemedAt >= thirtyDaysAgo);

        const timelineMap = recentRedemptions.reduce((acc, r) => {
            const date = r.redeemedAt.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { date, redemptions: 0, conversions: 0 };
            }
            acc[date].redemptions++;
            if (r.convertedToPaid) {
                acc[date].conversions++;
            }
            return acc;
        }, {} as Record<string, any>);

        const timeline = Object.values(timelineMap).sort((a: any, b: any) =>
            a.date.localeCompare(b.date)
        );

        const summary = {
            overview: {
                totalRedemptions,
                totalConversions,
                conversionRate: parseFloat(conversionRate),
                totalRevenue,
                totalCommissionOwed,
                cac: parseFloat(cac),
                cpm: 0 // Would need view counts to calculate
            },
            byCreator,
            byPlatform,
            timeline
        };

        return ApiResponse.success(summary);

    } catch (error) {
        console.error('[ATTRIBUTION_SUMMARY_ERROR]', error);
        return ApiResponse.error('Internal server error', 500);
    }
});
