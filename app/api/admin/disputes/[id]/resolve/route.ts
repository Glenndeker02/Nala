import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";
import { z } from "zod";

const resolveSchema = z.object({
    resolution: z.string().min(10, 'Resolution details must be at least 10 characters'),
    outcome: z.enum(['FAVOR_INITIATOR', 'FAVOR_RESPONDENT', 'SPLIT', 'DISMISSED']),
});

/**
 * POST /api/admin/disputes/[id]/resolve
 * Resolve a dispute with a final decision
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return requireRole('ADMIN', async (req: NextRequest, user: JWTPayload) => {
        try {
            const disputeId = params.id;
            const body = await request.json();
            const validation = resolveSchema.safeParse(body);

            if (!validation.success) {
                return ApiResponse.error('Invalid request', 400, validation.error.errors);
            }

            const { resolution, outcome } = validation.data;

            // Check if dispute exists
            const dispute = await db.dispute.findUnique({
                where: { id: disputeId },
                include: { initiator: true, respondent: true },
            });

            if (!dispute) {
                return ApiResponse.error('Dispute not found', 404);
            }

            // Update dispute
            await db.dispute.update({
                where: { id: disputeId },
                data: {
                    status: 'RESOLVED',
                    resolution: `Outcome: ${outcome}. Details: ${resolution}`,
                    resolvedAt: new Date(),
                },
            });

            // Add system message to thread
            await db.disputeMessage.create({
                data: {
                    disputeId,
                    senderId: context.user.id, // Admin ID
                    content: `**DISPUTE RESOLVED**\n\nDecision: ${outcome}\n\n${resolution}`,
                    isInternal: false,
                },
            });

            // Notify both parties
            const notificationData = {
                type: 'DISPUTE_UPDATE',
                title: 'Dispute Resolved',
                message: `The dispute regarding ${dispute.category} has been resolved. Outcome: ${outcome}.`,
                link: `/disputes/${disputeId}`,
            };

            await db.notification.createMany({
                data: [
                    { ...notificationData, userId: dispute.initiatorId } as any,
                    { ...notificationData, userId: dispute.respondentId } as any,
                ],
            });

            // Log admin action
            await db.adminAuditLog.create({
                data: {
                    adminId: user.userId,
                    actionType: 'DISPUTE_RESOLVE',
                    resourceType: 'DISPUTE',
                    resourceId: disputeId,
                    details: {
                        outcome,
                        resolution,
                    },
                    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                    userAgent: request.headers.get('user-agent') || 'unknown',
                },
            });

            return ApiResponse.success({
                disputeId,
                status: 'RESOLVED',
                outcome,
            });
        } catch (error) {
            console.error('Resolve dispute error:', error);
            return ApiResponse.error('Failed to resolve dispute', 500);
        }
    })(request);
}
