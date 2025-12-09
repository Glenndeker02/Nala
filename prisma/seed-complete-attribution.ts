import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCompleteAttributionCampaign() {
    console.log('🌱 Seeding complete attribution campaign...');

    try {
        // 1. Get test users
        const mike = await prisma.user.findUnique({ where: { email: 'mike21@gmail.com' } });
        const mary = await prisma.user.findUnique({ where: { email: 'mary57@gmail.com' } });

        if (!mike || !mary) {
            throw new Error('Test users not found. Please run main seed first.');
        }

        console.log('✅ Found test users');

        // 2. Create campaign with attribution enabled
        const campaign = await prisma.campaign.create({
            data: {
                founderId: mike.id,
                name: 'Complete Attribution Test Campaign',
                description: 'Full end-to-end test campaign with attribution codes and redemptions',
                status: 'COMPLETED',
                videosRequested: 2,
                totalBudget: 2000,
                baseFeePerVideo: 200,
                baseFeeBudget: 400,
                performanceBudget: 1600,
                escrowBalance: 2000,
                postingFrequency: 'weekly',
                startDate: new Date('2024-11-01'),
                deadline: new Date('2024-12-15'),
                completedAt: new Date('2024-12-15'),

                // Attribution settings
                enableCreatorCodes: true,
                autoGenerateCodes: true,
                conversionCommission: 15,
                codeDiscountType: 'PERCENTAGE',
                codeDiscountValue: 20,
                attributionWindowDays: 30,

                briefData: {
                    productDescription: 'Revolutionary AI-powered productivity app',
                    targetAudience: 'Tech-savvy professionals aged 25-40',
                    campaignGoal: 'Drive app signups and subscriptions',
                    platforms: ['TIKTOK', 'INSTAGRAM'],
                    videoLength: '30-60 seconds',
                    talkingPoints: [
                        'Show how the app saves time',
                        'Highlight AI features',
                        'Mention special discount code'
                    ],
                    tone: 'Professional yet approachable',
                    mustHaves: ['Show app interface', 'Mention discount code', 'Clear CTA'],
                    dontWants: ['Negative comparisons', 'Overly technical jargon'],
                    hashtags: '#ProductivityApp #AITools #TechLife',
                    guaranteedSpend: true,
                    targetViews: 100000
                },

                acceptedCreatorsCount: 1,
                notificationsSent: true,
                guaranteedSpend: true,
                targetViews: 100000
            }
        });

        console.log('✅ Created campaign:', campaign.id);

        // 3. Create application and accept it
        const application = await prisma.application.create({
            data: {
                campaignId: campaign.id,
                creatorId: mary.id,
                status: 'ACCEPTED',
                message: 'I would love to promote this app! I have experience with tech products.',
                acceptedAt: new Date('2024-11-10')
            }
        });

        console.log('✅ Created and accepted application');

        // 4. Create creator codes (TikTok and Instagram)
        const tiktokCode = await prisma.creatorCode.create({
            data: {
                campaignId: campaign.id,
                creatorId: mary.id,
                platform: 'TIKTOK',
                code: 'MARY20-TT-2499',
                createdBy: mike.id,
                active: true
            }
        });

        const instagramCode = await prisma.creatorCode.create({
            data: {
                campaignId: campaign.id,
                creatorId: mary.id,
                platform: 'INSTAGRAM',
                code: 'MARY20-IG-2401',
                createdBy: mike.id,
                active: true
            }
        });

        console.log('✅ Created attribution codes:', tiktokCode.code, instagramCode.code);

        // 5. Create videos (2 videos - both completed)
        const video1 = await prisma.video.create({
            data: {
                campaignId: campaign.id,
                creatorId: mary.id,
                platform: 'TIKTOK',
                status: 'LOCKED',
                videoNumber: 1,
                title: 'Productivity App Review - TikTok',

                draftVideoUrl: 'https://example.com/draft-video-1.mp4',
                finalPostUrl: 'https://tiktok.com/@mary/video/123456',
                platformVideoId: 'tiktok_123456',

                submittedAt: new Date('2024-11-15'),
                approvedAt: new Date('2024-11-16'),
                postedAt: new Date('2024-11-17'),
                lockedAt: new Date('2024-12-10'),

                deadline: new Date('2024-11-30'),

                currentViewCount: 45000,
                lockedViewCount: 45000,
                lastViewUpdate: new Date('2024-12-10'),

                baseFeeAmount: 200,
                baseFeePaid: true,
                performanceBonusAmount: 450, // Based on views
                performanceBonusPaid: true,

                performanceMetrics: {
                    views: 45000,
                    likes: 3200,
                    comments: 450,
                    shares: 890,
                    completedViews: 38000,
                    watchTimeHours: 1250,
                    engagementRate: 10.2,
                    completionRate: 84.4
                }
            }
        });

        const video2 = await prisma.video.create({
            data: {
                campaignId: campaign.id,
                creatorId: mary.id,
                platform: 'INSTAGRAM',
                status: 'LOCKED',
                videoNumber: 2,
                title: 'AI Productivity Tool Demo - Instagram',

                draftVideoUrl: 'https://example.com/draft-video-2.mp4',
                finalPostUrl: 'https://instagram.com/p/ABC123',
                platformVideoId: 'ig_ABC123',

                submittedAt: new Date('2024-11-20'),
                approvedAt: new Date('2024-11-21'),
                postedAt: new Date('2024-11-22'),
                lockedAt: new Date('2024-12-12'),

                deadline: new Date('2024-12-05'),

                currentViewCount: 38000,
                lockedViewCount: 38000,
                lastViewUpdate: new Date('2024-12-12'),

                baseFeeAmount: 200,
                baseFeePaid: true,
                performanceBonusAmount: 380,
                performanceBonusPaid: true,

                performanceMetrics: {
                    views: 38000,
                    likes: 2800,
                    comments: 320,
                    shares: 650,
                    completedViews: 32000,
                    watchTimeHours: 950,
                    engagementRate: 9.8,
                    completionRate: 84.2
                }
            }
        });

        console.log('✅ Created 2 completed videos');

        // 6. Create redemptions and conversions
        const redemptions = [];

        // TikTok code redemptions (12 total, 8 converted)
        for (let i = 0; i < 12; i++) {
            const convertedToPaid = i < 8; // First 8 converted
            const redemption = await prisma.redemption.create({
                data: {
                    creatorCodeId: tiktokCode.id,
                    campaignId: campaign.id,
                    creatorId: mary.id,
                    platform: 'TIKTOK',
                    userEmail: `user${i + 1}@example.com`,
                    redeemedAt: new Date(`2024-11-${17 + Math.floor(i / 4)}`),
                    convertedToPaid,
                    amountPaidByUser: convertedToPaid ? 29.99 : null,
                    discountApplied: 20,
                    discountType: 'PERCENTAGE'
                }
            });
            redemptions.push(redemption);
        }

        // Instagram code redemptions (8 total, 5 converted)
        for (let i = 0; i < 8; i++) {
            const convertedToPaid = i < 5; // First 5 converted
            const redemption = await prisma.redemption.create({
                data: {
                    creatorCodeId: instagramCode.id,
                    campaignId: campaign.id,
                    creatorId: mary.id,
                    platform: 'INSTAGRAM',
                    userEmail: `iguser${i + 1}@example.com`,
                    redeemedAt: new Date(`2024-11-${22 + Math.floor(i / 3)}`),
                    convertedToPaid,
                    amountPaidByUser: convertedToPaid ? 29.99 : null,
                    discountApplied: 20,
                    discountType: 'PERCENTAGE'
                }
            });
            redemptions.push(redemption);
        }

        console.log('✅ Created 20 redemptions (13 converted to paid)');

        // 7. Create conversion commission payments
        const totalConversions = 13;
        const commissionPerConversion = 15;
        const totalCommission = totalConversions * commissionPerConversion;

        const commissionPayment = await prisma.payment.create({
            data: {
                campaignId: campaign.id,
                recipientId: mary.id,
                payerId: mike.id,
                amount: totalCommission,
                commissionType: 'CONVERSION_COMMISSION',
                status: 'COMPLETED',
                stripePaymentIntentId: 'pi_test_commission_' + Date.now(),
                metadata: {
                    conversions: totalConversions,
                    commissionRate: commissionPerConversion,
                    tiktokConversions: 8,
                    instagramConversions: 5
                }
            }
        });

        console.log('✅ Created commission payment: $' + totalCommission);

        // 8. Create base fee and performance bonus payments
        await prisma.payment.create({
            data: {
                campaignId: campaign.id,
                videoId: video1.id,
                recipientId: mary.id,
                payerId: mike.id,
                amount: 200,
                commissionType: 'BASE_FEE',
                status: 'COMPLETED',
                stripePaymentIntentId: 'pi_test_base1_' + Date.now()
            }
        });

        await prisma.payment.create({
            data: {
                campaignId: campaign.id,
                videoId: video1.id,
                recipientId: mary.id,
                payerId: mike.id,
                amount: 450,
                commissionType: 'PERFORMANCE_BONUS',
                status: 'COMPLETED',
                stripePaymentIntentId: 'pi_test_perf1_' + Date.now()
            }
        });

        await prisma.payment.create({
            data: {
                campaignId: campaign.id,
                videoId: video2.id,
                recipientId: mary.id,
                payerId: mike.id,
                amount: 200,
                commissionType: 'BASE_FEE',
                status: 'COMPLETED',
                stripePaymentIntentId: 'pi_test_base2_' + Date.now()
            }
        });

        await prisma.payment.create({
            data: {
                campaignId: campaign.id,
                videoId: video2.id,
                recipientId: mary.id,
                payerId: mike.id,
                amount: 380,
                commissionType: 'PERFORMANCE_BONUS',
                status: 'COMPLETED',
                stripePaymentIntentId: 'pi_test_perf2_' + Date.now()
            }
        });

        console.log('✅ Created all payment records');

        // 9. Create campaign instructions
        await prisma.instruction.create({
            data: {
                campaignId: campaign.id,
                authorId: mike.id,
                text: 'Please make sure to show the app interface clearly and mention the discount code MARY20 in your video.',
                appliesTo: 'ALL',
                videoNumber: null,
                requiresAcknowledgment: true,
                instructionType: 'GENERAL',
                status: 'OPEN',
                acknowledgedBy: [mary.id]
            }
        });

        console.log('✅ Created campaign instructions');

        // 10. Create notifications
        await prisma.notification.create({
            data: {
                userId: mary.id,
                type: 'CAMPAIGN_COMPLETED',
                title: 'Campaign Completed! 🎉',
                message: `Your campaign "${campaign.name}" has been completed. Total earnings: $${200 + 450 + 200 + 380 + totalCommission} (including $${totalCommission} in conversion bonuses from ${totalConversions} sales)`,
                link: `/creator/campaigns/${campaign.id}`,
                isRead: false
            }
        });

        console.log('✅ Created notifications');

        console.log('\n📊 CAMPAIGN SUMMARY:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Campaign ID: ${campaign.id}`);
        console.log(`Status: ${campaign.status}`);
        console.log(`\n📹 Videos: 2 (both completed and locked)`);
        console.log(`   - TikTok: 45,000 views`);
        console.log(`   - Instagram: 38,000 views`);
        console.log(`   - Total Views: 83,000`);
        console.log(`\n🏷️  Attribution Codes:`);
        console.log(`   - TikTok: ${tiktokCode.code}`);
        console.log(`   - Instagram: ${instagramCode.code}`);
        console.log(`\n💰 Redemptions & Conversions:`);
        console.log(`   - Total Redemptions: 20`);
        console.log(`   - Paid Conversions: 13`);
        console.log(`   - Conversion Rate: 65%`);
        console.log(`   - Revenue Generated: $${(13 * 29.99).toFixed(2)}`);
        console.log(`\n💵 Creator Earnings:`);
        console.log(`   - Base Fees: $400`);
        console.log(`   - Performance Bonuses: $830`);
        console.log(`   - Conversion Commissions: $${totalCommission}`);
        console.log(`   - TOTAL: $${400 + 830 + totalCommission}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('✅ Complete attribution campaign seeded successfully!');
        console.log(`\n🔗 View campaign: http://localhost:3000/founder/campaigns/${campaign.id}`);
        console.log(`🔗 View codes: http://localhost:3000/founder/campaigns/${campaign.id}/codes`);
        console.log(`🔗 Creator view: http://localhost:3000/creator/campaigns/${campaign.id}`);

    } catch (error) {
        console.error('❌ Error seeding campaign:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedCompleteAttributionCampaign()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
