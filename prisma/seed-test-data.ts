import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    const founderEmail = 'mike20@gmail.com';
    const creatorEmail = 'mary20@gmail.com';

    // 1. Find Users
    const founder = await prisma.user.findUnique({ where: { email: founderEmail } });
    const creator = await prisma.user.findUnique({ where: { email: creatorEmail } });

    if (!founder || !creator) {
        console.error('❌ Users not found. Please ensure mike20@gmail.com and mary20@gmail.com exist.');
        return;
    }

    console.log(`✅ Found Founder: ${founder.fullName} (${founder.id})`);
    console.log(`✅ Found Creator: ${creator.fullName} (${creator.id})`);

    // CLEANUP: Remove existing test data for these users to avoid duplicates
    console.log('🧹 Cleaning up old test data...');
    await prisma.payment.deleteMany({ where: { recipientId: creator.id } });
    await prisma.video.deleteMany({ where: { creatorId: creator.id } });
    await prisma.application.deleteMany({ where: { creatorId: creator.id } });
    await prisma.campaign.deleteMany({ where: { founderId: founder.id } });
    console.log('✅ Cleanup complete');

    // 2. Update Founder Profile
    await prisma.user.update({
        where: { id: founder.id },
        data: {
            companyName: 'TechNova Solutions',
            founderTier: 'GOLD',
        }
    });
    console.log('✅ Updated Founder Profile');

    // 3. Update Creator Profile & Socials
    // Check if profile exists
    const existingProfile = await prisma.creatorProfile.findUnique({ where: { userId: creator.id } });

    if (!existingProfile) {
        await prisma.creatorProfile.create({
            data: {
                userId: creator.id,
                bio: 'Tech enthusiast and lifestyle creator. I love reviewing new gadgets and sharing my daily routine.',
                categories: ['Tech', 'Lifestyle', 'Education'],
                baseFeeTiktok: 150.00,
                baseFeeInstagram: 200.00,
                baseFeeFacebook: 100.00,
                verificationStatus: 'VERIFIED',
                isOnboardingComplete: true,
                availabilityStatus: 'AVAILABLE',
                responseTime: '< 4 hours'
            }
        });
    } else {
        await prisma.creatorProfile.update({
            where: { userId: creator.id },
            data: {
                bio: 'Tech enthusiast and lifestyle creator. I love reviewing new gadgets and sharing my daily routine.',
                categories: ['Tech', 'Lifestyle', 'Education'],
                baseFeeTiktok: 150.00,
                baseFeeInstagram: 200.00,
                baseFeeFacebook: 100.00,
                verificationStatus: 'VERIFIED',
                isOnboardingComplete: true
            }
        });
    }

    // Social Accounts
    const platforms = ['TIKTOK', 'INSTAGRAM'];
    for (const platform of platforms) {
        const exists = await prisma.socialAccount.findUnique({
            where: {
                creatorId_platform: {
                    creatorId: creator.id,
                    platform: platform as any
                }
            }
        });

        if (!exists) {
            await prisma.socialAccount.create({
                data: {
                    creatorId: creator.id,
                    platform: platform as any,
                    platformUserId: `user_${platform.toLowerCase()}_${creator.id.substring(0, 5)}`,
                    username: `@mary_${platform.toLowerCase()}`,
                    followerCount: platform === 'TIKTOK' ? 45000 : 12000,
                    verifiedAt: new Date()
                }
            });
        }
    }
    console.log('✅ Updated Creator Profile & Socials');

    // 4. Create Campaigns

    // Campaign A: "Summer Tech Launch" (Active, Assigned to Mary)
    const campaignA = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'Summer Tech Launch',
            description: 'Launch campaign for our new AI-powered headphones. Focus on noise cancellation and battery life.',
            status: 'ACTIVE',
            totalBudget: 2000.00,
            baseFeeeBudget: 1000.00,
            performanceBudget: 1000.00,
            escrowBalance: 2000.00,
            videosRequested: 5,
            videosCompleted: 0,
            postingFrequency: 'weekly',
            startDate: new Date(),
            stripePaymentIntentId: 'pi_mock_123456',
            briefData: {
                talkingPoints: ['Active Noise Cancellation', '30h Battery', 'Sleek Design'],
                mustHaves: ['Show product close-up', 'Wear the headphones'],
                dontWants: ['Mention competitors', 'Use bad lighting']
            }
        }
    });

    // Assign Mary to a video in Campaign A
    const videoA = await prisma.video.create({
        data: {
            campaignId: campaignA.id,
            creatorId: creator.id,
            status: 'PENDING', // Assigned, waiting for draft
            platform: 'TIKTOK'
        }
    });

    // Create Accepted Application for Campaign A
    await prisma.application.create({
        data: {
            campaignId: campaignA.id,
            creatorId: creator.id,
            status: 'ACCEPTED',
            message: 'I love audio tech! Would be great for this.'
        }
    });

    console.log('✅ Created Campaign A (Active, Assigned)');

    // Campaign B: "Lifestyle App Promo" (Active, Mary Applied)
    const campaignB = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'Lifestyle App Promo',
            description: 'Promoting our new productivity app. Looking for "Day in the life" style videos.',
            status: 'ACTIVE',
            totalBudget: 1500.00,
            baseFeeeBudget: 750.00,
            performanceBudget: 750.00,
            escrowBalance: 1500.00,
            videosRequested: 3,
            videosCompleted: 0,
            postingFrequency: 'daily',
            startDate: new Date()
        }
    });

    // Mary Applied
    await prisma.application.create({
        data: {
            campaignId: campaignB.id,
            creatorId: creator.id,
            status: 'PENDING',
            message: 'This fits my "Day in the life" content perfectly!'
        }
    });
    console.log('✅ Created Campaign B (Active, Applied)');

    // Campaign C: "Holiday Gift Guide" (Completed, Paid)
    const campaignC = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'Holiday Gift Guide',
            description: 'Feature our smart watch in your holiday gift guide.',
            status: 'COMPLETED',
            totalBudget: 3000.00,
            baseFeeeBudget: 1500.00,
            performanceBudget: 1500.00,
            escrowBalance: 0.00, // Paid out
            videosRequested: 10,
            videosCompleted: 10,
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            completedAt: new Date()
        }
    });

    // Mary's Completed Video
    const videoC = await prisma.video.create({
        data: {
            campaignId: campaignC.id,
            creatorId: creator.id,
            status: 'LOCKED', // Metrics locked
            platform: 'INSTAGRAM',
            draftVideoUrl: '/uploads/mock_draft.mp4',
            finalPostUrl: 'https://instagram.com/p/mock123',
            postedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            approvedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
            currentViewCount: 15400,
            lockedViewCount: 15400,
            baseFeePaid: true,
            baseFeeAmount: 200.00,
            performanceBonusPaid: true,
            performanceBonusAmount: 61.60 // 15.4k * $4
        }
    });

    await prisma.payment.create({
        data: {
            campaignId: campaignC.id,
            videoId: videoC.id,
            recipientId: creator.id,
            amount: 200.00,
            type: 'BASE_FEE',
            status: 'COMPLETED'
        }
    });

    await prisma.payment.create({
        data: {
            campaignId: campaignC.id,
            videoId: videoC.id,
            recipientId: creator.id,
            amount: 61.60,
            type: 'PERFORMANCE_BONUS',
            status: 'COMPLETED'
        }
    });

    console.log('✅ Created Campaign C (Completed, Paid)');

    // Campaign D: "Draft Review" (Active, Draft Submitted)
    const campaignD = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'Fitness Challenge',
            description: '30-day fitness challenge using our app.',
            status: 'ACTIVE',
            totalBudget: 5000.00,
            baseFeeeBudget: 2500.00,
            performanceBudget: 2500.00,
            escrowBalance: 5000.00,
            videosRequested: 5,
            videosCompleted: 0
        }
    });

    const videoD = await prisma.video.create({
        data: {
            campaignId: campaignD.id,
            creatorId: creator.id,
            status: 'DRAFT_SUBMITTED',
            platform: 'TIKTOK',
            draftVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Mock URL
            submittedAt: new Date()
        }
    });

    await prisma.application.create({
        data: {
            campaignId: campaignD.id,
            creatorId: creator.id,
            status: 'ACCEPTED',
            message: 'Ready to sweat!'
        }
    });

    console.log('✅ Created Campaign D (Draft Submitted)');

    console.log('🎉 Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
