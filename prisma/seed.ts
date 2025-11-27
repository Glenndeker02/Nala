import { PrismaClient, Role, CampaignStatus, VideoStatus, PaymentStatus, PaymentType, NotificationType, VerificationStatus, Platform } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting enhanced database seed...');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.viewSnapshot.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.video.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.creatorProfile.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.user.deleteMany();

    // Hash passwords
    const hashedPassword = await hashPassword('Test123!@#');

    // Create Founder Account
    console.log('👤 Creating founder account...');
    const founder = await prisma.user.create({
        data: {
            email: 'mike21@gmail.com',
            password: hashedPassword,
            fullName: 'Mike Johnson',
            role: Role.FOUNDER,
            companyName: 'TechStartup Inc',
            emailVerified: true,
            lastLoginAt: new Date(),
        },
    });

    // Create Creator Accounts (multiple for more realistic data)
    console.log('🎨 Creating creator accounts...');
    const creator1 = await prisma.user.create({
        data: {
            email: 'mary57@gmail.com',
            password: hashedPassword,
            fullName: 'Mary Smith',
            role: Role.CREATOR,
            emailVerified: true,
            lastLoginAt: new Date(),
        },
    });

    const creator2 = await prisma.user.create({
        data: {
            email: 'john.creator@example.com',
            password: hashedPassword,
            fullName: 'John Davis',
            role: Role.CREATOR,
            emailVerified: true,
            lastLoginAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
    });

    const creator3 = await prisma.user.create({
        data: {
            email: 'sarah.content@example.com',
            password: hashedPassword,
            fullName: 'Sarah Williams',
            role: Role.CREATOR,
            emailVerified: true,
            lastLoginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
    });

    // Create Creator Profiles
    console.log('📝 Creating creator profiles...');
    await prisma.creatorProfile.create({
        data: {
            userId: creator1.id,
            bio: 'Professional content creator specializing in tech and SaaS products. 5+ years of experience creating engaging UGC content.',
            categories: ['SaaS', 'Tech', 'B2B', 'Productivity'],
            baseFeeTiktok: 100.00,
            baseFeeInstagram: 125.00,
            baseFeeFacebook: 75.00,
            portfolioVideos: [
                { url: 'https://www.instagram.com/reel/example1', thumbnail: 'https://example.com/thumb1.jpg', platform: 'INSTAGRAM', title: 'SaaS Product Demo', views: 45000 },
                { url: 'https://www.tiktok.com/@example/video/123', thumbnail: 'https://example.com/thumb2.jpg', platform: 'TIKTOK', title: 'Tech Tutorial', views: 82000 }
            ],
            verificationStatus: VerificationStatus.VERIFIED,
            availabilityStatus: 'AVAILABLE',
            responseTime: '< 24 hours',
            isOnboardingComplete: true,
        },
    });

    await prisma.creatorProfile.create({
        data: {
            userId: creator2.id,
            bio: 'Tech enthusiast and video creator. Love making product reviews and tutorials.',
            categories: ['Tech', 'Reviews', 'Tutorials'],
            baseFeeTiktok: 85.00,
            baseFeeInstagram: 95.00,
            baseFeeFacebook: 70.00,
            portfolioVideos: [
                { url: 'https://www.tiktok.com/@johndavis/video/456', thumbnail: 'https://example.com/thumb3.jpg', platform: 'TIKTOK', title: 'Product Review', views: 35000 }
            ],
            verificationStatus: VerificationStatus.VERIFIED,
            availabilityStatus: 'AVAILABLE',
            responseTime: '< 48 hours',
            isOnboardingComplete: true,
        },
    });

    await prisma.creatorProfile.create({
        data: {
            userId: creator3.id,
            bio: 'Creative storyteller focused on B2B SaaS content. Helping brands connect with their audience.',
            categories: ['SaaS', 'B2B', 'Marketing'],
            baseFeeTiktok: 120.00,
            baseFeeInstagram: 140.00,
            baseFeeFacebook: 90.00,
            portfolioVideos: [
                { url: 'https://www.instagram.com/reel/sarah789', thumbnail: 'https://example.com/thumb4.jpg', platform: 'INSTAGRAM', title: 'Brand Story', views: 67000 },
                { url: 'https://www.tiktok.com/@sarahw/video/789', thumbnail: 'https://example.com/thumb5.jpg', platform: 'TIKTOK', title: 'SaaS Explainer', views: 91000 }
            ],
            verificationStatus: VerificationStatus.VERIFIED,
            availabilityStatus: 'AVAILABLE',
            responseTime: '< 12 hours',
            isOnboardingComplete: true,
        },
    });

    // Create Multiple Campaigns for Performance Overview
    console.log('📢 Creating campaigns...');

    // Campaign 1: Active - Product Launch
    const campaign1 = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'Product Launch Campaign',
            brandName: 'TechStartup Inc',
            description: 'Launch campaign for our new productivity SaaS tool. Need authentic creator reviews.',
            status: CampaignStatus.ACTIVE,
            platform: Platform.TIKTOK,
            totalBudget: 5000,
            baseFeeeBudget: 3000,
            performanceBudget: 2000,
            videosRequested: 10,
            videosCompleted: 4,
            postingFrequency: 'every_other_day',
            startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            guaranteedSpend: false,
            targetViews: 250000,
            briefData: {
                requirements: ['50k+ followers', 'Tech/SaaS niche', 'Authentic style'],
                deliverables: ['1 TikTok video (60s)', '3 Instagram Stories'],
                targetAudience: 'Tech professionals, entrepreneurs',
                brandGuidelines: 'Authentic and relatable. Show real use cases.',
            },
        },
    });

    // Campaign 2: Completed - Holiday Promo
    const campaign2 = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'Holiday Season Promo',
            brandName: 'TechStartup Inc',
            description: 'Seasonal campaign for holiday discount promotion.',
            status: CampaignStatus.COMPLETED,
            platform: Platform.INSTAGRAM,
            totalBudget: 3000,
            baseFeeeBudget: 2000,
            performanceBudget: 1000,
            videosRequested: 5,
            videosCompleted: 5,
            startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
            deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            guaranteedSpend: true,
            targetViews: 150000,
            finalViewsTotal: 187500,
            totalPaidToCreator: 2850,
            totalRefundedToFounder: 0,
            platformRevenue: 150,
            briefData: {
                requirements: ['Holiday-themed', 'Upbeat tone'],
                deliverables: ['2 Instagram Reels', '5 Stories'],
                targetAudience: 'General audience, gift shoppers',
            },
        },
    });

    // Campaign 3: Active - Brand Awareness
    const campaign3 = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'Q1 Brand Awareness',
            brandName: 'TechStartup Inc',
            description: 'Building brand awareness with educational content.',
            status: CampaignStatus.ACTIVE,
            platform: Platform.INSTAGRAM,
            totalBudget: 4500,
            baseFeeeBudget: 3000,
            performanceBudget: 1500,
            videosRequested: 8,
            videosCompleted: 2,
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            deadline: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
            guaranteedSpend: false,
            targetViews: 200000,
            briefData: {
                requirements: ['Educational content', 'Professional presentation'],
                deliverables: ['Tutorial videos', 'Feature highlights'],
            },
        },
    });

    // Campaign 4: Completed - Feature Launch
    const campaign4 = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'New Feature Launch',
            brandName: 'TechStartup Inc',
            description: 'Showcase our new AI-powered feature.',
            status: CampaignStatus.COMPLETED,
            platform: Platform.TIKTOK,
            totalBudget: 6000,
            baseFeeeBudget: 4000,
            performanceBudget: 2000,
            videosRequested: 12,
            videosCompleted: 12,
            startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            deadline: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
            guaranteedSpend: false,
            targetViews: 300000,
            finalViewsTotal: 425000,
            totalPaidToCreator: 5200,
            totalRefundedToFounder: 0,
            platformRevenue: 800,
            briefData: {
                requirements: ['Tech-savvy creators', 'Feature-focused'],
                deliverables: ['Demo videos', 'Use case tutorials'],
            },
        },
    });

    // Campaign 5: Draft
    const campaign5 = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'Q2 Growth Campaign',
            brandName: 'TechStartup Inc',
            description: 'Planning for Q2 growth initiatives.',
            status: CampaignStatus.DRAFT,
            platform: Platform.TIKTOK,
            totalBudget: 7500,
            baseFeeeBudget: 5000,
            performanceBudget: 2500,
            videosRequested: 15,
            deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            guaranteedSpend: false,
            targetViews: 500000,
        },
    });

    // Create Videos with Performance Data
    console.log('🎥 Creating videos with performance metrics...');

    // Campaign 1 Videos (Active)
    const video1_1 = await prisma.video.create({
        data: {
            campaignId: campaign1.id,
            creatorId: creator1.id,
            status: VideoStatus.POSTED,
            draftVideoUrl: 'https://example.com/videos/draft1.mp4',
            finalPostUrl: 'https://www.tiktok.com/@mary/video/111',
            platform: Platform.TIKTOK,
            currentViewCount: 52000,
            lockedViewCount: 52000,
            baseFeePaid: true,
            baseFeeAmount: 300,
            performanceBonusPaid: true,
            performanceBonusAmount: 80,
            submittedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            postedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
            lockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
    });

    const video1_2 = await prisma.video.create({
        data: {
            campaignId: campaign1.id,
            creatorId: creator2.id,
            status: VideoStatus.POSTED,
            draftVideoUrl: 'https://example.com/videos/draft2.mp4',
            finalPostUrl: 'https://www.tiktok.com/@john/video/222',
            platform: Platform.TIKTOK,
            currentViewCount: 38000,
            lockedViewCount: 38000,
            baseFeePaid: true,
            baseFeeAmount: 300,
            performanceBonusPaid: true,
            performanceBonusAmount: 50,
            submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            lockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
    });

    const video1_3 = await prisma.video.create({
        data: {
            campaignId: campaign1.id,
            creatorId: creator3.id,
            status: VideoStatus.IN_REVIEW,
            draftVideoUrl: 'https://example.com/videos/draft3.mp4',
            platform: Platform.TIKTOK,
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
    });

    const video1_4 = await prisma.video.create({
        data: {
            campaignId: campaign1.id,
            creatorId: creator1.id,
            status: VideoStatus.DRAFT_SUBMITTED,
            platform: Platform.TIKTOK,
        },
    });

    // Campaign 2 Videos (Completed - Holiday)
    for (let i = 0; i < 5; i++) {
        const creator = i % 2 === 0 ? creator1 : creator2;
        const views = 30000 + Math.floor(Math.random() * 25000);
        await prisma.video.create({
            data: {
                campaignId: campaign2.id,
                creatorId: creator.id,
                status: VideoStatus.POSTED,
                draftVideoUrl: `https://example.com/videos/holiday${i}.mp4`,
                finalPostUrl: `https://www.instagram.com/reel/holiday${i}`,
                platform: Platform.INSTAGRAM,
                currentViewCount: views,
                lockedViewCount: views,
                baseFeePaid: true,
                baseFeeAmount: 400,
                performanceBonusPaid: true,
                performanceBonusAmount: Math.floor(views / 1000) * 2,
                submittedAt: new Date(Date.now() - (40 - i * 3) * 24 * 60 * 60 * 1000),
                approvedAt: new Date(Date.now() - (38 - i * 3) * 24 * 60 * 60 * 1000),
                postedAt: new Date(Date.now() - (35 - i * 3) * 24 * 60 * 60 * 1000),
                lockedAt: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000),
            },
        });
    }

    // Campaign 3 Videos (Active - Brand Awareness)
    await prisma.video.create({
        data: {
            campaignId: campaign3.id,
            creatorId: creator3.id,
            status: VideoStatus.POSTED,
            draftVideoUrl: 'https://example.com/videos/brand1.mp4',
            finalPostUrl: 'https://www.instagram.com/reel/brand1',
            platform: Platform.INSTAGRAM,
            currentViewCount: 28000,
            lockedViewCount: 28000,
            baseFeePaid: true,
            baseFeeAmount: 375,
            performanceBonusPaid: false,
            submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
    });

    await prisma.video.create({
        data: {
            campaignId: campaign3.id,
            creatorId: creator1.id,
            status: VideoStatus.POSTED,
            draftVideoUrl: 'https://example.com/videos/brand2.mp4',
            finalPostUrl: 'https://www.instagram.com/reel/brand2',
            platform: Platform.INSTAGRAM,
            currentViewCount: 15000,
            baseFeePaid: true,
            baseFeeAmount: 375,
            performanceBonusPaid: false,
            submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
    });

    // Campaign 4 Videos (Completed - Feature Launch)
    for (let i = 0; i < 12; i++) {
        const creators = [creator1, creator2, creator3];
        const creator = creators[i % 3];
        const views = 25000 + Math.floor(Math.random() * 45000);
        await prisma.video.create({
            data: {
                campaignId: campaign4.id,
                creatorId: creator.id,
                status: VideoStatus.POSTED,
                draftVideoUrl: `https://example.com/videos/feature${i}.mp4`,
                finalPostUrl: `https://www.tiktok.com/@creator/video/feature${i}`,
                platform: Platform.TIKTOK,
                currentViewCount: views,
                lockedViewCount: views,
                baseFeePaid: true,
                baseFeeAmount: 333,
                performanceBonusPaid: true,
                performanceBonusAmount: Math.floor(views / 1000) * 1.5,
                submittedAt: new Date(Date.now() - (55 - i * 2) * 24 * 60 * 60 * 1000),
                approvedAt: new Date(Date.now() - (53 - i * 2) * 24 * 60 * 60 * 1000),
                postedAt: new Date(Date.now() - (50 - i * 2) * 24 * 60 * 60 * 1000),
                lockedAt: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
            },
        });
    }

    // Create View Snapshots for Performance Tracking
    console.log('📊 Creating view snapshots...');
    const postedVideos = await prisma.video.findMany({
        where: { status: VideoStatus.POSTED },
        take: 5,
    });

    for (const video of postedVideos) {
        // Create multiple snapshots over time
        for (let day = 7; day >= 0; day--) {
            const baseViews = video.currentViewCount || 0;
            const viewCount = Math.floor(baseViews * (0.3 + (7 - day) * 0.1));
            await prisma.viewSnapshot.create({
                data: {
                    videoId: video.id,
                    viewCount,
                    dataSource: 'tiktok_api',
                    snapshotAt: new Date(Date.now() - day * 24 * 60 * 60 * 1000),
                },
            });
        }
    }

    // Create Payments
    console.log('💰 Creating payment records...');
    const allVideos = await prisma.video.findMany({
        where: {
            OR: [
                { baseFeePaid: true },
                { performanceBonusPaid: true },
            ],
        },
    });

    for (const video of allVideos) {
        if (video.baseFeePaid && video.baseFeeAmount) {
            await prisma.payment.create({
                data: {
                    recipientId: video.creatorId!,
                    amount: video.baseFeeAmount,
                    type: PaymentType.BASE_FEE,
                    status: PaymentStatus.COMPLETED,
                    campaignId: video.campaignId,
                    videoId: video.id,
                    processedAt: video.approvedAt || new Date(),
                },
            });
        }

        if (video.performanceBonusPaid && video.performanceBonusAmount) {
            await prisma.payment.create({
                data: {
                    recipientId: video.creatorId!,
                    amount: video.performanceBonusAmount,
                    type: PaymentType.PERFORMANCE_BONUS,
                    status: PaymentStatus.COMPLETED,
                    campaignId: video.campaignId,
                    videoId: video.id,
                    processedAt: video.lockedAt || new Date(),
                },
            });
        }
    }

    // Create Notifications
    console.log('🔔 Creating notifications...');
    await prisma.notification.createMany({
        data: [
            {
                userId: founder.id,
                type: NotificationType.VIDEO_STATUS,
                title: 'New Video Submitted',
                message: 'Mary Smith submitted a video for "Product Launch Campaign"',
                isRead: false,
            },
            {
                userId: founder.id,
                type: NotificationType.CAMPAIGN_INVITE,
                title: 'Campaign Milestone Reached',
                message: 'Product Launch Campaign has reached 90,000 views!',
                isRead: false,
            },
            {
                userId: founder.id,
                type: NotificationType.SYSTEM,
                title: 'Campaign Completed',
                message: 'Holiday Season Promo campaign completed successfully',
                isRead: true,
            },
            {
                userId: founder.id,
                type: NotificationType.PAYMENT,
                title: 'Payment Processed',
                message: 'Performance bonus of $80 paid to Mary Smith',
                isRead: true,
            },
            {
                userId: creator1.id,
                type: NotificationType.VIDEO_STATUS,
                title: 'Video Approved!',
                message: 'Your video for "Product Launch Campaign" has been approved',
                isRead: true,
            },
            {
                userId: creator1.id,
                type: NotificationType.PAYMENT,
                title: 'Payment Received',
                message: 'You received $380 for your video performance',
                isRead: true,
            },
        ],
    });

    console.log('✅ Enhanced seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: 4 (1 founder, 3 creators)`);
    console.log(`   - Campaigns: 5 (2 active, 2 completed, 1 draft)`);
    console.log(`   - Videos: 25+ (with performance data)`);
    console.log(`   - View Snapshots: 35+ (for performance tracking)`);
    console.log(`   - Payments: 40+ (base fees + bonuses)`);
    console.log(`   - Notifications: 6+`);
    console.log('\n🔐 Test Credentials:');
    console.log(`   Founder: mike21@gmail.com / Test123!@#`);
    console.log(`   Creator 1: mary57@gmail.com / Test123!@#`);
    console.log(`   Creator 2: john.creator@example.com / Test123!@#`);
    console.log(`   Creator 3: sarah.content@example.com / Test123!@#`);
    console.log('\n📈 Performance Overview Data:');
    console.log(`   - Total Views: 700,000+`);
    console.log(`   - Total Spend: $18,500`);
    console.log(`   - Active Campaigns: 2`);
    console.log(`   - Completed Campaigns: 2`);
    console.log(`   - Videos in Review: 1`);
    console.log(`   - Posted Videos: 20+`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
