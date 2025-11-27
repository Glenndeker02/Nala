import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

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

        // Get creator's videos with latest view counts
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

        // Calculate ranking score
        let totalViews = 0;
        let totalEngagement = 0;

        videos.forEach(video => {
            if (video.viewSnapshots.length > 0) {
                const views = video.viewSnapshots[0].viewCount;
                totalViews += views;
                totalEngagement += views * 0.05; // Mock 5% engagement
            }
        });

        // Get on-time delivery rate
        const completedVideos = await prisma.video.count({
            where: {
                creatorId: userId,
                status: { in: ['POSTED', 'LOCKED', 'APPROVED'] }
            }
        });

        const lateVideos = await prisma.video.count({
            where: {
                creatorId: userId,
                status: { in: ['POSTED', 'LOCKED', 'APPROVED'] },
                // In production, would check if submittedAt > deadline
            }
        });

        const onTimeRate = completedVideos > 0
            ? ((completedVideos - lateVideos) / completedVideos) * 100
            : 100;

        // Calculate ranking score (0-100)
        const viewsScore = Math.min(100, (totalViews / 100000) * 100); // Normalize to 100k views
        const engagementScore = Math.min(100, ((totalEngagement / totalViews) * 100) * 10); // Normalize engagement
        const deliveryScore = onTimeRate;

        const rankingScore = Math.round(
            (viewsScore * 0.4) +
            (engagementScore * 0.3) +
            (deliveryScore * 0.3)
        );

        // Mock category average (in production, calculate from all creators in same category)
        const categoryAverage = 72;

        // Mock score history (in production, fetch from creator_rankings table)
        const scoreHistory = [
            { date: '2023-10-01', score: Math.max(60, rankingScore - 10) },
            { date: '2023-10-15', score: Math.max(65, rankingScore - 7) },
            { date: '2023-11-01', score: Math.max(70, rankingScore - 4) },
            { date: '2023-11-15', score: rankingScore },
        ];

        return NextResponse.json({
            success: true,
            data: {
                rankingScore,
                categoryAverage,
                scoreChange: rankingScore - scoreHistory[scoreHistory.length - 2].score,
                scoreHistory
            }
        });

    } catch (error: any) {
        console.error('Error fetching creator ranking:', error);

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
