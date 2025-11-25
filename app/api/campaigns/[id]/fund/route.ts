import { NextRequest } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

const fundSchema = z.object({
    amount: z.number().positive(),
    payment_method: z.enum(['CARD', 'BANK', 'APPLE_PAY']),
    stripe_payment_token: z.string(),
});

export const POST = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;
        const body = await request.json();

        const validation = fundSchema.safeParse(body);
        if (!validation.success) {
            return ApiResponse.error('Validation failed', 400, validation.error.errors);
        }

        const { amount, stripe_payment_token } = validation.data;

        // Verify campaign ownership
        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign) {
            return ApiResponse.error('Campaign not found', 404);
        }

        if (campaign.founderId !== user.userId) {
            return ApiResponse.error('Unauthorized', 403);
        }

        // Mock Stripe Charge
        // In production: await stripe.charges.create({...})
        const mockStripeChargeId = `ch_${Math.random().toString(36).substring(2, 15)}`;

        // Update Campaign
        const updatedCampaign = await db.campaign.update({
            where: { id: campaignId },
            data: {
                escrowBalance: { increment: amount },
                status: 'ACTIVE', // Maps to LIVE
                stripePaymentIntentId: mockStripeChargeId
            }
        });

        return ApiResponse.success({
            funding_id: mockStripeChargeId, // Using stripe ID as funding ID
            stripe_charge_id: mockStripeChargeId,
            amount_charged: amount,
            status: 'COMPLETED',
            campaign_status: 'LIVE'
        });

    } catch (error) {
        console.error('Funding error:', error);
        return ApiResponse.error('Failed to fund campaign', 500);
    }
});
