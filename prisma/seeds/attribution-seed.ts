/**
 * Attribution Seed Data
 * 
 * Seeds the database with test data for creator attribution including:
 * - Creator codes for test users
 * - Redemptions with various states
 * - Conversions
 * 
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seeds/attribution-seed.ts
 */

import { PrismaClient, Platform, DiscountType, CommissionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding attribution data...');

    // Find test users
    const founder = await prisma.user.findFirst({
        where: { email: 'mike21@yopmail.com' }
    });

    const creator = await prisma.user.findFirst({
        where: { email: 'mary57@yopmail.com' }
    });

    if (!founder || !creator) {
        console.error('❌ Test users not found. Please seed users first.');
        return;
    }

    // Find or create a campaign with attribution enabled
    let campaign = await prisma.campaign.findFirst({
        where: {
            founderId: founder.id,
            enableCreatorCodes: true
        }
    });

    if (!campaign) {
        // Enable attribution on first active campaign
        campaign = await prisma.campaign.findFirst({
            where: {
                founderId: founder.id,
                status: 'ACTIVE'
            }
        });

        if (campaign) {
            campaign = await prisma.campaign.update({
                where: { id: campaign.id },
                data: {
                    enableCreatorCodes: true,
                    autoGenerateCodes: true,
                    conversionCommission: 5.00,
                    codeDiscountType: 'PERCENTAGE',
                    codeDiscountValue: 20,
                    attributionWindowDays: 30
                }
            });
            console.log(`✓ Enabled attribution on campaign: ${campaign.name}`);
        }
    }

    if (!campaign) {
        console.error('❌ No active campaign found. Please create a campaign first.');
        return;
    }

    // Create creator codes
    const codes = [
        { platform: 'TIKTOK' as Platform, code: 'MARY01-TT', notes: 'TikTok discount code' },
        { platform: 'INSTAGRAM' as Platform, code: 'MARY01-IG', notes: 'Instagram discount code' }
    ];

    for (const codeData of codes) {
        const existing = await prisma.creatorCode.findUnique({
            where: { code: codeData.code }
        });

        if (!existing) {
            await prisma.creatorCode.create({
                data: {
                    campaignId: campaign.id,
                    creatorId: creator.id,
                    platform: codeData.platform,
                    code: codeData.code,
                    notes: codeData.notes,
                    createdBy: founder.id,
                    active: true
                }
            });
            console.log(`✓ Created code: ${codeData.code}`);
        } else {
            console.log(`⏭ Code already exists: ${codeData.code}`);
        }
    }

    // Get the created codes
    const creatorCodes = await prisma.creatorCode.findMany({
        where: {
            campaignId: campaign.id,
            creatorId: creator.id
        }
    });

    // Create sample redemptions
    const redemptionData = [
        { converted: true, amount: 29.99, orderId: 'ORD-001' },
        { converted: true, amount: 49.99, orderId: 'ORD-002' },
        { converted: false, amount: null, orderId: null },
        { converted: true, amount: 19.99, orderId: 'ORD-003' },
        { converted: false, amount: null, orderId: null },
        { converted: false, amount: null, orderId: null },
        { converted: true, amount: 99.99, orderId: 'ORD-004' },
        { converted: false, amount: null, orderId: null },
    ];

    let redemptionCount = 0;
    for (let i = 0; i < redemptionData.length; i++) {
        const data = redemptionData[i];
        const code = creatorCodes[i % creatorCodes.length];

        // Check if redemption already exists by orderId
        if (data.orderId) {
            const existing = await prisma.redemption.findFirst({
                where: { orderId: data.orderId }
            });
            if (existing) continue;
        }

        await prisma.redemption.create({
            data: {
                creatorCodeId: code.id,
                campaignId: campaign.id,
                creatorId: creator.id,
                platform: code.platform,
                orderId: data.orderId,
                convertedToPaid: data.converted,
                conversionDate: data.converted ? new Date() : null,
                amountPaidByUser: data.amount,
                discountApplied: data.amount ? data.amount * 0.2 : null,
                deviceInfo: 'Mobile Safari iOS 17',
                ipHash: 'abc123def456',
                redeemedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random within last 7 days
            }
        });
        redemptionCount++;
    }
    console.log(`✓ Created ${redemptionCount} redemptions`);

    // Create commission payments for conversions
    const conversions = await prisma.redemption.findMany({
        where: {
            campaignId: campaign.id,
            convertedToPaid: true
        }
    });

    let paymentCount = 0;
    for (const conversion of conversions) {
        const existing = await prisma.payment.findFirst({
            where: { redemptionId: conversion.id }
        });

        if (!existing) {
            await prisma.payment.create({
                data: {
                    campaignId: campaign.id,
                    recipientId: creator.id,
                    amount: Number(campaign.conversionCommission) || 5.00,
                    type: 'BONUS',
                    status: 'PENDING',
                    description: `Conversion commission for ${conversion.orderId}`,
                    commissionType: 'CONVERSION_COMMISSION',
                    redemptionId: conversion.id
                }
            });
            paymentCount++;
        }
    }
    console.log(`✓ Created ${paymentCount} commission payments`);

    console.log('\n✅ Attribution seed complete!');
    console.log('Summary:');
    console.log(`  Campaign: ${campaign.name}`);
    console.log(`  Codes: ${creatorCodes.length}`);
    console.log(`  Redemptions: ${redemptionCount}`);
    console.log(`  Commission Payments: ${paymentCount}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
