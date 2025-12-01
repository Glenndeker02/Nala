import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding additional creator accounts...');

    const hashedPassword = await bcrypt.hash('Test123!@#', 10);

    // Creator data with diverse profiles
    const creatorsData = [
        {
            email: 'sarah.tech@gmail.com',
            fullName: 'Sarah Martinez',
            bio: 'Tech enthusiast and software engineer creating educational content about coding and productivity tools.',
            categories: ['Tech', 'SaaS', 'Education', 'Productivity'],
            tiktokUsername: '@sarah_codes',
            tiktokFollowers: 67000,
            instagramUsername: '@sarahtech',
            instagramFollowers: 42000,
            baseFeeTiktok: 120,
            baseFeeInstagram: 110,
            baseFeeFacebook: 95,
        },
        {
            email: 'james.fitness@gmail.com',
            fullName: 'James Wilson',
            bio: 'Fitness coach and wellness advocate. Specializing in health tech and fitness app reviews.',
            categories: ['Health', 'Fitness', 'Lifestyle', 'Tech'],
            tiktokUsername: '@jamesfitpro',
            tiktokFollowers: 125000,
            instagramUsername: '@james.fitness',
            instagramFollowers: 89000,
            baseFeeTiktok: 150,
            baseFeeInstagram: 140,
            baseFeeFacebook: 120,
        },
        {
            email: 'emma.creative@gmail.com',
            fullName: 'Emma Thompson',
            bio: 'Creative director and content strategist. Expert in visual storytelling and brand narratives.',
            categories: ['Creative', 'Marketing', 'Design', 'SaaS'],
            tiktokUsername: '@emmacreates',
            tiktokFollowers: 54000,
            instagramUsername: '@emma.creative',
            instagramFollowers: 78000,
            baseFeeTiktok: 110,
            baseFeeInstagram: 125,
            baseFeeFacebook: 100,
        },
        {
            email: 'alex.business@gmail.com',
            fullName: 'Alex Chen',
            bio: 'Business consultant and entrepreneur. Creating content about B2B tools and startup growth.',
            categories: ['B2B', 'Business', 'SaaS', 'Entrepreneurship'],
            tiktokUsername: '@alexbiz',
            tiktokFollowers: 38000,
            instagramUsername: '@alex.business',
            instagramFollowers: 52000,
            baseFeeTiktok: 95,
            baseFeeInstagram: 100,
            baseFeeFacebook: 85,
        },
        {
            email: 'lisa.lifestyle@gmail.com',
            fullName: 'Lisa Rodriguez',
            bio: 'Lifestyle blogger and digital nomad. Reviewing productivity apps and remote work tools.',
            categories: ['Lifestyle', 'Travel', 'Productivity', 'Tech'],
            tiktokUsername: '@lisalives',
            tiktokFollowers: 92000,
            instagramUsername: '@lisa.lifestyle',
            instagramFollowers: 115000,
            baseFeeTiktok: 135,
            baseFeeInstagram: 145,
            baseFeeFacebook: 125,
        },
        {
            email: 'david.gaming@gmail.com',
            fullName: 'David Park',
            bio: 'Gaming content creator and tech reviewer. Passionate about gaming peripherals and software.',
            categories: ['Gaming', 'Tech', 'Entertainment', 'Reviews'],
            tiktokUsername: '@davidgames',
            tiktokFollowers: 156000,
            instagramUsername: '@david.gaming',
            instagramFollowers: 98000,
            baseFeeTiktok: 160,
            baseFeeInstagram: 150,
            baseFeeFacebook: 130,
        },
        {
            email: 'nina.food@gmail.com',
            fullName: 'Nina Patel',
            bio: 'Food blogger and recipe developer. Creating content about food delivery apps and kitchen tech.',
            categories: ['Food', 'Lifestyle', 'Tech', 'Reviews'],
            tiktokUsername: '@ninacooks',
            tiktokFollowers: 71000,
            instagramUsername: '@nina.food',
            instagramFollowers: 84000,
            baseFeeTiktok: 115,
            baseFeeInstagram: 120,
            baseFeeFacebook: 105,
        },
        {
            email: 'marcus.finance@gmail.com',
            fullName: 'Marcus Johnson',
            bio: 'Financial advisor and fintech enthusiast. Simplifying finance through engaging content.',
            categories: ['Finance', 'Fintech', 'Education', 'B2B'],
            tiktokUsername: '@marcusmoney',
            tiktokFollowers: 48000,
            instagramUsername: '@marcus.finance',
            instagramFollowers: 61000,
            baseFeeTiktok: 105,
            baseFeeInstagram: 110,
            baseFeeFacebook: 95,
        },
    ];

    console.log(`Creating ${creatorsData.length} creator accounts...`);

    for (const creatorData of creatorsData) {
        // Create user
        const creator = await prisma.user.upsert({
            where: { email: creatorData.email },
            update: {},
            create: {
                email: creatorData.email,
                password: hashedPassword,
                role: 'CREATOR',
                fullName: creatorData.fullName,
                emailVerified: true,
                emailVerifiedAt: new Date(),
                lastLoginAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            },
        });

        // Create profile
        await prisma.creatorProfile.upsert({
            where: { userId: creator.id },
            update: {},
            create: {
                userId: creator.id,
                bio: creatorData.bio,
                categories: creatorData.categories,
                baseFeeTiktok: creatorData.baseFeeTiktok,
                baseFeeInstagram: creatorData.baseFeeInstagram,
                baseFeeFacebook: creatorData.baseFeeFacebook,
                verificationStatus: 'VERIFIED',
                availabilityStatus: 'AVAILABLE',
                responseTime: '< 24 hours',
                isOnboardingComplete: true,
                portfolioVideos: {
                    videos: [
                        {
                            url: `https://www.tiktok.com/@${creatorData.tiktokUsername}/video/1`,
                            thumbnail: `https://picsum.photos/seed/${creator.id}1/400/600`,
                            platform: 'TIKTOK',
                            title: 'Portfolio Video 1',
                            views: Math.floor(Math.random() * 200000) + 50000,
                        },
                        {
                            url: `https://www.instagram.com/reel/${creator.id}1`,
                            thumbnail: `https://picsum.photos/seed/${creator.id}2/400/600`,
                            platform: 'INSTAGRAM',
                            title: 'Portfolio Video 2',
                            views: Math.floor(Math.random() * 150000) + 30000,
                        },
                    ],
                },
            },
        });

        // Add social accounts
        await prisma.socialAccount.upsert({
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
                platformUserId: creatorData.tiktokUsername.replace('@', ''),
                username: creatorData.tiktokUsername,
                followerCount: creatorData.tiktokFollowers,
                verifiedAt: new Date(),
                lastSyncedAt: new Date(),
            },
        });

        await prisma.socialAccount.upsert({
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
                platformUserId: creatorData.instagramUsername.replace('@', ''),
                username: creatorData.instagramUsername,
                followerCount: creatorData.instagramFollowers,
                verifiedAt: new Date(),
                lastSyncedAt: new Date(),
            },
        });

        console.log(`✅ Created creator: ${creatorData.email}`);
    }

    // Now create applications for some creators to the founder's campaigns
    console.log('\n📝 Creating campaign applications...');

    const founder = await prisma.user.findUnique({
        where: { email: 'mike21@gmail.com' },
    });

    if (!founder) {
        console.log('⚠️  Founder not found. Run seed-test-accounts.ts first.');
        return;
    }

    const campaigns = await prisma.campaign.findMany({
        where: { founderId: founder.id, status: 'ACTIVE' },
    });

    if (campaigns.length === 0) {
        console.log('⚠️  No active campaigns found. Run seed-test-accounts.ts first.');
        return;
    }

    // Get some creators to apply
    const creators = await prisma.user.findMany({
        where: {
            email: {
                in: [
                    'sarah.tech@gmail.com',
                    'james.fitness@gmail.com',
                    'emma.creative@gmail.com',
                    'alex.business@gmail.com',
                    'lisa.lifestyle@gmail.com',
                ],
            },
        },
    });

    // Create applications for the first campaign
    const campaign = campaigns[0];
    const applicationStatuses: ('PENDING' | 'ACCEPTED' | 'REJECTED')[] = ['PENDING', 'PENDING', 'PENDING', 'ACCEPTED', 'REJECTED'];

    for (let i = 0; i < Math.min(creators.length, 5); i++) {
        const creator = creators[i];
        const status = applicationStatuses[i];

        await prisma.application.upsert({
            where: {
                campaignId_creatorId: {
                    campaignId: campaign.id,
                    creatorId: creator.id,
                },
            },
            update: {},
            create: {
                campaignId: campaign.id,
                creatorId: creator.id,
                message: `Hi! I'm ${creator.fullName} and I'd love to work on this campaign. I have experience creating engaging content for ${campaign.briefData ? (campaign.briefData as any).targetAudience : 'similar audiences'}.`,
                portfolioLinks: [
                    `https://www.tiktok.com/@${creator.email.split('@')[0]}/video/1`,
                    `https://www.instagram.com/reel/${creator.email.split('@')[0]}`,
                ],
                status,
            },
        });

        console.log(`✅ Created ${status} application for ${creator.fullName}`);
    }

    console.log('\n🎉 Additional creators and applications seeded successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - New Creators: ${creatorsData.length}`);
    console.log(`   - Applications: ${Math.min(creators.length, 5)}`);
    console.log(`     • Pending: 3`);
    console.log(`     • Accepted: 1`);
    console.log(`     • Rejected: 1`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding creators:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
