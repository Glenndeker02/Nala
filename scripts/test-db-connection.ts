import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
    console.log('Testing database connection...');
    console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');

    try {
        await prisma.$connect();
        console.log('✅ Successfully connected to database!');

        const userCount = await prisma.user.count();
        console.log(`✅ Database query successful! Found ${userCount} users.`);

    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
