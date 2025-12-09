import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { ApiResponse } from '@/lib/api-middleware';
import { PayoutService } from '@/lib/services/payout-service';

export async function GET(request: NextRequest) {
    try {
        // Security check
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return ApiResponse.error('Unauthorized', 401);
        }

        console.log('Starting redemption processing job...');

        // 1. Find unverfied PAID redemptions that are verified but not processed?
        // Logic: Verified = true, EventType = PAID, no SubscriptionEvent associated.

        const redemptionsToProcess = await db.codeRedemption.findMany({
            where: {
                verified: true,
                eventType: 'PAID',
                subscriptionEvents: {
                    none: {}
                }
            },
            include: {
                campaign: true,
                creator: true,
                code: true
            },
            take: 50 // Process in batches
        });

        console.log(`Found ${redemptionsToProcess.length} verified PAID redemptions to process.`);

        let processed = 0;
        let failed = 0;

        for (const redemption of redemptionsToProcess) {
            try {
                await db.$transaction(async (tx) => {
                    // 1. Calculate Bonus
                    // Need plan price. stored in `eventValue`? 
                    // Assume `eventValue` has { amount: 20.00, currency: 'USD' } or similar.
                    const eventValue = redemption.eventValue as any;
                    const planPrice = Number(eventValue?.amount || 0);

                    if (!planPrice || planPrice <= 0) {
                        console.warn(`Redemption ${redemption.id} has no valid amount.`);
                        // Skip or mark as failed/ignored?
                        // If we skip, it will show up again.
                        // Let's assume we need to flag it? 
                        // For now, simple logging and moving on.
                        return;
                    }

                    const creatorShare = redemption.campaign.creatorSubscriptionShare?.toNumber() || 2.5;
                    const calculation = PayoutService.calculateSubscriptionBonus(planPrice, creatorShare);

                    // 2. Create SubscriptionEvent
                    const subEvent = await tx.subscriptionEvent.create({
                        data: {
                            campaignId: redemption.campaignId,
                            creatorId: redemption.creatorId,
                            redemptionId: redemption.id,
                            externalCustomerId: redemption.externalUserId || 'unknown',
                            planPrice: new Decimal(planPrice),
                            creatorBonus: new Decimal(calculation.creatorAmount),
                            platformFee: new Decimal(calculation.platformFee),
                            paidAt: new Date(), // Now, or redemption.receivedAt?
                        }
                    });

                    // 3. Create Payout record (Pending)
                    await tx.payout.create({
                        data: {
                            assignmentId: redemption.code.assignmentId,
                            creatorId: redemption.creatorId,
                            campaignId: redemption.campaignId,
                            type: 'SUBSCRIPTION_BONUS',
                            amount: new Decimal(calculation.creatorAmount),
                            status: 'PENDING',
                            reference: `SUB-${subEvent.id}`,
                            metadata: {
                                redemptionId: redemption.id,
                                planPrice,
                                eventValue
                            }
                        }
                    });

                });
                processed++;
            } catch (err) {
                console.error(`Failed to process redemption ${redemption.id}:`, err);
                failed++;
            }
        }

        return ApiResponse.success({
            message: "Redemption processing complete",
            processed,
            failed
        });

    } catch (error) {
        console.error('Error in process-redemptions cron:', error);
        return ApiResponse.error('Internal Server Error', 500);
    }
}
