import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';

// GET - Fetch all campaign requirements for logged-in creator
export async function GET(req: NextRequest) {
    try {
        const user = await requireRole(req, ['CREATOR']);

        // Fetch all campaigns where creator is accepted
        const applications = await db.application.findMany({
            where: {
                creatorId: user.id,
                status: 'ACCEPTED',
            },
            include: {
                campaign: {
                    include: {
                        instructions: {
                            orderBy: { createdAt: 'desc' },
                        },
                    },
                },
            },
        });

        // Transform data into campaign requirements format
        const campaigns = applications.map((app) => {
            const campaign = app.campaign;
            const instructions = campaign.instructions;

            // Calculate unacknowledged count
            const unacknowledgedCount = instructions.filter(
                (inst) =>
                    inst.requiresAcknowledgment &&
                    !inst.acknowledgedBy.includes(user.id)
            ).length;

            // Get last updated timestamp
            const lastUpdated =
                instructions.length > 0
                    ? instructions[0].createdAt
                    : campaign.updatedAt;

            return {
                id: campaign.id,
                name: campaign.name,
                status: campaign.status,
                instructions: instructions.map((inst) => ({
                    id: inst.id,
                    text: inst.text,
                    instructionType: inst.instructionType,
                    videoNumber: inst.videoNumber,
                    appliesTo: inst.appliesTo,
                    createdAt: inst.createdAt,
                    requiresAcknowledgment: inst.requiresAcknowledgment,
                    isAcknowledged: inst.acknowledgedBy.includes(user.id),
                })),
                unacknowledgedCount,
                lastUpdated,
            };
        });

        // Sort by unacknowledged count (descending) then by last updated
        campaigns.sort((a, b) => {
            if (a.unacknowledgedCount !== b.unacknowledgedCount) {
                return b.unacknowledgedCount - a.unacknowledgedCount;
            }
            return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        });

        return ApiResponse.success({ campaigns });
    } catch (error: any) {
        console.error('Error fetching campaign requirements:', error);
        return ApiResponse.error(error.message || 'Failed to fetch campaign requirements', 500);
    }
}
