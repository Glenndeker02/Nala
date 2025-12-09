import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Verifying Seeded Data...\n');

    // Get users
    const mike = await prisma.user.findUnique({
        where: { email: 'mike21@gmail.com' },
        select: { id: true, fullName: true, email: true }
    });

    const mary = await prisma.user.findUnique({
        where: { email: 'mary57@gmail.com' },
        include: { creatorProfile: true }
    });

    console.log('👤 Users:');
    console.log(`  - Founder: ${mike?.fullName} (${mike?.email})`);
    console.log(`  - Creator: ${mary?.fullName} (${mary?.email})`);
    console.log(`  - Creator Profile: ${mary?.creatorProfile ? 'EXISTS' : 'MISSING'}\n`);

    if (!mike) {
        console.error('❌ Mike not found!');
        return;
    }

    // Get campaigns
    const campaigns = await prisma.campaign.findMany({
        where: { founderId: mike.id },
        include: {
            videos: true,
            applications: true,
            instructions: true,
            abTests: {
                include: {
                    variants: true
                }
            },
            payments: true,
            founderVideos: true
        },
        orderBy: { name: 'asc' }
    });

    console.log(`📊 Campaigns: ${campaigns.length}\n`);

    for (const campaign of campaigns) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Campaign: ${campaign.name}`);
        console.log(`Status: ${campaign.status}`);
        console.log(`Platform: ${campaign.platform}`);
        console.log(`Videos Requested: ${campaign.videosRequested}`);
        console.log(`Videos Completed: ${campaign.videosCompleted}`);
        console.log(`Applications: ${campaign.applications.length}`);
        console.log(`Instructions: ${campaign.instructions.length}`);
        console.log(`Videos: ${campaign.videos.length}`);

        if (campaign.videos.length > 0) {
            campaign.videos.forEach((video, idx) => {
                console.log(`  Video ${idx + 1}:`);
                console.log(`    - Status: ${video.status}`);
                console.log(`    - Views: ${video.currentViewCount}`);
                console.log(`    - Base Fee Paid: ${video.baseFeePaid}`);
                if (video.founderComments) {
                    console.log(`    - Founder Comments: "${video.founderComments.substring(0, 50)}..."`);
                }
            });
        }

        if (campaign.abTests.length > 0) {
            console.log(`A/B Tests: ${campaign.abTests.length}`);
            campaign.abTests.forEach((test, idx) => {
                console.log(`  Test ${idx + 1}: ${test.name}`);
                console.log(`    - Status: ${test.status}`);
                console.log(`    - Variants: ${test.variants.length}`);
                test.variants.forEach(variant => {
                    console.log(`      - ${variant.label}: ${variant.views} views`);
                });
            });
        }

        if (campaign.founderVideos.length > 0) {
            console.log(`Founder Videos: ${campaign.founderVideos.length}`);
        }

        console.log(`Payments: ${campaign.payments.length}`);
    }

    // Check view snapshots for Campaign D
    const campaignD = campaigns.find(c => c.name.includes('Holiday'));
    if (campaignD) {
        const snapshots = await prisma.viewSnapshot.count({
            where: {
                video: {
                    campaignId: campaignD.id
                }
            }
        });
        console.log(`\n📈 View Snapshots for Campaign D: ${snapshots}`);
    }

    console.log('\n✅ Verification Complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
