import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, ApiResponse } from '@/lib/api-middleware';
import { ExamType, CertificationStatus } from '@prisma/client';

const PASSING_SCORE = 85; // 85%
const COOLDOWN_HOURS = 48;

export const POST = requireRole(['CREATOR'], async (req: NextRequest, user) => {
    try {
        const body = await req.json();
        const { answers } = body; // Record<questionId, answerString>

        if (!answers || Object.keys(answers).length === 0) {
            return ApiResponse.error('Missing answers', 400);
        }

        // Check cooldown
        const lastAttempt = await prisma.examAttempt.findFirst({
            where: {
                creatorId: user.userId,
                examType: ExamType.KNOWLEDGE,
            },
            orderBy: {
                startedAt: 'desc',
            },
        });

        if (lastAttempt && !lastAttempt.passed) {
            const hoursSinceLastAttempt = (Date.now() - lastAttempt.startedAt.getTime()) / (1000 * 60 * 60);
            if (hoursSinceLastAttempt < COOLDOWN_HOURS) {
                return NextResponse.json(
                    { error: `Cooldown active. Try again in ${Math.ceil(COOLDOWN_HOURS - hoursSinceLastAttempt)} hours.` },
                    { status: 403 }
                );
            }
        }

        // Fetch questions to grade
        const questionIds = Object.keys(answers);
        const questions = await prisma.examQuestion.findMany({
            where: {
                id: { in: questionIds },
            },
        });

        let score = 0;
        let totalPoints = 0;
        const results = [];

        for (const q of questions) {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correctAnswer;
            if (isCorrect) {
                score += q.points;
            }
            totalPoints += q.points;
            results.push({
                questionId: q.id,
                isCorrect,
                userAnswer,
                correctAnswer: q.correctAnswer,
            });
        }

        const percentage = (score / totalPoints) * 100;
        const passed = percentage >= PASSING_SCORE;

        // Save attempt
        await prisma.examAttempt.create({
            data: {
                creatorId: user.userId,
                examType: ExamType.KNOWLEDGE,
                score: percentage,
                passed,
                answers: results,
                completedAt: new Date(),
            },
        });

        // Update profile if passed
        if (passed) {
            await prisma.creatorProfile.update({
                where: { userId: user.userId },
                data: {
                    certificationStatus: CertificationStatus.THEORY_PASSED,
                    lastExamAttempt: new Date(),
                },
            });
        } else {
            await prisma.creatorProfile.update({
                where: { userId: user.userId },
                data: {
                    lastExamAttempt: new Date(),
                },
            });
        }

        return NextResponse.json({
            passed,
            score: percentage,
            results: results.map(r => ({ ...r, correctAnswer: undefined })), // Hide correct answers
        });

    } catch (error) {
        console.error('[EXAM_SUBMIT_POST]', error);
        return ApiResponse.error('Internal Error', 500);
    }
});
