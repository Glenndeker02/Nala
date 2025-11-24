import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";
import { z } from "zod";

const payoutSchema = z.object({
    amount: z.number().positive().optional(), // null = all available
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

/**
 * POST /api/admin/creators/[id]/force-payout
 * Force immediate payout (bypasses normal schedule)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return requireRole('ADMIN', async (req: NextRequest, user: JWTPayload) => {
        try {
            const creatorId = params.id;
            const body = await request.json();
            const validation = payoutSchema.safeParse(body);

            if (!validation.success) {
                return ApiResponse.error('Invalid request', 400, validation.error.errors);
            }

            const { amount, reason } = validation.data;

            // Check if creator exists
            const creator = await db.user.findUnique({
                where: {
                    id: creatorId,
                    role: 'CREATOR',
                },
            });

            if (!creator) {
                return ApiResponse.error('Creator not found', 404);
            }

            if (!creator.stripeAccountId) {
                return ApiResponse.error('Creator has not connected Stripe account', 400);
            }

            // Calculate available balance
            const completedPayments = await db.payment.aggregate({
                where: {
                    recipientId: creatorId,
                    status: 'COMPLETED',
                    type: {
                        in: ['BASE_FEE', 'PERFORMANCE_BONUS'],
                    },
                },
                _sum: {
                    amount: true,
                },
            });

            const paidOut = await db.payment.aggregate({
                where: {
                    recipientId: creatorId,
                    status: 'COMPLETED',
                    type: 'PAYOUT',
                },
                _sum: {
                    amount: true,
                },
            });

            const availableBalance = Number(completedPayments._sum.amount || 0) - Number(paidOut._sum.amount || 0);

            if (availableBalance <= 0) {
                return ApiResponse.error('No available balance to payout', 400);
            }

            const payoutAmount = amount || availableBalance;

            if (payoutAmount > availableBalance) {
                return ApiResponse.error(`Requested amount exceeds available balance of $${availableBalance}`, 400);
            }

            // Create payout record
            const payout = await db.payment.create({
                data: {
                    recipientId: creatorId,
                    amount: payoutAmount,
                    type: 'PAYOUT',
                    status: 'PROCESSING',
                    description: `Admin forced payout: ${reason}`,
                },
            });

            // In production, would initiate Stripe transfer here
            // const transfer = await stripe.transfers.create({
            //   amount: payoutAmount * 100,
            //   currency: 'usd',
            //   destination: creator.stripeAccountId,
            // });

            // Simulate Stripe transfer
            const stripeTransferId = `tr_${Date.now()}`;
            const estimatedArrival = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days

            // Update payout with Stripe info
            await db.payment.update({
                where: { id: payout.id },
                data: {
                    status: 'COMPLETED',
                    // Would store stripeTransferId in metadata
                },
            });

            // Create notification
            await db.notification.create({
                data: {
                    userId: creatorId,
                    type: 'PAYMENT',
                    title: 'Payout Processed',
                    message: `A payout of $${payoutAmount} has been initiated to your account. Expected arrival: ${estimatedArrival.toLocaleDateString()}`,
                    link: '/creator/earnings',
                },
            });

            // Log admin action
            await db.adminAuditLog.create({
                data: {
                    adminId: user.userId,
                    actionType: 'PAYMENT_OVERRIDE',
                    resourceType: 'CREATOR',
                    resourceId: creatorId,
                    details: {
                        payoutAmount,
                        reason,
                        availableBalance,
                        stripeTransferId,
                        payoutId: payout.id,
                    },
                    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                    userAgent: request.headers.get('user-agent') || 'unknown',
                },
            });

            return ApiResponse.success({
                payoutId: payout.id,
                amount: payoutAmount,
                stripeTransferId,
                status: 'PROCESSING',
                estimatedArrival,
            });
        } catch (error) {
            console.error('Force payout error:', error);
            return ApiResponse.error('Failed to process payout', 500);
        }
    })(request);
}
