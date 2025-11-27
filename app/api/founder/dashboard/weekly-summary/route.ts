import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { subDays } from 'date-fns';

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
        const weekAgo = subDays(new Date(), 7);

        // Calculate weekly spend from payments
        const weeklyPayments = await prisma.payment.aggregate({
            where: {
                campaign: { founderId: userId },
                createdAt: { gte: weekAgo },
                type: { in: ['BASE_FEE', 'PERFORMANCE_BONUS'] },
                status: 'COMPLETED'
            },
            _sum: { amount: true }
        });

        const totalSpent = Number(weeklyPayments._sum.amount || 0);

        // Count new videos created this week
        const newVideos = await prisma.video.count({
            where: {
                campaign: { founderId: userId },
                createdAt: { gte: weekAgo }
            }
        });

        // Count active creators (unique creators who submitted videos this week)
        const activeCreatorsData = await prisma.video.findMany({
            where: {
                campaign: { founderId: userId },
                createdAt: { gte: weekAgo },
                creatorId: { not: null }
            },
            select: {
                creatorId: true
            },
            distinct: ['creatorId']
        });

        const activeCreators = activeCreatorsData.length;

        return NextResponse.json({
            success: true,
            data: {
                totalSpent,
                newVideos,
                activeCreators
            }
        });

    } catch (error: any) {
        console.error('Error fetching weekly summary:', error);

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
