import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";
import { z } from "zod";

const banSchema = z.object({
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
    refundPendingEarnings: z.boolean().optional().default(false),
});

/**
 * POST /api/admin/creators/[id]/ban
 * Permanently ban creator (nuclear option)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return requireRole('ADMIN', async (req: NextRequest, user: JWTPayload) => {
        try {
            const creatorId = params.id;
            const body = await request.json();
            const validation = banSchema.safeParse(body);

            if (!validation.success) {
                return ApiResponse.error('Invalid request', 400, validation.error.errors);
            }

            const { reason, refundPendingEarnings } = validation.data;

            // Check if creator exists
            const creator = await db.user.findUnique({
                where: {
                    id: creatorId,
                    role: 'CREATOR',
                },
                include: {
                    assignedVideos: {
                        where: {
                            status: {
                                in: ['PENDING', 'DRAFT_SUBMITTED', 'IN_REVIEW', 'REVISION_REQUESTED'],
                            },
                        },
                        include: {
                            campaign: true,
                        },
                    },
                },
            });

            if (!creator) {
                return ApiResponse.error('Creator not found', 404);
            }

            // Get pending earnings
            const pendingEarnings = await db.payment.aggregate({
                where: {
                    recipientId: creatorId,
                    status: 'PENDING',
                },
                _sum: {
                    amount: true,
                },
            });

            const refundsProcessed = [];

            // Handle refunds if requested
            if (refundPendingEarnings && pendingEarnings._sum.amount) {
                // Cancel pending payments
                await db.payment.updateMany({
                    where: {
                        recipientId: creatorId,
                        status: 'PENDING',
                    },
                    data: {
                        status: 'CANCELLED',
                    },
                });

                refundsProcessed.push({
                    type: 'CANCELLED_PAYMENTS',
                    amount: Number(pendingEarnings._sum.amount),
                });
            }

            // Cancel all active campaigns
            const affectedCampaigns = creator.assignedVideos.map((v) => v.campaign);

            for (const video of creator.assignedVideos) {
                // Update video status
                await db.video.update({
                    where: { id: video.id },
                    data: {
                        status: 'PENDING', // Reset to pending so founder can reassign
                    },
                });

                // Notify founder
                await db.notification.create({
                    data: {
                        userId: video.campaign.founderId,
                        type: 'SYSTEM',
                        title: 'Creator Removed from Campaign',
                        message: `Creator has been removed from your campaign "${video.campaign.name}". You can assign a new creator.`,
                        link: `/founder/campaigns/${video.campaign.id}`,
                    },
                });
            }

            // Ban the user
            await db.user.update({
                where: {
                    id: creatorId,
                },
                data: {
                    bannedReason: reason,
                    suspendedUntil: new Date('2099-12-31'), // Far future date
                },
            });

            // Create notification
            await db.notification.create({
                data: {
                    userId: creatorId,
                    type: 'SYSTEM',
                    title: 'Account Banned',
                    message: `Your account has been permanently banned. Reason: ${reason}. If you believe this is an error, please contact support.`,
                },
            });

            // Log admin action
            await db.adminAuditLog.create({
                data: {
                    adminId: user.userId,
                    actionType: 'CREATOR_BAN',
                    resourceType: 'CREATOR',
                    resourceId: creatorId,
                    details: {
                        reason,
                        refundPendingEarnings,
                        pendingEarningsAmount: Number(pendingEarnings._sum.amount || 0),
                        affectedCampaigns: affectedCampaigns.length,
                        refundsProcessed,
                    },
                    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                    userAgent: request.headers.get('user-agent') || 'unknown',
                },
            });

            return ApiResponse.success({
                creatorId,
                status: 'BANNED',
                reason,
                affectedCampaigns: affectedCampaigns.length,
                refundsProcessed,
            });
        } catch (error) {
            console.error('Ban creator error:', error);
            return ApiResponse.error('Failed to ban creator', 500);
        }
    })(request);
}
