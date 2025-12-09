import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createCreatorCodes } from '@/lib/attribution/code-generator';
import { Platform } from '@prisma/client';
import { validateCampaignApiKey, rateLimiter, RATE_LIMITS } from '@/lib/attribution/security';

/**
 * POST /api/attribution/conversions
 * Webhook endpoint for founders to report paid conversions
 * Auth: Campaign API key (header: x-campaign-api-key)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            campaignId,
            code,
            userId,
            orderId,
            amount,
            currency = 'USD',
            conversionType = 'first_payment',
            metadata
        } = body;

        // Validate required fields
        if (!campaignId || !code) {
            return NextResponse.json(
                { success: false, error: 'campaignId and code are required' },
                { status: 400 }
            );
        }

        // Validate campaign API key
        const apiKey = request.headers.get('x-campaign-api-key');
        const campaign = await validateCampaignApiKey(apiKey, campaignId, prisma);

        if (!campaign) {
            return NextResponse.json(
                { success: false, error: 'Invalid or missing API key' },
                { status: 401 }
            );
        }

        // Rate limiting - max conversions per code per day
        const rateLimitKey = `conversion:${code}:${new Date().toISOString().split('T')[0]}`;
        if (!rateLimiter.check(rateLimitKey, RATE_LIMITS.CONVERSION_PER_CODE_DAY, 24 * 60 * 60 * 1000)) {
            return NextResponse.json(
                { success: false, error: 'Rate limit exceeded for this code' },
                { status: 429 }
            );
        }

        // Find the creator code
        const creatorCode = await prisma.creatorCode.findFirst({
            where: {
                code: {
                    equals: code.trim().toUpperCase(),
                    mode: 'insensitive'
                },
                campaignId,
                active: true
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true,
                        conversionCommission: true,
                        founderId: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        fullName: true
                    }
                }
            }
        });

        if (!creatorCode) {
            return NextResponse.json(
                { success: false, error: 'Invalid code or campaign' },
                { status: 400 }
            );
        }

        // Find the redemption to link to
        // Try to find by userId or orderId
        let redemption = null;
        if (userId || orderId) {
            redemption = await prisma.redemption.findFirst({
                where: {
                    creatorCodeId: creatorCode.id,
                    ...(userId && { userId }),
                    ...(orderId && { orderId }),
                    convertedToPaid: false // Only unconverted redemptions
                },
                orderBy: {
                    redeemedAt: 'desc' // Most recent redemption
                }
            });
        }

        // If no redemption found but we have userId/orderId, create one
        if (!redemption && (userId || orderId)) {
            redemption = await prisma.redemption.create({
                data: {
                    creatorCodeId: creatorCode.id,
                    campaignId,
                    creatorId: creatorCode.creatorId,
                    platform: creatorCode.platform,
                    userId: userId || null,
                    orderId: orderId || null,
                    convertedToPaid: true,
                    conversionDate: new Date(),
                    amountPaidByUser: amount ? Number(amount) : null,
                    metadata: metadata || null
                }
            });
        } else if (redemption) {
            // Update existing redemption
            redemption = await prisma.redemption.update({
                where: { id: redemption.id },
                data: {
                    convertedToPaid: true,
                    conversionDate: new Date(),
                    amountPaidByUser: amount ? Number(amount) : null,
                    metadata: {
                        ...(redemption.metadata as object || {}),
                        ...(metadata || {}),
                        conversionType
                    }
                }
            });
        } else {
            return NextResponse.json(
                { success: false, error: 'No redemption found for this user/order' },
                { status: 400 }
            );
        }

        // Calculate commission
        let commissionAmount = 0;
        let paymentId = null;

        if (creatorCode.campaign.conversionCommission) {
            commissionAmount = Number(creatorCode.campaign.conversionCommission);

            // Create payment record for creator
            const payment = await prisma.payment.create({
                data: {
                    campaignId,
                    recipientId: creatorCode.creatorId,
                    amount: commissionAmount,
                    type: 'PAYOUT',
                    commissionType: 'CONVERSION_COMMISSION',
                    status: 'PENDING',
                    metadata: {
                        redemptionId: redemption.id,
                        code: creatorCode.code,
                        conversionType,
                        userAmount: amount,
                        currency: currency || 'USD'
                    }
                }
            });

            paymentId = payment.id;
        }

        // Send notification to creator
        await prisma.notification.create({
            data: {
                userId: creatorCode.creatorId,
                type: 'PAYMENT',
                title: 'Conversion Earned! 💰',
                message: `You earned $${commissionAmount.toFixed(2)} from a conversion on campaign "${creatorCode.campaign.name}"`,
                link: `/creator/earnings`,
                metadata: {
                    redemptionId: redemption.id,
                    paymentId,
                    amount: commissionAmount
                }
            }
        });

        // Send notification to founder (optional)
        await prisma.notification.create({
            data: {
                userId: creatorCode.campaign.founderId,
                type: 'SYSTEM',
                title: 'Conversion Tracked',
                message: `${creatorCode.creator.fullName} generated a conversion on "${creatorCode.campaign.name}"`,
                link: `/founder/campaigns/${campaignId}/attribution`
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                redemptionId: redemption.id,
                conversionTracked: true,
                commissionAmount,
                paymentId,
                creator: {
                    id: creatorCode.creatorId,
                    name: creatorCode.creator.fullName
                },
                campaign: {
                    id: campaignId,
                    name: creatorCode.campaign.name
                }
            }
        });

    } catch (error: any) {
        console.error('[CONVERSION_TRACKING] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
