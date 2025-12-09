import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(['CREATOR'], async (req: NextRequest, user) => {
    try {
        console.log('[EXAM_QUESTIONS] User authenticated:', user?.userId, 'Role:', user?.role);

        // Fetch all questions (assuming pool is small enough for now)
        // In production with large pool, use raw query for random selection
        const allQuestions = await db.examQuestion.findMany({
            select: {
                id: true,
                text: true,
                type: true,
                options: true,
                // Exclude correctAnswer!
            },
        });

        console.log('[EXAM_QUESTIONS] Found questions:', allQuestions.length);

        if (allQuestions.length === 0) {
            console.error('[EXAM_QUESTIONS] No questions in database!');
            return ApiResponse.error('No exam questions available. Please contact support.', 404);
        }

        // Shuffle and pick 10
        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 10);

        console.log('[EXAM_QUESTIONS] Returning questions:', selected.length);
        return ApiResponse.success(selected);
    } catch (error) {
        console.error('[EXAM_QUESTIONS_GET]', error);
        return ApiResponse.error('Internal Error', 500);
    }
});
