import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Platform } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { subDays, format, startOfDay } from 'date-fns';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        // Extract and verify JWT token
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
            userId: string;
            role: string;
        };

        if (decoded.role !== 'CREATOR') {
            return NextResponse.json(
                { success: false, error: 'Access denied. Creator role required.' },
                { status: 403 }
            );
        }

        const userId = decoded.userId;

        // Get query parameters
        const { searchParams } = new URL(req.url);
        const timeframe = searchParams.get('period') || 'week'; // week, month, year
        const platformParam = searchParams.get('platform') || 'all'; // all, tiktok, instagram, facebook

        // Parse platform filter
        let platformFilter: Platform | undefined;
        if (platformParam !== 'all') {
            platformFilter = platformParam.toUpperCase() as Platform;
        }

        // Calculate overall stats
        const videos = await prisma.video.findMany({
            where: {
                creatorId: userId,
                status: { in: ['POSTED', 'LOCKED'] },
                ...(platformFilter && { platform: platformFilter })
            },
            include: {
                viewSnapshots: {
                    orderBy: { snapshotAt: 'desc' },
                    take: 1
                }
            }
        });

        // Calculate total views
        let totalViews = 0;
        let totalEngagement = 0;
        videos.forEach(video => {
            if (video.viewSnapshots.length > 0) {
                const views = video.viewSnapshots[0].viewCount;
                totalViews += views;
                // Mock engagement calculation (5% engagement rate)
                totalEngagement += views * 0.05;
            }
        });

        const videosCreated = videos.length;
        const engagementRate = totalViews > 0
            ? Number(((totalEngagement / totalViews) * 100).toFixed(1))
            : 0;

        // Calculate completion rate
        const totalAssignedVideos = await prisma.video.count({
            where: {
                creatorId: userId,
                ...(platformFilter && { platform: platformFilter })
            }
        });

        const completionRate = totalAssignedVideos > 0
            ? Math.round((videosCreated / totalAssignedVideos) * 100)
            : 0;

        // Get historical data for charts
        const daysToFetch = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 365;
        const startDate = subDays(new Date(), daysToFetch);

        const allSnapshots = await prisma.viewSnapshot.findMany({
            where: {
                video: {
                    creatorId: userId,
                    ...(platformFilter && { platform: platformFilter })
                },
                snapshotAt: { gte: startDate }
            },
            orderBy: { snapshotAt: 'asc' }
        });

        // Aggregate by day
        const dataByDay = new Map<string, { views: number; engagement: number; earnings: number }>();

        for (let i = 0; i < daysToFetch; i++) {
            const date = subDays(new Date(), daysToFetch - i - 1);
            const dayKey = format(startOfDay(date), 'yyyy-MM-dd');
            dataByDay.set(dayKey, { views: 0, engagement: 0, earnings: 0 });
        }

        allSnapshots.forEach(snapshot => {
            const dayKey = format(startOfDay(snapshot.snapshotAt), 'yyyy-MM-dd');
            const existing = dataByDay.get(dayKey) || { views: 0, engagement: 0, earnings: 0 };
            existing.views += snapshot.viewCount;
            existing.engagement = 4.5; // Mock engagement rate
            dataByDay.set(dayKey, existing);
        });

        // Get earnings data for the period
        const earningsData = await prisma.payment.findMany({
            where: {
                recipientId: userId,
                type: { in: ['BASE_FEE', 'PERFORMANCE_BONUS'] },
                status: 'COMPLETED',
                createdAt: { gte: startDate }
            },
            select: {
                amount: true,
                createdAt: true
            }
        });

        // Add earnings to chart data
        earningsData.forEach(payment => {
            const dayKey = format(startOfDay(payment.createdAt), 'yyyy-MM-dd');
            const existing = dataByDay.get(dayKey);
            if (existing) {
                existing.earnings += Number(payment.amount);
            }
        });

        // Format for charts
        const chartData = Array.from(dataByDay.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([dateStr, data]) => ({
                date: format(new Date(dateStr), 'MMM d'),
                views: data.views,
                engagement: data.engagement,
                earnings: data.earnings
            }));

        // Legacy format for backward compatibility
        const viewsHistory = chartData.map(d => ({ date: d.date, views: d.views }));
        const engagementHistory = chartData.map(d => ({ date: d.date, rate: d.engagement }));

        return NextResponse.json({
            success: true,
            data: {
                views: totalViews,
                engagementRate,
                videosCreated,
                completionRate,
                viewsHistory,
                engagementHistory,
                chartData,
                platform: platformParam
            }
        });

    } catch (error: any) {
        console.error('Error fetching creator performance:', error);

        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json(
                { success: false, error: 'Invalid token' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
