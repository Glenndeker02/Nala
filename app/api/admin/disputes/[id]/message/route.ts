import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";
import { z } from "zod";

const messageSchema = z.object({
    content: z.string().min(1, 'Message cannot be empty'),
    isInternal: z.boolean().default(false),
});

/**
 * POST /api/admin/disputes/[id]/message
 * Send a message in the dispute thread
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return requireRole('ADMIN', async (req: NextRequest, user: JWTPayload) => {
        try {
            const disputeId = params.id;
            const body = await request.json();
            const validation = messageSchema.safeParse(body);

            if (!validation.success) {
                return ApiResponse.error('Invalid request', 400, validation.error.errors);
            }

            const { content, isInternal } = validation.data;

            // Check if dispute exists
            const dispute = await db.dispute.findUnique({
                where: { id: disputeId },
                include: { initiator: true, respondent: true },
            });

            if (!dispute) {
                return ApiResponse.error('Dispute not found', 404);
            }

            // Create message
            const message = await db.disputeMessage.create({
                data: {
                    disputeId,
                    senderId: user.userId,
                    content,
                    isInternal,
                },
            });

            if (!isInternal) {
                const notificationData = {
                    type: 'DISPUTE_UPDATE',
                    title: 'New Message from Admin',
                    message: `An admin posted a new message in your dispute.`,
                    link: `/disputes/${disputeId}`,
                };

                await db.notification.createMany({
                    data: [
                        { ...notificationData, userId: dispute.initiatorId } as any,
                        { ...notificationData, userId: dispute.respondentId } as any,
                    ],
                });
            }
            return ApiResponse.success({
                messageId: message.id,
                content,
                createdAt: message.createdAt,
            });
        } catch (error) {
            console.error('Send dispute message error:', error);
            return ApiResponse.error('Failed to send message', 500);
        }
    })(request);
}
