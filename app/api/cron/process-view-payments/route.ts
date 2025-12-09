import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { ApiResponse } from '@/lib/api-middleware';
import { PayoutService } from '@/lib/services/payout-service';
import { Decimal } from '@prisma/client/runtime/library';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return ApiResponse.error('Unauthorized', 401);
        }

        console.log('Starting view payment processing...');

        // 1. Get all Active Campaigns
        const campaigns = await db.campaign.findMany({
            where: { status: 'ACTIVE' },
            include: { assignments: { where: { status: 'ACCEPTED' } } }
        });

        let processed = 0;

        const currentPeriodStart = new Date();
        currentPeriodStart.setDate(1); // 1st of month
        currentPeriodStart.setHours(0, 0, 0, 0);

        const nextPeriodStart = new Date(currentPeriodStart);
        nextPeriodStart.setMonth(nextPeriodStart.getMonth() + 1); // 1st of next month

        for (const campaign of campaigns) {
            // For each creator in campaign
            for (const assignment of campaign.assignments) {
                // Aggregate Total Views for this creator's videos in this campaign
                const videoStats = await db.video.aggregate({
                    where: {
                        campaignId: campaign.id,
                        creatorId: assignment.creatorId,
                        status: 'POSTED'
                    },
                    _sum: { currentViewCount: true }
                });

                const totalViews = videoStats._sum.currentViewCount || 0;

                if (totalViews === 0) continue;

                // Calculate Payout
                // We need to know previous period's paid views to calculate Delta?
                // Or does `ViewPayment` track Cumulative?
                // Let's assume we pay for Total Views minus "Previously Paid Views".
                // But where is "Previously Paid" stored?
                // `ViewPayment` has `viewsCount`.
                // Let's Sum `viewsCount` from ALL `PAID` ViewPayments for this creator/campaign.

                const previousPayments = await db.viewPayment.aggregate({
                    where: {
                        campaignId: campaign.id,
                        creatorId: assignment.creatorId,
                        status: 'PAID'
                    },
                    _sum: { viewsCount: true }
                });

                const paidViews = previousPayments._sum.viewsCount || 0;
                const billableViews = totalViews - paidViews;

                if (billableViews <= 0) continue;

                const calculation = PayoutService.calculateViewPayout(billableViews);

                // Upsert ViewPayment for CURRENT period (Pending)
                // If we run this daily, we update the existing Pending record.

                const existingPending = await db.viewPayment.findFirst({
                    where: {
                        campaignId: campaign.id,
                        creatorId: assignment.creatorId,
                        status: 'PENDING', // or just check date range
                        periodStart: currentPeriodStart
                    }
                });

                if (existingPending) {
                    await db.viewPayment.update({
                        where: { id: existingPending.id },
                        data: {
                            viewsCount: billableViews,
                            amountDueCreator: new Decimal(calculation.creatorAmount),
                            amountChargedFounder: new Decimal(calculation.founderCharge)
                        }
                    });
                } else {
                    await db.viewPayment.create({
                        data: {
                            campaignId: campaign.id,
                            creatorId: assignment.creatorId,
                            periodStart: currentPeriodStart,
                            periodEnd: nextPeriodStart,
                            viewsCount: billableViews,
                            amountDueCreator: new Decimal(calculation.creatorAmount),
                            amountChargedFounder: new Decimal(calculation.founderCharge),
                            status: 'PENDING'
                        }
                    });
                }
                processed++;
            }
        }

        return ApiResponse.success({
            message: "View payments processed",
            processed
        });

    } catch (error) {
        console.error('Error in process-view-payments:', error);
        return ApiResponse.error("Internal Server Error", 500);
    }
}
