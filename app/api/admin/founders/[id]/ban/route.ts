import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";
import { z } from "zod";

const banSchema = z.object({
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

/**
 * POST /api/admin/founders/[id]/ban
 * Permanently ban founder
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return requireRole('ADMIN', async (req: NextRequest, user: JWTPayload) => {
        try {
            const founderId = params.id;
            const body = await request.json();
            const validation = banSchema.safeParse(body);

            if (!validation.success) {
                return ApiResponse.error('Invalid request', 400, validation.error.errors);
            }

            const { reason } = validation.data;

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

            // Cancel all campaigns
            const activeCampaigns = await db.campaign.findMany({
                where: {
                    founderId,
                    status: { not: 'COMPLETED' }, // Cancel everything not completed
                },
            });

            await db.campaign.updateMany({
                where: {
                    founderId,
                    status: { not: 'COMPLETED' },
                },
                data: {
                    status: 'CANCELLED',
                },
            });

            // Update user
            await db.user.update({
                where: { id: founderId },
                data: {
                    bannedReason: reason,
                    suspendedUntil: new Date('2099-12-31'),
                },
            });

            // Create notification
            await db.notification.create({
                data: {
                    userId: founderId,
                    type: 'SYSTEM',
                    title: 'Account Banned',
                    message: `Your account has been permanently banned. Reason: ${reason}.`,
                },
            });

            // Log admin action
            await db.adminAuditLog.create({
                data: {
                    adminId: user.userId,
                    actionType: 'FOUNDER_BAN',
                    resourceType: 'FOUNDER',
                    resourceId: founderId,
                    details: {
                        reason,
                        affectedCampaigns: activeCampaigns.length,
                    },
                    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                    userAgent: request.headers.get('user-agent') || 'unknown',
                },
            });

            return ApiResponse.success({
                founderId,
                status: 'BANNED',
                reason,
                affectedCampaigns: activeCampaigns.length,
            });
        } catch (error) {
            console.error('Ban founder error:', error);
            return ApiResponse.error('Failed to ban founder', 500);
        }
    })(request);
}
