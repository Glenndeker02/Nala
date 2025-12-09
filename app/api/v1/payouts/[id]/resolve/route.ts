import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const POST = requireRole(['ADMIN'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const disputeId = params.id; // Using Dispute ID here, not Payout ID?
        // URL is /api/v1/payouts/[id]/resolve... this implies Id is Payout ID?
        // But disputes are separate.
        // Let's assume the ID passed is the DISPUTE ID for clean REST resource "disputes"?
        // Or if it is "payouts/:id/resolve", we need to find the OPEN dispute for that payout.

        // Let's assume input is DISPUTE ID because we moved to /v1/disputes/:id/resolve ?
        // Or stick to plan: `/api/v1/payouts/:id/resolve`.
        // Then we resolve the dispute associated with this payout.

        const payoutId = params.id;
        const body = await request.json();
        const { resolution, notes } = body; // 'APPROVED' (Refund founder/Cancel payout) or 'REJECTED' (Pay creator)

        if (!['APPROVED', 'REJECTED'].includes(resolution)) {
            return ApiResponse.error("Invalid resolution. Must be APPROVED or REJECTED", 400);
        }

        const payout = await db.payout.findUnique({
            where: { id: payoutId }
        });

        if (!payout) return ApiResponse.error("Payout not found", 404);

        // Find associated dispute?
        // For simplicity, we just update Payout Status based on Admin Decision.
        // If APPROVED (Dispute Valid): Payout -> FAILED/REVERSED.
        // If REJECTED (Dispute Invalid): Payout -> PENDING (Proceed to pay).

        const newStatus = resolution === 'APPROVED' ? 'REVERSED' : 'PENDING';

        const updatedPayout = await db.payout.update({
            where: { id: payoutId },
            data: { status: newStatus }
        });

        // Log Audit
        await db.auditLog.create({
            data: {
                userId: user.userId,
                action: 'RESOLVE_DISPUTE',
                entity: 'Payout',
                entityId: payoutId,
                details: { resolution, notes, oldStatus: payout.status }
            }
        });

        return ApiResponse.success({ payout: updatedPayout });

    } catch (error) {
        console.error('Error resolving dispute:', error);
        return ApiResponse.error('Internal Server Error', 500);
    }
});
