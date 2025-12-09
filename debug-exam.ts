
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Get the first user with role CREATOR
    const creator = await prisma.user.findFirst({
        where: { role: 'CREATOR' },
        include: { creatorProfile: true }
    });

    if (!creator) {
        console.log("No creator found.");
        return;
    }

    console.log(`Creator found: ${creator.email} (ID: ${creator.id})`);
    console.log(`CreatorProfile:`, creator.creatorProfile);

    if (!creator.creatorProfile) {
        console.log("WARNING: Creator has no profile! Creating one...");
        await prisma.creatorProfile.create({
            data: {
                userId: creator.id,
                bio: "Test Bio",
                categories: ["Lifestyle"],
            }
        });
        console.log("Created missing profile.");
    }

    // 2. Simulate Exam Submission
    const questions = await prisma.examQuestion.findMany({ take: 3 });
    if (questions.length === 0) {
        console.log("No questions found!");
        return;
    }

    const answers: Record<string, string> = {};
    questions.forEach(q => {
        answers[q.id] = q.correctAnswer; // Cheat properly
    });

    console.log("Simulating submission with answers:", answers);

    // Call logic similar to the API route locally
    // (We can't call the API route directly easily without mocked request, so we replicate logic)

    // Logic from route:
    const questionIds = Object.keys(answers);
    const fetchedQuestions = await prisma.examQuestion.findMany({
        where: { id: { in: questionIds } }
    });

    let score = 0;
    let totalPoints = 0;
    const results = [];

    for (const q of fetchedQuestions) {
        const userAnswer = answers[q.id];
        const isCorrect = userAnswer === q.correctAnswer;
        if (isCorrect) score += q.points;
        totalPoints += q.points;
        results.push({ questionId: q.id, isCorrect, userAnswer });
    }

    const percentage = (score / totalPoints) * 100;
    const passed = percentage >= 85;

    console.log(`Result: Score=${score}/${totalPoints} (${percentage}%) Passed=${passed}`);

    // Attempt storage
    try {
        const attempt = await prisma.examAttempt.create({
            data: {
                creatorId: creator.id,
                examType: 'KNOWLEDGE',
                score: percentage,
                passed,
                answers: results,
                completedAt: new Date(),
            }
        });
        console.log("ExamAttempt created:", attempt.id);

        if (passed) {
            const updated = await prisma.creatorProfile.update({
                where: { userId: creator.id },
                data: {
                    certificationStatus: 'THEORY_PASSED',
                    lastExamAttempt: new Date(),
                }
            });
            console.log("Profile updated:", updated.certificationStatus);
        }
    } catch (e) {
        console.error("Storage failed:", e);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
