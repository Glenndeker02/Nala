import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(['CREATOR', 'ADMIN'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const creatorId = params.id;

        // Check verification (self or admin)
        if (user.role !== 'ADMIN' && user.userId !== creatorId) {
            return ApiResponse.error("Unauthorized", 403);
        }

        const codes = await db.attributionCode.findMany({
            where: { creatorId },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true,
                        brandName: true,
                        status: true
                    }
                }
            },
            orderBy: { generatedAt: 'desc' }
        });

        return ApiResponse.success({ codes });

    } catch (error) {
        console.error('Error fetching creator codes:', error);
        return ApiResponse.error('Internal Server Error', 500);
    }
});
