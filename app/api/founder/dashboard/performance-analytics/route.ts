import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';

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

        if (decoded.role !== 'FOUNDER') {
            return NextResponse.json(
                { success: false, error: 'Access denied. Founder role required.' },
                { status: 403 }
            );
        }

        const userId = decoded.userId;

        // Get timeframe from query params (default to weekly)
        const { searchParams } = new URL(req.url);
        const timeframe = searchParams.get('timeframe') || 'weekly';

        // Calculate date range
        const daysToFetch = timeframe === 'weekly' ? 7 : 30;
        const startDate = subDays(new Date(), daysToFetch);

        // Get all videos for this founder
        const videos = await prisma.video.findMany({
            where: {
                campaign: { founderId: userId },
                status: { in: ['POSTED', 'LOCKED'] }
            },
            include: {
                viewSnapshots: {
                    where: {
                        snapshotAt: { gte: startDate }
                    },
                    orderBy: { snapshotAt: 'asc' }
                }
            }
        });

        // Aggregate data by day
        const dataByDay = new Map<string, { views: number; engagement: number }>();

        // Initialize all days with zero values
        for (let i = 0; i < daysToFetch; i++) {
            const date = subDays(new Date(), daysToFetch - i - 1);
            const dayKey = format(startOfDay(date), 'yyyy-MM-dd');
            dataByDay.set(dayKey, { views: 0, engagement: 0 });
        }

        // Aggregate view snapshots by day
        videos.forEach(video => {
            video.viewSnapshots.forEach(snapshot => {
                const dayKey = format(startOfDay(snapshot.snapshotAt), 'yyyy-MM-dd');
                const existing = dataByDay.get(dayKey) || { views: 0, engagement: 0 };

                // Add views
                existing.views += snapshot.viewCount;

                // Calculate mock engagement (in production, this would come from platform APIs)
                // Engagement = views * engagement_rate_factor
                const engagementFactor = 0.05; // 5% engagement rate
                existing.engagement += Math.floor(snapshot.viewCount * engagementFactor);

                dataByDay.set(dayKey, existing);
            });
        });

        // Format data for chart
        const chartData = Array.from(dataByDay.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([dateStr, data], index) => {
                const date = new Date(dateStr);
                let name: string;

                if (timeframe === 'weekly') {
                    // For weekly, show day names
                    name = format(date, 'EEE'); // Mon, Tue, etc.
                } else {
                    // For monthly, show week numbers or dates
                    if (index % 5 === 0) {
                        name = format(date, 'MMM d');
                    } else {
                        name = '';
                    }
                }

                return {
                    name,
                    views: data.views,
                    engagement: data.engagement,
                    date: dateStr
                };
            });

        // If no data, return sample data for better UX
        if (chartData.every(d => d.views === 0)) {
            const sampleData = timeframe === 'weekly'
                ? [
                    { name: 'Mon', views: 0, engagement: 0 },
                    { name: 'Tue', views: 0, engagement: 0 },
                    { name: 'Wed', views: 0, engagement: 0 },
                    { name: 'Thu', views: 0, engagement: 0 },
                    { name: 'Fri', views: 0, engagement: 0 },
                    { name: 'Sat', views: 0, engagement: 0 },
                    { name: 'Sun', views: 0, engagement: 0 },
                ]
                : Array.from({ length: 6 }, (_, i) => ({
                    name: i % 5 === 0 ? `Week ${Math.floor(i / 5) + 1}` : '',
                    views: 0,
                    engagement: 0
                }));

            return NextResponse.json({
                success: true,
                data: {
                    timeframe,
                    data: sampleData,
                    isEmpty: true
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                timeframe,
                data: chartData,
                isEmpty: false
            }
        });

    } catch (error: any) {
        console.error('Error fetching performance analytics:', error);

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
