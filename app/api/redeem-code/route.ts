import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// POST - Redeem a creator code (public endpoint - called by founder's app)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, userId, orderId, amount, metadata } = body;

        if (!code) {
            return NextResponse.json(
                { success: false, error: 'Code is required' },
                { status: 400 }
            );
        }

        // Normalize code (uppercase, trim whitespace)
        const normalizedCode = code.trim().toUpperCase();

        // Find the code
        const creatorCode = await prisma.creatorCode.findFirst({
            where: {
                code: {
                    equals: normalizedCode,
                    mode: 'insensitive'
                },
                active: true
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        codeDiscountType: true,
                        codeDiscountValue: true,
                        attributionWindowDays: true
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
                { success: false, error: 'Invalid or inactive code' },
                { status: 400 }
            );
        }

        // Check expiration
        if (creatorCode.expirationDate && creatorCode.expirationDate < new Date()) {
            return NextResponse.json(
                { success: false, error: 'Code has expired' },
                { status: 400 }
            );
        }

        // Check if campaign is still active
        if (creatorCode.campaign.status !== 'ACTIVE' && creatorCode.campaign.status !== 'COMPLETED') {
            return NextResponse.json(
                { success: false, error: 'Campaign is not active' },
                { status: 400 }
            );
        }

        // Get device info and hash IP for fraud detection
        const forwardedFor = request.headers.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
        const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Rate limiting check (basic - per IP)
        const recentRedemptions = await prisma.redemption.count({
            where: {
                ipHash,
                redeemedAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
            }
        });

        const flagForReview = recentRedemptions >= 10; // Flag if more than 10 redemptions from same IP

        // Calculate discount if applicable
        let discountAmount = 0;
        let discountDescription = '';

        if (creatorCode.campaign.codeDiscountType && creatorCode.campaign.codeDiscountValue) {
            const discountValue = Number(creatorCode.campaign.codeDiscountValue);
            switch (creatorCode.campaign.codeDiscountType) {
                case 'PERCENTAGE':
                    discountAmount = amount ? (Number(amount) * discountValue / 100) : 0;
                    discountDescription = `${discountValue}% off`;
                    break;
                case 'FIXED_AMOUNT':
                    discountAmount = discountValue;
                    discountDescription = `$${discountValue} off`;
                    break;
                case 'FREE_TRIAL':
                    discountDescription = `${discountValue} day free trial`;
                    break;
                case 'FREE_MONTH':
                    discountDescription = `${discountValue} month(s) free`;
                    break;
            }
        }

        // Create redemption record
        const redemption = await prisma.redemption.create({
            data: {
                creatorCodeId: creatorCode.id,
                campaignId: creatorCode.campaign.id,
                creatorId: creatorCode.creatorId,
                platform: creatorCode.platform,
                userId: userId || null,
                orderId: orderId || null,
                amountPaidByUser: amount ? Number(amount) : null,
                discountApplied: discountAmount || null,
                deviceInfo: userAgent.substring(0, 255),
                ipHash,
                metadata: metadata || null,
                flaggedForReview: flagForReview,
                convertedToPaid: false
            }
        });

        // TODO: Send notification to creator about redemption

        return NextResponse.json({
            success: true,
            data: {
                redemptionId: redemption.id,
                valid: true,
                discount: {
                    type: creatorCode.campaign.codeDiscountType,
                    value: Number(creatorCode.campaign.codeDiscountValue) || 0,
                    amount: discountAmount,
                    description: discountDescription
                },
                attribution: {
                    creatorName: creatorCode.creator.fullName,
                    campaignName: creatorCode.campaign.name
                },
                message: `Code from ${creatorCode.creator.fullName} applied successfully!`
            }
        });

    } catch (error: any) {
        console.error('Error redeeming code:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
