import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";
import { z } from "zod";

const suspendSchema = z.object({
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
    durationDays: z.number().int().positive().optional(), // null = indefinite
});

/**
 * POST /api/admin/founders/[id]/suspend
 * Temporarily suspend founder account
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return requireRole('ADMIN', async (req: NextRequest, user: JWTPayload) => {
        try {
            const founderId = params.id;
            const body = await request.json();
            const validation = suspendSchema.safeParse(body);

            if (!validation.success) {
                return ApiResponse.error('Invalid request', 400, validation.error.errors);
            }

            const { reason, durationDays } = validation.data;

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

            // Calculate suspension end date
            const suspendedUntil = durationDays
                ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
                : null; // null = indefinite

            // Update user
            await db.user.update({
                where: { id: founderId },
                data: {
                    suspendedUntil,
                    suspensionReason: reason,
                },
            });

            // Pause all active campaigns
            const activeCampaigns = await db.campaign.findMany({
                where: {
                    founderId,
                    status: { in: ['ACTIVE', 'IN_PROGRESS'] },
                },
            });

            await db.campaign.updateMany({
                where: {
                    founderId,
                    status: { in: ['ACTIVE', 'IN_PROGRESS'] },
                },
                data: {
                    status: 'PAUSED',
                },
            });

            // Create notification
            await db.notification.create({
                data: {
                    userId: founderId,
                    type: 'SYSTEM',
                    title: 'Account Suspended',
                    message: `Your account has been suspended${durationDays ? ` for ${durationDays} days` : ' indefinitely'}. Reason: ${reason}`,
                    link: '/founder/dashboard',
                },
            });

            // Log admin action
            await db.adminAuditLog.create({
                data: {
                    adminId: user.userId,
                    actionType: 'FOUNDER_SUSPEND',
                    resourceType: 'FOUNDER',
                    resourceId: founderId,
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
                founderId,
                status: 'SUSPENDED',
                suspendedUntil,
                reason,
                affectedCampaigns: activeCampaigns.length,
            });
        } catch (error) {
            console.error('Suspend founder error:', error);
            return ApiResponse.error('Failed to suspend founder', 500);
        }
    })(request);
}
