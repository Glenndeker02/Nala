import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";
import { z } from "zod";

const pauseSchema = z.object({
    action: z.enum(['PAUSE', 'RESUME']),
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

/**
 * POST /api/admin/campaigns/[id]/pause
 * Pause or resume a campaign
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return requireRole('ADMIN', async (req: NextRequest, user: JWTPayload) => {
        try {
            const campaignId = params.id;
            const body = await request.json();
            const validation = pauseSchema.safeParse(body);

            if (!validation.success) {
                return ApiResponse.error('Invalid request', 400, validation.error.errors);
            }

            const { action, reason } = validation.data;

            // Check if campaign exists
            const campaign = await db.campaign.findUnique({
                where: { id: campaignId },
                include: { founder: true },
            });

            if (!campaign) {
                return ApiResponse.error('Campaign not found', 404);
            }

            const newStatus = action === 'PAUSE' ? 'PAUSED' : 'ACTIVE';

            // Update campaign
            await db.campaign.update({
                where: { id: campaignId },
                data: {
                    status: newStatus,
                },
            });

            // Create notification for founder
            await db.notification.create({
                data: {
                    userId: campaign.founderId,
                    type: 'SYSTEM',
                    title: `Campaign ${action === 'PAUSE' ? 'Paused' : 'Resumed'}`,
                    message: `Your campaign "${campaign.name}" has been ${action === 'PAUSE' ? 'paused' : 'resumed'} by an admin. Reason: ${reason}`,
                    link: `/founder/campaigns/${campaignId}`,
                },
            });

            // Log admin action
            await db.adminAuditLog.create({
                data: {
                    adminId: user.userId,
                    actionType: `CAMPAIGN_${action}`,
                    resourceType: 'CAMPAIGN',
                    resourceId: campaignId,
                    details: {
                        reason,
                        previousStatus: campaign.status,
                        newStatus,
                    },
                    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                    userAgent: request.headers.get('user-agent') || 'unknown',
                },
            });

            return ApiResponse.success({
                campaignId,
                status: newStatus,
                reason,
            });
        } catch (error) {
            console.error('Pause campaign error:', error);
            return ApiResponse.error('Failed to update campaign status', 500);
        }
    })(request);
}
