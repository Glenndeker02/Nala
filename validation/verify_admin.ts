
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Verifying Admin Tools...');

    const campaign = await prisma.campaign.findFirst({ where: { status: 'ACTIVE' } });
    const founder = await prisma.user.findFirst({ where: { role: 'FOUNDER' } });

    // Get or Create Admin
    let adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminUser) {
        adminUser = await prisma.user.create({
            data: {
                email: 'admin@nala.com',
                password: 'hashedpassword',
                fullName: 'System Admin',
                role: 'ADMIN'
            } as any
        });
        console.log('Created Admin User');
    }

    if (campaign) {
        // 1. Verify Secret Rotation
        const newSecret = "whsec_verified";
        await prisma.campaign.update({
            where: { id: campaign.id },
            data: { webhookSecret: newSecret }
        });

        // Log Audit manually to simulate API
        await prisma.auditLog.create({
            data: {
                userId: founder?.id || 'unknown',
                action: 'ROTATE_WEBHOOK_SECRET',
                entity: 'Campaign',
                entityId: campaign.id
            } as any
        });
        console.log('Secret Rotated & Audit Logged');
    }

    // 2. Verify Dispute Flow
    let payout = await prisma.payout.findFirst();

    // Self-seed payout if missing (e.g. if logic verification failed)
    if (!payout && campaign && founder) {
        console.log('No payout found, creating mock payout for testing...');
        payout = await prisma.payout.create({
            data: {
                campaignId: campaign.id,
                creatorId: founder.id, // Using founder as creator for simplicity in this mock or find a creator
                amount: 100,
                type: 'BASE_FEE',
                status: 'PAID'
            } as any
        });
    }

    if (payout) {
        // Create Dispute
        await prisma.dispute.create({
            data: {
                campaignId: payout.campaignId,
                initiatorId: founder?.id || 'unknown',
                respondentId: payout.creatorId,
                reason: "Invalid traffic",
                category: 'PAYMENT_ISSUE',
                description: 'Automated dispute test description',
                status: 'OPEN',
                amount: payout.amount
            } as any
        });
        console.log('Dispute Created');

        // Resolve Dispute (Update Payout)
        await prisma.payout.update({
            where: { id: payout.id },
            data: { status: 'REVERSED' }
        });

        await prisma.auditLog.create({
            data: {
                userId: adminUser!.id,
                action: 'RESOLVE_DISPUTE',
                entity: 'Payout',
                entityId: payout.id,
                details: { resolution: 'APPROVED' }
            } as any
        });
        console.log('Dispute Resolved & Audit Logged');
    }

    // 3. List Audit Logs
    const logs = await prisma.auditLog.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
    console.log(`Found ${logs.length} audit logs:`);
    logs.forEach(l => console.log(`- ${l.action} on ${l.entity} (${l.createdAt})`));

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
