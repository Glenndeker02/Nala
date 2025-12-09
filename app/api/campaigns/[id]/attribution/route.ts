import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/api-middleware';

// GET - Attribution analytics for a campaign
export const GET = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;
        const { searchParams } = new URL(request.url);

        // Parse query params
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const groupBy = searchParams.get('group_by') || 'creator'; // creator, platform, day
        const creatorId = searchParams.get('creatorId');
        const platform = searchParams.get('platform');

        // Verify campaign ownership
        const campaign = await prisma.campaign.findFirst({
            where: {
                id: campaignId,
                founderId: user.userId
            },
            select: {
                id: true,
                name: true,
                totalBudget: true,
                performanceBudget: true
            }
        });

        if (!campaign) {
            return NextResponse.json(
                { success: false, error: 'Campaign not found' },
                { status: 404 }
            );
        }

        // Build date filter
        const dateFilter: any = {};
        if (from) dateFilter.gte = new Date(from);
        if (to) dateFilter.lte = new Date(to);

        // Build where clause for redemptions
        const redemptionWhere: any = { campaignId };
        if (Object.keys(dateFilter).length > 0) redemptionWhere.redeemedAt = dateFilter;
        if (creatorId) redemptionWhere.creatorId = creatorId;
        if (platform) redemptionWhere.platform = platform;

        // Get total views from videos
        const videos = await prisma.video.findMany({
            where: { campaignId },
            select: {
                currentViewCount: true,
                creatorId: true,
                platform: true,
                postedAt: true
            }
        });

        const totalViews = videos.reduce((sum, v) => sum + (v.currentViewCount || 0), 0);

        // Get redemptions
        const redemptions = await prisma.redemption.findMany({
            where: redemptionWhere,
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true
                    }
                },
                creatorCode: {
                    select: {
                        code: true
                    }
                }
            }
        });

        const totalRedemptions = redemptions.length;
        const conversions = redemptions.filter(r => r.convertedToPaid);
        const totalConversions = conversions.length;

        // Calculate attributed revenue
        const attributedRevenue = conversions.reduce((sum, r) => sum + (Number(r.amountPaidByUser) || 0), 0);

        // Calculate metrics
        const spend = Number(campaign.performanceBudget) || Number(campaign.totalBudget) || 0;
        const impressionRedemptionRate = totalViews > 0 ? (totalRedemptions / totalViews) * 100 : 0;
        const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;
        const cpm = totalViews > 0 ? (spend / (totalViews / 1000)) : 0;
        const cac = totalConversions > 0 ? (spend / totalConversions) : 0;

        // Group data based on groupBy parameter
        let groupedData: any[] = [];

        if (groupBy === 'creator') {
            // Group by creator
            const creatorMap = new Map<string, any>();

            for (const r of redemptions) {
                const key = r.creatorId;
                if (!creatorMap.has(key)) {
                    const creatorVideos = videos.filter(v => v.creatorId === r.creatorId);
                    const creatorViews = creatorVideos.reduce((sum, v) => sum + (v.currentViewCount || 0), 0);
                    creatorMap.set(key, {
                        creatorId: r.creatorId,
                        creatorName: r.creator.fullName,
                        views: creatorViews,
                        redemptions: 0,
                        conversions: 0,
                        revenue: 0
                    });
                }

                const data = creatorMap.get(key);
                data.redemptions++;
                if (r.convertedToPaid) {
                    data.conversions++;
                    data.revenue += Number(r.amountPaidByUser) || 0;
                }
            }

            groupedData = Array.from(creatorMap.values()).map(d => ({
                ...d,
                redemptionRate: d.views > 0 ? (d.redemptions / d.views * 100).toFixed(2) : 0,
                conversionRate: d.views > 0 ? (d.conversions / d.views * 100).toFixed(2) : 0,
                cac: d.conversions > 0 ? (spend * (d.views / (totalViews || 1)) / d.conversions).toFixed(2) : null
            }));
        } else if (groupBy === 'platform') {
            // Group by platform
            const platformMap = new Map<string, any>();

            for (const r of redemptions) {
                const key = r.platform;
                if (!platformMap.has(key)) {
                    const platformVideos = videos.filter(v => v.platform === r.platform);
                    const platformViews = platformVideos.reduce((sum, v) => sum + (v.currentViewCount || 0), 0);
                    platformMap.set(key, {
                        platform: key,
                        views: platformViews,
                        redemptions: 0,
                        conversions: 0,
                        revenue: 0
                    });
                }

                const data = platformMap.get(key);
                data.redemptions++;
                if (r.convertedToPaid) {
                    data.conversions++;
                    data.revenue += Number(r.amountPaidByUser) || 0;
                }
            }

            groupedData = Array.from(platformMap.values()).map(d => ({
                ...d,
                redemptionRate: d.views > 0 ? (d.redemptions / d.views * 100).toFixed(2) : 0,
                conversionRate: d.views > 0 ? (d.conversions / d.views * 100).toFixed(2) : 0
            }));
        } else if (groupBy === 'day') {
            // Group by day
            const dayMap = new Map<string, any>();

            for (const r of redemptions) {
                const day = r.redeemedAt.toISOString().split('T')[0];
                if (!dayMap.has(day)) {
                    dayMap.set(day, {
                        date: day,
                        redemptions: 0,
                        conversions: 0,
                        revenue: 0
                    });
                }

                const data = dayMap.get(day);
                data.redemptions++;
                if (r.convertedToPaid) {
                    data.conversions++;
                    data.revenue += Number(r.amountPaidByUser) || 0;
                }
            }

            groupedData = Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));
        }

        return NextResponse.json({
            success: true,
            data: {
                campaign: {
                    id: campaign.id,
                    name: campaign.name
                },
                summary: {
                    totalViews,
                    totalRedemptions,
                    totalConversions,
                    attributedRevenue: attributedRevenue.toFixed(2),
                    impressionRedemptionRate: impressionRedemptionRate.toFixed(4),
                    conversionRate: conversionRate.toFixed(4),
                    cpm: cpm.toFixed(2),
                    cac: cac.toFixed(2),
                    spend: spend.toFixed(2)
                },
                groupedData,
                filters: {
                    from: from || null,
                    to: to || null,
                    groupBy,
                    creatorId: creatorId || null,
                    platform: platform || null
                }
            }
        });

    } catch (error: any) {
        console.error('Error fetching attribution data:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
