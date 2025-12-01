import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { z } from 'zod';

// Schema for creating a campaign goal
const createGoalSchema = z.object({
    type: z.enum(['VIEWS', 'LIKES', 'SHARES', 'COMMENTS', 'CONVERSIONS', 'REVENUE']),
    targetValue: z.number().positive('Target value must be positive'),
    deadline: z.string().optional().transform(str => str ? new Date(str) : undefined),
    description: z.string().optional(),
});

// GET - List goals for a campaign
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireRole(req, ['FOUNDER', 'ADMIN']);
        const campaignId = params.id;

        // Verify campaign ownership
        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
            select: { founderId: true },
        });

        if (!campaign) {
            return ApiResponse.error('Campaign not found', 404);
        }

        if (campaign.founderId !== user.id && user.role !== 'ADMIN') {
            return ApiResponse.error('Unauthorized', 403);
        }

        // Fetch goals
        const goals = await db.campaignGoal.findMany({
            where: { campaignId },
            orderBy: { createdAt: 'desc' },
        });

        return ApiResponse.success(goals);
    } catch (error: any) {
        console.error('Error fetching campaign goals:', error);
        return ApiResponse.error(error.message || 'Failed to fetch goals', 500);
    }
}

// POST - Create a new goal
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireRole(req, ['FOUNDER', 'ADMIN']);
        const campaignId = params.id;
        const body = await req.json();

        // Validate request body
        const validation = createGoalSchema.safeParse(body);
        if (!validation.success) {
            return ApiResponse.error('Validation failed', 400, validation.error.errors);
        }

        const { type, targetValue, deadline, description } = validation.data;

        // Verify campaign ownership
        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
            select: { founderId: true },
        });

        if (!campaign) {
            return ApiResponse.error('Campaign not found', 404);
        }

        if (campaign.founderId !== user.id && user.role !== 'ADMIN') {
            return ApiResponse.error('Unauthorized', 403);
        }

        // Create goal
        const goal = await db.campaignGoal.create({
            data: {
                campaignId,
                type,
                targetValue,
                currentValue: 0, // Initial value is 0
                deadline,
                description,
                status: 'IN_PROGRESS',
            },
        });

        return ApiResponse.success(goal, 201);
    } catch (error: any) {
        console.error('Error creating campaign goal:', error);
        return ApiResponse.error(error.message || 'Failed to create goal', 500);
    }
}
