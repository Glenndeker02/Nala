import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, ApiResponse } from '@/lib/api-middleware';
import { DiscountType } from '@prisma/client';
import crypto from 'crypto';

/**
 * POST /api/campaigns/:id/attribution/enable
 * Enable or configure attribution codes for a campaign
 * Auth: Founder only
 */
export const POST = requireRole(['FOUNDER'], async (req: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;
        const body = await req.json();

        const {
            enabled,
            strategy, // "AUTO" | "CUSTOM"
            commissionPerConversion,
            discountType,
            discountValue,
            attributionWindowDays
        } = body;

        // Validate input
        if (typeof enabled !== 'boolean') {
            return ApiResponse.error('enabled must be a boolean', 400);
        }

        if (enabled) {
            if (!strategy || !['AUTO', 'CUSTOM'].includes(strategy)) {
                return ApiResponse.error('strategy must be AUTO or CUSTOM when enabled', 400);
            }

            if (commissionPerConversion !== undefined && (typeof commissionPerConversion !== 'number' || commissionPerConversion < 0)) {
                return ApiResponse.error('commissionPerConversion must be a positive number', 400);
            }

            if (discountType && !['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_TRIAL', 'FREE_MONTH'].includes(discountType)) {
                return ApiResponse.error('Invalid discountType', 400);
            }

            if (discountValue !== undefined && (typeof discountValue !== 'number' || discountValue < 0)) {
                return ApiResponse.error('discountValue must be a positive number', 400);
            }
        }

        // Check campaign exists and user owns it
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            select: { id: true, founderId: true, enableCreatorCodes: true, apiKey: true }
        });

        if (!campaign) {
            return ApiResponse.error('Campaign not found', 404);
        }

        if (campaign.founderId !== user.userId) {
            return ApiResponse.error('Unauthorized - not campaign owner', 403);
        }

        // Generate API key if enabling and doesn't exist
        let apiKey = campaign.apiKey;
        if (enabled && !apiKey) {
            apiKey = `ck_${crypto.randomBytes(32).toString('hex')}`;
        }

        // Update campaign
        const updatedCampaign = await prisma.campaign.update({
            where: { id: campaignId },
            data: {
                enableCreatorCodes: enabled,
                autoGenerateCodes: enabled ? (strategy === 'AUTO') : false,
                conversionCommission: commissionPerConversion !== undefined ? commissionPerConversion : undefined,
                codeDiscountType: discountType as DiscountType || undefined,
                codeDiscountValue: discountValue !== undefined ? discountValue : undefined,
                attributionWindowDays: attributionWindowDays !== undefined ? attributionWindowDays : undefined,
                apiKey: apiKey
            },
            select: {
                id: true,
                name: true,
                enableCreatorCodes: true,
                autoGenerateCodes: true,
                conversionCommission: true,
                codeDiscountType: true,
                codeDiscountValue: true,
                attributionWindowDays: true,
                apiKey: true
            }
        });

        console.log('[ATTRIBUTION_ENABLE] Campaign attribution configured:', {
            campaignId,
            enabled,
            strategy,
            apiKeyGenerated: !!apiKey
        });

        return ApiResponse.success({
            status: 'ok',
            campaign: updatedCampaign,
            message: enabled ? 'Attribution codes enabled successfully' : 'Attribution codes disabled'
        });

    } catch (error) {
        console.error('[ATTRIBUTION_ENABLE_ERROR]', error);
        return ApiResponse.error('Internal server error', 500);
    }
});
