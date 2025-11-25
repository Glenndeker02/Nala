import { NextRequest } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

const payoutSchema = z.object({
    amount: z.number().positive().optional(),
    payout_method: z.enum(['STRIPE']).default('STRIPE'),
});

export const POST = requireRole(['CREATOR'], async (request: NextRequest, user) => {
    try {
        const body = await request.json();
        const validation = payoutSchema.safeParse(body);

        if (!validation.success) {
            return ApiResponse.error('Validation failed', 400, validation.error.errors);
        }

        const { amount, payout_method } = validation.data;

        // Calculate available balance
        const payments = await db.payment.findMany({
            where: { recipientId: user.userId },
        });

        let availableBalance = 0;
        for (const payment of payments) {
            const val = Number(payment.amount);
            if (payment.status === 'COMPLETED') {
                if (['BASE_FEE', 'PERFORMANCE_BONUS'].includes(payment.type)) {
                    availableBalance += val;
                } else if (payment.type === 'PAYOUT') {
                    availableBalance -= val;
                }
            }
        }

        const payoutAmount = amount || availableBalance;

        if (payoutAmount <= 0) {
            return ApiResponse.error('Insufficient balance for payout', 400);
        }

        if (payoutAmount > availableBalance) {
            return ApiResponse.error('Requested amount exceeds available balance', 400);
        }

        // Create Payout Record
        const payout = await db.payment.create({
            data: {
                recipientId: user.userId,
                amount: payoutAmount,
                type: 'PAYOUT',
                status: 'PENDING', // Needs admin approval or Stripe processing
                description: `Payout request via ${payout_method}`,
                metadata: { payout_method }
            }
        });

        return ApiResponse.success({
            payout_id: payout.id,
            amount: payoutAmount,
            status: 'REQUESTED',
            estimated_arrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // +2 days
        }, 201);

    } catch (error) {
        console.error('Payout request error:', error);
        return ApiResponse.error('Failed to request payout', 500);
    }
});
