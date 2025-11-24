import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";
import { z } from "zod";

const adjustSchema = z.object({
    adjustmentAmount: z.number(),
    reason: z.enum(['ERROR_CORRECTION', 'DISPUTE_RESOLUTION', 'COMPENSATION']),
    notes: z.string().min(10, 'Notes must be at least 10 characters'),
});

/**
 * POST /api/admin/creators/[id]/adjust-earnings
 * Manually adjust creator earnings (for error correction)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return requireRole('ADMIN', async (req: NextRequest, user: JWTPayload) => {
        try {
            const creatorId = params.id;
            const body = await request.json();
            const validation = adjustSchema.safeParse(body);

            if (!validation.success) {
                return ApiResponse.error('Invalid request', 400, validation.error.errors);
            }

            const { adjustmentAmount, reason, notes } = validation.data;

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

            // Check admin permissions for amount
            // Note: This would require fetching admin user details from the database
            // For now, we'll skip this check or implement it differently
            const maxOverride = 10000; // Default max override amount

            if (Math.abs(adjustmentAmount) > maxOverride) {
                return ApiResponse.error(
                    `Adjustment amount exceeds your limit of $${maxOverride}. Requires approval from higher admin level.`,
                    403
                );
            }

            // Create payment record for adjustment
            const payment = await db.payment.create({
                data: {
                    recipientId: creatorId,
                    amount: adjustmentAmount,
                    type: 'PAYOUT',
                    status: adjustmentAmount > 100 ? 'PENDING' : 'COMPLETED',
                    description: `Admin adjustment: ${reason} - ${notes}`,
                },
            });

            // Create notification
            await db.notification.create({
                data: {
                    userId: creatorId,
                    type: 'PAYMENT',
                    title: 'Earnings Adjustment',
                    message: `Your earnings have been adjusted by $${adjustmentAmount}. Reason: ${reason}`,
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
                        adjustmentAmount,
                        reason,
                        notes,
                        paymentId: payment.id,
                        status: payment.status,
                    },
                    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                    userAgent: request.headers.get('user-agent') || 'unknown',
                },
            });

            return ApiResponse.success({
                adjustmentId: payment.id,
                creatorId,
                amount: adjustmentAmount,
                status: payment.status,
                requiresApproval: payment.status === 'PENDING',
                createdAt: payment.createdAt,
            });
        } catch (error) {
            console.error('Adjust earnings error:', error);
            return ApiResponse.error('Failed to adjust earnings', 500);
        }
    })(request);
}
