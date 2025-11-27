import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { startOfMonth } from 'date-fns';

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

        // Get this month's earnings
        const monthStart = startOfMonth(new Date());
        const thisMonthData = await prisma.payment.aggregate({
            where: {
                recipientId: userId,
                type: { in: ['BASE_FEE', 'PERFORMANCE_BONUS'] },
                status: 'COMPLETED',
                createdAt: { gte: monthStart }
            },
            _sum: { amount: true }
        });

        const thisMonth = Number(thisMonthData._sum.amount || 0);

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

        // Check Stripe Connect status
        // In production, this would check actual Stripe account
        // For now, use seed data as requested
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { stripeCustomerId: true }
        });

        const stripeConnected = !!user?.stripeCustomerId;

        return NextResponse.json({
            success: true,
            data: {
                totalEarnings,
                thisMonth,
                pendingPayouts,
                completedPayouts,
                stripeConnected
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
