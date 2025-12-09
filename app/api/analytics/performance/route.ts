import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export const GET = requireRole(['FOUNDER'], async (request: NextRequest, user) => {
    try {
        const { searchParams } = new URL(request.url);
        const platform = searchParams.get('platform') || 'all'; // all, tiktok, instagram, facebook, youtube
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

        // Build platform filter
        const platformFilter = platform !== 'all'
            ? { platform: platform.toUpperCase() }
            : {};

        // Get videos with performance data
        const videos = await prisma.video.findMany({
            where: {
                campaign: {
                    founderId: user.userId
                },
                updatedAt: {
                    gte: startDate
                },
                status: {
                    in: ['POSTED', 'COMPLETED']
                },
                ...platformFilter
            },
            include: {
                campaign: {
                    select: {
                        name: true,
                        baseFeePerVideo: true,
                        performanceRate: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        fullName: true
                    }
                },
                payments: {
                    where: {
                        status: 'COMPLETED'
                    }
                }
            }
        });

        // Calculate summary metrics
        let totalViews = 0;
        let totalCost = 0;
        let totalEngagement = 0;
        let videoCount = 0;
        let totalConversions = 0;

        const creatorStats: Map<string, { name: string; views: number; cost: number }> = new Map();
        const platformStats: Map<string, { views: number; engagement: number }> = new Map();

        videos.forEach(video => {
            const views = video.views || 0;
            totalViews += views;

            // Calculate cost from payments
            const videoCost = video.payments.reduce((sum, payment) => {
                return sum + Number(payment.amount);
            }, 0);
            totalCost += videoCost;

            // Track engagement
            if (video.performanceMetrics && typeof video.performanceMetrics === 'object') {
                const metrics = video.performanceMetrics as any;
                if (metrics.engagementRate) {
                    totalEngagement += Number(metrics.engagementRate);
                    videoCount++;
                }
                if (metrics.conversions) {
                    totalConversions += Number(metrics.conversions);
                }
            }

            // Track by creator
            if (video.creator) {
                const existing = creatorStats.get(video.creator.id) || {
                    name: video.creator.fullName || 'Unknown',
                    views: 0,
                    cost: 0
                };
                existing.views += views;
                existing.cost += videoCost;
                creatorStats.set(video.creator.id, existing);
            }

            // Track by platform
            if (video.platform) {
                const platformKey = video.platform;
                const existing = platformStats.get(platformKey) || { views: 0, engagement: 0 };
                existing.views += views;
                if (video.performanceMetrics && typeof video.performanceMetrics === 'object') {
                    const metrics = video.performanceMetrics as any;
                    if (metrics.engagementRate) {
                        existing.engagement += Number(metrics.engagementRate);
                    }
                }
                platformStats.set(platformKey, existing);
            }
        });

        // Calculate derived metrics
        const costPerView = totalViews > 0 ? totalCost / totalViews : 0;
        const avgEngagement = videoCount > 0 ? totalEngagement / videoCount : 0;
        const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;
        const roi = totalCost > 0 ? ((totalConversions * 50 - totalCost) / totalCost) * 100 : 0; // Assuming $50 per conversion
        const mrrImpact = totalConversions * 29; // Assuming $29/month subscription

        // Get top and worst performers
        const sortedByViews = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0));
        const topVideos = sortedByViews.slice(0, 5).map(v => ({
            id: v.id,
            title: v.title || `Video ${v.videoNumber}`,
            views: v.views || 0,
            campaignName: v.campaign.name
        }));
        const worstVideos = sortedByViews.slice(-5).reverse().map(v => ({
            id: v.id,
            title: v.title || `Video ${v.videoNumber}`,
            views: v.views || 0,
            campaignName: v.campaign.name
        }));

        // Convert maps to arrays
        const byCreator = Array.from(creatorStats.entries()).map(([id, data]) => ({
            creatorId: id,
            name: data.name,
            views: data.views,
            cost: data.cost
        })).sort((a, b) => b.views - a.views);

        const byPlatform = Array.from(platformStats.entries()).map(([platform, data]) => ({
            platform,
            views: data.views,
            engagement: data.engagement
        })).sort((a, b) => b.views - a.views);

        // Generate chart data for the period
        const chartData = generateChartData(videos, period, startDate);

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalViews,
                    totalCost: Number(totalCost.toFixed(2)),
                    costPerView: Number(costPerView.toFixed(4)),
                    roi: Number(roi.toFixed(2)),
                    conversionRate: Number(conversionRate.toFixed(2)),
                    mrrImpact: Number(mrrImpact.toFixed(2)),
                    avgEngagement: Number(avgEngagement.toFixed(2))
                },
                byCreator,
                byPlatform,
                topVideos,
                worstVideos,
                chartData,
                period,
                platform
            }
        });

    } catch (error: any) {
        console.error('Error fetching performance analytics:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});

function generateChartData(videos: any[], period: string, startDate: Date) {
    const data: { name: string; views: number; engagement: number }[] = [];
    const now = new Date();

    if (period === 'weekly') {
        // Generate 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            const dayVideos = videos.filter(v => {
                const videoDate = new Date(v.updatedAt);
                return videoDate.toDateString() === date.toDateString();
            });

            const views = dayVideos.reduce((sum, v) => sum + (v.views || 0), 0);
            const engagement = dayVideos.length > 0
                ? dayVideos.reduce((sum, v) => {
                    const metrics = v.performanceMetrics as any;
                    return sum + (metrics?.engagementRate || 0);
                }, 0) / dayVideos.length
                : 0;

            data.push({ name: dayName, views, engagement });
        }
    } else if (period === 'monthly') {
        // Generate weeks of the month
        const weeksInMonth = 4;
        for (let i = weeksInMonth - 1; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - (i * 7));
            const weekName = `Week ${weeksInMonth - i}`;

            const weekVideos = videos.filter(v => {
                const videoDate = new Date(v.updatedAt);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 7);
                return videoDate >= weekStart && videoDate < weekEnd;
            });

            const views = weekVideos.reduce((sum, v) => sum + (v.views || 0), 0);
            const engagement = weekVideos.length > 0
                ? weekVideos.reduce((sum, v) => {
                    const metrics = v.performanceMetrics as any;
                    return sum + (metrics?.engagementRate || 0);
                }, 0) / weekVideos.length
                : 0;

            data.push({ name: weekName, views, engagement });
        }
    } else {
        // Generate months of the year
        for (let i = 11; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });

            const monthVideos = videos.filter(v => {
                const videoDate = new Date(v.updatedAt);
                return videoDate.getMonth() === monthDate.getMonth() &&
                    videoDate.getFullYear() === monthDate.getFullYear();
            });

            const views = monthVideos.reduce((sum, v) => sum + (v.views || 0), 0);
            const engagement = monthVideos.length > 0
                ? monthVideos.reduce((sum, v) => {
                    const metrics = v.performanceMetrics as any;
                    return sum + (metrics?.engagementRate || 0);
                }, 0) / monthVideos.length
                : 0;

            data.push({ name: monthName, views, engagement });
        }
    }

    return data;
}
