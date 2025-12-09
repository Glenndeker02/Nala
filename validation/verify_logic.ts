
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// Inlined PayoutService logic for verification
class PayoutService {
    static calculateBaseFeeSplit(baseFee: number) {
        const platformFee = baseFee * 0.10;
        const creatorAmount = baseFee - platformFee;
        return { creatorAmount, platformFee, founderCharge: baseFee };
    }

    static calculateViewPayout(views: number) {
        const units = views / 1000;
        const founderRate = 3.00;
        const creatorRate = 2.00;
        const platformRate = 1.00; // Derived (3 - 2)

        const founderCharge = units * founderRate;
        const creatorAmount = units * creatorRate;
        const platformFee = units * platformRate;

        return {
            creatorAmount: Number(creatorAmount.toFixed(2)),
            platformFee: Number(platformFee.toFixed(2)),
            founderCharge: Number(founderCharge.toFixed(2))
        };
    }

    static calculateSubscriptionBonus(planPrice: number, creatorSharePercent: number = 2.5) {
        const totalPoolPercent = 5.0;
        const creatorAmount = planPrice * (creatorSharePercent / 100);
        const platformFee = (planPrice * (totalPoolPercent / 100)) - creatorAmount;
        const founderCharge = planPrice * (totalPoolPercent / 100);

        return {
            creatorAmount: Number(creatorAmount.toFixed(2)),
            platformFee: Number(platformFee.toFixed(2)),
            founderCharge: Number(founderCharge.toFixed(2))
        };
    }
}

async function main() {
    console.log('Verifying logic against seeded data...');

    // 1. Verify Redemption Processing Logic
    // Find a verified PAID redemption that doesn't have a subscription event yet.
    const redemption = await prisma.codeRedemption.findFirst({
        where: {
            eventType: 'PAID',
            verified: true,
            subscriptionEvents: { none: {} }
        },
        include: { campaign: true, code: true }
    });

    if (redemption) {
        console.log(`Found redemption to process: ${redemption.id}`);
        const eventValue = redemption.eventValue as any;
        const planPrice = Number(eventValue?.amount || 0);
        const creatorShare = redemption.campaign.creatorSubscriptionShare?.toNumber() || 2.5;

        console.log(`Plan Price: ${planPrice}, Creator Share: ${creatorShare}%`);
        const calculation = PayoutService.calculateSubscriptionBonus(planPrice, creatorShare);
        console.log('Calculation result:', calculation);

        if (calculation.creatorAmount > 0) {
            const subEvent = await prisma.subscriptionEvent.create({
                data: {
                    campaignId: redemption.campaignId,
                    creatorId: redemption.creatorId,
                    redemptionId: redemption.id,
                    externalCustomerId: redemption.externalUserId || 'unknown',
                    planPrice: new Decimal(planPrice),
                    creatorBonus: new Decimal(calculation.creatorAmount),
                    platformFee: new Decimal(calculation.platformFee),
                    paidAt: new Date(),
                } as any
            });
            console.log(`Created SubscriptionEvent: ${subEvent.id}`);

            const payout = await prisma.payout.create({
                data: {
                    assignmentId: redemption.code.assignmentId,
                    creatorId: redemption.creatorId,
                    campaignId: redemption.campaignId,
                    type: 'SUBSCRIPTION_BONUS',
                    amount: new Decimal(calculation.creatorAmount),
                    status: 'PENDING',
                    reference: `SUB-${subEvent.id}`
                } as any
            });
            console.log(`Created Payout: ${payout.id}`);
        }
    } else {
        console.log('No eligible redemption found (maybe already processed or seed failed).');
    }

    // 2. Verify View Payment Logic
    const video = await prisma.video.findFirst({
        where: { currentViewCount: { gt: 0 } },
        include: { campaign: true }
    });

    if (video) {
        console.log(`Found video with views: ${video.id} (${video.currentViewCount})`);
        const calculation = PayoutService.calculateViewPayout(video.currentViewCount || 0);
        console.log('View Calculation:', calculation);

        // Upsert ViewPayment
        const payment = await prisma.viewPayment.create({
            data: {
                campaignId: video.campaignId,
                creatorId: video.creatorId,
                periodStart: new Date(),
                periodEnd: new Date(), // End of today
                viewsCount: video.currentViewCount || 0,
                amountDueCreator: new Decimal(calculation.creatorAmount),
                amountChargedFounder: new Decimal(calculation.founderCharge),
                status: 'PENDING'
            } as any
        });
        console.log(`Created ViewPayment: ${payment.id}`);
    } else {
        console.log('No video with views found.');
    }

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
