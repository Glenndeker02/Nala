import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const POST = requireRole(['ADMIN'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const payoutId = params.id;

        const payout = await db.payout.findUnique({
            where: { id: payoutId }
        });

        if (!payout) {
            return ApiResponse.error("Payout not found", 404);
        }

        if (payout.status === 'PAID') {
            return ApiResponse.error("Payout already paid", 400);
        }

        const updated = await db.payout.update({
            where: { id: payoutId },
            data: {
                status: 'PAID',
                paidAt: new Date(),
            }
        });

        return ApiResponse.success({ payout: updated });

    } catch (error) {
        console.error('Error marking payout as paid:', error);
        return ApiResponse.error('Internal Server Error', 500);
    }
});
