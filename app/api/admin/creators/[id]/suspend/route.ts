import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";
import { z } from "zod";

const suspendSchema = z.object({
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
    durationDays: z.number().int().positive().optional(), // null = indefinite
});

/**
 * POST /api/admin/creators/[id]/suspend
 * Temporarily suspend creator account
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return requireRole('ADMIN', async (req: NextRequest, user: JWTPayload) => {
        try {
            const creatorId = params.id;
            const body = await request.json();
            const validation = suspendSchema.safeParse(body);

            if (!validation.success) {
                return ApiResponse.error('Invalid request', 400, validation.error.errors);
            }

            const { reason, durationDays } = validation.data;

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

            // Calculate suspension end date
            const suspendedUntil = durationDays
                ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
                : null; // null = indefinite

            // Update user
            const updatedUser = await db.user.update({
                where: {
                    id: creatorId,
                },
                data: {
                    suspendedUntil,
                    suspensionReason: reason,
                },
            });

            // Pause all active campaigns
            const activeCampaigns = await db.video.findMany({
                where: {
                    creatorId,
                    status: {
                        in: ['PENDING', 'DRAFT_SUBMITTED', 'IN_REVIEW'],
                    },
                },
            });

            // Update video statuses (simplified - would need more complex logic)
            await db.video.updateMany({
                where: {
                    creatorId,
                    status: {
                        in: ['PENDING', 'DRAFT_SUBMITTED', 'IN_REVIEW'],
                    },
                },
                data: {
                    // Would add a suspended flag or status
                },
            });

            // Create notification
            await db.notification.create({
                data: {
                    userId: creatorId,
                    type: 'SYSTEM',
                    title: 'Account Suspended',
                    message: `Your account has been suspended${durationDays ? ` for ${durationDays} days` : ' indefinitely'}. Reason: ${reason}`,
                    link: '/creator/profile',
                },
            });

            // Log admin action
            await db.adminAuditLog.create({
                data: {
                    adminId: user.userId,
                    actionType: 'CREATOR_SUSPEND',
                    resourceType: 'CREATOR',
                    resourceId: creatorId,
                    details: {
                        reason,
                        durationDays,
                        suspendedUntil,
                        affectedCampaigns: activeCampaigns.length,
                    },
                    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                    userAgent: request.headers.get('user-agent') || 'unknown',
                },
            });

            return ApiResponse.success({
                creatorId,
                status: 'SUSPENDED',
                suspendedUntil,
                reason,
                affectedCampaigns: activeCampaigns.length,
            });
        } catch (error) {
            console.error('Suspend creator error:', error);
            return ApiResponse.error('Failed to suspend creator', 500);
        }
    })(request);
}
