
import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { ApiResponse, extractUser } from '@/lib/api-middleware';

export const POST = async (req: NextRequest) => {
    try {
        const user = extractUser(req);
        if (!user) {
            return ApiResponse.error('Unauthorized', 401);
        }

        const body = await req.json();
        const { agreementType, campaignId } = body;

        if (!agreementType) {
            return ApiResponse.error('Missing agreement type', 400);
        }

        // Additional validation could go here to ensure user role matches agreement type

        const agreement = await db.legalAgreement.create({
            data: {
                userId: user.userId,
                role: user.role,
                agreementType,
                campaignId,
                version: 'v1.0', // Could be dynamic
                ipAddress: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
                acceptedAt: new Date(),
            },
        });

        return ApiResponse.created({ id: agreement.id });

    } catch (error) {
        console.error('[LEGAL_AGREEMENT_ACCEPT]', error);
        return ApiResponse.error('Failed to record agreement', 500);
    }
};
