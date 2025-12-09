import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting E2E Test Scenarios Seed...\n');

    // ============================================
    // CLEANUP EXISTING TEST DATA
    // ============================================
    console.log('🧹 Cleaning up existing test data...');

    const testEmails = ['mike21@gmail.com', 'mary57@gmail.com'];

    for (const email of testEmails) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            // Delete all related records
            await prisma.aBTestPerformanceSnapshot.deleteMany({ where: { test: { campaign: { founderId: user.id } } } });
            await prisma.aBTestVariant.deleteMany({ where: { test: { campaign: { founderId: user.id } } } });
            await prisma.aBTest.deleteMany({ where: { campaign: { founderId: user.id } } });
            await prisma.founderVideoSnapshot.deleteMany({ where: { video: { founderId: user.id } } });
            await prisma.founderVideo.deleteMany({ where: { founderId: user.id } });
            await prisma.instructionAudit.deleteMany({ where: { instruction: { campaign: { founderId: user.id } } } });
            await prisma.instruction.deleteMany({ where: { campaign: { founderId: user.id } } });
            await prisma.viewSnapshot.deleteMany({ where: { video: { campaign: { founderId: user.id } } } });
            await prisma.video.deleteMany({ where: { campaign: { founderId: user.id } } });
            await prisma.application.deleteMany({ where: { campaign: { founderId: user.id } } });
            await prisma.notification.deleteMany({ where: { userId: user.id } });
            await prisma.payment.deleteMany({ where: { campaign: { founderId: user.id } } });
            await prisma.campaign.deleteMany({ where: { founderId: user.id } });
            await prisma.socialAccount.deleteMany({ where: { creatorId: user.id } });
            await prisma.creatorProfile.deleteMany({ where: { userId: user.id } });
            await prisma.user.delete({ where: { id: user.id } });
        }
    }

    console.log('✅ Cleanup complete\n');

    // ============================================
    // CREATE TEST ACCOUNTS
    // ============================================
    console.log('👥 Creating test accounts...');

    const hashedPassword = await bcrypt.hash('Test123!', 10);

    // Create Mike (Founder)
    const mike = await prisma.user.create({
        data: {
            email: 'mike21@gmail.com',
            password: hashedPassword,
            role: 'FOUNDER',
            fullName: 'Mike Johnson',
            companyName: 'TechCorp Inc.',
            companyIndustry: 'Technology',
            companySize: '50-100',
            companyWebsite: 'https://techcorp.example.com',
            stripeCustomerId: 'cus_test_mike_123',
            emailVerified: true,
            emailVerifiedAt: new Date(),
        },
    });
    console.log(`✅ Created Founder: ${mike.email}`);

    // Create Mary (Creator)
    const mary = await prisma.user.create({
        data: {
            email: 'mary57@gmail.com',
            password: hashedPassword,
            role: 'CREATOR',
            fullName: 'Mary Williams',
            stripeAccountId: 'acct_test_mary_456',
            emailVerified: true,
            emailVerifiedAt: new Date(),
            creatorProfile: {
                create: {
                    bio: 'Professional content creator specializing in tech product reviews and tutorials. 5+ years experience.',
                    categories: ['Technology', 'SaaS', 'Product Reviews'],
                    baseFeeTiktok: 75.00,
                    baseFeeInstagram: 75.00,
                    baseFeeFacebook: 75.00,
                    verificationStatus: 'VERIFIED',
                    isOnboardingComplete: true,
                    rankingScore: 85,
                    videoQualityScore: 4.5,
                    avgRating: 4.8,
                    totalReviews: 12,
                },
            },
        },
    });
    console.log(`✅ Created Creator: ${mary.email}`);

    // Add social accounts for Mary
    await prisma.socialAccount.createMany({
        data: [
            {
                creatorId: mary.id,
                platform: 'TIKTOK',
                platformUserId: 'mary_tech_reviews',
                username: '@mary_tech_reviews',
                followerCount: 125000,
                verifiedAt: new Date(),
            },
            {
                creatorId: mary.id,
                platform: 'INSTAGRAM',
                platformUserId: 'mary.williams.tech',
                username: '@mary.williams.tech',
                followerCount: 85000,
                verifiedAt: new Date(),
            },
        ],
    });
    console.log('✅ Added social accounts for Mary\n');

    // ============================================
    // CAMPAIGN A: OPEN FOR APPLICATIONS
    // ============================================
    console.log('📋 Creating Campaign A: Open for Applications...');

    const campaignA = await prisma.campaign.create({
        data: {
            founderId: mike.id,
            name: 'Summer Product Launch 2024',
            brandName: 'TechCorp',
            description: 'Launch campaign for our new AI-powered productivity tool. Looking for creators who can demonstrate the product in real-world scenarios.',
            status: 'ACTIVE_ACCEPTING_APPLICATIONS',
            platform: 'TIKTOK',
            totalBudget: 2000.00,
            baseFeeBudget: 750.00,
            performanceBudget: 1250.00,
            escrowBalance: 2000.00,
            baseFeePerVideo: 75.00,
            performanceRate: 4.00,
            videosRequested: 3,
            targetViews: 150000,
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            eligibilityRules: {
                minFollowers: 50000,
                platforms: ['TIKTOK'],
                categories: ['Technology', 'SaaS', 'Product Reviews'],
                minRating: 4.0,
            },
            briefData: {
                productName: 'AI TaskMaster Pro',
                targetAudience: 'Professionals, entrepreneurs, productivity enthusiasts',
                keyFeatures: ['AI-powered task prioritization', 'Smart scheduling', 'Team collaboration'],
                tone: 'Professional yet approachable',
                callToAction: 'Visit our website for a free trial',
            },
        },
    });

    // Add instructions for Campaign A (with acknowledgment tracking)
    await prisma.instruction.createMany({
        data: [
            {
                campaignId: campaignA.id,
                authorId: mike.id,
                text: '<h3>Overall Campaign Guidelines</h3><p>Please showcase the AI TaskMaster Pro in a real work scenario. Focus on how it saves time and improves productivity.</p><ul><li>Video length: 30-60 seconds</li><li>Show the app interface clearly</li><li>Include before/after comparison</li></ul>',
                appliesTo: 'all',
                instructionType: 'OVERALL_CAMPAIGN',
                requiresAcknowledgment: true,
                status: 'OPEN',
            },
            {
                campaignId: campaignA.id,
                authorId: mike.id,
                text: '<h3>Video #1: Morning Routine</h3><p>Show how you use AI TaskMaster Pro to plan your morning and prioritize tasks for the day.</p>',
                appliesTo: 'all',
                instructionType: 'VIDEO_SPECIFIC',
                videoNumber: 1,
                requiresAcknowledgment: true,
                status: 'OPEN',
            },
            {
                campaignId: campaignA.id,
                authorId: mike.id,
                text: '<h3>Video #2: Team Collaboration</h3><p>Demonstrate the team features and how multiple people can collaborate on projects.</p>',
                appliesTo: 'all',
                instructionType: 'VIDEO_SPECIFIC',
                videoNumber: 2,
                requiresAcknowledgment: true,
                status: 'OPEN',
            },
            {
                campaignId: campaignA.id,
                authorId: mike.id,
                text: '<h3>Video #3: Results Showcase</h3><p>Share your productivity improvements after using the app for a week.</p>',
                appliesTo: 'all',
                instructionType: 'VIDEO_SPECIFIC',
                videoNumber: 3,
                requiresAcknowledgment: true,
                status: 'OPEN',
            },
        ],
    });

    console.log(`✅ Campaign A created: ${campaignA.name}\n`);

    // ============================================
    // CAMPAIGN B: IN REVIEW STAGE
    // ============================================
    console.log('📋 Creating Campaign B: In Review Stage...');

    const campaignB = await prisma.campaign.create({
        data: {
            founderId: mike.id,
            name: 'Holiday Campaign - Video Reviews',
            brandName: 'TechCorp',
            description: 'Holiday season campaign showcasing our gift guide products.',
            status: 'IN_PROGRESS',
            platform: 'TIKTOK',
            totalBudget: 1500.00,
            baseFeeBudget: 600.00,
            performanceBudget: 900.00,
            escrowBalance: 1500.00,
            baseFeePerVideo: 75.00,
            performanceRate: 4.00,
            videosRequested: 2,
            targetViews: 100000,
            deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
            acceptedCreatorsCount: 1,
        },
    });

    // Accept Mary for Campaign B
    const applicationB = await prisma.application.create({
        data: {
            campaignId: campaignB.id,
            creatorId: mary.id,
            status: 'ACCEPTED',
            message: 'I would love to work on this holiday campaign! I have experience with tech gift guides.',
            portfolioLinks: ['https://tiktok.com/@mary_tech_reviews/video1', 'https://tiktok.com/@mary_tech_reviews/video2'],
            acceptedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            assignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
    });

    // Create video in DRAFT_SUBMITTED status
    const videoB1 = await prisma.video.create({
        data: {
            campaignId: campaignB.id,
            creatorId: mary.id,
            platform: 'TIKTOK',
            status: 'DRAFT_SUBMITTED',
            videoNumber: 1,
            title: 'Holiday Tech Gift Guide - Top Picks',
            draftVideoUrl: 'https://storage.example.com/drafts/mary_holiday_v1.mp4',
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            baseFeeAmount: 75.00,
            founderComments: 'Great hook! Please adjust the CTA at 0:45 to mention our holiday discount code. Also, add more product close-ups in the second half.',
            revisionDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
            lastReviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
    });

    // Create notification for revision request
    await prisma.notification.create({
        data: {
            userId: mary.id,
            type: 'VIDEO_STATUS',
            title: 'Revision Requested',
            message: 'Mike has requested revisions for your Holiday Campaign video',
            link: `/creator/tasks/${videoB1.id}`,
            isRead: false,
        },
    });

    console.log(`✅ Campaign B created: ${campaignB.name}\n`);

    // ============================================
    // CAMPAIGN C: READY FOR FINAL APPROVAL
    // ============================================
    console.log('📋 Creating Campaign C: Ready for Final Approval...');

    const campaignC = await prisma.campaign.create({
        data: {
            founderId: mike.id,
            name: 'Product Demo - Final Approval',
            brandName: 'TechCorp',
            description: 'Detailed product demonstration for our flagship product.',
            status: 'IN_PROGRESS',
            platform: 'TIKTOK',
            totalBudget: 1200.00,
            baseFeeBudget: 400.00,
            performanceBudget: 800.00,
            escrowBalance: 1200.00,
            baseFeePerVideo: 75.00,
            performanceRate: 4.00,
            videosRequested: 1,
            targetViews: 75000,
            deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            acceptedCreatorsCount: 1,
        },
    });

    const applicationC = await prisma.application.create({
        data: {
            campaignId: campaignC.id,
            creatorId: mary.id,
            status: 'ACCEPTED',
            message: 'Perfect fit for my audience!',
            portfolioLinks: ['https://tiktok.com/@mary_tech_reviews/demo1'],
            acceptedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            assignedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
    });

    const videoC1 = await prisma.video.create({
        data: {
            campaignId: campaignC.id,
            creatorId: mary.id,
            platform: 'TIKTOK',
            status: 'APPROVED',
            videoNumber: 1,
            title: 'Complete Product Demo - AI TaskMaster',
            draftVideoUrl: 'https://storage.example.com/drafts/mary_demo_final.mp4',
            submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Approved yesterday
            baseFeeAmount: 75.00,
            baseFeePaid: false, // Payment pending
        },
    });

    // Create pending payment
    await prisma.payment.create({
        data: {
            campaignId: campaignC.id,
            videoId: videoC1.id,
            recipientId: mary.id,
            amount: 75.00,
            type: 'BASE_FEE',
            status: 'PENDING',
            description: 'Base fee for Product Demo video',
        },
    });

    console.log(`✅ Campaign C created: ${campaignC.name}\n`);

    // ============================================
    // CAMPAIGN D: FULLY COMPLETED
    // ============================================
    console.log('📋 Creating Campaign D: Fully Completed with A/B Testing...');

    const campaignD = await prisma.campaign.create({
        data: {
            founderId: mike.id,
            name: 'A/B Test Campaign - Completed',
            brandName: 'TechCorp',
            description: 'Completed campaign with A/B testing to determine best hook style.',
            status: 'COMPLETED',
            platform: 'TIKTOK',
            totalBudget: 3000.00,
            baseFeeBudget: 1200.00,
            performanceBudget: 1800.00,
            escrowBalance: 0.00, // All paid out
            baseFeePerVideo: 75.00,
            performanceRate: 4.00,
            videosRequested: 3,
            videosCompleted: 3,
            targetViews: 200000,
            finalViewsTotal: 245000,
            totalPaidToCreator: 1200.00,
            platformRevenue: 300.00,
            totalRefundedToFounder: 500.00,
            completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            acceptedCreatorsCount: 1,
        },
    });

    const applicationD = await prisma.application.create({
        data: {
            campaignId: campaignD.id,
            creatorId: mary.id,
            status: 'ACCEPTED',
            message: 'Excited to test different hooks!',
            portfolioLinks: ['https://tiktok.com/@mary_tech_reviews/hook1'],
            acceptedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
            assignedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        },
    });

    // Create 3 completed videos
    const videoD1 = await prisma.video.create({
        data: {
            campaignId: campaignD.id,
            creatorId: mary.id,
            platform: 'TIKTOK',
            status: 'LOCKED',
            videoNumber: 1,
            title: 'Hook Test - Question Style',
            draftVideoUrl: 'https://storage.example.com/videos/mary_hook_question.mp4',
            finalPostUrl: 'https://tiktok.com/@mary_tech_reviews/video_d1',
            platformVideoId: '7234567890123456789',
            submittedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000),
            postedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
            lockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            currentViewCount: 50000,
            lockedViewCount: 50000,
            baseFeeAmount: 75.00,
            baseFeePaid: true,
            performanceBonusAmount: 200.00,
            performanceBonusPaid: true,
            performanceMetrics: {
                likes: 2500,
                comments: 180,
                shares: 320,
                engagementRate: 6.0,
            },
        },
    });

    const videoD2 = await prisma.video.create({
        data: {
            campaignId: campaignD.id,
            creatorId: mary.id,
            platform: 'TIKTOK',
            status: 'LOCKED',
            videoNumber: 2,
            title: 'Hook Test - Shocking Stat',
            draftVideoUrl: 'https://storage.example.com/videos/mary_hook_stat.mp4',
            finalPostUrl: 'https://tiktok.com/@mary_tech_reviews/video_d2',
            platformVideoId: '7234567890123456790',
            submittedAt: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
            postedAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000),
            lockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            currentViewCount: 75000,
            lockedViewCount: 75000,
            baseFeeAmount: 75.00,
            baseFeePaid: true,
            performanceBonusAmount: 300.00,
            performanceBonusPaid: true,
            performanceMetrics: {
                likes: 4200,
                comments: 290,
                shares: 580,
                engagementRate: 7.0,
            },
        },
    });

    const videoD3 = await prisma.video.create({
        data: {
            campaignId: campaignD.id,
            creatorId: mary.id,
            platform: 'TIKTOK',
            status: 'LOCKED',
            videoNumber: 3,
            title: 'Hook Test - Story Opening',
            draftVideoUrl: 'https://storage.example.com/videos/mary_hook_story.mp4',
            finalPostUrl: 'https://tiktok.com/@mary_tech_reviews/video_d3',
            platformVideoId: '7234567890123456791',
            submittedAt: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000),
            postedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
            lockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            currentViewCount: 120000,
            lockedViewCount: 120000,
            baseFeeAmount: 75.00,
            baseFeePaid: true,
            performanceBonusAmount: 480.00,
            performanceBonusPaid: true,
            performanceMetrics: {
                likes: 8400,
                comments: 520,
                shares: 1100,
                engagementRate: 8.5,
            },
        },
    });

    // Create view snapshots for historical tracking
    for (const video of [videoD1, videoD2, videoD3]) {
        const baseViews = video.lockedViewCount! / 10;
        for (let i = 0; i < 10; i++) {
            await prisma.viewSnapshot.create({
                data: {
                    videoId: video.id,
                    viewCount: Math.floor(baseViews * (i + 1)),
                    dataSource: 'tiktok_api',
                    snapshotAt: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000),
                },
            });
        }
    }

    // Create A/B Test
    const abTest = await prisma.aBTest.create({
        data: {
            campaignId: campaignD.id,
            name: 'Hook Comparison Test',
            description: 'Testing different hook styles to determine which generates the most engagement',
            hypothesis: 'Story-based hooks will generate higher engagement than question or stat-based hooks',
            testGoal: 'BEST_HOOK',
            successMetric: 'ENGAGEMENT_RATE',
            status: 'COMPLETED',
            assignedCreatorIds: [mary.id],
            testVariables: {
                variantA: {
                    title: 'Question Hook',
                    description: 'Start with an intriguing question',
                    example: 'What if I told you there\'s a better way to manage your tasks?',
                },
                variantB: {
                    title: 'Shocking Stat Hook',
                    description: 'Open with a surprising statistic',
                    example: '73% of professionals waste 2 hours daily on task management',
                },
                variantC: {
                    title: 'Story Hook',
                    description: 'Begin with a relatable story',
                    example: 'I used to spend hours organizing my to-do list...',
                },
            },
            trackingMetrics: ['views', 'engagement', 'watchTime', 'shares'],
            startDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            deployedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            winnerVariantId: '', // Will set after creating variants
            confidence: 85.5,
            conclusionNotes: 'Story-based hook (Variant C) significantly outperformed other variants with 120K views and 8.5% engagement rate. Recommend using story-based hooks for future campaigns.',
            adoptAction: 'CONVERT_TO_FORMAT',
        },
    });

    // Create A/B Test Variants
    const variantA = await prisma.aBTestVariant.create({
        data: {
            testId: abTest.id,
            variantName: 'Variant A',
            label: 'Question Hook',
            description: 'Hook using an intriguing question',
            variantType: 'HOOK',
            creatorId: mary.id,
            videoId: videoD1.id,
            approvalStatus: 'DEPLOYED',
            videoUploadUrl: videoD1.draftVideoUrl,
            uploadedAt: videoD1.submittedAt,
            approvedAt: videoD1.approvedAt,
            deployedAt: videoD1.postedAt,
            views: 50000,
            engagement: 3000,
            conversions: 250,
            performanceScore: 6.0,
        },
    });

    const variantB = await prisma.aBTestVariant.create({
        data: {
            testId: abTest.id,
            variantName: 'Variant B',
            label: 'Shocking Stat Hook',
            description: 'Hook using a surprising statistic',
            variantType: 'HOOK',
            creatorId: mary.id,
            videoId: videoD2.id,
            approvalStatus: 'DEPLOYED',
            videoUploadUrl: videoD2.draftVideoUrl,
            uploadedAt: videoD2.submittedAt,
            approvedAt: videoD2.approvedAt,
            deployedAt: videoD2.postedAt,
            views: 75000,
            engagement: 5070,
            conversions: 420,
            performanceScore: 7.0,
        },
    });

    const variantC = await prisma.aBTestVariant.create({
        data: {
            testId: abTest.id,
            variantName: 'Variant C',
            label: 'Story Hook',
            description: 'Hook using a relatable story',
            variantType: 'HOOK',
            creatorId: mary.id,
            videoId: videoD3.id,
            approvalStatus: 'DEPLOYED',
            videoUploadUrl: videoD3.draftVideoUrl,
            uploadedAt: videoD3.submittedAt,
            approvedAt: videoD3.approvedAt,
            deployedAt: videoD3.postedAt,
            views: 120000,
            engagement: 10200,
            conversions: 780,
            performanceScore: 8.5,
        },
    });

    // Update A/B test with winner
    await prisma.aBTest.update({
        where: { id: abTest.id },
        data: {
            winnerVariantId: variantC.id,
            adoptedVariantId: variantC.id,
        },
    });

    // Create performance snapshots for A/B test
    for (const variant of [variantA, variantB, variantC]) {
        const baseViews = variant.views / 10;
        for (let i = 0; i < 10; i++) {
            await prisma.aBTestPerformanceSnapshot.create({
                data: {
                    testId: abTest.id,
                    variantId: variant.id,
                    views: Math.floor(baseViews * (i + 1)),
                    clicks: Math.floor((baseViews * (i + 1)) * 0.05),
                    conversions: Math.floor((baseViews * (i + 1)) * 0.01),
                    watchTime: Math.floor((baseViews * (i + 1)) * 45), // avg 45 seconds
                    engagementRate: variant.performanceScore!,
                    ctr: 5.0,
                    conversionRate: 1.0,
                    snapshotAt: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000),
                },
            });
        }
    }

    // Create founder videos for comparison
    await prisma.founderVideo.createMany({
        data: [
            {
                campaignId: campaignD.id,
                founderId: mike.id,
                videoUrl: 'https://storage.example.com/founder/mike_demo1.mp4',
                thumbnailUrl: 'https://storage.example.com/founder/mike_demo1_thumb.jpg',
                caption: 'Our team demonstrating AI TaskMaster Pro',
                platform: 'TIKTOK',
                status: 'POSTED',
                finalPostUrl: 'https://tiktok.com/@techcorp/video1',
                platformVideoId: '7234567890123456792',
                postedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                currentViewCount: 35000,
                likes: 1200,
                comments: 85,
                shares: 150,
                engagementRate: 4.1,
            },
            {
                campaignId: campaignD.id,
                founderId: mike.id,
                videoUrl: 'https://storage.example.com/founder/mike_demo2.mp4',
                thumbnailUrl: 'https://storage.example.com/founder/mike_demo2_thumb.jpg',
                caption: 'Behind the scenes: Building AI TaskMaster',
                platform: 'TIKTOK',
                status: 'POSTED',
                finalPostUrl: 'https://tiktok.com/@techcorp/video2',
                platformVideoId: '7234567890123456793',
                postedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
                currentViewCount: 28000,
                likes: 950,
                comments: 62,
                shares: 110,
                engagementRate: 4.0,
            },
        ],
    });

    // Create completed payments
    await prisma.payment.createMany({
        data: [
            {
                campaignId: campaignD.id,
                videoId: videoD1.id,
                recipientId: mary.id,
                amount: 75.00,
                type: 'BASE_FEE',
                status: 'COMPLETED',
                description: 'Base fee for Video #1',
                stripeTransferId: 'tr_test_base_1',
                processedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
            },
            {
                campaignId: campaignD.id,
                videoId: videoD1.id,
                recipientId: mary.id,
                amount: 200.00,
                type: 'PERFORMANCE_BONUS',
                status: 'COMPLETED',
                description: 'Performance bonus for 50K views',
                stripeTransferId: 'tr_test_perf_1',
                processedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            },
            {
                campaignId: campaignD.id,
                videoId: videoD2.id,
                recipientId: mary.id,
                amount: 75.00,
                type: 'BASE_FEE',
                status: 'COMPLETED',
                description: 'Base fee for Video #2',
                stripeTransferId: 'tr_test_base_2',
                processedAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000),
            },
            {
                campaignId: campaignD.id,
                videoId: videoD2.id,
                recipientId: mary.id,
                amount: 300.00,
                type: 'PERFORMANCE_BONUS',
                status: 'COMPLETED',
                description: 'Performance bonus for 75K views',
                stripeTransferId: 'tr_test_perf_2',
                processedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            },
            {
                campaignId: campaignD.id,
                videoId: videoD3.id,
                recipientId: mary.id,
                amount: 75.00,
                type: 'BASE_FEE',
                status: 'COMPLETED',
                description: 'Base fee for Video #3',
                stripeTransferId: 'tr_test_base_3',
                processedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
            },
            {
                campaignId: campaignD.id,
                videoId: videoD3.id,
                recipientId: mary.id,
                amount: 480.00,
                type: 'PERFORMANCE_BONUS',
                status: 'COMPLETED',
                description: 'Performance bonus for 120K views',
                stripeTransferId: 'tr_test_perf_3',
                processedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            },
        ],
    });

    console.log(`✅ Campaign D created: ${campaignD.name}`);
    console.log(`✅ A/B Test created with 3 variants`);
    console.log(`✅ Winner: ${variantC.label} (Story Hook)\n`);

    // ============================================
    // CREATE NOTIFICATIONS
    // ============================================
    console.log('🔔 Creating notifications...');

    await prisma.notification.createMany({
        data: [
            // For Mary
            {
                userId: mary.id,
                type: 'CAMPAIGN_INVITE',
                title: 'New Campaign Available',
                message: 'Summer Product Launch 2024 is now accepting applications',
                link: `/creator/briefs/${campaignA.id}`,
                isRead: false,
            },
            {
                userId: mary.id,
                type: 'APPLICATION_UPDATE',
                title: 'Application Accepted',
                message: 'Your application for Holiday Campaign has been accepted!',
                link: `/creator/tasks`,
                isRead: true,
            },
            {
                userId: mary.id,
                type: 'PAYMENT',
                title: 'Payment Received',
                message: 'You received $75.00 base fee payment',
                link: `/creator/earnings`,
                isRead: true,
            },
            {
                userId: mary.id,
                type: 'AB_TEST_COMPLETED',
                title: 'A/B Test Completed',
                message: 'Your Story Hook variant won the A/B test!',
                link: `/creator/ab-tests/${abTest.id}`,
                isRead: false,
            },
            // For Mike
            {
                userId: mike.id,
                type: 'APPLICATION_UPDATE',
                title: 'New Application',
                message: 'Mary Williams applied to your Summer Product Launch campaign',
                link: `/founder/campaigns/${campaignA.id}/applications`,
                isRead: false,
            },
            {
                userId: mike.id,
                type: 'VIDEO_STATUS',
                title: 'Draft Submitted',
                message: 'Mary submitted a draft for Holiday Campaign',
                link: `/founder/campaigns/${campaignB.id}`,
                isRead: false,
            },
            {
                userId: mike.id,
                type: 'AB_TEST_COMPLETED',
                title: 'A/B Test Results Ready',
                message: 'Hook Comparison Test has completed with clear winner',
                link: `/founder/campaigns/${campaignD.id}/ab-tests/${abTest.id}/results`,
                isRead: false,
            },
        ],
    });

    console.log('✅ Notifications created\n');

    // ============================================
    // SUMMARY
    // ============================================
    console.log('✨ E2E Test Scenarios Seed Complete!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`👥 Test Accounts Created:`);
    console.log(`   • Founder: ${mike.email} (Password: Test123!)`);
    console.log(`   • Creator: ${mary.email} (Password: Test123!)\n`);

    console.log(`📋 Campaigns Created:`);
    console.log(`   1. ${campaignA.name} - ${campaignA.status}`);
    console.log(`      → Open for applications, 3 videos, $2,000 budget`);
    console.log(`      → 4 instructions ready (requires acknowledgment)\n`);

    console.log(`   2. ${campaignB.name} - ${campaignB.status}`);
    console.log(`      → 1 draft submitted, awaiting review`);
    console.log(`      → Revision deadline in 5 days\n`);

    console.log(`   3. ${campaignC.name} - ${campaignC.status}`);
    console.log(`      → Video approved, payment pending`);
    console.log(`      → Ready for posting URL submission\n`);

    console.log(`   4. ${campaignD.name} - ${campaignD.status}`);
    console.log(`      → 3 videos completed, 245K total views`);
    console.log(`      → A/B test completed, Story Hook won`);
    console.log(`      → $1,200 paid to creator, $300 platform revenue\n`);

    console.log(`🧪 A/B Testing:`);
    console.log(`   • Test: ${abTest.name}`);
    console.log(`   • Variants: 3 (Question, Stat, Story)`);
    console.log(`   • Winner: Story Hook (120K views, 8.5% engagement)`);
    console.log(`   • Confidence: 85.5%\n`);

    console.log(`💰 Payments:`);
    console.log(`   • 6 completed payments`);
    console.log(`   • 1 pending payment ($75 base fee)\n`);

    console.log(`🔔 Notifications:`);
    console.log(`   • 7 notifications created`);
    console.log(`   • Mix of read/unread for both users\n`);

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Ready for E2E Testing!');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('🚀 Next Steps:');
    console.log('   1. Login as Mike: mike21@gmail.com');
    console.log('   2. Login as Mary: mary57@gmail.com');
    console.log('   3. Test all campaign workflows');
    console.log('   4. Verify Campaign Requirements system');
    console.log('   5. Test A/B testing results page\n');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
