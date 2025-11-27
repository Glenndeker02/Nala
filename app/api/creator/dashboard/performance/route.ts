import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
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
        const timeframe = searchParams.get('timeframe') || 'weekly';

        // Calculate overall stats
        const videos = await prisma.video.findMany({
            where: {
                creatorId: userId,
                status: { in: ['POSTED', 'LOCKED'] }
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
                // Mock engagement calculation
                totalEngagement += views * 0.05; // 5% engagement rate
            }
        });

        const videosCreated = videos.length;
        const engagementRate = videosCreated > 0
            ? Number(((totalEngagement / totalViews) * 100).toFixed(1)) || 0
            : 0;

        // Get historical data for charts
        const daysToFetch = timeframe === 'weekly' ? 7 : 30;
        const startDate = subDays(new Date(), daysToFetch);

        const allSnapshots = await prisma.viewSnapshot.findMany({
            where: {
                video: { creatorId: userId },
                snapshotAt: { gte: startDate }
            },
            orderBy: { snapshotAt: 'asc' }
        });

        // Aggregate by day
        const dataByDay = new Map<string, { views: number; rate: number }>();

        for (let i = 0; i < daysToFetch; i++) {
            const date = subDays(new Date(), daysToFetch - i - 1);
            const dayKey = format(startOfDay(date), 'yyyy-MM-dd');
            dataByDay.set(dayKey, { views: 0, rate: 0 });
        }

        allSnapshots.forEach(snapshot => {
            const dayKey = format(startOfDay(snapshot.snapshotAt), 'yyyy-MM-dd');
            const existing = dataByDay.get(dayKey) || { views: 0, rate: 0 };
            existing.views += snapshot.viewCount;
            existing.rate = 4.5; // Mock engagement rate
            dataByDay.set(dayKey, existing);
        });

        // Format for charts
        const viewsHistory = Array.from(dataByDay.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([dateStr, data]) => ({
                date: format(new Date(dateStr), 'MMM d'),
                views: data.views
            }));

        const engagementHistory = Array.from(dataByDay.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([dateStr, data]) => ({
                date: format(new Date(dateStr), 'MMM d'),
                rate: data.rate
            }));

        return NextResponse.json({
            success: true,
            data: {
                views: totalViews,
                engagementRate,
                videosCreated,
                viewsHistory,
                engagementHistory
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
