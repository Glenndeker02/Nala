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

// Helper to calculate current value based on metrics
async function calculateCurrentValue(campaignId: string, type: string): Promise<number> {
    try {
        if (type === 'VIEWS') {
            const aggregate = await db.video.aggregate({
                where: { campaignId },
                _sum: { currentViewCount: true }
            });
            return aggregate._sum.currentViewCount || 0;
        }

        if (['LIKES', 'SHARES', 'COMMENTS'].includes(type)) {
            const videos = await db.video.findMany({
                where: { campaignId },
                select: { performanceMetrics: true }
            });

            return videos.reduce((sum, video) => {
                const metrics = video.performanceMetrics as any || {};
                // Map type to key: LIKES -> likes, SHARES -> shares, etc.
                const key = type.toLowerCase();
                const val = Number(metrics[key] || 0);
                return sum + val;
            }, 0);
        }

        if (type === 'REVENUE') {
            const campaign = await db.campaign.findUnique({
                where: { id: campaignId },
                select: { platformRevenue: true }
            });
            return Number(campaign?.platformRevenue || 0);
        }
    } catch (error) {
        console.error(`Error calculating current value for ${type}:`, error);
    }
    return 0;
}

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

        // Update current values and status for all goals
        const updatedGoals = await Promise.all(goals.map(async (goal) => {
            const currentValue = await calculateCurrentValue(campaignId, goal.type);
            let status = goal.status;

            // Auto-complete if target reached
            if (currentValue >= Number(goal.targetValue) && status !== 'COMPLETED') {
                status = 'COMPLETED';
            }

            // Mark as failed if deadline passed and not completed
            if (goal.deadline && new Date(goal.deadline) < new Date() && status !== 'COMPLETED' && currentValue < Number(goal.targetValue)) {
                status = 'FAILED';
            }

            // Only update DB if value or status changed
            if (Number(goal.currentValue) !== currentValue || goal.status !== status) {
                return await db.campaignGoal.update({
                    where: { id: goal.id },
                    data: { currentValue, status },
                });
            }
            return goal;
        }));

        return ApiResponse.success(updatedGoals);
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

        console.log('Creating goal for campaign:', campaignId, 'Body:', body);

        // Validate request body
        const validation = createGoalSchema.safeParse(body);
        if (!validation.success) {
            console.error('Validation error:', validation.error);
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

        // Calculate initial current value (e.g. if campaign already has views)
        const currentValue = await calculateCurrentValue(campaignId, type);

        // Create goal
        const goal = await db.campaignGoal.create({
            data: {
                campaignId,
                name: `${type} Goal`, // Default name
                type,
                targetValue,
                currentValue,
                deadline,
                description,
                status: 'IN_PROGRESS',
            },
        });

        console.log('Goal created successfully:', goal);
        return ApiResponse.success(goal, 201);
    } catch (error: any) {
        console.error('Error creating campaign goal:', error);
        return ApiResponse.error(error.message || 'Failed to create goal', 500);
    }
}
