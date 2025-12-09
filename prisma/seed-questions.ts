import { PrismaClient, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding exam questions...');

    // Clear existing questions
    await prisma.examQuestion.deleteMany();

    const questions = [
        {
            text: "What is the primary goal of User Generated Content (UGC)?",
            type: QuestionType.MULTIPLE_CHOICE,
            options: ["To sell products directly", "To build trust and authenticity", "To replace professional ads completely", "To lower marketing costs only"],
            correctAnswer: "To build trust and authenticity",
            category: "Fundamentals"
        },
        {
            text: "Which of the following is NOT a good practice for a hook in a video?",
            type: QuestionType.MULTIPLE_CHOICE,
            options: ["Asking a question", "Showing a shocking visual", "Starting with a long intro about yourself", "Stating a bold claim"],
            correctAnswer: "Starting with a long intro about yourself",
            category: "Content Strategy"
        },
        {
            text: "What is the recommended length for a TikTok ad creative to maximize retention?",
            type: QuestionType.MULTIPLE_CHOICE,
            options: ["5-10 seconds", "21-34 seconds", "60+ seconds", "Under 5 seconds"],
            correctAnswer: "21-34 seconds",
            category: "Metrics"
        },
        {
            text: "When negotiating rights, what does 'Organic Usage' typically mean?",
            type: QuestionType.MULTIPLE_CHOICE,
            options: ["The brand can run paid ads with the video", "The brand can post it on their profile timeline only", "The creator owns the video forever", "The video must be deleted after 30 days"],
            correctAnswer: "The brand can post it on their profile timeline only",
            category: "Rights & Usage"
        },
        {
            text: "What element is crucial for a 'Problem/Solution' video format?",
            type: QuestionType.MULTIPLE_CHOICE,
            options: ["High production value", "Cinematic lighting", "Clearly identifying a pain point", "Background music volume"],
            correctAnswer: "Clearly identifying a pain point",
            category: "Content Strategy"
        },
        {
            text: "How should you handle clear background noise in a voiceover?",
            type: QuestionType.MULTIPLE_CHOICE,
            options: ["Leave it for authenticity", "Re-record in a quiet environment", "Yell louder", "Add loud music to cover it"],
            correctAnswer: "Re-record in a quiet environment",
            category: "Production Quality"
        },
        {
            text: "What is a 'Call to Action' (CTA)?",
            type: QuestionType.MULTIPLE_CHOICE,
            options: ["The phone number of the creator", "An instruction telling the viewer what to do next", "The title of the video", "The caption hashtags"],
            correctAnswer: "An instruction telling the viewer what to do next",
            category: "Fundamentals"
        },
        {
            text: "In the context of paid ads, what does 'CTR' stand for?",
            type: QuestionType.MULTIPLE_CHOICE,
            options: ["Click Through Rate", "Cost To Reach", "Content Time Ratio", "Creator Total Revenue"],
            correctAnswer: "Click Through Rate",
            category: "Metrics"
        },
        {
            text: "Which lighting setup is generally best for a talking head video?",
            type: QuestionType.MULTIPLE_CHOICE,
            options: ["Backlighting (window behind you)", "Soft, even front lighting", "Overhead ceiling light only", "Flashlight under chin"],
            correctAnswer: "Soft, even front lighting",
            category: "Production Quality"
        },
        {
            text: "Why is captioning (subtitles) important for short-form video?",
            type: QuestionType.MULTIPLE_CHOICE,
            options: ["It looks cool", "Many users watch with sound off", "It fills up space", "It's required by law"],
            correctAnswer: "Many users watch with sound off",
            category: "Production Quality"
        }
    ];

    for (const q of questions) {
        await prisma.examQuestion.create({
            data: {
                text: q.text,
                type: q.type,
                options: q.options,
                correctAnswer: q.correctAnswer,
                category: q.category,
                points: 1
            }
        });
    }

    console.log(`✅ Seeded ${questions.length} exam questions.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
