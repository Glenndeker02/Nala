import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(['ADMIN'], async (request: NextRequest) => {
    try {
        const payouts = await db.payout.findMany({
            include: {
                creator: {
                    select: { fullName: true, email: true }
                },
                campaign: {
                    select: { name: true, founderId: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100 // Limit for now
        });

        return ApiResponse.success({ payouts });

    } catch (error) {
        console.error('Error fetching payouts:', error);
        return ApiResponse.error('Internal Server Error', 500);
    }
});
