import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireAuth, ApiResponse } from '@/lib/api-middleware';
import { z } from 'zod';

const disputeSchema = z.object({
    campaignId: z.string(),
    videoId: z.string().optional(),
    respondentId: z.string(),
    category: z.enum(['VIEW_COUNT_DISCREPANCY', 'CONTENT_QUALITY', 'POSTING_VIOLATION', 'PAYMENT_ISSUE', 'OTHER']),
    description: z.string().min(10),
});

export const POST = requireAuth(async (request: NextRequest, user) => {
    try {
        const body = await request.json();
        const validation = disputeSchema.safeParse(body);

        if (!validation.success) {
            return ApiResponse.error('Invalid data', 400, validation.error.errors);
        }

        const data = validation.data;

        // Create dispute
        const dispute = await db.dispute.create({
            data: {
                campaignId: data.campaignId,
                videoId: data.videoId,
                initiatorId: user.userId,
                respondentId: data.respondentId,
                category: data.category,
                description: data.description,
                status: 'OPEN',
            },
        });

        // Notify respondent
        await db.notification.create({
            data: {
                userId: data.respondentId,
                type: 'DISPUTE',
                title: 'New Dispute Filed',
            });
