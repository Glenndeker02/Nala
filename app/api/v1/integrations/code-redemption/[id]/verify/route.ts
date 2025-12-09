import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';
import { z } from 'zod';

const verifySchema = z.object({
    verified: z.boolean(),
    reference: z.string().optional(),
});

export const POST = requireRole(['FOUNDER', 'ADMIN', 'CREATOR'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const redemptionId = params.id;
        const body = await request.json();

        const result = verifySchema.safeParse(body);
        if (!result.success) {
            return ApiResponse.error("Invalid input", 400, result.error.errors);
        }
        const { verified, reference } = result.data;

        // Fetch redemption
        const redemption = await db.codeRedemption.findUnique({
            where: { id: redemptionId },
            include: { campaign: true }
        });

        if (!redemption) {
            return ApiResponse.error("Redemption not found", 404);
        }

        // Authorization
        const isAdmin = user.role === 'ADMIN';
        const isFounder = user.role === 'FOUNDER' && redemption.campaign.founderId === user.userId;

        // Creators cannot verify their own redemptions usually. 
        // But maybe they can upload proof? 
        // For now, let's restrict to Founder/Admin.
        // `cal.md` says: "Verified by founder or system."
        if (!isAdmin && !isFounder) {
            return ApiResponse.error("Unauthorized", 403);
        }

        const updated = await db.codeRedemption.update({
            where: { id: redemptionId },
            data: {
                verified,
                verifiedAt: verified ? new Date() : null,
                verificationReference: reference,
            }
        });

        return ApiResponse.success({ redemption: updated });

    } catch (error) {
        console.error('Error verifying redemption:', error);
        return ApiResponse.error('Internal Server Error', 500);
    }
});
