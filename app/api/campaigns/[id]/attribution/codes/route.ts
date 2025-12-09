import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, ApiResponse } from '@/lib/api-middleware';
import { Platform, CodeType } from '@prisma/client';
import { createCreatorCodes } from '@/lib/attribution/code-generator';

/**
 * POST /api/campaigns/:id/attribution/codes
 * Create attribution codes for a creator
 * Auth: Founder only
 */
export const POST = requireRole(['FOUNDER'], async (req: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;
        const body = await req.json();

        const { creatorId, platform, code: customCode } = body;

        // Validate input
        if (!creatorId) {
            return ApiResponse.error('creatorId is required', 400);
        }

        if (!platform || !['TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'FACEBOOK'].includes(platform)) {
            return ApiResponse.error('Valid platform is required', 400);
        }

        // Check campaign exists and user owns it
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            include: {
                creator: {
                    select: { id: true, fullName: true }
                }
            }
        });

        if (!campaign) {
            return ApiResponse.error('Campaign not found', 404);
        }

        if (campaign.founderId !== user.userId) {
            return ApiResponse.error('Unauthorized - not campaign owner', 403);
        }

        if (!campaign.enableCreatorCodes) {
            return ApiResponse.error('Attribution codes not enabled for this campaign', 400);
        }

        // Verify creator exists
        const creator = await prisma.user.findUnique({
            where: { id: creatorId },
            select: { id: true, fullName: true, role: true }
        });

        if (!creator || creator.role !== 'CREATOR') {
            return ApiResponse.error('Creator not found', 404);
        }

        // Check if code already exists for this creator/platform/campaign
        const existingCode = await prisma.creatorCode.findFirst({
            where: {
                campaignId,
                creatorId,
                platform: platform as Platform
            }
        });

        if (existingCode) {
            return ApiResponse.error('Code already exists for this creator and platform', 409);
        }

        // If custom code provided, validate uniqueness
        if (customCode) {
            const codeExists = await prisma.creatorCode.findUnique({
                where: { code: customCode.toUpperCase() }
            });

            if (codeExists) {
                return ApiResponse.error('Code already in use', 409);
            }
        }

        // Create the code
        let createdCode;
        if (customCode) {
            // Custom code
            createdCode = await prisma.creatorCode.create({
                data: {
                    campaignId,
                    creatorId,
                    platform: platform as Platform,
                    code: customCode.toUpperCase(),
                    codeType: CodeType.CUSTOM,
                    createdBy: user.userId,
                    active: true
                },
                include: {
                    creator: {
                        select: { id: true, fullName: true }
                    },
                    campaign: {
                        select: { id: true, name: true }
                    }
                }
            });
        } else {
            // Auto-generate code
            const codes = await createCreatorCodes(campaign, creator, [platform as Platform]);
            createdCode = codes[0];
        }

        // Send notification to creator
        await prisma.notification.create({
            data: {
                userId: creatorId,
                type: 'SYSTEM',
                title: 'Attribution Code Assigned',
                message: `You've been assigned code ${createdCode.code} for campaign "${campaign.name}" on ${platform}`,
                link: `/creator/campaigns/${campaignId}`
            }
        });

        console.log('[ATTRIBUTION_CODE_CREATED]', {
            campaignId,
            creatorId,
            platform,
            code: createdCode.code,
            type: customCode ? 'CUSTOM' : 'AUTO'
        });

        return ApiResponse.success(createdCode, 201);

    } catch (error) {
        console.error('[ATTRIBUTION_CODE_CREATE_ERROR]', error);
        return ApiResponse.error('Internal server error', 500);
    }
});

/**
 * GET /api/campaigns/:id/attribution/codes
 * List all attribution codes for a campaign
 * Auth: Founder only
 */
export const GET = requireRole(['FOUNDER'], async (req: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;

        // Check campaign exists and user owns it
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            select: { id: true, founderId: true }
        });

        if (!campaign) {
            return ApiResponse.error('Campaign not found', 404);
        }

        if (campaign.founderId !== user.userId) {
            return ApiResponse.error('Unauthorized - not campaign owner', 403);
        }

        // Fetch codes with stats
        const codes = await prisma.creatorCode.findMany({
            where: { campaignId },
            include: {
                creator: {
                    select: { id: true, fullName: true, email: true }
                },
                _count: {
                    select: {
                        redemptions: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Get conversion counts for each code
        const codesWithStats = await Promise.all(codes.map(async (code) => {
            const conversions = await prisma.redemption.count({
                where: {
                    creatorCodeId: code.id,
                    convertedToPaid: true
                }
            });

            return {
                ...code,
                stats: {
                    redemptions: code._count.redemptions,
                    conversions,
                    conversionRate: code._count.redemptions > 0
                        ? ((conversions / code._count.redemptions) * 100).toFixed(2)
                        : '0.00'
                }
            };
        }));

        return ApiResponse.success(codesWithStats);

    } catch (error) {
        console.error('[ATTRIBUTION_CODES_GET_ERROR]', error);
        return ApiResponse.error('Internal server error', 500);
    }
});
