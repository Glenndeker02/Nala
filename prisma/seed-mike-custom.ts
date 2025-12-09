import { PrismaClient, Role, CampaignStatus, VideoStatus, PaymentStatus, PaymentType, NotificationType, VerificationStatus, Platform } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting refined seed for Mike & Mary...');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.viewSnapshot.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.video.deleteMany();
    await prisma.application.deleteMany(); // Clear applications too
    await prisma.campaign.deleteMany();
    await prisma.creatorProfile.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.user.deleteMany();

    // Hash passwords
    const hashedPassword = await hashPassword('Test123!@#');

    // 1. Create Founder: Mike
    console.log('👤 Creating founder: mike21@gmail.com');
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

    // 2. Create Creator: Mary
    console.log('🎨 Creating creator: mary57@gmail.com');
    const creator = await prisma.user.create({
        data: {
            email: 'mary57@gmail.com',
            password: hashedPassword,
            fullName: 'Mary Smith',
            role: Role.CREATOR,
            emailVerified: true,
            lastLoginAt: new Date(),
        },
    });

    // Create Creator Profile for Mary
    await prisma.creatorProfile.create({
        data: {
            userId: creator.id,
            bio: 'Professional tech and lifestyle creator.',
            categories: ['Tech', 'Lifestyle'],
            baseFeeTiktok: 150.00,
            baseFeeInstagram: 200.00,
            verificationStatus: VerificationStatus.VERIFIED,
            isOnboardingComplete: true,
        },
    });

    console.log('📢 Creating 5 specific campaign scenarios...');

    // Scenario 1: Completed Campaign
    // "It's complete we should see founder mike accepted mary into campaign. mary uploaded all the videos. videos were tracked, views reached, payments were made to mary from mike."
    const campaign1 = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'Holiday Mega Sale (Completed)',
            brandName: 'TechStartup Inc',
            description: 'Huge holiday success. All payments settled.',
            status: CampaignStatus.COMPLETED,
            platform: Platform.TIKTOK,
            totalBudget: 5000,
            baseFeeBudget: 2500,
            performanceBudget: 2500,
            videosRequested: 1,
            videosCompleted: 1,
            startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            targetViews: 50000,
            finalViewsTotal: 65000,
            totalPaidToCreator: 450, // 150 base + 300 bonus
        },
    });

    // Video for Campaign 1
    const video1 = await prisma.video.create({
        data: {
            campaignId: campaign1.id,
            creatorId: creator.id,
            status: VideoStatus.LOCKED, // Metrics locked
            draftVideoUrl: 'https://example.com/draft_holiday.mp4',
            finalPostUrl: 'https://tiktok.com/@mary57/video/holiday',
            platform: Platform.TIKTOK,
            currentViewCount: 65000,
            lockedViewCount: 65000,
            baseFeePaid: true,
            baseFeeAmount: 150,
            performanceBonusPaid: true,
            performanceBonusAmount: 300,
            submittedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
            approvedAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000),
            postedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
            lockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
    });

    // Payments for Campaign 1
    await prisma.payment.create({
        data: {
            recipientId: creator.id,
            amount: 150,
            type: PaymentType.BASE_FEE,
            status: PaymentStatus.COMPLETED,
            campaignId: campaign1.id,
            videoId: video1.id,
            processedAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000),
        },
    });
    await prisma.payment.create({
        data: {
            recipientId: creator.id,
            amount: 300,
            type: PaymentType.PERFORMANCE_BONUS,
            status: PaymentStatus.COMPLETED,
            campaignId: campaign1.id,
            videoId: video1.id,
            processedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
    });


    // Scenario 2: In Progress - Founder Reviewing
    // "campaign its progress- mary has uploaded videos founder is review them and waiting for corrections."
    // Status: IN_REVIEW
    const campaign2 = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'Summer Vibes (In Review)',
            brandName: 'TechStartup Inc',
            description: 'Founder is currently reviewing the draft.',
            status: CampaignStatus.ACTIVE,
            platform: Platform.INSTAGRAM,
            totalBudget: 3000,
            baseFeeBudget: 1500,
            performanceBudget: 1500,
            videosRequested: 1,
            videosCompleted: 0,
            startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        },
    });

    await prisma.video.create({
        data: {
            campaignId: campaign2.id,
            creatorId: creator.id,
            status: VideoStatus.IN_REVIEW, // Mary uploaded, Founder reviewing
            draftVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            platform: Platform.INSTAGRAM,
            submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
    });


    // Scenario 3: Corrections Needed / Submitting Corrections
    // "campaign founder has reviewed videos now mary is submitting corrected videos."
    // Status: REVISION_REQUESTED
    const campaign3 = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'Tech Unboxing (Corrections)',
            brandName: 'TechStartup Inc',
            description: 'Founder requested changes. Mary needs to upload revision.',
            status: CampaignStatus.ACTIVE,
            platform: Platform.TIKTOK,
            totalBudget: 4000,
            baseFeeBudget: 2000,
            performanceBudget: 2000,
            videosRequested: 1,
            videosCompleted: 0,
            startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        },
    });

    await prisma.video.create({
        data: {
            campaignId: campaign3.id,
            creatorId: creator.id,
            status: VideoStatus.REVISION_REQUESTED, // Founder reviewed, waiting for Mary
            draftVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            platform: Platform.TIKTOK,
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            founderComments: 'Great start! But please make the logo more visible in the first 3 seconds.',
            lastReviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
    });


    // Scenario 4: Launching / Accepting Applications
    // "Campaign founder lauched a campaign and is accepting applications from creators."
    const campaign4 = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'Global Brand Search (Open)',
            brandName: 'TechStartup Inc',
            description: 'We are looking for new faces! Apply now.',
            status: CampaignStatus.ACTIVE_ACCEPTING_APPLICATIONS,
            platform: Platform.TIKTOK,
            totalBudget: 10000,
            baseFeeBudget: 5000,
            performanceBudget: 5000,
            videosRequested: 10,
            videosCompleted: 0,
            startDate: new Date(),
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            briefData: { requirements: ['High energy', 'Creative'] },
        },
    });
    // Mary hasn't applied yet, so she can see it in "Open Campaigns"


    // Scenario 5: Assigned / Pending Upload
    // (Adding this to complete the "5 types" and test the "Upload Draft" flow from scratch)
    const campaign5 = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'Quick Feature Demo (Assigned)',
            brandName: 'TechStartup Inc',
            description: 'You have been selected! Please upload your draft.',
            status: CampaignStatus.ACTIVE,
            platform: Platform.INSTAGRAM,
            totalBudget: 2000,
            baseFeeBudget: 1000,
            performanceBudget: 1000,
            videosRequested: 1,
            videosCompleted: 0,
            startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
    });

    await prisma.video.create({
        data: {
            campaignId: campaign5.id,
            creatorId: creator.id,
            status: VideoStatus.PENDING, // Assigned, waiting for draft
            platform: Platform.INSTAGRAM,
        },
    });


    console.log('✅ Refined seed completed!');
    console.log('Credentials:');
    console.log('Founder: mike21@gmail.com / Test123!@#');
    console.log('Creator: mary57@gmail.com / Test123!@#');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
