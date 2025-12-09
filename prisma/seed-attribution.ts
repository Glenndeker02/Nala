import { PrismaClient, Platform } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAttributionData() {
    console.log('🌱 Seeding Attribution Codes data...');

    try {
        // Find or create test users
        const mike = await prisma.user.upsert({
            where: { email: 'mike@hapto.com' },
            update: {},
            create: {
                email: 'mike@hapto.com',
                password: '$2a$10$YourHashedPasswordHere', // Use proper bcrypt hash
                role: 'FOUNDER',
                fullName: 'Mike Johnson',
                companyName: 'Hapto Inc',
                emailVerified: true
            }
        });

        const mary = await prisma.user.upsert({
            where: { email: 'mary@creator.com' },
            update: {},
            create: {
                email: 'mary@creator.com',
                password: '$2a$10$YourHashedPasswordHere',
                role: 'CREATOR',
                fullName: 'Mary Anderson',
                emailVerified: true
            }
        });

        // Ensure Mary has a creator profile
        await prisma.creatorProfile.upsert({
            where: { userId: mary.id },
            update: {},
            create: {
                userId: mary.id,
                bio: 'UGC Creator specializing in tech and lifestyle content',
                categories: ['Technology', 'Lifestyle'],
                certificationStatus: 'CERTIFIED'
            }
        });

        console.log('✅ Users created/found:', { mike: mike.email, mary: mary.email });

        // Create a campaign with attribution codes enabled
        const campaign = await prisma.campaign.create({
            data: {
                founderId: mike.id,
                name: 'New Feature Launch',
                brandName: 'Hapto',
                description: 'Promote our new AI-powered productivity features',
                status: 'ACTIVE',
                platform: Platform.TIKTOK,
                totalBudget: 5000,
                baseFeeBudget: 2000,
                performanceBudget: 3000,
                baseFeePerVideo: 200,
                performanceRate: 4.00,
                videosRequested: 5,
                enableCreatorCodes: true,
                autoGenerateCodes: true,
                conversionCommission: 15.00,
                codeDiscountType: 'PERCENTAGE',
                codeDiscountValue: 20,
                attributionWindowDays: 30,
                briefData: {
                    productName: 'Hapto AI',
                    targetAudience: 'Tech-savvy professionals',
                    mustHaves: [
                        'Show the AI features in action',
                        'Mention the discount code',
                        'Include call-to-action'
                    ],
                    dontMentions: ['Competitors', 'Pricing details']
                }
            }
        });

        console.log('✅ Campaign created:', campaign.name, campaign.id);

        // Create creator codes for Mary (simulating auto-generation on acceptance)
        const codes = await Promise.all([
            prisma.creatorCode.create({
                data: {
                    campaignId: campaign.id,
                    creatorId: mary.id,
                    platform: Platform.TIKTOK,
                    code: 'MARY01-NFT-TT',
                    createdBy: mike.id,
                    active: true
                }
            }),
            prisma.creatorCode.create({
                data: {
                    campaignId: campaign.id,
                    creatorId: mary.id,
                    platform: Platform.INSTAGRAM,
                    code: 'MARY01-NFT-IG',
                    createdBy: mike.id,
                    active: true
                }
            })
        ]);

        console.log('✅ Creator codes generated:', codes.map(c => c.code).join(', '));

        // Create sample redemptions (25 on TikTok, 10 on Instagram)
        const redemptions = [];

        // TikTok redemptions
        for (let i = 0; i < 25; i++) {
            const redemption = await prisma.redemption.create({
                data: {
                    creatorCodeId: codes[0].id, // TikTok code
                    campaignId: campaign.id,
                    creatorId: mary.id,
                    platform: Platform.TIKTOK,
                    userId: `user_tt_${i}`,
                    orderId: i < 8 ? `order_tt_${i}` : null, // First 8 will convert
                    convertedToPaid: i < 8, // First 8 are conversions
                    conversionDate: i < 8 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
                    amountPaidByUser: i < 8 ? [29.99, 49.99, 99.99, 29.99, 49.99, 29.99, 99.99, 49.99][i] : null,
                    discountApplied: i < 8 ? [6.00, 10.00, 20.00, 6.00, 10.00, 6.00, 20.00, 10.00][i] : null,
                    ipHash: `hash_${Math.random().toString(36).substring(7)}`,
                    deviceInfo: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
                    metadata: {
                        source: 'tiktok',
                        videoId: `tt_video_${i}`
                    }
                }
            });
            redemptions.push(redemption);
        }

        // Instagram redemptions
        for (let i = 0; i < 10; i++) {
            const redemption = await prisma.redemption.create({
                data: {
                    creatorCodeId: codes[1].id, // Instagram code
                    campaignId: campaign.id,
                    creatorId: mary.id,
                    platform: Platform.INSTAGRAM,
                    userId: `user_ig_${i}`,
                    orderId: i < 3 ? `order_ig_${i}` : null, // First 3 will convert
                    convertedToPaid: i < 3,
                    conversionDate: i < 3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
                    amountPaidByUser: i < 3 ? [49.99, 29.99, 99.99][i] : null,
                    discountApplied: i < 3 ? [10.00, 6.00, 20.00][i] : null,
                    ipHash: `hash_${Math.random().toString(36).substring(7)}`,
                    deviceInfo: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
                    metadata: {
                        source: 'instagram',
                        postId: `ig_post_${i}`
                    }
                }
            });
            redemptions.push(redemption);
        }

        console.log('✅ Redemptions created:', redemptions.length);
        console.log('   - TikTok: 25 (8 converted)');
        console.log('   - Instagram: 10 (3 converted)');

        // Create commission payments for conversions
        const conversions = redemptions.filter(r => r.convertedToPaid);
        const payments = [];

        for (const conversion of conversions) {
            const payment = await prisma.payment.create({
                data: {
                    campaignId: campaign.id,
                    recipientId: mary.id,
                    amount: 15.00, // conversionCommission
                    type: 'PAYOUT',
                    commissionType: 'CONVERSION_COMMISSION',
                    status: Math.random() > 0.5 ? 'PENDING' : 'COMPLETED',
                    metadata: {
                        redemptionId: conversion.id,
                        code: conversion.platform === Platform.TIKTOK ? 'MARY01-NFT-TT' : 'MARY01-NFT-IG',
                        userAmount: conversion.amountPaidByUser
                    }
                }
            });
            payments.push(payment);
        }

        console.log('✅ Commission payments created:', payments.length);
        console.log('   - Total commission: $' + (payments.length * 15).toFixed(2));

        console.log('   - Pending:', payments.filter(p => p.status === 'PENDING').length);
        console.log('   - Completed:', payments.filter(p => p.status === 'COMPLETED').length);

        // Create notification for Mary about codes
        await prisma.notification.create({
            data: {
                userId: mary.id,
                type: 'SYSTEM',
                title: 'Attribution Codes Assigned! 🏷️',
                message: `Your attribution codes for "${campaign.name}" have been generated:\n\n• TikTok: MARY01-NFT-TT\n• Instagram: MARY01-NFT-IG\n\nUse these codes in your content to earn $15 per conversion!`,
                link: `/creator/campaigns/${campaign.id}`,
                isRead: false
            }
        });

        console.log('✅ Notification created for Mary');

        // Summary
        console.log('\n📊 Attribution System Seed Summary:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Campaign: ${campaign.name}`);
        console.log(`Codes: MARY01-NFT-TT, MARY01-NFT-IG`);
        console.log(`Total Redemptions: ${redemptions.length}`);
        console.log(`Total Conversions: ${conversions.length}`);
        console.log(`Conversion Rate: ${((conversions.length / redemptions.length) * 100).toFixed(1)}%`);
        console.log(`Total Revenue: $${conversions.reduce((sum, c) => sum + Number(c.amountPaidByUser || 0), 0).toFixed(2)}`);
        console.log(`Commission Owed: $${(conversions.length * 15).toFixed(2)}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        return {
            campaign,
            codes,
            redemptions,
            payments
        };

    } catch (error) {
        console.error('❌ Error seeding attribution data:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    seedAttributionData()
        .then(() => {
            console.log('✅ Attribution seed completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Attribution seed failed:', error);
            process.exit(1);
        })
        .finally(() => {
            prisma.$disconnect();
        });
}

export { seedAttributionData };
