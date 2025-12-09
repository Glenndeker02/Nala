/**
 * Attribution Seed Script
 * Creates test data for Creator Attribution Codes feature
 * 
 * Test Accounts:
 * - Founder: mike21@gmail.com (Mike)
 * - Creator: mary57@gmail.com (Mary)
 * 
 * Usage: npx ts-node prisma/seed/attribution-seed.ts
 */

import { PrismaClient, Platform, PaymentType, CommissionType, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAttribution() {
    console.log('🌱 Seeding attribution data...');

    try {
        // Find test accounts
        const founder = await prisma.user.findFirst({
            where: { email: 'mike21@gmail.com' }
        });

        const creator = await prisma.user.findFirst({
            where: { email: 'mary57@gmail.com' }
        });

        if (!founder) {
            console.log('❌ Founder mike21@gmail.com not found. Please create this account first.');
            return;
        }

        if (!creator) {
            console.log('❌ Creator mary57@gmail.com not found. Please create this account first.');
            return;
        }

        console.log(`✅ Found founder: ${founder.fullName} (${founder.id})`);
        console.log(`✅ Found creator: ${creator.fullName} (${creator.id})`);

        // Create or update test campaign with attribution enabled
        let campaign = await prisma.campaign.findFirst({
            where: {
                founderId: founder.id,
                name: 'Attribution Test Campaign'
            }
        });

        if (!campaign) {
            campaign = await prisma.campaign.create({
                data: {
                    founderId: founder.id,
                    name: 'Attribution Test Campaign',
                    brandName: 'TestBrand',
                    description: 'Test campaign for attribution codes feature',
                    status: 'ACTIVE',
                    platform: Platform.TIKTOK,
                    totalBudget: 5000,
                    baseFeeBudget: 1500,
                    performanceBudget: 3500,
                    videosRequested: 3,
                    enableCreatorCodes: true,
                    autoGenerateCodes: true,
                    conversionCommission: 15.00,
                    codeDiscountType: 'PERCENTAGE',
                    codeDiscountValue: 20,
                    attributionWindowDays: 30,
                    startDate: new Date(),
                    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    baseFeePerVideo: 75,
                    performanceRate: 4.00
                }
            });
            console.log(`✅ Created campaign: ${campaign.name} (${campaign.id})`);
        } else {
            // Update with attribution settings
            campaign = await prisma.campaign.update({
                where: { id: campaign.id },
                data: {
                    enableCreatorCodes: true,
                    autoGenerateCodes: true,
                    conversionCommission: 15.00,
                    codeDiscountType: 'PERCENTAGE',
                    codeDiscountValue: 20,
                    attributionWindowDays: 30
                }
            });
            console.log(`✅ Updated campaign: ${campaign.name} (${campaign.id})`);
        }

        // Create application if not exists
        let application = await prisma.application.findFirst({
            where: {
                campaignId: campaign.id,
                creatorId: creator.id
            }
        });

        if (!application) {
            application = await prisma.application.create({
                data: {
                    campaignId: campaign.id,
                    creatorId: creator.id,
                    status: 'ACCEPTED',
                    acceptedAt: new Date()
                }
            });
            console.log(`✅ Created application for Mary`);
        }

        // Create creator codes for TikTok and Instagram
        const platforms: Platform[] = [Platform.TIKTOK, Platform.INSTAGRAM];
        const creatorCodes = [];

        for (const platform of platforms) {
            let code = await prisma.creatorCode.findFirst({
                where: {
                    campaignId: campaign.id,
                    creatorId: creator.id,
                    platform
                }
            });

            if (!code) {
                const suffix = platform === Platform.TIKTOK ? 'TT' : 'IG';
                const codeString = `MARY01-${suffix}`;

                code = await prisma.creatorCode.create({
                    data: {
                        campaignId: campaign.id,
                        creatorId: creator.id,
                        platform,
                        code: codeString,
                        createdBy: founder.id,
                        active: true
                    }
                });
                console.log(`✅ Created code: ${codeString}`);
            } else {
                console.log(`⏭️ Code already exists: ${code.code}`);
            }
            creatorCodes.push(code);
        }

        // Create sample redemptions
        const tiktokCode = creatorCodes.find(c => c.platform === Platform.TIKTOK);
        if (tiktokCode) {
            // Check existing redemptions
            const existingRedemptions = await prisma.redemption.count({
                where: { creatorCodeId: tiktokCode.id }
            });

            if (existingRedemptions < 5) {
                // Create 5 sample redemptions (3 paid, 2 signup only)
                const redemptionsToCreate = [
                    { convertedToPaid: true, amount: 29.99, orderId: 'ORD-001' },
                    { convertedToPaid: true, amount: 29.99, orderId: 'ORD-002' },
                    { convertedToPaid: true, amount: 49.99, orderId: 'ORD-003' },
                    { convertedToPaid: false, amount: null, orderId: null },
                    { convertedToPaid: false, amount: null, orderId: null }
                ];

                for (const r of redemptionsToCreate) {
                    await prisma.redemption.create({
                        data: {
                            creatorCodeId: tiktokCode.id,
                            campaignId: campaign.id,
                            creatorId: creator.id,
                            platform: Platform.TIKTOK,
                            orderId: r.orderId,
                            convertedToPaid: r.convertedToPaid,
                            conversionDate: r.convertedToPaid ? new Date() : null,
                            amountPaidByUser: r.amount,
                            metadata: {
                                user_identifier: `user${Math.random().toString(36).substring(7)}@example.com`,
                                conversion_type: r.convertedToPaid ? 'PAID_SUBSCRIPTION' : 'SIGNUP'
                            }
                        }
                    });
                }
                console.log(`✅ Created 5 sample redemptions (3 paid, 2 signups)`);

                // Create conversion commission payments for paid redemptions
                for (let i = 0; i < 3; i++) {
                    await prisma.payment.create({
                        data: {
                            campaignId: campaign.id,
                            recipientId: creator.id,
                            amount: 15.00,
                            type: PaymentType.PAYOUT,
                            commissionType: CommissionType.CONVERSION_COMMISSION,
                            status: i < 2 ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
                            description: `Conversion bonus for code ${tiktokCode.code}`,
                            metadata: { code: tiktokCode.code }
                        }
                    });
                }
                console.log(`✅ Created 3 conversion commission payments ($45 total, $15 pending)`);
            } else {
                console.log(`⏭️ Redemptions already exist (${existingRedemptions} found)`);
            }
        }

        // Create a video with views for analytics
        let video = await prisma.video.findFirst({
            where: {
                campaignId: campaign.id,
                creatorId: creator.id
            }
        });

        if (!video) {
            video = await prisma.video.create({
                data: {
                    campaignId: campaign.id,
                    creatorId: creator.id,
                    platform: Platform.TIKTOK,
                    status: 'APPROVED',
                    currentViewCount: 25000,
                    title: 'Attribution Test Video',
                    videoNumber: 1,
                    submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
                }
            });
            console.log(`✅ Created video with 25,000 views`);
        }

        console.log('\n📊 Attribution Seed Summary:');
        console.log('═══════════════════════════════════════');
        console.log(`Campaign: ${campaign.name}`);
        console.log(`Creator: ${creator.fullName}`);
        console.log(`Codes: MARY01-TT, MARY01-IG`);
        console.log(`Redemptions: 5 (3 paid conversions)`);
        console.log(`Conversion Bonus: $15 per conversion`);
        console.log(`Total Bonus Earnings: $45 ($30 paid, $15 pending)`);
        console.log('═══════════════════════════════════════');
        console.log('\n✅ Attribution seed complete!');

        console.log('\n🧪 Test Commands:');
        console.log('─────────────────────────────────────────');
        console.log('# Redeem a code:');
        console.log(`curl -X POST http://localhost:3000/api/codes/MARY01-TT/redeem \\
  -H "Content-Type: application/json" \\
  -d '{"user_identifier":"test@example.com","conversion_type":"PAID_SUBSCRIPTION","amount":29.99}'`);
        console.log('\n# Check code validity:');
        console.log(`curl http://localhost:3000/api/codes/MARY01-TT/redeem`);

    } catch (error) {
        console.error('❌ Seed failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedAttribution();

