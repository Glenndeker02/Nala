import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { z } from 'zod';

// Schema for updating a campaign goal
const updateGoalSchema = z.object({
    targetValue: z.number().positive().optional(),
    deadline: z.string().optional().transform(str => str ? new Date(str) : undefined),
    description: z.string().optional(),
    status: z.enum(['IN_PROGRESS', 'COMPLETED', 'FAILED']).optional(),
});

// GET - Get a specific goal
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string; goalId: string } }
) {
    try {
        const user = await requireRole(req, ['FOUNDER', 'ADMIN']);
        const { id: campaignId, goalId } = params;

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

        // Fetch goal
        const goal = await db.campaignGoal.findUnique({
            where: { id: goalId, campaignId },
        });

        if (!goal) {
            return ApiResponse.error('Goal not found', 404);
        }

        return ApiResponse.success(goal);
    } catch (error: any) {
        console.error('Error fetching campaign goal:', error);
        return ApiResponse.error(error.message || 'Failed to fetch goal', 500);
    }
}

// PATCH - Update a goal
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string; goalId: string } }
) {
    try {
        const user = await requireRole(req, ['FOUNDER', 'ADMIN']);
        const { id: campaignId, goalId } = params;
        const body = await req.json();

        // Validate request body
        const validation = updateGoalSchema.safeParse(body);
        if (!validation.success) {
            return ApiResponse.error('Validation failed', 400, validation.error.errors);
        }

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

        // Check if goal exists
        const existingGoal = await db.campaignGoal.findUnique({
            where: { id: goalId, campaignId },
        });

        if (!existingGoal) {
            return ApiResponse.error('Goal not found', 404);
        }

        // Update goal
        const updatedGoal = await db.campaignGoal.update({
            where: { id: goalId },
            data: validation.data,
        });

        return ApiResponse.success(updatedGoal);
    } catch (error: any) {
        console.error('Error updating campaign goal:', error);
        return ApiResponse.error(error.message || 'Failed to update goal', 500);
    }
}

// DELETE - Delete a goal
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string; goalId: string } }
) {
    try {
        const user = await requireRole(req, ['FOUNDER', 'ADMIN']);
        const { id: campaignId, goalId } = params;

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

        // Delete goal
        await db.campaignGoal.delete({
            where: { id: goalId, campaignId },
        });

        return ApiResponse.success({ message: 'Goal deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting campaign goal:', error);
        return ApiResponse.error(error.message || 'Failed to delete goal', 500);
    }
}
