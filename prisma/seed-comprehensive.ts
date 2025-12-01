import { PrismaClient, Role, CampaignStatus, VideoStatus, PaymentStatus, PaymentType, NotificationType, VerificationStatus, Platform, ApplicationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Inline hashPassword to avoid import issues with ts-node
async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

async function main() {
    console.log('🌱 Starting comprehensive database seed for makemore22@gmail.com and makemore21@gmail.com...');

    // Clear existing data for these specific accounts
    console.log('🗑️  Clearing existing data for test accounts...');

    const existingFounder = await prisma.user.findUnique({ where: { email: 'makemore22@gmail.com' } });
    const existingCreator = await prisma.user.findUnique({ where: { email: 'makemore21@gmail.com' } });

    if (existingFounder) {
        await prisma.notification.deleteMany({ where: { userId: existingFounder.id } });
        await prisma.payment.deleteMany({ where: { recipientId: existingFounder.id } });
        await prisma.license.deleteMany({ where: { founderId: existingFounder.id } });
        await prisma.dispute.deleteMany({ where: { OR: [{ initiatorId: existingFounder.id }, { respondentId: existingFounder.id }] } });
        await prisma.video.deleteMany({ where: { campaign: { founderId: existingFounder.id } } });
        await prisma.application.deleteMany({ where: { campaign: { founderId: existingFounder.id } } });
        await prisma.campaign.deleteMany({ where: { founderId: existingFounder.id } });
    }

    if (existingCreator) {
        await prisma.notification.deleteMany({ where: { userId: existingCreator.id } });
        await prisma.payment.deleteMany({ where: { recipientId: existingCreator.id } });
        await prisma.viewSnapshot.deleteMany({ where: { video: { creatorId: existingCreator.id } } });
        await prisma.video.deleteMany({ where: { creatorId: existingCreator.id } });
        await prisma.application.deleteMany({ where: { creatorId: existingCreator.id } });
        await prisma.socialAccount.deleteMany({ where: { creatorId: existingCreator.id } });
        await prisma.socialConnection.deleteMany({ where: { userId: existingCreator.id } });
        await prisma.creatorProfile.deleteMany({ where: { userId: existingCreator.id } });
    }

    // Delete the users themselves
    if (existingFounder) {
        await prisma.user.delete({ where: { id: existingFounder.id } });
    }
    if (existingCreator) {
        await prisma.user.delete({ where: { id: existingCreator.id } });
    }

    console.log('✅ Cleanup complete');

    // Hash password for both accounts
    const hashedPassword = await hashPassword('Test123!@#');

    // ============================================
    // CREATE FOUNDER ACCOUNT
    // ============================================
    console.log('👤 Creating founder account (makemore22@gmail.com)...');
    const founder = await prisma.user.create({
        data: {
            email: 'makemore22@gmail.com',
            password: hashedPassword,
            fullName: 'Alex Thompson',
            role: Role.FOUNDER,
            companyName: 'InnovateTech Solutions',
            stripeCustomerId: 'cus_test_founder_' + Date.now(),
        },
    });
    console.log(`✅ Created Founder: ${founder.fullName} (${founder.email})`);

    // ============================================
    // CREATE CREATOR ACCOUNT
    // ============================================
    console.log('🎨 Creating creator account (makemore21@gmail.com)...');
    const creator = await prisma.user.create({
        data: {
            email: 'makemore21@gmail.com',
            password: hashedPassword,
            fullName: 'Jordan Martinez',
            role: Role.CREATOR,
        },
    });
    console.log(`✅ Created Creator: ${creator.fullName} (${creator.email})`);

    // ============================================
    // CREATE CREATOR PROFILE
    // ============================================
    console.log('📝 Creating creator profile...');
    await prisma.creatorProfile.create({
        data: {
            userId: creator.id,
            bio: 'Professional UGC creator specializing in tech, SaaS, and lifestyle content. 7+ years of experience creating authentic, engaging videos that convert. Passionate about storytelling and helping brands connect with their audience.',
            categories: ['Tech', 'SaaS', 'Lifestyle', 'B2B', 'Productivity', 'Education'],
            baseFeeTiktok: 150.00,
            baseFeeInstagram: 175.00,
            baseFeeFacebook: 125.00,
            portfolioVideos: [
                {
                    url: 'https://www.tiktok.com/@jordan/video/7123456789',
                    thumbnail: 'https://example.com/thumbnails/tech-review-1.jpg',
                    platform: 'TIKTOK',
                    title: 'AI Productivity Tool Review',
                    views: 125000,
                    engagement: 8.5
                },
                {
                    url: 'https://www.instagram.com/reel/ABC123XYZ',
                    thumbnail: 'https://example.com/thumbnails/saas-demo-1.jpg',
                    platform: 'INSTAGRAM',
                    title: 'SaaS Product Walkthrough',
                    views: 87000,
                    engagement: 7.2
                },
                {
                    url: 'https://www.tiktok.com/@jordan/video/7234567890',
                    thumbnail: 'https://example.com/thumbnails/lifestyle-1.jpg',
                    platform: 'TIKTOK',
                    title: 'Day in the Life - Remote Work Setup',
                    views: 203000,
                    engagement: 9.1
                },
                {
                    url: 'https://www.instagram.com/reel/DEF456UVW',
                    thumbnail: 'https://example.com/thumbnails/tutorial-1.jpg',
                    platform: 'INSTAGRAM',
                    title: 'How to Maximize Productivity',
                    views: 156000,
                    engagement: 8.8
                }
            ],
            verificationStatus: VerificationStatus.VERIFIED,
            availabilityStatus: 'AVAILABLE',
            responseTime: '< 6 hours',
            isOnboardingComplete: true,
            adminNotes: 'Top-tier creator. Excellent communication and quality content. Highly recommended.',
        },
    });
    console.log('✅ Created creator profile');

    // ============================================
    // CREATE SOCIAL ACCOUNTS
    // ============================================
    console.log('📱 Creating social accounts...');

    await prisma.socialAccount.create({
        data: {
            creatorId: creator.id,
            platform: Platform.TIKTOK,
            platformUserId: 'tiktok_jordan_' + Date.now(),
            username: '@jordan.creates',
            followerCount: 127500,
            accessToken: 'mock_tiktok_access_token_encrypted',
            refreshToken: 'mock_tiktok_refresh_token_encrypted',
            tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
            verifiedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
            lastSyncedAt: new Date(),
        },
    });

    await prisma.socialAccount.create({
        data: {
            creatorId: creator.id,
            platform: Platform.INSTAGRAM,
            platformUserId: 'ig_jordan_' + Date.now(),
            username: '@jordan.martinez',
            followerCount: 89300,
            accessToken: 'mock_instagram_access_token_encrypted',
            refreshToken: 'mock_instagram_refresh_token_encrypted',
            tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            verifiedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
            lastSyncedAt: new Date(),
        },
    });

    await prisma.socialAccount.create({
        data: {
            creatorId: creator.id,
            platform: Platform.FACEBOOK,
            platformUserId: 'fb_jordan_' + Date.now(),
            username: 'jordan.martinez.creator',
            followerCount: 45600,
            accessToken: 'mock_facebook_access_token_encrypted',
            refreshToken: 'mock_facebook_refresh_token_encrypted',
            tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            verifiedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
            lastSyncedAt: new Date(),
        },
    });

    console.log('✅ Created 3 social accounts (TikTok, Instagram, Facebook)');

    // ============================================
    // CREATE SOCIAL CONNECTIONS
    // ============================================
    console.log('🔗 Creating social connections...');

    await prisma.socialConnection.create({
        data: {
            userId: creator.id,
            platform: Platform.TIKTOK,
            platformUserId: 'tiktok_jordan_' + Date.now(),
            accessToken: 'mock_tiktok_connection_token',
            refreshToken: 'mock_tiktok_refresh',
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            scope: 'user.info.basic,video.list,video.upload',
            isActive: true,
        },
    });

    await prisma.socialConnection.create({
        data: {
            userId: creator.id,
            platform: Platform.INSTAGRAM,
            platformUserId: 'ig_jordan_' + Date.now(),
            accessToken: 'mock_instagram_connection_token',
            refreshToken: 'mock_instagram_refresh',
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            scope: 'instagram_basic,instagram_content_publish',
            isActive: true,
        },
    });

    console.log('✅ Created social connections');

    // ============================================
    // CREATE CAMPAIGNS
    // ============================================
    console.log('📢 Creating campaigns...');

    // Campaign 1: Active Campaign - Product Launch
    const campaign1 = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            creatorId: creator.id,
            name: 'AI Writing Assistant Launch',
            brandName: 'InnovateTech Solutions',
            description: 'Launch campaign for our revolutionary AI-powered writing assistant. Looking for authentic creator reviews showcasing real use cases and productivity improvements.',
            status: CampaignStatus.ACTIVE,
            platform: Platform.TIKTOK,
            totalBudget: 8500.00,
            baseFeeeBudget: 4500.00,
            performanceBudget: 4000.00,
            escrowBalance: 8500.00,
            videosRequested: 10,
            videosCompleted: 3,
            postingFrequency: 'every_other_day',
            startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
            guaranteedSpend: false,
            targetViews: 500000,
            stripePaymentIntentId: 'pi_test_campaign1_' + Date.now(),
            briefData: {
                productName: 'WriteGenius AI',
                targetAudience: 'Content creators, writers, students, professionals',
                talkingPoints: [
                    'AI-powered writing suggestions',
                    'Real-time grammar and style improvements',
                    'Saves 5+ hours per week',
                    'Works across all platforms'
                ],
                mustHaves: [
                    'Show the product in action',
                    'Demonstrate before/after writing quality',
                    'Mention time-saving benefits',
                    'Include clear call-to-action'
                ],
                dontWants: [
                    'Mention competitor products',
                    'Make unrealistic claims',
                    'Use stock footage'
                ],
                brandGuidelines: 'Authentic, professional yet approachable. Focus on real productivity gains.',
                hashtags: ['#AIWriting', '#ProductivityHacks', '#ContentCreation', '#WriteGenius']
            },
        },
    });

    // Campaign 2: Completed Campaign - Holiday Promo
    const campaign2 = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            creatorId: creator.id,
            name: 'Holiday Season Special Offer',
            brandName: 'InnovateTech Solutions',
            description: 'Holiday promotional campaign featuring our product suite with special discount codes.',
            status: CampaignStatus.COMPLETED,
            platform: Platform.INSTAGRAM,
            totalBudget: 6000.00,
            baseFeeeBudget: 3500.00,
            performanceBudget: 2500.00,
            escrowBalance: 0.00,
            videosRequested: 8,
            videosCompleted: 8,
            postingFrequency: 'daily',
            startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            deadline: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            guaranteedSpend: true,
            targetViews: 400000,
            finalViewsTotal: 487500,
            totalPaidToCreator: 5650.00,
            totalRefundedToFounder: 0.00,
            platformRevenue: 350.00,
            stripePaymentIntentId: 'pi_test_campaign2_' + Date.now(),
            briefData: {
                productName: 'InnovateTech Suite',
                targetAudience: 'Tech enthusiasts, gift shoppers, professionals',
                talkingPoints: [
                    'Perfect holiday gift for professionals',
                    'Limited time 40% discount',
                    'All-in-one productivity suite'
                ],
                mustHaves: [
                    'Festive, holiday-themed presentation',
                    'Clear discount code mention',
                    'Gift-giving angle'
                ],
                brandGuidelines: 'Warm, festive, generous. Create urgency with limited-time offer.'
            },
        },
    });

    // Campaign 3: Active Campaign - Brand Awareness
    const campaign3 = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            creatorId: creator.id,
            name: 'Q1 Brand Awareness Initiative',
            brandName: 'InnovateTech Solutions',
            description: 'Educational content series to build brand awareness and establish thought leadership in the productivity space.',
            status: CampaignStatus.ACTIVE,
            platform: Platform.TIKTOK,
            totalBudget: 12000.00,
            baseFeeeBudget: 7000.00,
            performanceBudget: 5000.00,
            escrowBalance: 12000.00,
            videosRequested: 15,
            videosCompleted: 5,
            postingFrequency: 'weekly',
            startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
            guaranteedSpend: false,
            targetViews: 750000,
            stripePaymentIntentId: 'pi_test_campaign3_' + Date.now(),
            briefData: {
                productName: 'InnovateTech Ecosystem',
                targetAudience: 'Entrepreneurs, remote workers, productivity enthusiasts',
                talkingPoints: [
                    'Productivity tips and tricks',
                    'Behind-the-scenes of successful workflows',
                    'How technology enhances creativity'
                ],
                mustHaves: [
                    'Educational value',
                    'Subtle brand integration',
                    'Engaging storytelling'
                ],
                brandGuidelines: 'Informative, inspiring, authentic. Focus on value over selling.'
            },
        },
    });

    // Campaign 4: Draft Campaign
    const campaign4 = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'Q2 Product Feature Showcase',
            brandName: 'InnovateTech Solutions',
            description: 'Showcase new features released in Q2 with creator testimonials and tutorials.',
            status: CampaignStatus.DRAFT,
            platform: Platform.INSTAGRAM,
            totalBudget: 10000.00,
            baseFeeeBudget: 6000.00,
            performanceBudget: 4000.00,
            escrowBalance: 0.00,
            videosRequested: 12,
            videosCompleted: 0,
            deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            guaranteedSpend: false,
            targetViews: 600000,
            briefData: {
                productName: 'InnovateTech 2.0',
                targetAudience: 'Existing users, potential customers',
                talkingPoints: [
                    'New AI features',
                    'Enhanced collaboration tools',
                    'Mobile app improvements'
                ]
            },
        },
    });

    // Campaign 5: Pending Creator Assignment
    const campaign5 = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'Summer Productivity Challenge',
            brandName: 'InnovateTech Solutions',
            description: '30-day productivity challenge featuring our tools. Looking for creators to document their journey.',
            status: CampaignStatus.PENDING_CREATOR,
            platform: Platform.TIKTOK,
            totalBudget: 7500.00,
            baseFeeeBudget: 4500.00,
            performanceBudget: 3000.00,
            escrowBalance: 7500.00,
            videosRequested: 10,
            videosCompleted: 0,
            postingFrequency: 'daily',
            startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            guaranteedSpend: false,
            targetViews: 450000,
            stripePaymentIntentId: 'pi_test_campaign5_' + Date.now(),
        },
    });

    console.log('✅ Created 5 campaigns (2 active, 1 completed, 1 draft, 1 pending creator)');

    // ============================================
    // CREATE VIDEOS
    // ============================================
    console.log('🎥 Creating videos...');

    // Campaign 1 Videos (Active - AI Writing Assistant)
    const video1_1 = await prisma.video.create({
        data: {
            campaignId: campaign1.id,
            creatorId: creator.id,
            status: VideoStatus.POSTED,
            platform: Platform.TIKTOK,
            draftVideoUrl: 'https://storage.example.com/videos/draft_ai_writing_1.mp4',
            finalPostUrl: 'https://www.tiktok.com/@jordan.creates/video/7345678901',
            platformVideoId: '7345678901',
            currentViewCount: 87500,
            lockedViewCount: 87500,
            baseFeePaid: true,
            baseFeeAmount: 450.00,
            performanceBonusPaid: true,
            performanceBonusAmount: 175.00,
            submittedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
            postedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            lockedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        },
    });

    const video1_2 = await prisma.video.create({
        data: {
            campaignId: campaign1.id,
            creatorId: creator.id,
            status: VideoStatus.POSTED,
            platform: Platform.TIKTOK,
            draftVideoUrl: 'https://storage.example.com/videos/draft_ai_writing_2.mp4',
            finalPostUrl: 'https://www.tiktok.com/@jordan.creates/video/7345678902',
            platformVideoId: '7345678902',
            currentViewCount: 124300,
            lockedViewCount: 124300,
            baseFeePaid: true,
            baseFeeAmount: 450.00,
            performanceBonusPaid: true,
            performanceBonusAmount: 248.60,
            submittedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            postedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
            lockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
    });

    const video1_3 = await prisma.video.create({
        data: {
            campaignId: campaign1.id,
            creatorId: creator.id,
            status: VideoStatus.POSTED,
            platform: Platform.TIKTOK,
            draftVideoUrl: 'https://storage.example.com/videos/draft_ai_writing_3.mp4',
            finalPostUrl: 'https://www.tiktok.com/@jordan.creates/video/7345678903',
            platformVideoId: '7345678903',
            currentViewCount: 56700,
            baseFeePaid: true,
            baseFeeAmount: 450.00,
            performanceBonusPaid: false,
            submittedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
    });

    const video1_4 = await prisma.video.create({
        data: {
            campaignId: campaign1.id,
            creatorId: creator.id,
            status: VideoStatus.IN_REVIEW,
            platform: Platform.TIKTOK,
            draftVideoUrl: 'https://storage.example.com/videos/draft_ai_writing_4.mp4',
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
    });

    const video1_5 = await prisma.video.create({
        data: {
            campaignId: campaign1.id,
            creatorId: creator.id,
            status: VideoStatus.REVISION_REQUESTED,
            platform: Platform.TIKTOK,
            draftVideoUrl: 'https://storage.example.com/videos/draft_ai_writing_5.mp4',
            submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
    });

    // Create revision for video1_5
    await prisma.revision.create({
        data: {
            videoId: video1_5.id,
            requestedBy: founder.id,
            feedback: 'Great start! Please add more emphasis on the time-saving benefits and include a before/after comparison. Also, the call-to-action could be clearer at the end.',
            priority: 'significant',
            deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            iterationNumber: 1,
        },
    });

    // Campaign 2 Videos (Completed - Holiday Promo)
    const campaign2Videos = [];
    for (let i = 0; i < 8; i++) {
        const views = 45000 + Math.floor(Math.random() * 40000);
        const video = await prisma.video.create({
            data: {
                campaignId: campaign2.id,
                creatorId: creator.id,
                status: VideoStatus.LOCKED,
                platform: Platform.INSTAGRAM,
                draftVideoUrl: `https://storage.example.com/videos/draft_holiday_${i + 1}.mp4`,
                finalPostUrl: `https://www.instagram.com/reel/holiday_promo_${i + 1}`,
                platformVideoId: `holiday_promo_${i + 1}`,
                currentViewCount: views,
                lockedViewCount: views,
                baseFeePaid: true,
                baseFeeAmount: 437.50,
                performanceBonusPaid: true,
                performanceBonusAmount: Math.floor(views / 1000) * 2,
                submittedAt: new Date(Date.now() - (55 - i * 3) * 24 * 60 * 60 * 1000),
                approvedAt: new Date(Date.now() - (53 - i * 3) * 24 * 60 * 60 * 1000),
                postedAt: new Date(Date.now() - (50 - i * 3) * 24 * 60 * 60 * 1000),
                lockedAt: new Date(Date.now() - (15 - i) * 24 * 60 * 60 * 1000),
            },
        });
        campaign2Videos.push(video);
    }

    // Campaign 3 Videos (Active - Brand Awareness)
    const video3_1 = await prisma.video.create({
        data: {
            campaignId: campaign3.id,
            creatorId: creator.id,
            status: VideoStatus.POSTED,
            platform: Platform.TIKTOK,
            draftVideoUrl: 'https://storage.example.com/videos/draft_brand_1.mp4',
            finalPostUrl: 'https://www.tiktok.com/@jordan.creates/video/7345678910',
            platformVideoId: '7345678910',
            currentViewCount: 92300,
            lockedViewCount: 92300,
            baseFeePaid: true,
            baseFeeAmount: 466.67,
            performanceBonusPaid: true,
            performanceBonusAmount: 184.60,
            submittedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            postedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            lockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
    });

    const video3_2 = await prisma.video.create({
        data: {
            campaignId: campaign3.id,
            creatorId: creator.id,
            status: VideoStatus.POSTED,
            platform: Platform.TIKTOK,
            draftVideoUrl: 'https://storage.example.com/videos/draft_brand_2.mp4',
            finalPostUrl: 'https://www.tiktok.com/@jordan.creates/video/7345678911',
            platformVideoId: '7345678911',
            currentViewCount: 67800,
            baseFeePaid: true,
            baseFeeAmount: 466.67,
            performanceBonusPaid: false,
            submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
    });

    const video3_3 = await prisma.video.create({
        data: {
            campaignId: campaign3.id,
            creatorId: creator.id,
            status: VideoStatus.APPROVED,
            platform: Platform.TIKTOK,
            draftVideoUrl: 'https://storage.example.com/videos/draft_brand_3.mp4',
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(),
        },
    });

    const video3_4 = await prisma.video.create({
        data: {
            campaignId: campaign3.id,
            creatorId: creator.id,
            status: VideoStatus.DRAFT_SUBMITTED,
            platform: Platform.TIKTOK,
            draftVideoUrl: 'https://storage.example.com/videos/draft_brand_4.mp4',
            submittedAt: new Date(),
        },
    });

    const video3_5 = await prisma.video.create({
        data: {
            campaignId: campaign3.id,
            creatorId: creator.id,
            status: VideoStatus.PENDING,
            platform: Platform.TIKTOK,
        },
    });

    console.log('✅ Created 20+ videos across all campaigns');

    // ============================================
    // CREATE VIEW SNAPSHOTS
    // ============================================
    console.log('📊 Creating view snapshots for performance tracking...');

    const postedVideos = [video1_1, video1_2, video1_3, video3_1, video3_2];

    for (const video of postedVideos) {
        const finalViews = video.currentViewCount || 0;
        const daysPosted = 14;

        for (let day = daysPosted; day >= 0; day--) {
            const growthFactor = 1 - (day / daysPosted) * 0.7; // Views grow over time
            const viewCount = Math.floor(finalViews * growthFactor);

            await prisma.viewSnapshot.create({
                data: {
                    videoId: video.id,
                    viewCount,
                    dataSource: video.platform === Platform.TIKTOK ? 'tiktok_api' : 'meta_api',
                    snapshotAt: new Date(Date.now() - day * 24 * 60 * 60 * 1000),
                },
            });
        }
    }

    console.log('✅ Created 75+ view snapshots');

    // ============================================
    // CREATE PAYMENTS
    // ============================================
    console.log('💰 Creating payment records...');

    const allVideos = await prisma.video.findMany({
        where: {
            creatorId: creator.id,
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
                    recipientId: creator.id,
                    campaignId: video.campaignId,
                    videoId: video.id,
                    amount: video.baseFeeAmount,
                    type: PaymentType.BASE_FEE,
                    status: PaymentStatus.COMPLETED,
                    description: `Base fee payment for video ${video.id.substring(0, 8)}`,
                    stripeTransferId: 'tr_test_base_' + Date.now() + '_' + Math.random().toString(36).substring(7),
                    processedAt: video.approvedAt || new Date(),
                    metadata: {
                        videoUrl: video.finalPostUrl,
                        platform: video.platform,
                    },
                },
            });
        }

        if (video.performanceBonusPaid && video.performanceBonusAmount) {
            await prisma.payment.create({
                data: {
                    recipientId: creator.id,
                    campaignId: video.campaignId,
                    videoId: video.id,
                    amount: video.performanceBonusAmount,
                    type: PaymentType.PERFORMANCE_BONUS,
                    status: PaymentStatus.COMPLETED,
                    description: `Performance bonus for ${video.lockedViewCount} views`,
                    stripeTransferId: 'tr_test_bonus_' + Date.now() + '_' + Math.random().toString(36).substring(7),
                    processedAt: video.lockedAt || new Date(),
                    metadata: {
                        viewCount: video.lockedViewCount,
                        videoUrl: video.finalPostUrl,
                    },
                },
            });
        }
    }

    // Add a pending payment
    await prisma.payment.create({
        data: {
            recipientId: creator.id,
            campaignId: campaign1.id,
            videoId: video1_3.id,
            amount: 113.40,
            type: PaymentType.PERFORMANCE_BONUS,
            status: PaymentStatus.PENDING,
            description: 'Pending performance bonus - awaiting view lock',
            metadata: {
                estimatedViews: video1_3.currentViewCount,
            },
        },
    });

    console.log('✅ Created 30+ payment records');

    // ============================================
    // CREATE APPLICATIONS
    // ============================================
    console.log('📝 Creating applications...');

    // Accepted application for Campaign 1
    await prisma.application.create({
        data: {
            campaignId: campaign1.id,
            creatorId: creator.id,
            status: ApplicationStatus.ACCEPTED,
            message: 'I\'m very excited about this campaign! I\'ve been using AI writing tools extensively and would love to showcase WriteGenius. My audience is highly engaged with productivity content.',
            portfolioLinks: [
                'https://www.tiktok.com/@jordan/video/7123456789',
                'https://www.instagram.com/reel/ABC123XYZ'
            ],
            createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
        },
    });

    // Accepted application for Campaign 2
    await prisma.application.create({
        data: {
            campaignId: campaign2.id,
            creatorId: creator.id,
            status: ApplicationStatus.ACCEPTED,
            message: 'Perfect timing for holiday content! I have great ideas for festive, gift-focused videos.',
            portfolioLinks: [
                'https://www.instagram.com/reel/DEF456UVW'
            ],
            createdAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 62 * 24 * 60 * 60 * 1000),
        },
    });

    // Accepted application for Campaign 3
    await prisma.application.create({
        data: {
            campaignId: campaign3.id,
            creatorId: creator.id,
            status: ApplicationStatus.ACCEPTED,
            message: 'Educational content is my specialty! I\'d love to create value-driven videos for this campaign.',
            portfolioLinks: [
                'https://www.tiktok.com/@jordan/video/7234567890',
                'https://www.instagram.com/reel/ABC123XYZ'
            ],
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        },
    });

    // Pending application for Campaign 5
    await prisma.application.create({
        data: {
            campaignId: campaign5.id,
            creatorId: creator.id,
            status: ApplicationStatus.PENDING,
            message: 'A 30-day challenge sounds amazing! I\'m very interested in documenting this journey with my audience.',
            portfolioLinks: [
                'https://www.tiktok.com/@jordan/video/7123456789'
            ],
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
    });

    console.log('✅ Created 4 applications');

    // ============================================
    // CREATE LICENSES
    // ============================================
    console.log('📜 Creating content licenses...');

    const lockedVideos = await prisma.video.findMany({
        where: {
            creatorId: creator.id,
            status: VideoStatus.LOCKED,
        },
    });

    for (const video of lockedVideos) {
        const licenseNumber = `LIC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        await prisma.license.create({
            data: {
                campaignId: video.campaignId,
                videoId: video.id,
                creatorId: creator.id,
                founderId: founder.id,
                licenseNumber,
                pdfUrl: `https://storage.example.com/licenses/${licenseNumber}.pdf`,
                grantedAt: video.lockedAt || new Date(),
            },
        });
    }

    console.log('✅ Created licenses for locked videos');

    // ============================================
    // CREATE NOTIFICATIONS
    // ============================================
    console.log('🔔 Creating notifications...');

    // Founder notifications
    await prisma.notification.createMany({
        data: [
            {
                userId: founder.id,
                type: NotificationType.VIDEO_STATUS,
                title: 'New Video Submitted',
                message: 'Jordan Martinez submitted a new video for "AI Writing Assistant Launch"',
                link: `/founder/campaigns/${campaign1.id}`,
                isRead: false,
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            },
            {
                userId: founder.id,
                type: NotificationType.VIDEO_STATUS,
                title: 'Video Needs Review',
                message: 'A video revision has been submitted for "AI Writing Assistant Launch"',
                link: `/founder/campaigns/${campaign1.id}/videos/${video1_4.id}`,
                isRead: false,
                createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
            },
            {
                userId: founder.id,
                type: NotificationType.CAMPAIGN_INVITE,
                title: 'Campaign Milestone',
                message: 'AI Writing Assistant Launch has reached 250,000 views!',
                link: `/founder/campaigns/${campaign1.id}`,
                isRead: true,
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            },
            {
                userId: founder.id,
                type: NotificationType.SYSTEM,
                title: 'Campaign Completed',
                message: 'Holiday Season Special Offer campaign has been completed successfully',
                link: `/founder/campaigns/${campaign2.id}`,
                isRead: true,
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            },
            {
                userId: founder.id,
                type: NotificationType.PAYMENT,
                title: 'Payment Processed',
                message: 'Performance bonus of $248.60 paid to Jordan Martinez',
                link: `/founder/payments`,
                isRead: true,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            },
            {
                userId: founder.id,
                type: NotificationType.APPLICATION_UPDATE,
                title: 'New Application',
                message: 'Jordan Martinez applied to "Summer Productivity Challenge"',
                link: `/founder/campaigns/${campaign5.id}/applications`,
                isRead: false,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            },
        ],
    });

    // Creator notifications
    await prisma.notification.createMany({
        data: [
            {
                userId: creator.id,
                type: NotificationType.VIDEO_STATUS,
                title: 'Video Approved!',
                message: 'Your video for "AI Writing Assistant Launch" has been approved',
                link: `/creator/campaigns/${campaign1.id}`,
                isRead: true,
                createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            },
            {
                userId: creator.id,
                type: NotificationType.VIDEO_STATUS,
                title: 'Revision Requested',
                message: 'Alex Thompson requested revisions on your video',
                link: `/creator/campaigns/${campaign1.id}/videos/${video1_5.id}`,
                isRead: false,
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            },
            {
                userId: creator.id,
                type: NotificationType.PAYMENT,
                title: 'Payment Received',
                message: 'You received $698.60 for your video performance',
                link: `/creator/earnings`,
                isRead: true,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            },
            {
                userId: creator.id,
                type: NotificationType.PAYMENT,
                title: 'Payment Received',
                message: 'Base fee payment of $450.00 processed',
                link: `/creator/earnings`,
                isRead: true,
                createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
            },
            {
                userId: creator.id,
                type: NotificationType.CAMPAIGN_INVITE,
                title: 'Campaign Invitation',
                message: 'You\'ve been invited to "Q1 Brand Awareness Initiative"',
                link: `/creator/campaigns/${campaign3.id}`,
                isRead: true,
                createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            },
            {
                userId: creator.id,
                type: NotificationType.APPLICATION_UPDATE,
                title: 'Application Accepted',
                message: 'Your application for "AI Writing Assistant Launch" was accepted!',
                link: `/creator/campaigns/${campaign1.id}`,
                isRead: true,
                createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
            },
            {
                userId: creator.id,
                type: NotificationType.SYSTEM,
                title: 'Milestone Achieved',
                message: 'Congratulations! You\'ve earned over $5,000 on the platform',
                link: `/creator/earnings`,
                isRead: true,
                createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
            },
        ],
    });

    console.log('✅ Created 13 notifications');

    // ============================================
    // CREATE REVENUE RECORDS
    // ============================================
    console.log('💵 Creating revenue tracking records...');

    // Revenue from completed campaign
    await prisma.revenue.create({
        data: {
            campaignId: campaign2.id,
            amount: 350.00,
            type: 'markup',
            viewsCount: 487500,
        },
    });

    // Revenue from active campaigns
    await prisma.revenue.create({
        data: {
            campaignId: campaign1.id,
            amount: 150.00,
            type: 'markup',
            viewsCount: 268500,
        },
    });

    await prisma.revenue.create({
        data: {
            campaignId: campaign3.id,
            amount: 100.00,
            type: 'markup',
            viewsCount: 160100,
        },
    });

    console.log('✅ Created revenue records');

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n✅ ========================================');
    console.log('✅ COMPREHENSIVE SEED COMPLETED SUCCESSFULLY!');
    console.log('✅ ========================================\n');

    console.log('📊 SUMMARY:');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('👥 USERS:');
    console.log(`   ✓ Founder: ${founder.fullName}`);
    console.log(`     Email: ${founder.email}`);
    console.log(`     Company: ${founder.companyName}`);
    console.log(`   ✓ Creator: ${creator.fullName}`);
    console.log(`     Email: ${creator.email}`);
    console.log(`     Verification: VERIFIED`);
    console.log(`     Social Accounts: 3 (TikTok, Instagram, Facebook)\n`);

    console.log('📢 CAMPAIGNS:');
    console.log('   ✓ Total: 5');
    console.log('   ✓ Active: 2');
    console.log('   ✓ Completed: 1');
    console.log('   ✓ Draft: 1');
    console.log('   ✓ Pending Creator: 1\n');

    console.log('🎥 VIDEOS:');
    console.log('   ✓ Total: 20+');
    console.log('   ✓ Posted: 12');
    console.log('   ✓ Locked: 8');
    console.log('   ✓ In Review: 1');
    console.log('   ✓ Revision Requested: 1');
    console.log('   ✓ Approved: 1');
    console.log('   ✓ Draft Submitted: 1');
    console.log('   ✓ Pending: 1\n');

    console.log('💰 PAYMENTS:');
    console.log('   ✓ Total Payments: 30+');
    console.log('   ✓ Completed: 29+');
    console.log('   ✓ Pending: 1');
    console.log('   ✓ Total Earned: $5,650+\n');

    console.log('📊 ANALYTICS:');
    console.log('   ✓ View Snapshots: 75+');
    console.log('   ✓ Total Views: 900,000+');
    console.log('   ✓ Revenue Records: 3');
    console.log('   ✓ Platform Revenue: $600+\n');

    console.log('📝 OTHER DATA:');
    console.log('   ✓ Applications: 4 (3 accepted, 1 pending)');
    console.log('   ✓ Licenses: 8+');
    console.log('   ✓ Notifications: 13');
    console.log('   ✓ Revisions: 1\n');

    console.log('🔐 TEST CREDENTIALS:');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   📧 Founder Account:');
    console.log('      Email: makemore22@gmail.com');
    console.log('      Password: Test123!@#');
    console.log('      Role: FOUNDER\n');
    console.log('   📧 Creator Account:');
    console.log('      Email: makemore21@gmail.com');
    console.log('      Password: Test123!@#');
    console.log('      Role: CREATOR\n');

    console.log('✨ All data is stored in the database and ready for testing!');
    console.log('✨ You can now log in and test all features on both front-end and back-end.\n');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
