
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const question = await prisma.examQuestion.findFirst();
    console.log(JSON.stringify(question, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
