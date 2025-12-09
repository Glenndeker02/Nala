import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/api-middleware';

// GET - List redemptions for a campaign
export const GET = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;
        const { searchParams } = new URL(request.url);

        // Parse query params
        const creatorId = searchParams.get('creatorId');
        const platform = searchParams.get('platform');
        const converted = searchParams.get('converted');
        const flagged = searchParams.get('flagged');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');

        // Verify campaign ownership
        const campaign = await prisma.campaign.findFirst({
            where: {
                id: campaignId,
                founderId: user.userId
            }
        });

        if (!campaign) {
            return NextResponse.json(
                { success: false, error: 'Campaign not found' },
                { status: 404 }
            );
        }

        // Build where clause
        const where: any = { campaignId };
        if (creatorId) where.creatorId = creatorId;
        if (platform) where.platform = platform;
        if (converted === 'true') where.convertedToPaid = true;
        if (converted === 'false') where.convertedToPaid = false;
        if (flagged === 'true') where.flaggedForReview = true;

        // Get total count
        const total = await prisma.redemption.count({ where });

        // Get redemptions with pagination
        const redemptions = await prisma.redemption.findMany({
            where,
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true
                    }
                },
                creatorCode: {
                    select: {
                        code: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        email: true
                    }
                }
            },
            orderBy: { redeemedAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit
        });

        const data = redemptions.map(r => ({
            id: r.id,
            code: r.creatorCode.code,
            platform: r.platform,
            redeemedAt: r.redeemedAt.toISOString(),
            creator: {
                id: r.creator.id,
                name: r.creator.fullName
            },
            user: r.user ? {
                id: r.user.id,
                email: r.user.email
            } : null,
            orderId: r.orderId,
            amountPaid: r.amountPaidByUser ? Number(r.amountPaidByUser) : null,
            discountApplied: r.discountApplied ? Number(r.discountApplied) : null,
            convertedToPaid: r.convertedToPaid,
            conversionDate: r.conversionDate?.toISOString() || null,
            flaggedForReview: r.flaggedForReview,
            reviewNotes: r.reviewNotes,
            deviceInfo: r.deviceInfo
        }));

        return NextResponse.json({
            success: true,
            data: {
                redemptions: data,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error: any) {
        console.error('Error fetching redemptions:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
