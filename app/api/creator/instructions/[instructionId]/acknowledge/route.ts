import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';

// POST - Acknowledge a specific instruction
export async function POST(
    req: NextRequest,
    { params }: { params: { instructionId: string } }
) {
    try {
        const user = await requireRole(req, ['CREATOR']);

        if (!user) {
            return ApiResponse.error('Unauthorized', 401);
        }

        const { instructionId } = params;

        // Fetch instruction
        const instruction = await db.instruction.findUnique({
            where: { id: instructionId },
            include: {
                campaign: {
                    include: {
                        applications: {
                            where: {
                                creatorId: user.userId,
                                status: 'ACCEPTED',
                            },
                        },
                    },
                },
            },
        });

        if (!instruction) {
            return ApiResponse.error('Instruction not found', 404);
        }

        // Verify creator is accepted into campaign
        if (instruction.campaign.applications.length === 0) {
            return ApiResponse.error('Access denied', 403);
        }

        // Check if already acknowledged
        if (instruction.acknowledgedBy.includes(user.userId)) {
            return ApiResponse.success({
                message: 'Instruction already acknowledged',
                instruction: {
                    ...instruction,
                    isAcknowledged: true,
                },
            });
        }

        // Add creator to acknowledgedBy array
        const updatedInstruction = await db.instruction.update({
            where: { id: instructionId },
            data: {
                acknowledgedBy: {
                    push: user.userId,
                },
            },
        });

        // Create audit log
        await db.instructionAudit.create({
            data: {
                instructionId,
                action: 'ACKNOWLEDGED',
                actorId: user.userId,
                changes: {
                    acknowledgedBy: user.userId,
                    acknowledgedAt: new Date(),
                },
            },
        });

        // Check if all required instructions for this campaign are now acknowledged
        const allInstructions = await db.instruction.findMany({
            where: {
                campaignId: instruction.campaignId,
                requiresAcknowledgment: true,
            },
        });

        const allAcknowledged = allInstructions.every((inst) =>
            inst.acknowledgedBy.includes(user.userId)
        );

        return ApiResponse.success({
            message: 'Instruction acknowledged successfully',
            instruction: {
                ...updatedInstruction,
                isAcknowledged: true,
            },
            allAcknowledged,
        });
    } catch (error: any) {
        console.error('Error acknowledging instruction:', error);
        return ApiResponse.error(error.message || 'Failed to acknowledge instruction', 500);
    }
}
