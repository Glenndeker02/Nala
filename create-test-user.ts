import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'test.creator.final@gmail.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 12); // Matching lib/auth.ts rounds

    console.log(`Creating test user: ${email}`);

    // Create user
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'CREATOR'
        },
        create: {
            email,
            password: hashedPassword,
            role: 'CREATOR',
            fullName: 'Test Creator Final',
            emailVerified: true,
            emailVerifiedAt: new Date(),
        },
    });

    // Create profile
    await prisma.creatorProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
            userId: user.id,
            bio: 'Test Creator Bio',
            categories: ['Tech', 'Lifestyle'],
            baseFeeTiktok: 100,
            baseFeeInstagram: 100,
            baseFeeFacebook: 100,
            verificationStatus: 'VERIFIED',
            isOnboardingComplete: true,
            rankingScore: 75, // Good ranking for testing
            videoQualityScore: 15,
            conversionRate: 10,
            selectionRate: 10,
            avgResponseTimeHours: 4,
            totalReviews: 5,
            avgRating: 4.8,
            campaignParticipationRate: 95,
            disputeCount: 0
        },
    });

    // Create some performance metrics
    await prisma.creatorPerformanceMetric.create({
        data: {
            creatorId: user.id,
            platform: 'TIKTOK',
            totalViews: 50000,
            totalEngagement: 2500,
            videosPosted: 10,
            periodStart: new Date(new Date().setDate(new Date().getDate() - 30)),
            periodEnd: new Date(),
            periodType: 'MONTH'
        }
    });

    console.log('✅ Test user created successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
