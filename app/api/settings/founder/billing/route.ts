import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export const GET = requireRole(['FOUNDER'], async (request: NextRequest, user) => {
    try {
        const userData = await prisma.user.findUnique({
            where: { id: user.userId },
            select: {
                stripeCustomerId: true,
                founderTier: true
            }
        });

        // Get payment history (campaigns created)
        const campaigns = await prisma.campaign.findMany({
            where: {
                founderId: user.userId
            },
            select: {
                id: true,
                name: true,
                totalBudget: true,
                escrowBalance: true,
                createdAt: true,
                status: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        });

        const totalSpent = campaigns.reduce((sum, c) =>
            sum + (Number(c.totalBudget) - Number(c.escrowBalance)), 0
        );

        return NextResponse.json({
            success: true,
            data: {
                stripeCustomerId: userData?.stripeCustomerId,
                tier: userData?.founderTier || 'SILVER',
                totalSpent,
                recentCampaigns: campaigns.map(c => ({
                    id: c.id,
                    name: c.name,
                    budget: Number(c.totalBudget),
                    spent: Number(c.totalBudget) - Number(c.escrowBalance),
                    status: c.status,
                    date: c.createdAt
                }))
            }
        });

    } catch (error: any) {
        console.error('Error fetching billing info:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
