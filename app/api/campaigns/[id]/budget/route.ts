import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, JWTPayload } from '@/lib/api-middleware';

export const GET = requireRole(['FOUNDER'], async (request: NextRequest, user: JWTPayload, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;

        // Verify campaign belongs to founder
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            select: {
                id: true,
                founderId: true,
                totalBudget: true,
                baseFeePerVideo: true,
                videosRequested: true,
                performanceRate: true,
                baseFeeBudget: true,
                performanceBudget: true
            }
        });

        if (!campaign) {
            return NextResponse.json(
                { success: false, error: 'Campaign not found' },
                { status: 404 }
            );
        }

        if (campaign.founderId !== user.userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Calculate budget breakdown
        const totalBudget = Number(campaign.totalBudget);
        const baseFeePerVideo = Number(campaign.baseFeePerVideo);
        const fixedBudget = Number(campaign.baseFeeBudget) || (baseFeePerVideo * campaign.videosRequested);
        const variableBudget = Number(campaign.performanceBudget) || (totalBudget - fixedBudget);

        // Get all videos with assignments and payments
        const videos = await prisma.video.findMany({
            where: { campaignId },
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true
                    }
                },
                payments: {
                    where: {
                        type: { in: ['PERFORMANCE_BONUS', 'BASE_FEE'] }
                    },
                    select: {
                        type: true,
                        amount: true,
                        status: true
                    }
                }
            }
        });

        // Calculate spent variable budget (performance bonuses)
        let spentVariable = 0;
        let creatorPayoutTotal = 0;

        const breakdownPerVideo = videos.map(video => {
            const baseFee = Number(video.baseFeeAmount) || baseFeePerVideo;
            let bonusAccrued = 0;

            // Calculate bonus from payments
            const bonusPayments = video.payments.filter(p => p.type === 'PERFORMANCE_BONUS' && p.status === 'COMPLETED');
            bonusAccrued = bonusPayments.reduce((sum, p) => sum + Number(p.amount), 0);

            // If no bonus payment yet but video is posted, calculate potential bonus
            if (bonusPayments.length === 0 && video.status === 'POSTED' && video.currentViewCount > 0) {
                const performanceRate = Number(campaign.performanceRate);
                bonusAccrued = (video.currentViewCount / 1000) * performanceRate;
            }

            spentVariable += bonusAccrued;

            // Calculate total payout for this video
            const baseFeePayments = video.payments.filter(p => p.type === 'BASE_FEE' && p.status === 'COMPLETED');
            const baseFeePaid = baseFeePayments.reduce((sum, p) => sum + Number(p.amount), 0);
            creatorPayoutTotal += baseFeePaid + bonusAccrued;

            return {
                assignmentId: video.id, // Using video ID as assignment ID
                creatorId: video.creator?.id || null,
                creatorName: video.creator?.fullName || 'Unassigned',
                baseFee: baseFee,
                bonusAccrued: bonusAccrued,
                views: video.currentViewCount,
                videoStatus: video.status
            };
        });

        const remainingVariable = variableBudget - spentVariable;
        const refundProjected = remainingVariable > 0 ? remainingVariable : 0;

        return NextResponse.json({
            success: true,
            data: {
                campaignId,
                totalBudget,
                fixedBudget,
                variableBudget,
                spentVariable,
                remainingVariable,
                creatorPayoutTotal,
                refundProjected,
                breakdownPerVideo
            }
        });

    } catch (error: any) {
        console.error('Error fetching budget breakdown:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
