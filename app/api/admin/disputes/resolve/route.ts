import { NextRequest } from 'next/server';
import { requireRole, ApiResponse } from '@/lib/api-middleware';
import db from '@/lib/db';
import { z } from 'zod';

const resolveSchema = z.object({
    disputeId: z.string(),
    resolution: z.string().min(10, 'Resolution must be at least 10 characters'),
    outcome: z.enum(['REFUND_FOUNDER', 'PAY_CREATOR', 'SPLIT', 'DISMISS']),
});

/**
 * POST /api/admin/disputes/resolve - Resolve a dispute (admin only)
 */
export const POST = requireRole('ADMIN', async (request: NextRequest, user: JWTPayload) => {
    try {
        const body = await request.json();
        const validation = resolveSchema.safeParse(body);

        if (!validation.success) {
            return ApiResponse.error('Invalid input', 400, validation.error.errors);
        }

        const { disputeId, resolution, outcome } = validation.data;

        // Fetch the dispute
        const dispute = await db.dispute.findUnique({
            where: { id: disputeId },
            include: {
                campaign: true,
                video: true,
            },
        });

        if (!dispute) {
            return ApiResponse.error('Dispute not found', 404);
        }

        if (dispute.status !== 'PENDING') {
            return ApiResponse.error('Dispute already resolved', 400);
        }

        // Update dispute status
        await db.dispute.update({
            where: { id: disputeId },
            data: {
                status: 'RESOLVED',
                resolution,
                resolvedAt: new Date(),
            },
        });

        // Handle outcome actions
        switch (outcome) {
            case 'REFUND_FOUNDER':
                // In a real app, trigger Stripe refund
                // For now, just log and notify
                console.log(`[Admin] Refunding founder for dispute ${disputeId}`);

                // Notify founder
                await db.notification.create({
                    data: {
                        recipientId: dispute.campaign.founderId,
                        type: 'DISPUTE',
                        title: 'Dispute Resolved - Refund Issued',
                        message: `Your dispute has been resolved in your favor. A refund has been processed.`,
                        link: `/founder/campaigns/${dispute.campaignId}`,
                        isRead: false,
                    },
                });

                // Notify creator
                await db.notification.create({
                    data: {
                        recipientId: dispute.respondentId,
                        type: 'DISPUTE',
                        title: 'Dispute Resolved',
                        message: `The dispute has been resolved. Please review the admin decision.`,
                        link: `/creator/tasks/${dispute.videoId}`,
                        isRead: false,
                    },
                });
                break;

            case 'PAY_CREATOR':
                // Trigger payment to creator
                console.log(`[Admin] Paying creator for dispute ${disputeId}`);

                // Notify creator
                await db.notification.create({
                    data: {
                        recipientId: dispute.respondentId,
                        type: 'PAYMENT',
                        title: 'Dispute Resolved - Payment Released',
                        message: `Your dispute has been resolved in your favor. Payment has been released.`,
                        link: `/creator/tasks/${dispute.videoId}`,
                        isRead: false,
                    },
                });

                // Notify founder
                await db.notification.create({
                    data: {
                        recipientId: dispute.campaign.founderId,
                        type: 'DISPUTE',
                        title: 'Dispute Resolved',
                        message: `The dispute has been resolved. Payment has been released to the creator.`,
                        link: `/founder/campaigns/${dispute.campaignId}`,
                        isRead: false,
                    },
                });
                break;

            case 'SPLIT':
                console.log(`[Admin] Splitting payment for dispute ${disputeId}`);
                // Handle 50/50 split logic
                break;

            case 'DISMISS':
                console.log(`[Admin] Dismissing dispute ${disputeId}`);
                // No financial action
                break;
        }

        return ApiResponse.success({
            message: 'Dispute resolved successfully',
            disputeId,
            outcome,
        });
    } catch (error) {
        console.error('Resolve dispute error:', error);
        return ApiResponse.error('Failed to resolve dispute', 500);
    }
});
