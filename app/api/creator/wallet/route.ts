import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(['CREATOR'], async (request: NextRequest, user) => {
    try {
        // Fetch all payments for the creator
        const payments = await db.payment.findMany({
            where: { recipientId: user.userId },
            orderBy: { createdAt: 'desc' },
            include: {
                campaign: {
                    select: { name: true }
                }
            }
        });

        let availableBalance = 0;
        let pendingBalance = 0;
        let lifetimeEarnings = 0;

        const earningsBreakdown = [];
        const recentTransactions = [];

        for (const payment of payments) {
            const amount = Number(payment.amount);

            // Calculate balances
            if (payment.status === 'COMPLETED') {
                if (['BASE_FEE', 'PERFORMANCE_BONUS'].includes(payment.type)) {
                    availableBalance += amount;
                    lifetimeEarnings += amount;
                } else if (payment.type === 'PAYOUT') {
                    availableBalance -= amount;
                }
            } else if (payment.status === 'PENDING') {
                if (['BASE_FEE', 'PERFORMANCE_BONUS'].includes(payment.type)) {
                    pendingBalance += amount;
                }
            }

            // Build breakdown (simplified grouping by campaign could be done, but listing payments is easier for now)
            if (['BASE_FEE', 'PERFORMANCE_BONUS'].includes(payment.type)) {
                earningsBreakdown.push({
                    campaign_id: payment.campaignId,
                    campaign_name: payment.campaign?.name || 'Unknown Campaign',
                    amount: amount,
                    type: payment.type,
                    status: payment.status === 'COMPLETED' ? 'PAID' : payment.status
                });
            }

            // Recent transactions
            recentTransactions.push({
                transaction_id: payment.id,
                amount: amount,
                type: payment.type,
                timestamp: payment.createdAt,
                status: payment.status
            });
        }

        return ApiResponse.success({
            available_balance: availableBalance.toFixed(2),
            pending_balance: pendingBalance.toFixed(2),
            lifetime_earnings: lifetimeEarnings.toFixed(2),
            earnings_breakdown: earningsBreakdown,
            recent_transactions: recentTransactions.slice(0, 10) // Limit to 10
        });

    } catch (error) {
        console.error('Wallet fetch error:', error);
        return ApiResponse.error('Failed to fetch wallet', 500);
    }
});
