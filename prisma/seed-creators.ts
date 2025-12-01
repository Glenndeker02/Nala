import { PrismaClient, Role, VerificationStatus, Platform } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

// Creator data templates
const niches = [
    'Beauty & Cosmetics', 'Fitness & Health', 'SaaS & Tech', 'Lifestyle',
    'Finance & Fintech', 'Food & Cooking', 'Travel', 'Gaming',
    'Education', 'Fashion', 'Home & DIY', 'Parenting'
];

const locations = [
    'Los Angeles, CA', 'New York, NY', 'London, UK', 'Toronto, Canada',
    'Sydney, Australia', 'Berlin, Germany', 'Paris, France', 'Tokyo, Japan',
    'Miami, FL', 'Austin, TX', 'Barcelona, Spain', 'Amsterdam, Netherlands',
    'Singapore', 'Dubai, UAE', 'Mexico City, Mexico', 'São Paulo, Brazil'
];

const languages = [
    'English', 'Spanish', 'French', 'German', 'Portuguese',
    'Japanese', 'Mandarin', 'Arabic', 'Dutch', 'Italian'
];

const firstNames = [
    'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
    'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
    'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Michael',
    'Emily', 'Daniel', 'Elizabeth', 'Matthew', 'Sofia', 'Jackson', 'Avery',
    'Sebastian', 'Ella', 'Jack', 'Scarlett', 'Aiden', 'Grace', 'Owen',
    'Chloe', 'Samuel', 'Victoria', 'David', 'Riley', 'Joseph', 'Aria',
    'Carter', 'Lily', 'Wyatt', 'Aubrey', 'John', 'Zoey', 'Luke', 'Penelope',
    'Dylan', 'Lillian', 'Grayson', 'Addison', 'Isaac', 'Layla', 'Jayden',
    'Natalie', 'Gabriel', 'Camila'
];

const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
    'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
    'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez',
    'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright',
    'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams',
    'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter',
    'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
    'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart'
];

function randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateFollowerCount(tier: 'nano' | 'micro' | 'mid' | 'macro'): number {
    switch (tier) {
        case 'nano': return randomInt(1000, 9999);
        case 'micro': return randomInt(10000, 49999);
        case 'mid': return randomInt(50000, 199999);
        case 'macro': return randomInt(200000, 999999);
    }
}

function generateUsername(firstName: string, lastName: string): string {
    const variations = [
        `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
        `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
        `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
        `${firstName.toLowerCase()}.creates`,
        `${firstName.toLowerCase()}_official`,
        `the${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    ];
    return randomElement(variations);
}

function generateBio(niche: string, firstName: string): string {
    const bios = {
        'Beauty & Cosmetics': [
            `💄 Beauty creator sharing makeup tutorials & skincare tips | Cruelty-free advocate`,
            `✨ Professional MUA | ${niche} content creator | Collab: DM`,
            `Beauty enthusiast 💅 Honest reviews & tutorials | ${randomInt(100, 500)}K+ on TikTok`,
        ],
        'Fitness & Health': [
            `💪 Certified personal trainer | Fitness & wellness content | Transform your life`,
            `🏋️ Fitness coach helping you reach your goals | Nutrition tips & workouts`,
            `Health & fitness creator | NASM certified | Building stronger communities`,
        ],
        'SaaS & Tech': [
            `👨‍💻 Tech reviewer & SaaS enthusiast | Helping businesses scale with the right tools`,
            `💻 Software reviews, productivity hacks, and tech tutorials | DM for collabs`,
            `Tech content creator | SaaS expert | Making technology accessible for everyone`,
        ],
        'Lifestyle': [
            `🌟 Lifestyle creator sharing daily inspiration | Fashion, travel & wellness`,
            `Living my best life and sharing the journey ✨ Lifestyle & travel content`,
            `Lifestyle blogger | Authentic content | Collaborations welcome 📧`,
        ],
        'Finance & Fintech': [
            `💰 Financial literacy advocate | Making money management simple & accessible`,
            `📊 Finance creator | Investment tips & budgeting hacks | Not financial advice`,
            `Fintech enthusiast helping you build wealth | Personal finance simplified`,
        ],
        'Food & Cooking': [
            `👨‍🍳 Home chef sharing easy recipes & cooking tips | Food is love ❤️`,
            `🍳 Recipe creator | Quick meals & food hacks | Making cooking fun & simple`,
            `Foodie & content creator | Delicious recipes you can actually make`,
        ],
        'Travel': [
            `✈️ Travel creator exploring the world | ${randomInt(30, 80)}+ countries visited`,
            `🌍 Adventure seeker & travel blogger | Budget travel tips & destination guides`,
            `Travel content creator | Wanderlust & cultural experiences | DM for collabs`,
        ],
        'Gaming': [
            `🎮 Gaming content creator | ${randomElement(['FPS', 'RPG', 'Strategy'])} enthusiast | Streaming & reviews`,
            `Pro gamer & content creator | Tips, tricks & gameplay | Join the community!`,
            `Gaming creator | Reviews, walkthroughs & live streams | Level up with me 🎯`,
        ],
        'Education': [
            `📚 Educator & content creator | Making learning fun & accessible for everyone`,
            `🎓 Educational content | Study tips, tutorials & knowledge sharing`,
            `Teacher turned content creator | Simplifying complex topics | Learn with me!`,
        ],
        'Fashion': [
            `👗 Fashion creator | Style tips, outfit ideas & trend forecasts | Sustainable fashion advocate`,
            `✨ Personal stylist & fashion blogger | Affordable style for everyone`,
            `Fashion content creator | OOTD, hauls & styling tips | DM for collabs`,
        ],
        'Home & DIY': [
            `🏡 Home improvement & DIY creator | Budget-friendly projects & decor ideas`,
            `🔨 DIY enthusiast sharing home projects | Making your space beautiful on a budget`,
            `Home & garden content creator | DIY tutorials & renovation tips`,
        ],
        'Parenting': [
            `👶 Parenting content creator | Real talk, tips & support for modern parents`,
            `Mom of ${randomInt(1, 3)} | Sharing the parenting journey | Tips, hacks & honest moments`,
            `Parenting blogger | Family life, tips & product reviews | Building community`,
        ],
    };

    const nicheKey = niche as keyof typeof bios;
    return randomElement(bios[nicheKey] || bios['Lifestyle']);
}

async function main() {
    console.log('🌱 Starting creator seeding...');

    const hashedPassword = await hashPassword('Creator123!@#');

    // Distribution: 20 nano, 25 micro, 10 mid, 5 macro = 60 total
    const tiers: Array<'nano' | 'micro' | 'mid' | 'macro'> = [
        ...Array(20).fill('nano'),
        ...Array(25).fill('micro'),
        ...Array(10).fill('mid'),
        ...Array(5).fill('macro'),
    ];

    const creators = [];

    for (let i = 0; i < 60; i++) {
        const firstName = randomElement(firstNames);
        const lastName = randomElement(lastNames);
        const fullName = `${firstName} ${lastName}`;
        const email = `creator${i + 1}@nala-test.com`;
        const niche = randomElement(niches);
        const tier = tiers[i];
        const location = randomElement(locations);
        const language = randomElement(languages);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            console.log(`⏭️  Skipping ${email} - already exists`);
            continue;
        }

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                fullName,
                role: Role.CREATOR,
            },
        });

        // Generate follower counts for each platform
        const tiktokFollowers = generateFollowerCount(tier);
        const instagramFollowers = Math.floor(tiktokFollowers * randomFloat(0.6, 1.4));
        const facebookFollowers = Math.floor(tiktokFollowers * randomFloat(0.3, 0.8));

        // Create creator profile
        const engagementRate = randomFloat(2, 15, 2);
        const rating = randomFloat(3.5, 5.0, 1);

        await prisma.creatorProfile.create({
            data: {
                userId: user.id,
                bio: generateBio(niche, firstName),
                categories: [niche, ...Array(randomInt(1, 3)).fill(null).map(() => randomElement(niches))].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
                baseFeeTiktok: tier === 'nano' ? randomFloat(50, 100) :
                    tier === 'micro' ? randomFloat(100, 250) :
                        tier === 'mid' ? randomFloat(250, 500) :
                            randomFloat(500, 1500),
                baseFeeInstagram: tier === 'nano' ? randomFloat(60, 120) :
                    tier === 'micro' ? randomFloat(120, 300) :
                        tier === 'mid' ? randomFloat(300, 600) :
                            randomFloat(600, 1800),
                baseFeeFacebook: tier === 'nano' ? randomFloat(40, 80) :
                    tier === 'micro' ? randomFloat(80, 200) :
                        tier === 'mid' ? randomFloat(200, 400) :
                            randomFloat(400, 1200),
                portfolioVideos: [
                    {
                        url: `https://www.tiktok.com/@${generateUsername(firstName, lastName)}/video/${randomInt(7000000000, 7999999999)}`,
                        thumbnail: `https://picsum.photos/seed/${user.id}-1/400/600`,
                        platform: 'TIKTOK',
                        title: `${niche} Content - ${randomElement(['Tutorial', 'Review', 'Tips', 'Guide', 'Showcase'])}`,
                        views: randomInt(10000, 500000),
                        engagement: randomFloat(5, 15, 1),
                    },
                    {
                        url: `https://www.instagram.com/reel/${randomElement(['ABC', 'DEF', 'GHI', 'JKL'])}${randomInt(100000, 999999)}`,
                        thumbnail: `https://picsum.photos/seed/${user.id}-2/400/600`,
                        platform: 'INSTAGRAM',
                        title: `${niche} Reel - ${randomElement(['Behind the Scenes', 'Day in the Life', 'How To', 'Product Review'])}`,
                        views: randomInt(8000, 300000),
                        engagement: randomFloat(4, 12, 1),
                    },
                ],
                verificationStatus: randomFloat(0, 1) > 0.3 ? VerificationStatus.VERIFIED : VerificationStatus.PENDING,
                availabilityStatus: randomElement(['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'BUSY']),
                responseTime: randomElement(['< 2 hours', '< 6 hours', '< 12 hours', '< 24 hours']),
                isOnboardingComplete: true,
                adminNotes: randomFloat(0, 1) > 0.7 ? `${randomElement(['Excellent', 'Great', 'Good', 'Reliable'])} creator. ${randomElement(['High engagement', 'Quality content', 'Professional', 'Responsive'])}. ${randomElement(['Recommended', 'Top performer', 'Consistent delivery'])}.` : null,
            },
        });

        // Create social accounts
        const platforms: Platform[] = [Platform.TIKTOK, Platform.INSTAGRAM, Platform.FACEBOOK];
        const followerCounts = [tiktokFollowers, instagramFollowers, facebookFollowers];
        const usernames = [
            `@${generateUsername(firstName, lastName)}`,
            `@${generateUsername(firstName, lastName)}`,
            `${firstName}.${lastName}`,
        ];

        for (let j = 0; j < platforms.length; j++) {
            await prisma.socialAccount.create({
                data: {
                    creatorId: user.id,
                    platform: platforms[j],
                    platformUserId: `${platforms[j].toLowerCase()}_${user.id}_${Date.now()}`,
                    username: usernames[j],
                    followerCount: followerCounts[j],
                    accessToken: `mock_${platforms[j].toLowerCase()}_token_${user.id}`,
                    refreshToken: `mock_${platforms[j].toLowerCase()}_refresh_${user.id}`,
                    tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                    verifiedAt: new Date(Date.now() - randomInt(30, 180) * 24 * 60 * 60 * 1000),
                    lastSyncedAt: new Date(),
                },
            });
        }

        creators.push({
            email,
            fullName,
            niche,
            tier,
            followers: tiktokFollowers,
        });

        console.log(`✅ Created: ${fullName} (${email}) - ${niche} - ${tier} - ${tiktokFollowers.toLocaleString()} followers`);
    }

    console.log(`\n🎉 Successfully seeded ${creators.length} creators!`);
    console.log('\n📊 Distribution:');
    console.log(`   Nano (<10k): ${creators.filter(c => c.tier === 'nano').length}`);
    console.log(`   Micro (10-50k): ${creators.filter(c => c.tier === 'micro').length}`);
    console.log(`   Mid (50-200k): ${creators.filter(c => c.tier === 'mid').length}`);
    console.log(`   Macro (200k+): ${creators.filter(c => c.tier === 'macro').length}`);

    console.log('\n🏷️  Niches:');
    const nicheCount = creators.reduce((acc, c) => {
        acc[c.niche] = (acc[c.niche] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    Object.entries(nicheCount).forEach(([niche, count]) => {
        console.log(`   ${niche}: ${count}`);
    });

    console.log('\n🔑 Test credentials: creator1@nala-test.com through creator60@nala-test.com');
    console.log('   Password: Creator123!@#');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding creators:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
