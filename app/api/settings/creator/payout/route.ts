import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export const GET = requireRole(['CREATOR'], async (request: NextRequest, user) => {
    try {
        const userData = await prisma.user.findUnique({
            where: { id: user.userId },
            select: {
                stripeAccountId: true
            }
        });

        // Get payment history
        const payments = await prisma.payment.findMany({
            where: {
                recipientId: user.userId,
                status: 'COMPLETED'
            },
            select: {
                id: true,
                amount: true,
                type: true,
                createdAt: true,
                campaign: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        });

        const totalEarnings = payments.reduce((sum, p) => sum + Number(p.amount), 0);

        return NextResponse.json({
            success: true,
            data: {
                stripeAccountId: userData?.stripeAccountId,
                isConnected: !!userData?.stripeAccountId,
                totalEarnings,
                recentPayments: payments.map(p => ({
                    id: p.id,
                    amount: Number(p.amount),
                    type: p.type,
                    campaignName: p.campaign.name,
                    date: p.createdAt
                }))
            }
        });

    } catch (error: any) {
        console.error('Error fetching payout settings:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
