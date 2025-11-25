import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole } from "@/lib/api-middleware";

/**
 * POST /api/admin/campaigns/[id]/resume
 * Resume a paused campaign
 */
export const POST = requireRole('ADMIN', async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
        const { id } = params;
        const body = await request.json();
        const { reason } = body;

        if (!reason) {
            return ApiResponse.error('Reason is required', 400);
        }

        // Check if campaign exists and is paused
        const campaign = await db.campaign.findUnique({
            where: { id },
            include: {
                founder: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                    },
                },
            },
        });

        if (!campaign) {
            return ApiResponse.error('Campaign not found', 404);
        }

        if (campaign.status !== 'PAUSED') {
            return ApiResponse.error('Campaign is not paused', 400);
        }

        // Resume campaign
        const updatedCampaign = await db.campaign.update({
            where: { id },
            data: {
                status: 'IN_PROGRESS',
            },
        });

        // Create notification for founder
        await db.notification.create({
            data: {
                userId: campaign.founderId,
                type: 'SYSTEM',
                title: 'Campaign Resumed',
                message: `Your campaign "${campaign.name}" has been resumed by admin. Reason: ${reason}`,
                link: `/founder/campaigns/${campaign.id}`,
            },
        });

        // TODO: Send email notification to founder

        return ApiResponse.success({
            campaign: updatedCampaign,
            message: 'Campaign resumed successfully',
        });
    } catch (error) {
        console.error('Resume campaign error:', error);
        return ApiResponse.error('Failed to resume campaign', 500);
    }
});
