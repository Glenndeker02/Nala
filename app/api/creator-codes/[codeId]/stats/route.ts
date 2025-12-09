import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/api-middleware';

// GET - Fetch stats for a specific creator code
export const GET = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { codeId: string } }) => {
    try {
        const codeId = params.codeId;

        // Fetch code with creator and campaign info
        const code = await prisma.creatorCode.findUnique({
            where: { id: codeId },
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                },
                campaign: {
                    select: {
                        id: true,
                        founderId: true,
                        conversionCommission: true
                    }
                },
                redemptions: {
                    select: {
                        id: true,
                        redeemedAt: true,
                        userEmail: true,
                        convertedToPaid: true,
                        amountPaidByUser: true
                    },
                    orderBy: {
                        redeemedAt: 'desc'
                    }
                }
            }
        });

        if (!code) {
            return NextResponse.json(
                { success: false, error: 'Code not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (code.campaign.founderId !== user.userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Calculate stats
        const totalRedemptions = code.redemptions.length;
        const totalConversions = code.redemptions.filter(r => r.convertedToPaid).length;
        const conversionRate = totalRedemptions > 0 ? (totalConversions / totalRedemptions) * 100 : 0;
        const totalRevenue = code.redemptions
            .filter(r => r.convertedToPaid)
            .reduce((sum, r) => sum + (Number(r.amountPaidByUser) || 0), 0);
        const commissionOwed = totalConversions * (Number(code.campaign.conversionCommission) || 0);

        return NextResponse.json({
            success: true,
            data: {
                code: {
                    id: code.id,
                    code: code.code,
                    platform: code.platform,
                    active: code.active,
                    createdAt: code.createdAt.toISOString(),
                    creator: {
                        id: code.creator.id,
                        name: code.creator.fullName,
                        email: code.creator.email
                    }
                },
                redemptions: code.redemptions.map(r => ({
                    id: r.id,
                    redeemedAt: r.redeemedAt.toISOString(),
                    userEmail: r.userEmail,
                    convertedToPaid: r.convertedToPaid,
                    amountPaidByUser: r.amountPaidByUser ? Number(r.amountPaidByUser) : null
                })),
                stats: {
                    totalRedemptions,
                    totalConversions,
                    conversionRate,
                    totalRevenue,
                    commissionOwed
                }
            }
        });

    } catch (error: any) {
        console.error('Error fetching code stats:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
