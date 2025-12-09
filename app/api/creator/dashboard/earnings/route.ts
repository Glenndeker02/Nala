import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { startOfMonth, startOfWeek, startOfYear, subMonths, subWeeks, subYears } from 'date-fns';

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

        // Get filter parameter
        const { searchParams } = new URL(req.url);
        const filter = searchParams.get('filter') || 'month'; // week, month, year

        // Calculate date ranges
        const now = new Date();
        let periodStart: Date;
        let previousPeriodStart: Date;
        let previousPeriodEnd: Date;

        switch (filter) {
            case 'week':
                periodStart = startOfWeek(now);
                previousPeriodStart = startOfWeek(subWeeks(now, 1));
                previousPeriodEnd = startOfWeek(now);
                break;
            case 'year':
                periodStart = startOfYear(now);
                previousPeriodStart = startOfYear(subYears(now, 1));
                previousPeriodEnd = startOfYear(now);
                break;
            case 'month':
            default:
                periodStart = startOfMonth(now);
                previousPeriodStart = startOfMonth(subMonths(now, 1));
                previousPeriodEnd = startOfMonth(now);
                break;
        }

        // Get total earnings (all completed payments)
        const totalEarningsData = await prisma.payment.aggregate({
            where: {
                recipientId: userId,
                type: { in: ['BASE_FEE', 'PERFORMANCE_BONUS'] },
                status: 'COMPLETED'
            },
            _sum: { amount: true }
        });

        const totalEarnings = Number(totalEarningsData._sum.amount || 0);

        // Get current period earnings
        const currentPeriodData = await prisma.payment.aggregate({
            where: {
                recipientId: userId,
                type: { in: ['BASE_FEE', 'PERFORMANCE_BONUS'] },
                status: 'COMPLETED',
                createdAt: { gte: periodStart }
            },
            _sum: { amount: true },
            _count: { _all: true }
        });

        const currentPeriodEarnings = Number(currentPeriodData._sum.amount || 0);
        const currentPeriodCampaigns = currentPeriodData._count._all;

        // Get previous period earnings for trend calculation
        const previousPeriodData = await prisma.payment.aggregate({
            where: {
                recipientId: userId,
                type: { in: ['BASE_FEE', 'PERFORMANCE_BONUS'] },
                status: 'COMPLETED',
                createdAt: {
                    gte: previousPeriodStart,
                    lt: previousPeriodEnd
                }
            },
            _sum: { amount: true }
        });

        const previousPeriodEarnings = Number(previousPeriodData._sum.amount || 0);

        // Calculate trend
        let trendPercentage = 0;
        let trendDirection: 'up' | 'down' | 'neutral' = 'neutral';

        if (previousPeriodEarnings > 0) {
            trendPercentage = Math.round(
                ((currentPeriodEarnings - previousPeriodEarnings) / previousPeriodEarnings) * 100
            );
            trendDirection = trendPercentage > 0 ? 'up' : trendPercentage < 0 ? 'down' : 'neutral';
        } else if (currentPeriodEarnings > 0) {
            trendPercentage = 100;
            trendDirection = 'up';
        }

        // Get pending payouts
        const pendingData = await prisma.payment.aggregate({
            where: {
                recipientId: userId,
                type: { in: ['BASE_FEE', 'PERFORMANCE_BONUS'] },
                status: { in: ['PENDING', 'PROCESSING'] }
            },
            _sum: { amount: true }
        });

        const pendingPayouts = Number(pendingData._sum.amount || 0);

        // Calculate completed payouts (total - pending)
        const completedPayouts = totalEarnings;

        // Calculate average per campaign
        const avgPerCampaign = currentPeriodCampaigns > 0
            ? Math.round(currentPeriodEarnings / currentPeriodCampaigns)
            : 0;

        // Check Stripe Connect status
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { stripeAccountId: true }
        });

        const stripeConnected = !!user?.stripeAccountId;

        return NextResponse.json({
            success: true,
            data: {
                totalEarnings,
                thisMonth: currentPeriodEarnings,
                pendingPayouts,
                completedPayouts,
                stripeConnected,
                avgPerCampaign,
                trend: {
                    percentage: Math.abs(trendPercentage),
                    direction: trendDirection
                },
                filter
            }
        });

    } catch (error: any) {
        console.error('Error fetching creator earnings:', error);

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
