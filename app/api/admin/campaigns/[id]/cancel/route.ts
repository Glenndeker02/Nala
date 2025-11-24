
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";
import { z } from "zod";

const cancelSchema = z.object({
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
    refundBudget: z.boolean().default(true),
});

/**
 * POST /api/admin/campaigns/[id]/cancel
 * Cancel a campaign and optionally refund remaining budget
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return requireRole('ADMIN', async (req: NextRequest, user: JWTPayload) => {
        try {
            // Extract campaign ID from params
            const campaignId = params.id;
            const body = await request.json();
            const validation = cancelSchema.safeParse(body);

            if (!validation.success) {
                return ApiResponse.error('Invalid request', 400, validation.error.errors);
            }

            const { reason, refundBudget } = validation.data;

            // Check if campaign exists
            const campaign = await db.campaign.findUnique({
                where: { id: campaignId },
                include: {
                    founder: true,
                    videos: true,
                },
            });

            if (!campaign) {
                return ApiResponse.error('Campaign not found', 404);
            }

            // Calculate refund if applicable
            const committedBudget = campaign.videos.reduce((sum, v) => sum + 100, 0); // Mock calculation
            const remainingBudget = Math.max(0, Number(campaign.totalBudget) - committedBudget);

            let refundId = null;

            if (refundBudget && remainingBudget > 0) {
                // Create refund record
                const refund = await db.payment.create({
                    data: {
                        recipientId: campaign.founderId,
                        amount: remainingBudget,
                        type: 'REFUND',
                        status: 'PROCESSING',
                        description: `Campaign cancellation refund: ${campaign.name}`,
                        campaignId,
                    },
                });
                refundId = refund.id;
            }

            // Update campaign
            await db.campaign.update({
                where: { id: campaignId },
                data: {
                    status: 'CANCELLED',
                },
            });

            // Create notification for founder
            await db.notification.create({
                data: {
                    userId: campaign.founderId,
                    type: 'SYSTEM',
                    title: 'Campaign Cancelled',
                    message: `Your campaign "${campaign.name}" has been cancelled by an admin. Reason: ${reason}${refundId ? ` A refund of $${remainingBudget} has been initiated.` : ''}`,
                    link: `/founder/campaigns/${campaignId}`,
                },
            });

            // Log admin action
            await db.adminAuditLog.create({
                data: {
                    adminId: user.userId,
                    actionType: 'CAMPAIGN_CANCEL',
                    resourceType: 'CAMPAIGN',
                    resourceId: campaignId,
                    details: {
                        reason,
                        refundAmount: refundId ? remainingBudget : 0,
                        previousStatus: campaign.status,
                    },
                    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                    userAgent: request.headers.get('user-agent') || 'unknown',
                },
            });

            return ApiResponse.success({
                campaignId,
                status: 'CANCELLED',
                refundAmount: refundId ? remainingBudget : 0,
            });
        } catch (error) {
            console.error('Cancel campaign error:', error);
            return ApiResponse.error('Failed to cancel campaign', 500);
        }
    })(request);
}
