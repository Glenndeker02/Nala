import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/api-middleware';

// GET - Creator's view of their codes and attribution stats
export const GET = requireRole(['CREATOR'], async (request: NextRequest, user) => {
    try {
        const { searchParams } = new URL(request.url);
        const campaignId = searchParams.get('campaignId');

        // Build where clause
        const where: any = { creatorId: user.userId };
        if (campaignId) where.campaignId = campaignId;

        // Get creator's codes with redemption stats
        const codes = await prisma.creatorCode.findMany({
            where,
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        conversionCommission: true
                    }
                },
                _count: {
                    select: {
                        redemptions: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Get redemptions for conversion count
        const redemptions = await prisma.redemption.findMany({
            where: {
                creatorId: user.userId,
                ...(campaignId && { campaignId })
            },
            select: {
                id: true,
                convertedToPaid: true,
                amountPaidByUser: true,
                campaignId: true,
                creatorCodeId: true
            }
        });

        // Calculate totals
        const totalRedemptions = redemptions.length;
        const totalConversions = redemptions.filter(r => r.convertedToPaid).length;
        const attributedRevenue = redemptions
            .filter(r => r.convertedToPaid)
            .reduce((sum, r) => sum + (Number(r.amountPaidByUser) || 0), 0);

        // Get commission payments
        const commissionPayments = await prisma.payment.findMany({
            where: {
                recipientId: user.userId,
                commissionType: 'CONVERSION_COMMISSION',
                ...(campaignId && { campaignId })
            },
            select: {
                amount: true,
                status: true
            }
        });

        const totalCommissionEarned = commissionPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const pendingCommission = commissionPayments
            .filter(p => p.status === 'PENDING')
            .reduce((sum, p) => sum + Number(p.amount), 0);
        const paidCommission = commissionPayments
            .filter(p => p.status === 'COMPLETED')
            .reduce((sum, p) => sum + Number(p.amount), 0);

        // Transform codes with per-code stats
        const codesData = codes.map(code => {
            const codeRedemptions = redemptions.filter(r => r.creatorCodeId === code.id);
            const codeConversions = codeRedemptions.filter(r => r.convertedToPaid).length;

            return {
                id: code.id,
                code: code.code,
                platform: code.platform,
                active: code.active,
                notes: code.notes,
                expirationDate: code.expirationDate?.toISOString() || null,
                campaign: {
                    id: code.campaign.id,
                    name: code.campaign.name,
                    status: code.campaign.status,
                    commissionPerConversion: code.campaign.conversionCommission ? Number(code.campaign.conversionCommission) : null
                },
                stats: {
                    redemptions: code._count.redemptions,
                    conversions: codeConversions
                }
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                codes: codesData,
                summary: {
                    totalCodes: codes.length,
                    activeCodes: codes.filter(c => c.active).length,
                    totalRedemptions,
                    totalConversions,
                    attributedRevenue: attributedRevenue.toFixed(2),
                    earnings: {
                        total: totalCommissionEarned.toFixed(2),
                        pending: pendingCommission.toFixed(2),
                        paid: paidCommission.toFixed(2)
                    }
                }
            }
        });

    } catch (error: any) {
        console.error('Error fetching creator attribution:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
