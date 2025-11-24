import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";
import { z } from "zod";

const settleSchema = z.object({
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

/**
 * POST /api/admin/campaigns/[id]/force-settlement
 * Force settle a campaign (mark as completed and release funds)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return requireRole('ADMIN', async (req: NextRequest, user: JWTPayload) => {
        try {
            const campaignId = params.id;
            const body = await request.json();
            const validation = settleSchema.safeParse(body);

            if (!validation.success) {
                return ApiResponse.error('Invalid request', 400, validation.error.errors);
            }

            const { reason } = validation.data;

            // Check if campaign exists
            const campaign = await db.campaign.findUnique({
                where: { id: campaignId },
                include: { founder: true },
            });

            if (!campaign) {
                return ApiResponse.error('Campaign not found', 404);
            }

            // Update campaign
            await db.campaign.update({
                where: { id: campaignId },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                },
            });

            // In a real system, this would trigger logic to release held funds to creators
            // and potentially refund unused budget to the founder.
            // For now, we'll just log it.

            // Create notification for founder
            await db.notification.create({
                data: {
                    userId: campaign.founderId,
                    type: 'SYSTEM',
                    title: 'Campaign Settled',
                    message: `Your campaign "${campaign.name}" has been marked as completed by an admin. Reason: ${reason}`,
                    link: `/founder/campaigns/${campaignId}`,
                },
            });

            // Log admin action
            await db.adminAuditLog.create({
                data: {
                    adminId: user.userId,
                    actionType: 'CAMPAIGN_SETTLE',
                    resourceType: 'CAMPAIGN',
                    resourceId: campaignId,
                    details: {
                        reason,
                    },
                    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                    userAgent: request.headers.get('user-agent') || 'unknown',
                },
            });

            return ApiResponse.success({
                campaignId,
                status: 'COMPLETED',
                settledAt: new Date(),
            });
        } catch (error) {
            console.error('Settle campaign error:', error);
            return ApiResponse.error('Failed to settle campaign', 500);
        }
    })(request);
}
