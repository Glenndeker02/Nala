import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { calculateCreatorRanking, getCategoryAverageRanking } from '@/lib/ranking';

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

        // Get creator profile
        const profile = await prisma.creatorProfile.findUnique({
            where: { userId },
        });

        if (!profile) {
            return NextResponse.json(
                { success: false, error: 'Creator profile not found' },
                { status: 404 }
            );
        }

        // Calculate current ranking
        const ranking = await calculateCreatorRanking(userId);

        // Get category average for comparison
        const categoryAverage = await getCategoryAverageRanking(profile.categories);

        // Get recent ranking history
        const history = (profile.rankingHistory as any[]) || [];
        const recentHistory = history.slice(-10);

        return NextResponse.json({
            success: true,
            data: {
                rankingScore: ranking.score,
                categoryAverage,
                scoreChange: ranking.change,
                factors: ranking.factors,
                history: recentHistory,
                lastUpdate: profile.lastRankingUpdate,
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
