import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';

// GET - Fetch detailed requirements for specific campaign
export async function GET(
    req: NextRequest,
    { params }: { params: { campaignId: string } }
) {
    try {
        const user = await requireRole(req, ['CREATOR']);
        const { campaignId } = params;

        // Verify creator is accepted into campaign
        const application = await db.application.findFirst({
            where: {
                campaignId,
                creatorId: user.id,
                status: 'ACCEPTED',
            },
        });

        if (!application) {
            return ApiResponse.error('Campaign not found or access denied', 404);
        }

        // Fetch campaign with instructions
        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
            include: {
                instructions: {
                    orderBy: { createdAt: 'desc' },
                },
                founder: {
                    select: {
                        fullName: true,
                        companyName: true,
                    },
                },
            },
        });

        if (!campaign) {
            return ApiResponse.error('Campaign not found', 404);
        }

        // Group instructions by type
        const groupedInstructions = {
            overallCampaign: campaign.instructions.filter(
                (inst) => inst.instructionType === 'OVERALL_CAMPAIGN' || inst.instructionType === 'GLOBAL' || inst.instructionType === 'GENERAL'
            ),
            videoSpecific: campaign.instructions.filter(
                (inst) => inst.instructionType === 'VIDEO_SPECIFIC'
            ),
            revision: campaign.instructions.filter(
                (inst) => inst.instructionType === 'REVISION'
            ),
        };

        // Add acknowledgment status to each instruction
        const addAcknowledgmentStatus = (instructions: any[]) =>
            instructions.map((inst) => ({
                ...inst,
                isAcknowledged: inst.acknowledgedBy.includes(user.id),
            }));

        const result = {
            campaign: {
                id: campaign.id,
                name: campaign.name,
                status: campaign.status,
                deadline: campaign.deadline,
                founderName: campaign.founder.fullName,
                companyName: campaign.founder.companyName,
            },
            instructions: {
                overallCampaign: addAcknowledgmentStatus(groupedInstructions.overallCampaign),
                videoSpecific: addAcknowledgmentStatus(groupedInstructions.videoSpecific),
                revision: addAcknowledgmentStatus(groupedInstructions.revision),
            },
            allAcknowledged: campaign.instructions
                .filter((inst) => inst.requiresAcknowledgment)
                .every((inst) => inst.acknowledgedBy.includes(user.id)),
        };

        return ApiResponse.success(result);
    } catch (error: any) {
        console.error('Error fetching campaign requirements:', error);
        return ApiResponse.error(error.message || 'Failed to fetch campaign requirements', 500);
    }
}
