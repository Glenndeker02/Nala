const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        const users = await prisma.user.findMany({ take: 1 });
        console.log('Database connected. Users found:', users.length);

        console.log('Fetching campaigns...');
        const campaigns = await prisma.campaign.findMany({
            take: 5,
            include: {
                founder: {
                    select: {
                        fullName: true,
                        companyName: true,
                    }
                }
            }
        });
        console.log('Campaigns found:', campaigns.length);
        console.log(JSON.stringify(campaigns, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
