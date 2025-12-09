import { PrismaClient, Role, CampaignStatus, VideoStatus, PaymentStatus, PaymentType, VerificationStatus, Platform, ApplicationStatus, InstructionStatus, ABTestStatus, TestGoal, SuccessMetric, VariantStatus, VariantType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

async function main() {
    console.log('🌱 Starting E2E Flow Seed...');

    // 1. Clear existing data to ensure clean state
    console.log('🗑️  Clearing existing data...');
    // Delete in order of dependencies
    await prisma.viewSnapshot.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.video.deleteMany();
    await prisma.application.deleteMany();
    await prisma.instruction.deleteMany();
    await prisma.aBTestVariant.deleteMany();
    await prisma.aBTest.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.creatorProfile.deleteMany();
    await prisma.user.deleteMany();

    // 2. Create Users
    console.log('👤 Creating Users...');
    const hashedPassword = await hashPassword('Test123!@#');

    const founder = await prisma.user.create({
        data: {
            email: 'mike21@gmail.com',
            password: hashedPassword,
            fullName: 'Mike Founder',
            role: Role.FOUNDER,
            companyName: 'Tupstory Inc',
            emailVerified: true,
            lastLoginAt: new Date(),
        },
    });

    const creator = await prisma.user.create({
        data: {
            email: 'mary57@gmail.com',
            password: hashedPassword,
            fullName: 'Mary Creator',
            role: Role.CREATOR,
            emailVerified: true,
            lastLoginAt: new Date(),
        },
    });

    // Create Creator Profile
    await prisma.creatorProfile.create({
        data: {
            userId: creator.id,
            bio: 'Top tier creator for tech and lifestyle.',
            categories: ['Tech', 'Lifestyle'],
            baseFeeTiktok: 150.00,
            baseFeeInstagram: 200.00,
            verificationStatus: VerificationStatus.VERIFIED,
            isOnboardingComplete: true,
        },
    });

    // =========================================================================
    // Scenario 1: Campaign A — Open for applications
    // =========================================================================
    console.log('🚀 Seeding Campaign A (Open)...');
    const campaignA = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'Campaign A - Summer Launch',
            brandName: 'Tupstory Inc',
            description: 'We are launching our new summer collection. Looking for energetic creators!',
            status: CampaignStatus.ACTIVE_ACCEPTING_APPLICATIONS,
            platform: Platform.TIKTOK,
            totalBudget: 5000,
            baseFeeBudget: 2500,
            performanceBudget: 2500,
            videosRequested: 5,
            videosCompleted: 0,
            startDate: new Date(),
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            briefData: {
                requirements: ['High energy', 'Show product in use', 'Good lighting'],
                talkingPoints: ['Summer vibes', 'Limited edition', 'Free shipping'],
            },
        },
    });

    // Create an Instruction for Campaign A (to test instruction flow later)
    await prisma.instruction.create({
        data: {
            campaignId: campaignA.id,
            authorId: founder.id,
            text: 'Please focus on the blue color variant. It is our hero product.',
            appliesTo: 'all',
            status: InstructionStatus.OPEN,
        },
    });


    // =========================================================================
    // Scenario 2: Campaign B — In review stage
    // =========================================================================
    console.log('📝 Seeding Campaign B (In Review)...');
    const campaignB = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'Campaign B - Tech Review',
            brandName: 'Tupstory Inc',
            description: 'In-depth review of our new gadget.',
            status: CampaignStatus.ACTIVE, // Active because it has accepted creators
            platform: Platform.TIKTOK,
            totalBudget: 2000,
            baseFeeBudget: 1000,
            performanceBudget: 1000,
            videosRequested: 1,
            videosCompleted: 0,
            startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            acceptedCreatorsCount: 1,
        },
    });

    // Mary Applied and was Accepted
    await prisma.application.create({
        data: {
            campaignId: campaignB.id,
            creatorId: creator.id,
            status: ApplicationStatus.ACCEPTED,
            message: 'I love tech reviews! Check my portfolio.',
            acceptedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
    });

    // Mary uploaded a video, Mike reviewed it and added comments
    await prisma.video.create({
        data: {
            campaignId: campaignB.id,
            creatorId: creator.id,
            status: VideoStatus.IN_REVIEW, // Or REVISION_REQUESTED if we want to force revision immediately
            draftVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            platform: Platform.TIKTOK,
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            founderComments: 'Great energy, but the audio is a bit low in the second half. Can you boost it?',
            lastReviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            revisionDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days to revise
        },
    });


    // =========================================================================
    // Scenario 3: Campaign C — Ready for final approval
    // =========================================================================
    console.log('✅ Seeding Campaign C (Ready for Approval)...');
    const campaignC = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'Campaign C - Lifestyle Vlog',
            brandName: 'Tupstory Inc',
            description: 'Day in the life with our product.',
            status: CampaignStatus.ACTIVE,
            platform: Platform.INSTAGRAM,
            totalBudget: 3000,
            baseFeeBudget: 1500,
            performanceBudget: 1500,
            videosRequested: 1,
            videosCompleted: 0,
            startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            acceptedCreatorsCount: 1,
        },
    });

    // Mary Accepted
    await prisma.application.create({
        data: {
            campaignId: campaignC.id,
            creatorId: creator.id,
            status: ApplicationStatus.ACCEPTED,
            acceptedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
    });

    // Mary uploaded final draft, waiting for Mike to approve and pay
    await prisma.video.create({
        data: {
            campaignId: campaignC.id,
            creatorId: creator.id,
            status: VideoStatus.IN_REVIEW, // Waiting for final approval
            draftVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            platform: Platform.INSTAGRAM,
            submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
            revisionCount: 2, // Implies there was a previous version
        },
    });


    // =========================================================================
    // Scenario 4: Campaign D — Fully completed
    // =========================================================================
    console.log('🏆 Seeding Campaign D (Completed)...');
    const campaignD = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'Campaign D - Holiday Special',
            brandName: 'Tupstory Inc',
            description: 'Holiday campaign with A/B testing.',
            status: CampaignStatus.COMPLETED,
            platform: Platform.TIKTOK,
            totalBudget: 10000,
            baseFeeBudget: 5000,
            performanceBudget: 5000,
            videosRequested: 2,
            videosCompleted: 2,
            startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            acceptedCreatorsCount: 1,
            finalViewsTotal: 150000,
            totalPaidToCreator: 2000,
        },
    });

    // Mary Accepted
    await prisma.application.create({
        data: {
            campaignId: campaignD.id,
            creatorId: creator.id,
            status: ApplicationStatus.ACCEPTED,
            acceptedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
        },
    });

    // Video 1: High Performer
    const videoD1 = await prisma.video.create({
        data: {
            campaignId: campaignD.id,
            creatorId: creator.id,
            status: VideoStatus.LOCKED,
            draftVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
            finalPostUrl: 'https://tiktok.com/@mary57/video/holiday1',
            platform: Platform.TIKTOK,
            currentViewCount: 100000,
            lockedViewCount: 100000,
            baseFeePaid: true,
            baseFeeAmount: 500,
            performanceBonusPaid: true,
            performanceBonusAmount: 1000, // $10 per 1k views capped? or just calculated. Let's say $10 CPM for easy math = $1000
            postedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
            lockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
    });

    // Video 2: Average Performer
    const videoD2 = await prisma.video.create({
        data: {
            campaignId: campaignD.id,
            creatorId: creator.id,
            status: VideoStatus.LOCKED,
            draftVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            finalPostUrl: 'https://tiktok.com/@mary57/video/holiday2',
            platform: Platform.TIKTOK,
            currentViewCount: 50000,
            lockedViewCount: 50000,
            baseFeePaid: true,
            baseFeeAmount: 500,
            performanceBonusPaid: true,
            performanceBonusAmount: 500,
            postedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
            lockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
    });

    // A/B Test Data
    const abTest = await prisma.aBTest.create({
        data: {
            campaignId: campaignD.id,
            name: 'Holiday Hook Test',
            testGoal: TestGoal.BEST_HOOK,
            successMetric: SuccessMetric.TOTAL_VIEWS,
            status: ABTestStatus.COMPLETED,
            startDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000), // 7 day test
            completedAt: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000),
            winnerVariantId: undefined, // Will update after creating variants
            results: {
                winner: 'Variant A',
                uplift: '100%',
                confidence: 0.98,
            },
        },
    });

    const variantA = await prisma.aBTestVariant.create({
        data: {
            testId: abTest.id,
            videoId: videoD1.id,
            variantName: 'Variant A',
            label: 'Variant A (Emotional Hook)',
            variantType: 'HOOK',
            views: 100000,
            conversions: 200,
            engagement: 5000, // Using engagement field for clicks/likes proxy
        },
    });

    const variantB = await prisma.aBTestVariant.create({
        data: {
            testId: abTest.id,
            videoId: videoD2.id,
            variantName: 'Variant B',
            label: 'Variant B (Direct Offer)',
            variantType: 'HOOK',
            views: 50000,
            conversions: 50,
            engagement: 1000,
        },
    });

    // Update winner
    await prisma.aBTest.update({
        where: { id: abTest.id },
        data: { winnerVariantId: variantA.id },
    });

    // Payments for Campaign D
    // Base Fees
    await prisma.payment.create({
        data: {
            recipientId: creator.id,
            amount: 500,
            type: PaymentType.BASE_FEE,
            status: PaymentStatus.COMPLETED,
            campaignId: campaignD.id,
            videoId: videoD1.id,
            processedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        },
    });
    await prisma.payment.create({
        data: {
            recipientId: creator.id,
            amount: 500,
            type: PaymentType.BASE_FEE,
            status: PaymentStatus.COMPLETED,
            campaignId: campaignD.id,
            videoId: videoD2.id,
            processedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        },
    });

    // Performance Bonuses
    await prisma.payment.create({
        data: {
            recipientId: creator.id,
            amount: 1000,
            type: PaymentType.PERFORMANCE_BONUS,
            status: PaymentStatus.COMPLETED,
            campaignId: campaignD.id,
            videoId: videoD1.id,
            processedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
    });
    await prisma.payment.create({
        data: {
            recipientId: creator.id,
            amount: 500,
            type: PaymentType.PERFORMANCE_BONUS,
            status: PaymentStatus.COMPLETED,
            campaignId: campaignD.id,
            videoId: videoD2.id,
            processedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
    });


    console.log('✨ E2E Flow Seed Completed Successfully!');
    console.log('------------------------------------------------');
    console.log('Founder: mike21@gmail.com / Test123!@#');
    console.log('Creator: mary57@gmail.com / Test123!@#');
    console.log('------------------------------------------------');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
