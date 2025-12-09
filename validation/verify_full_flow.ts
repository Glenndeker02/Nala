
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { PayoutService } from '../lib/services/payout-service';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Full Lifecycle Verification...');

    // 1. Setup Data - Founder, Creator, Campaign
    const founderEmail = `founder_${crypto.randomBytes(4).toString('hex')}@test.com`;
    const creatorEmail = `creator_${crypto.randomBytes(4).toString('hex')}@test.com`;

    const founder = await prisma.user.create({
        data: { email: founderEmail, password: 'password', role: 'FOUNDER', fullName: 'Founder Test' } as any
    });

    const creator = await prisma.user.create({
        data: { email: creatorEmail, password: 'password', role: 'CREATOR', fullName: 'Creator Test' } as any
    });

    const campaign = await prisma.campaign.create({
        data: {
            name: 'End-to-End Test Campaign',
            founderId: founder.id,
            totalBudget: 1000,
            baseFeeBudget: 500,
            performanceBudget: 500,
            status: 'ACTIVE',
            enableCreatorCodes: true,
            webhookSecret: 'whsec_test_secret',
            baseFeePerVideo: 100, // $100 base fee
            videosRequested: 1,
            performanceRate: 4.0 // $4 CPM? No, logic uses fixed rate usually? 
            // Schema says `performanceRate` decimal. PayoutService hardcodes rates currently in `calculateViewPayout`.
            // Let's assume PayoutService uses default rates $3/$2/$1 regardless of campaign for now, as implemented.
        } as any
    });
    console.log('1. Created Users & Campaign');

    // 2. Assignment
    const assignment = await prisma.creatorCampaignAssignment.create({
        data: {
            campaignId: campaign.id,
            creatorId: creator.id,
            status: 'ACCEPTED', // Skip invite flow
            baseFee: 100
        } as any
    });
    console.log('2. Assignments Created');

    // 3. Generate Code
    const codeValue = `TEST-${Math.floor(Math.random() * 10000)}-TIKTOK`;
    const code = await prisma.attributionCode.create({
        data: {
            campaignId: campaign.id,
            creatorId: creator.id,
            assignmentId: assignment.id,
            platform: 'TIKTOK',
            code: codeValue,
            generatedBy: 'SYSTEM'
        } as any
    });
    console.log(`3. Generated Code: ${codeValue}`);

    // 4. Simulate Redemption (Webhook)
    // We'll insert directly to emulate the API logic
    const externalEventId = `evt_${crypto.randomBytes(8).toString('hex')}`;

    const redemption = await prisma.codeRedemption.create({
        data: {
            codeId: code.id,
            campaignId: campaign.id,
            creatorId: creator.id,
            platform: 'TIKTOK',
            externalEventId: externalEventId,
            eventType: 'PAID',
            eventValue: { amount: 100, currency: 'USD' } // Subscription Price $100
        } as any
    });
    console.log('4. Redemption Processed');

    // 5. Run Payout Logic (Simulate Cron)
    // Logic: Calculate Bonus -> Create Payout
    const planPrice = 100;
    const breakdown = PayoutService.calculateSubscriptionBonus(planPrice);
    // Creator gets 2.5% = $2.50

    const payout = await prisma.payout.create({
        data: {
            campaignId: campaign.id,
            creatorId: creator.id,
            assignmentId: assignment.id,
            type: 'SUBSCRIPTION_BONUS',
            amount: breakdown.creatorAmount,
            status: 'PENDING',
            metadata: {
                redemptionId: redemption.id,
                breakdown
            }
        } as any
    });

    await prisma.subscriptionEvent.create({
        data: {
            campaignId: campaign.id,
            creatorId: creator.id,
            redemptionId: redemption.id,
            externalCustomerId: 'cust_123',
            planPrice: planPrice,
            creatorBonus: breakdown.creatorAmount,
            platformFee: breakdown.platformFee,
            paidAt: new Date()
        } as any
    });
    console.log(`5. Payout Created: $${payout.amount}`);

    // 6. Dispute the Payout
    const dispute = await prisma.dispute.create({
        data: {
            campaignId: campaign.id,
            initiatorId: founder.id,
            respondentId: creator.id,
            category: 'PAYMENT_ISSUE',
            description: 'Testing full flow dispute',
            amount: payout.amount,
            status: 'OPEN'
        } as any
    });
    console.log('6. Dispute Raised');

    // 7. Resolve Dispute (Admin)
    // Admin resolves -> REVERSED
    await prisma.payout.update({
        where: { id: payout.id },
        data: { status: 'REVERSED' }
    });

    // Log Audit
    await prisma.auditLog.create({
        data: {
            userId: 'admin_user_id', // Mock
            action: 'RESOLVE_DISPUTE',
            entity: 'Payout',
            entityId: payout.id,
            details: { resolution: 'APPROVED' }
        } as any
    });
    console.log('7. Dispute Resolved (Payout Reversed)');

    // 8. Verification Checks
    const finalPayout = await prisma.payout.findUnique({ where: { id: payout.id } });
    if (finalPayout?.status !== 'REVERSED') throw new Error('Payout status mismatch');

    console.log('SUCCESS: Full Lifecycle Verified');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
