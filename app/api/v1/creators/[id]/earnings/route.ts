import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(['CREATOR', 'ADMIN'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const creatorId = params.id;

        if (user.role !== 'ADMIN' && user.userId !== creatorId) {
            return ApiResponse.error("Unauthorized", 403);
        }

        // Fetch Payouts (Paid and Pending)
        const payouts = await db.payout.findMany({
            where: { creatorId },
            include: {
                campaign: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate Totals
        let totalEarnings = 0;
        let pending = 0;
        let paid = 0;

        const history = payouts.map(p => {
            const amount = p.amount.toNumber();
            totalEarnings += amount;
            if (p.status === 'PAID') paid += amount;
            else pending += amount;

            return {
                id: p.id,
                campaignName: p.campaign.name,
                amount: amount,
                type: p.type,
                status: p.status,
                date: p.createdAt
            };
        });

        // Also fetch potentially un-invoiced earnings? (ViewPayments pending?)
        // viewPayments tracks "amountDueCreator".
        // If Payout is created from ViewPayment, we shouldn't double count.
        // Usually ViewPayment accumulates, then Payout is generated.
        // Let's assume Payouts table is the source of truth for "Earnings Ledger".
        // If ViewPayment is PENDING and no Payout exists, it is "Accrued but not Payout-ready"?
        // For simplicity, let's report Payouts.

        return ApiResponse.success({
            summary: {
                totalEarnings,
                paid,
                pending
            },
            history
        });

    } catch (error) {
        console.error('Error fetching creator earnings:', error);
        return ApiResponse.error('Internal Server Error', 500);
    }
});
