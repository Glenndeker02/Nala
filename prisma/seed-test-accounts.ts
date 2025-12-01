import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed for test accounts...');

    // Hash password
    const hashedPassword = await bcrypt.hash('Test123!@#', 10);

    // ============================================
    // 1. CREATE FOUNDER: mike21@gmail.com
    // ============================================
    console.log('Creating founder account: mike21@gmail.com');

    const founder = await prisma.user.upsert({
        where: { email: 'mike21@gmail.com' },
        update: {},
        create: {
            email: 'mike21@gmail.com',
            password: hashedPassword,
            role: 'FOUNDER',
            fullName: 'Mike Johnson',
            companyName: 'TechFlow Solutions',
            emailVerified: true,
            emailVerifiedAt: new Date(),
            founderTier: 'GOLD',
            lastLoginAt: new Date(),
        },
    });

    console.log('✅ Founder created:', founder.email);

    // ============================================
    // 2. CREATE CREATOR: mary57@gmail.com
    // ============================================
    console.log('Creating creator account: mary57@gmail.com');

    const creator = await prisma.user.upsert({
        where: { email: 'mary57@gmail.com' },
        update: {},
        create: {
            email: 'mary57@gmail.com',
            password: hashedPassword,
            role: 'CREATOR',
            fullName: 'Mary Anderson',
            emailVerified: true,
            emailVerifiedAt: new Date(),
            lastLoginAt: new Date(),
        },
    });

    console.log('✅ Creator created:', creator.email);

    // Create Creator Profile
    const creatorProfile = await prisma.creatorProfile.upsert({
        where: { userId: creator.id },
        update: {},
        create: {
            userId: creator.id,
            bio: 'Professional UGC creator specializing in tech and SaaS products. 5+ years of experience creating engaging content that converts.',
            categories: ['SaaS', 'Tech', 'B2B', 'Productivity'],
            baseFeeTiktok: 100.00,
            baseFeeInstagram: 95.00,
            baseFeeFacebook: 85.00,
            verificationStatus: 'VERIFIED',
            availabilityStatus: 'AVAILABLE',
            responseTime: '< 12 hours',
            isOnboardingComplete: true,
            portfolioVideos: {
                videos: [
                    {
                        url: 'https://www.tiktok.com/@example/video/1',
                        thumbnail: 'https://picsum.photos/seed/video1/400/600',
                        platform: 'TIKTOK',
                        title: 'SaaS Product Demo',
                        views: 125000,
                    },
                    {
                        url: 'https://www.instagram.com/reel/example1',
                        thumbnail: 'https://picsum.photos/seed/video2/400/600',
                        platform: 'INSTAGRAM',
                        title: 'Tech Product Review',
                        views: 89000,
                    },
                    {
                        url: 'https://www.tiktok.com/@example/video/2',
                        thumbnail: 'https://picsum.photos/seed/video3/400/600',
                        platform: 'TIKTOK',
                        title: 'App Tutorial',
                        views: 156000,
                    },
                ],
            },
        },
    });

    console.log('✅ Creator profile created');

    // Add Social Accounts for Creator
    const socialAccounts = await Promise.all([
        prisma.socialAccount.upsert({
            where: {
                creatorId_platform: {
                    creatorId: creator.id,
                    platform: 'TIKTOK',
                },
            },
            update: {},
            create: {
                creatorId: creator.id,
                platform: 'TIKTOK',
                platformUserId: 'mary_creates_57',
                username: '@mary_creates',
                followerCount: 45000,
                verifiedAt: new Date(),
                lastSyncedAt: new Date(),
            },
        }),
        prisma.socialAccount.upsert({
            where: {
                creatorId_platform: {
                    creatorId: creator.id,
                    platform: 'INSTAGRAM',
                },
            },
            update: {},
            create: {
                creatorId: creator.id,
                platform: 'INSTAGRAM',
                platformUserId: 'mary.anderson.creates',
                username: '@mary.anderson',
                followerCount: 32000,
                verifiedAt: new Date(),
                lastSyncedAt: new Date(),
            },
        }),
    ]);

    console.log('✅ Social accounts created:', socialAccounts.length);

    // ============================================
    // 3. CREATE CAMPAIGNS FOR FOUNDER
    // ============================================
    console.log('Creating campaigns for founder...');

    // Active Campaign 1
    const campaign1 = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'TechFlow App Launch Campaign',
            brandName: 'TechFlow',
            description: 'Launch campaign for our new productivity app targeting remote workers and digital nomads.',
            status: 'ACTIVE',
            platform: 'TIKTOK',
            totalBudget: 5000.00,
            baseFeeeBudget: 3000.00,
            performanceBudget: 2000.00,
            escrowBalance: 5000.00,
            videosRequested: 10,
            videosCompleted: 6,
            postingFrequency: 'every_other_day',
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            briefData: {
                productName: 'TechFlow Pro',
                productDescription: 'All-in-one productivity suite for remote teams',
                targetAudience: 'Remote workers, digital nomads, startup teams',
                platforms: ['TikTok', 'Instagram'],
                keyMessages: [
                    'Streamline your workflow',
                    'Collaborate seamlessly',
                    'Boost productivity by 40%',
                ],
                dosList: [
                    'Show real use cases',
                    'Highlight time-saving features',
                    'Include clear CTA',
                ],
                dontsList: [
                    'No competitor mentions',
                    'Avoid technical jargon',
                ],
                hashtags: ['#productivity', '#remotework', '#techflow', '#saas'],
            },
        },
    });

    console.log('✅ Campaign 1 created:', campaign1.name);

    // Active Campaign 2
    const campaign2 = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'Holiday Season Promo',
            brandName: 'TechFlow',
            description: 'Special holiday promotion campaign with limited-time offers.',
            status: 'ACTIVE',
            platform: 'INSTAGRAM',
            totalBudget: 3500.00,
            baseFeeeBudget: 2100.00,
            performanceBudget: 1400.00,
            escrowBalance: 3500.00,
            videosRequested: 7,
            videosCompleted: 3,
            postingFrequency: 'daily',
            startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
            briefData: {
                productName: 'TechFlow Pro - Holiday Deal',
                productDescription: '50% off annual subscription for the holiday season',
                targetAudience: 'Small business owners, freelancers',
                platforms: ['Instagram', 'Facebook'],
                keyMessages: [
                    'Limited time 50% off',
                    'Perfect gift for professionals',
                    'Start 2026 organized',
                ],
            },
        },
    });

    console.log('✅ Campaign 2 created:', campaign2.name);

    // Draft Campaign
    const campaign3 = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'Q1 2026 Growth Campaign',
            brandName: 'TechFlow',
            description: 'Planned campaign for Q1 2026 focusing on enterprise clients.',
            status: 'DRAFT',
            totalBudget: 8000.00,
            baseFeeeBudget: 4800.00,
            performanceBudget: 3200.00,
            videosRequested: 15,
            videosCompleted: 0,
            postingFrequency: 'daily',
            briefData: {
                productName: 'TechFlow Enterprise',
                productDescription: 'Enterprise-grade productivity solution',
                targetAudience: 'Enterprise teams, CTOs, IT managers',
            },
        },
    });

    console.log('✅ Campaign 3 created:', campaign3.name);

    // ============================================
    // 4. CREATE VIDEOS FOR CAMPAIGNS
    // ============================================
    console.log('Creating videos for campaigns...');

    // Videos for Campaign 1 (with creator assigned)
    const videosData = [
        {
            status: 'POSTED',
            views: 125000,
            likes: 8500,
            comments: 420,
            shares: 1200,
            postedDaysAgo: 6,
        },
        {
            status: 'POSTED',
            views: 98000,
            likes: 6200,
            comments: 310,
            shares: 890,
            postedDaysAgo: 5,
        },
        {
            status: 'POSTED',
            views: 156000,
            likes: 11200,
            comments: 580,
            shares: 1650,
            postedDaysAgo: 4,
        },
        {
            status: 'POSTED',
            views: 87000,
            likes: 5400,
            comments: 270,
            shares: 720,
            postedDaysAgo: 3,
        },
        {
            status: 'APPROVED',
            views: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            postedDaysAgo: null,
        },
        {
            status: 'IN_REVIEW',
            views: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            postedDaysAgo: null,
        },
    ];

    for (let i = 0; i < videosData.length; i++) {
        const videoData = videosData[i];
        const video = await prisma.video.create({
            data: {
                campaignId: campaign1.id,
                creatorId: creator.id,
                platform: 'TIKTOK',
                status: videoData.status as any,
                finalPostUrl: videoData.status === 'POSTED'
                    ? `https://www.tiktok.com/@mary_creates/video/${1000000 + i}`
                    : null,
                platformVideoId: videoData.status === 'POSTED' ? `${1000000 + i}` : null,
                currentViewCount: videoData.views,
                postedAt: videoData.postedDaysAgo
                    ? new Date(Date.now() - videoData.postedDaysAgo * 24 * 60 * 60 * 1000)
                    : null,
                approvedAt: videoData.status === 'APPROVED' || videoData.status === 'POSTED'
                    ? new Date(Date.now() - (videoData.postedDaysAgo || 1) * 24 * 60 * 60 * 1000)
                    : null,
                submittedAt: new Date(Date.now() - (videoData.postedDaysAgo || 0) * 24 * 60 * 60 * 1000 - 12 * 60 * 60 * 1000),
                baseFeePaid: videoData.status === 'POSTED',
                baseFeeAmount: 100.00,
                performanceBonusPaid: false,
            },
        });

        // Add view snapshots for posted videos
        if (videoData.status === 'POSTED') {
            const snapshotDates = [1, 2, 3, 4, 5, 6, 7];
            for (const day of snapshotDates) {
                if (day <= (videoData.postedDaysAgo || 0)) {
                    await prisma.viewSnapshot.create({
                        data: {
                            videoId: video.id,
                            viewCount: Math.floor(videoData.views * (day / (videoData.postedDaysAgo || 7))),
                            dataSource: 'tiktok_api',
                            snapshotAt: new Date(Date.now() - ((videoData.postedDaysAgo || 0) - day) * 24 * 60 * 60 * 1000),
                        },
                    });
                }
            }
        }
    }

    console.log('✅ Videos created for campaign 1:', videosData.length);

    // Videos for Campaign 2
    for (let i = 0; i < 3; i++) {
        await prisma.video.create({
            data: {
                campaignId: campaign2.id,
                creatorId: creator.id,
                platform: 'INSTAGRAM',
                status: 'POSTED',
                finalPostUrl: `https://www.instagram.com/reel/ABC${i}DEF`,
                platformVideoId: `ABC${i}DEF`,
                currentViewCount: 45000 + i * 10000,
                postedAt: new Date(Date.now() - (2 - i) * 24 * 60 * 60 * 1000),
                approvedAt: new Date(Date.now() - (2 - i) * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000),
                submittedAt: new Date(Date.now() - (2 - i) * 24 * 60 * 60 * 1000 - 18 * 60 * 60 * 1000),
                baseFeePaid: true,
                baseFeeAmount: 95.00,
            },
        });
    }

    console.log('✅ Videos created for campaign 2: 3');

    // ============================================
    // 5. CREATE FOUNDER VIDEOS
    // ============================================
    console.log('Creating founder videos...');

    const founderVideos = [
        {
            platform: 'TIKTOK',
            caption: 'Behind the scenes of building TechFlow! 🚀',
            status: 'POSTED',
            views: 12500,
            likes: 890,
            comments: 45,
            shares: 120,
        },
        {
            platform: 'INSTAGRAM',
            caption: 'Quick demo of our new feature! Check it out 👇',
            status: 'POSTED',
            views: 8900,
            likes: 650,
            comments: 32,
            shares: 85,
        },
        {
            platform: 'TIKTOK',
            caption: 'Customer success story - how TechFlow helped Sarah 2x her productivity',
            status: 'READY_TO_POST',
            views: 0,
            likes: 0,
            comments: 0,
            shares: 0,
        },
    ];

    for (const fv of founderVideos) {
        const founderVideo = await prisma.founderVideo.create({
            data: {
                campaignId: campaign1.id,
                founderId: founder.id,
                videoUrl: `https://storage.example.com/videos/${Math.random().toString(36).substring(7)}.mp4`,
                thumbnailUrl: `https://picsum.photos/seed/${Math.random()}/400/600`,
                caption: fv.caption,
                platform: fv.platform as any,
                status: fv.status as any,
                isDraft: fv.status === 'DRAFT',
                currentViewCount: fv.views,
                likes: fv.likes,
                comments: fv.comments,
                shares: fv.shares,
            },
        });

        // Add view snapshots for posted videos
        if (fv.status === 'POSTED' && fv.views > 0) {
            for (let day = 1; day <= 3; day++) {
                await prisma.founderVideoSnapshot.create({
                    data: {
                        videoId: founderVideo.id,
                        viewCount: Math.floor(fv.views * (day / 3)),
                        likes: Math.floor(fv.likes * (day / 3)),
                        comments: Math.floor(fv.comments * (day / 3)),
                        shares: Math.floor(fv.shares * (day / 3)),
                        snapshotAt: new Date(Date.now() - (3 - day) * 24 * 60 * 60 * 1000),
                    },
                });
            }
        }
    }

    console.log('✅ Founder videos created:', founderVideos.length);

    // ============================================
    // 6. CREATE CAMPAIGN GOALS
    // ============================================
    console.log('Creating campaign goals...');

    const goals = [
        {
            name: 'Reach 1M Total Views',
            description: 'Achieve 1 million total views across all campaign videos',
            type: 'VIEWS',
            targetValue: 1000000,
            currentValue: 466000,
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
        {
            name: 'Complete All Videos',
            description: 'Get all 10 videos posted and live',
            type: 'VIDEOS_COMPLETED',
            targetValue: 10,
            currentValue: 6,
            deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        },
        {
            name: 'Engagement Rate Target',
            description: 'Maintain 8% average engagement rate',
            type: 'ENGAGEMENT_RATE',
            targetValue: 8,
            currentValue: 7.2,
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
    ];

    for (const goal of goals) {
        await prisma.campaignGoal.create({
            data: {
                campaignId: campaign1.id,
                ...goal,
                status: goal.currentValue >= goal.targetValue ? 'COMPLETED' : 'IN_PROGRESS',
            },
        });
    }

    console.log('✅ Campaign goals created:', goals.length);

    // ============================================
    // 7. CREATE A/B TESTS
    // ============================================
    console.log('Creating A/B tests...');

    const abTest = await prisma.aBTest.create({
        data: {
            campaignId: campaign1.id,
            name: 'Hook Variation Test',
            description: 'Testing different hook styles to improve view-through rate',
            testGoal: 'BEST_HOOK',
            successMetric: 'VIEW_THROUGH_RATE',
            status: 'ACTIVE',
            startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Started 5 days ago
            variants: {
                create: [
                    {
                        variantName: 'Variant A',
                        label: 'Question Hook',
                        description: 'Starts with "Have you ever wondered...?"',
                        variantType: 'HOOK',
                        instructions: 'Start the video with a provocative question.',
                        views: 12500,
                        engagement: 850,
                        performanceScore: 8.5,
                    },
                    {
                        variantName: 'Variant B',
                        label: 'Statement Hook',
                        description: 'Starts with "This is the best way to..."',
                        variantType: 'HOOK',
                        instructions: 'Start with a bold statement.',
                        views: 15000,
                        engagement: 1200,
                        performanceScore: 9.2,
                    }
                ]
            }
        }
    });

    console.log('✅ A/B tests created: 1');

    // ============================================
    // 8. CREATE NOTIFICATIONS
    // ============================================
    console.log('Creating notifications...');

    const notifications = [
        {
            userId: founder.id,
            type: 'VIDEO_STATUS',
            title: 'New Video Posted!',
            message: 'Mary Anderson just posted a video for TechFlow App Launch Campaign',
            link: `/founder/campaigns/${campaign1.id}`,
            isRead: false,
        },
        {
            userId: founder.id,
            type: 'PERFORMANCE_ALERT',
            title: 'Campaign Performing Well! 🎉',
            message: 'Your TechFlow campaign has reached 450K+ views',
            link: `/founder/campaigns/${campaign1.id}`,
            isRead: false,
        },
        {
            userId: founder.id,
            type: 'GOAL_MILESTONE',
            title: 'Goal Progress Update',
            message: 'You\'re 60% towards your 1M views goal!',
            link: `/founder/campaigns/${campaign1.id}`,
            isRead: true,
        },
        {
            userId: creator.id,
            type: 'PAYMENT',
            title: 'Payment Received',
            message: 'You received $100 for video completion',
            link: '/creator/earnings',
            isRead: false,
        },
        {
            userId: creator.id,
            type: 'VIDEO_STATUS',
            title: 'Video Approved!',
            message: 'Your video for TechFlow campaign has been approved',
            link: '/creator/campaigns',
            isRead: true,
        },
    ];

    for (const notif of notifications) {
        await prisma.notification.create({
            data: notif as any,
        });
    }

    console.log('✅ Notifications created:', notifications.length);

    // ============================================
    // 9. CREATE PAYMENTS
    // ============================================
    console.log('Creating payment records...');

    const payments = [
        {
            recipientId: creator.id,
            campaignId: campaign1.id,
            amount: 100.00,
            type: 'BASE_FEE',
            status: 'COMPLETED',
            description: 'Base fee for video #1',
            processedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        },
        {
            recipientId: creator.id,
            campaignId: campaign1.id,
            amount: 100.00,
            type: 'BASE_FEE',
            status: 'COMPLETED',
            description: 'Base fee for video #2',
            processedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
            recipientId: creator.id,
            campaignId: campaign1.id,
            amount: 100.00,
            type: 'BASE_FEE',
            status: 'COMPLETED',
            description: 'Base fee for video #3',
            processedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
        {
            recipientId: creator.id,
            campaignId: campaign1.id,
            amount: 100.00,
            type: 'BASE_FEE',
            status: 'COMPLETED',
            description: 'Base fee for video #4',
            processedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
            recipientId: creator.id,
            campaignId: campaign1.id,
            amount: 150.00,
            type: 'PERFORMANCE_BONUS',
            status: 'PENDING',
            description: 'Performance bonus for exceeding 150K views',
        },
    ];

    for (const payment of payments) {
        await prisma.payment.create({
            data: payment as any,
        });
    }

    console.log('✅ Payment records created:', payments.length);

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('   Founder: mike21@gmail.com / Test123!@#');
    console.log('   Creator: mary57@gmail.com / Test123!@#');
    console.log('\n📊 Data Summary:');
    console.log(`   - Campaigns: 3 (2 active, 1 draft)`);
    console.log(`   - Videos: 9 (7 posted, 1 approved, 1 in review)`);
    console.log(`   - Founder Videos: 3 (2 posted, 1 ready)`);
    console.log(`   - Goals: ${goals.length}`);
    console.log(`   - A/B Tests: 1`);
    console.log(`   - Notifications: ${notifications.length}`);
    console.log(`   - Payments: ${payments.length}`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
