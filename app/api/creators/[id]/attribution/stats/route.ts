import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

/**
 * GET /api/creators/:id/attribution/stats
 * Get attribution statistics for a creator
 * Auth: Creator (self only) or Admin
 */
export const GET = requireRole(['CREATOR', 'ADMIN'], async (req: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const creatorId = params.id;

        // Verify authorization (creator can only view own stats)
        if (user.role === 'CREATOR' && user.userId !== creatorId) {
            return ApiResponse.error('Unauthorized - can only view own stats', 403);
        }

        // Verify creator exists
        const creator = await prisma.user.findUnique({
            where: { id: creatorId },
            select: { id: true, role: true }
        });

        if (!creator || creator.role !== 'CREATOR') {
            return ApiResponse.error('Creator not found', 404);
        }

        // Get all redemptions for this creator
        const redemptions = await prisma.redemption.findMany({
            where: { creatorId },
            include: {
                creatorCode: {
                    select: { code: true, platform: true }
                },
                campaign: {
                    select: { id: true, name: true, conversionCommission: true }
                }
            }
        });

        // Calculate stats
        const totalRedemptions = redemptions.length;
        const conversions = redemptions.filter(r => r.convertedToPaid);
        const totalConversions = conversions.length;
        const conversionRate = totalRedemptions > 0
            ? ((totalConversions / totalRedemptions) * 100).toFixed(2)
            : '0.00';

        // Calculate commission
        const totalCommission = conversions.reduce((sum, r) => {
            const commission = r.campaign.conversionCommission || 0;
            return sum + Number(commission);
        }, 0);

        // Get pending vs paid commission
        const payments = await prisma.payment.findMany({
            where: {
                recipientId: creatorId,
                commissionType: 'CONVERSION_COMMISSION'
            },
            select: {
                amount: true,
                status: true
            }
        });

        const pendingCommission = payments
            .filter(p => p.status === 'PENDING')
            .reduce((sum, p) => sum + Number(p.amount), 0);

        const paidCommission = payments
            .filter(p => p.status === 'COMPLETED')
            .reduce((sum, p) => sum + Number(p.amount), 0);

        // Group by platform
        const byPlatform = redemptions.reduce((acc, r) => {
            const platform = r.creatorCode.platform;
            if (!acc[platform]) {
                acc[platform] = {
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

        // Group by campaign
        const byCampaign = redemptions.reduce((acc, r) => {
            const campaignId = r.campaign.id;
            if (!acc[campaignId]) {
                acc[campaignId] = {
                    campaignId,
                    campaignName: r.campaign.name,
                    redemptions: 0,
                    conversions: 0,
                    commission: 0
                };
            }
            acc[campaignId].redemptions++;
            if (r.convertedToPaid) {
                acc[campaignId].conversions++;
                acc[campaignId].commission += Number(r.campaign.conversionCommission || 0);
            }
            return acc;
        }, {} as Record<string, any>);

        const stats = {
            totalRedemptions,
            totalConversions,
            conversionRate: parseFloat(conversionRate),
            totalCommission,
            pendingCommission,
            paidCommission,
            byPlatform,
            byCampaign: Object.values(byCampaign)
        };

        return ApiResponse.success(stats);

    } catch (error) {
        console.error('[CREATOR_STATS_ERROR]', error);
        return ApiResponse.error('Internal server error', 500);
    }
});
