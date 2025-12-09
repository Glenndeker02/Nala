
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding attribution test data...');

    // 1. Get or Create Founder and Creator
    let founder = await prisma.user.findFirst({ where: { role: 'FOUNDER' } });
    if (!founder) {
        founder = await prisma.user.create({
            data: {
                email: 'founder@test.com',
                password: 'hashedpassword',
                fullName: 'Mike Founder',
                role: 'FOUNDER',
                companyName: 'Test Co'
            } as any
        });
        console.log('Created Founder');
    }

    let creator = await prisma.user.findFirst({ where: { role: 'CREATOR' } });
    if (!creator) {
        creator = await prisma.user.create({
            data: {
                email: 'creator@test.com',
                password: 'hashedpassword',
                fullName: 'Mary Creator',
                role: 'CREATOR'
            } as any
        });
        console.log('Created Creator');

        try {
            await prisma.creatorProfile.create({
                data: {
                    userId: creator.id,
                    bio: 'Test Bio'
                } as any
            });
        } catch (e) {
            // Ignore
        }
    }

    // 2. Create Campaign with Codes Enabled
    const campaign = await prisma.campaign.create({
        data: {
            founderId: founder.id,
            name: 'Attribution Test Campaign',
            brandName: 'Test Brand',
            status: 'ACTIVE',
            totalBudget: 1000,
            baseFeeBudget: 500,
            performanceBudget: 500,
            enableCreatorCodes: true,
            creatorSubscriptionShare: 5.0, // 5% share
            budgetReserved: 0,
            videosRequested: 1 // Required field
        } as any
    });
    console.log(`Created Campaign: ${campaign.id}`);

    // 3. Assign Creator
    const assignment = await prisma.creatorCampaignAssignment.create({
        data: {
            campaignId: campaign.id,
            creatorId: creator.id,
            status: 'ACCEPTED',
            baseFee: 100,
        } as any
    });
    console.log(`Created Assignment: ${assignment.id}`);

    // 4. Generate Codes (Simulating API call logic)
    const codeTT = await prisma.attributionCode.create({
        data: {
            campaignId: campaign.id,
            creatorId: creator.id,
            assignmentId: assignment.id,
            platform: 'TIKTOK',
            code: 'TEST01-TT',
            generatedBy: founder.id
        } as any
    });
    console.log(`Generated Code: ${codeTT.code}`);

    // 5. Create Video
    const video = await prisma.video.create({
        data: {
            campaignId: campaign.id,
            creatorId: creator.id,
            platform: 'TIKTOK',
            status: 'POSTED',
            platformVideoId: 'video_12345',
            currentViewCount: 0
        } as any
    });
    console.log(`Created Video: ${video.id}`);

    // 6. Simulate Redemption (Webhook)
    const redemption = await prisma.codeRedemption.create({
        data: {
            campaignId: campaign.id,
            creatorId: creator.id,
            codeId: codeTT.id,
            platform: 'TIKTOK',
            externalEventId: 'evt_Sub_001',
            eventType: 'PAID',
            eventValue: { amount: 50.00, currency: 'USD' },
            verified: true
        } as any
    });
    console.log(`Created Verified Redemption: ${redemption.id}`);

    // 7. Simulate Views Report
    await prisma.video.update({
        where: { id: video.id },
        data: { currentViewCount: 5000 } as any
    });
    console.log(`Updated Video Views to 5000`);

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
