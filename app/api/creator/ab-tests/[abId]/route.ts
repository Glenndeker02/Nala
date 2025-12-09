import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';

// GET - Fetch A/B test details for creator
export async function GET(
    req: NextRequest,
    { params }: { params: { abId: string } }
) {
    try {
        const user = await requireRole(req, ['CREATOR']);
        const { abId } = params;

        // Fetch test
        const test = await db.aBTest.findUnique({
            where: { id: abId },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true,
                        founderId: true,
                    },
                },
                variants: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!test) {
            return ApiResponse.error('A/B test not found', 404);
        }

        // Verify creator is assigned
        if (!test.assignedCreatorIds.includes(user.id)) {
            return ApiResponse.error('You are not assigned to this A/B test', 403);
        }

        return ApiResponse.success(test);
    } catch (error: any) {
        console.error('Error fetching A/B test:', error);
        return ApiResponse.error(error.message || 'Failed to fetch A/B test', 500);
    }
}
