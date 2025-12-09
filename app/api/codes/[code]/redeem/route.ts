import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Record a code redemption (External/QA endpoint - no auth required)
export async function POST(
    request: NextRequest,
    { params }: { params: { code: string } }
) {
    try {
        const codeString = params.code.toUpperCase();
        const body = await request.json();
        const {
            user_identifier,
            conversion_type,
            amount,
            currency = 'USD',
            platform,
            order_id,
            metadata
        } = body;

        // Find the creator code
        const creatorCode = await prisma.creatorCode.findUnique({
            where: { code: codeString },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        conversionCommission: true,
                        attributionWindowDays: true,
                        enableCreatorCodes: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                }
            }
        });

        if (!creatorCode) {
            return NextResponse.json(
                { success: false, error: 'Invalid code' },
                { status: 404 }
            );
        }

        // Check if code is active
        if (!creatorCode.active) {
            return NextResponse.json(
                { success: false, error: 'Code is no longer active' },
                { status: 400 }
            );
        }

        // Check if code is expired
        if (creatorCode.expirationDate && new Date(creatorCode.expirationDate) < new Date()) {
            return NextResponse.json(
                { success: false, error: 'Code has expired' },
                { status: 400 }
            );
        }

        // Check if campaign has creator codes enabled
        if (!creatorCode.campaign.enableCreatorCodes) {
            return NextResponse.json(
                { success: false, error: 'Creator codes are not enabled for this campaign' },
                { status: 400 }
            );
        }

        // Check attribution window (if code was created more than X days ago, reject)
        const attributionWindowDays = creatorCode.campaign.attributionWindowDays || 30;
        const codeAge = (Date.now() - new Date(creatorCode.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (codeAge > attributionWindowDays) {
            return NextResponse.json(
                { success: false, error: 'Code is outside the attribution window' },
                { status: 400 }
            );
        }

        // Determine if this is a paid conversion
        const isPaidConversion = conversion_type === 'PAID_SUBSCRIPTION' ||
            conversion_type === 'PAID' ||
            conversion_type === 'PURCHASE';

        // Create the redemption record
        const redemption = await prisma.redemption.create({
            data: {
                creatorCodeId: creatorCode.id,
                campaignId: creatorCode.campaign.id,
                creatorId: creatorCode.creatorId,
                platform: platform || creatorCode.platform,
                orderId: order_id,
                convertedToPaid: isPaidConversion,
                conversionDate: isPaidConversion ? new Date() : null,
                amountPaidByUser: amount ? parseFloat(amount) : null,
                variantId: creatorCode.variantId,
                metadata: {
                    user_identifier,
                    conversion_type,
                    currency,
                    ...metadata
                }
            }
        });

        // If paid conversion and campaign has conversion commission, create pending payment
        if (isPaidConversion && creatorCode.campaign.conversionCommission) {
            const commissionAmount = Number(creatorCode.campaign.conversionCommission);

            await prisma.payment.create({
                data: {
                    campaignId: creatorCode.campaign.id,
                    recipientId: creatorCode.creatorId,
                    amount: commissionAmount,
                    type: 'CREATOR_PAYMENT',
                    commissionType: 'CONVERSION_COMMISSION',
                    status: 'PENDING',
                    description: `Conversion bonus for code ${codeString}`,
                    redemptionId: redemption.id,
                    metadata: {
                        code: codeString,
                        orderId: order_id,
                        userAmount: amount
                    }
                }
            });

            // TODO: Create notification for creator about pending conversion bonus
        }

        // TODO: Create notification for founder about new redemption

        return NextResponse.json({
            success: true,
            data: {
                redemptionId: redemption.id,
                code: codeString,
                creatorId: creatorCode.creatorId,
                creatorName: creatorCode.creator.fullName,
                campaignId: creatorCode.campaign.id,
                campaignName: creatorCode.campaign.name,
                isPaidConversion,
                commissionPending: isPaidConversion && creatorCode.campaign.conversionCommission
                    ? Number(creatorCode.campaign.conversionCommission)
                    : null
            }
        });

    } catch (error: any) {
        console.error('Error processing redemption:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET - Check code validity and info (for frontend integration)
export async function GET(
    request: NextRequest,
    { params }: { params: { code: string } }
) {
    try {
        const codeString = params.code.toUpperCase();

        const creatorCode = await prisma.creatorCode.findUnique({
            where: { code: codeString },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true,
                        codeDiscountType: true,
                        codeDiscountValue: true,
                        enableCreatorCodes: true
                    }
                },
                _count: {
                    select: { redemptions: true }
                }
            }
        });

        if (!creatorCode) {
            return NextResponse.json(
                { success: false, error: 'Invalid code' },
                { status: 404 }
            );
        }

        if (!creatorCode.active) {
            return NextResponse.json(
                { success: false, error: 'Code is no longer active' },
                { status: 400 }
            );
        }

        if (creatorCode.expirationDate && new Date(creatorCode.expirationDate) < new Date()) {
            return NextResponse.json(
                { success: false, error: 'Code has expired' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                code: codeString,
                valid: true,
                campaign: creatorCode.campaign.name,
                discount: creatorCode.campaign.codeDiscountValue
                    ? {
                        type: creatorCode.campaign.codeDiscountType,
                        value: Number(creatorCode.campaign.codeDiscountValue)
                    }
                    : null
            }
        });

    } catch (error: any) {
        console.error('Error validating code:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
