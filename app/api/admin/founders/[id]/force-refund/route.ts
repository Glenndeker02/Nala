import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";
import { z } from "zod";

const refundSchema = z.object({
    amount: z.number().positive(),
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
    campaignId: z.string().optional(),
});

/**
 * POST /api/admin/founders/[id]/force-refund
 * Manually issue a refund to a founder
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return requireRole('ADMIN', async (req: NextRequest, user: JWTPayload) => {
        try {
            const founderId = params.id;
            const body = await request.json();
            const validation = refundSchema.safeParse(body);

            if (!validation.success) {
                return ApiResponse.error('Invalid request', 400, validation.error.errors);
            }

            const { amount, reason, campaignId } = validation.data;

            // Check if founder exists
            const founder = await db.user.findUnique({
                where: {
                    id: founderId,
                    role: 'FOUNDER',
                },
            });

            if (!founder) {
                return ApiResponse.error('Founder not found', 404);
            }

            // Check admin permissions for amount
            const adminUser = user;
            const maxOverride = Number(adminUser.adminUser?.maxManualOverrideAmount || 0);

            if (amount > maxOverride) {
                return ApiResponse.error(
                    `Refund amount exceeds your limit of $${maxOverride}. Requires approval from higher admin level.`,
                    403
                );
            }

            // Create refund payment record
            const payment = await db.payment.create({
                data: {
                    recipientId: founderId,
                    amount: amount,
                    type: 'REFUND',
                    status: 'PROCESSING', // Would be PROCESSING until Stripe confirms
                    description: `Admin forced refund: ${reason}`,
                    campaignId,
                },
            });

            // Simulate Stripe Refund
            // In production: await stripe.refunds.create(...)
            const stripeRefundId = `re_${Date.now()}`;

            // Update payment
            await db.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'COMPLETED',
                    // Store stripeRefundId in metadata if field existed
                },
            });

            // Create notification
            await db.notification.create({
                data: {
                    userId: founderId,
                    type: 'PAYMENT',
                    title: 'Refund Processed',
                    message: `A refund of $${amount} has been processed to your original payment method. Reason: ${reason}`,
                    link: '/founder/billing',
                },
            });

            // Log admin action
            await db.adminAuditLog.create({
                data: {
                    adminId: user.userId,
                    actionType: 'PAYMENT_OVERRIDE',
                    resourceType: 'FOUNDER',
                    resourceId: founderId,
                    details: {
                        amount,
                        reason,
                        campaignId,
                        stripeRefundId,
                        paymentId: payment.id,
                    },
                    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                    userAgent: request.headers.get('user-agent') || 'unknown',
                },
            });

            return ApiResponse.success({
                refundId: payment.id,
                amount,
                stripeRefundId,
                status: 'COMPLETED',
            });
        } catch (error) {
            console.error('Force refund error:', error);
            return ApiResponse.error('Failed to process refund', 500);
        }
    })(request);
}
