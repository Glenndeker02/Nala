import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const db = new PrismaClient();

async function main() {
    const email = process.argv[2];
    const password = process.argv[3];
    const name = process.argv[4] || 'Super Admin';

    if (!email || !password) {
        console.error('Usage: npx ts-node scripts/create-admin.ts <email> <password> [name]');
        process.exit(1);
    }

    console.log(`Creating admin user: ${email}...`);

    try {
        // 1. Create or get User
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await db.user.upsert({
            where: { email },
            update: {
                role: 'ADMIN',
            },
            create: {
                email,
                password: hashedPassword,
                fullName: name,
                role: 'ADMIN',
                emailVerified: true,
            },
        });

        // 2. Create AdminUser profile
        await db.adminUser.upsert({
            where: { userId: user.id },
            update: {
                adminLevel: 'DIRECTOR',
                permissions: { all: true }, // Full access
                active: true,
            },
            create: {
                userId: user.id,
                adminLevel: 'DIRECTOR',
                permissions: { all: true },
                active: true,
            },
        });

        console.log('✅ Admin user created successfully!');
        console.log(`Login at: http://localhost:3000/login`);
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await db.$disconnect();
    }
}

main();
