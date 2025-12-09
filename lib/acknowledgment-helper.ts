import { db } from '@/lib/db';

/**
 * Check if a creator has acknowledged all required instructions for a campaign
 * @param creatorId - The ID of the creator
 * @param campaignId - The ID of the campaign
 * @returns Object with allAcknowledged boolean and unacknowledgedCount
 */
export async function checkCampaignAcknowledgment(creatorId: string, campaignId: string) {
    try {
        // Fetch all required instructions for the campaign
        const instructions = await db.instruction.findMany({
            where: {
                campaignId,
                requiresAcknowledgment: true,
            },
        });

        // Check which ones are not acknowledged by this creator
        const unacknowledged = instructions.filter(
            (inst) => !inst.acknowledgedBy.includes(creatorId)
        );

        return {
            allAcknowledged: unacknowledged.length === 0,
            unacknowledgedCount: unacknowledged.length,
            totalRequired: instructions.length,
        };
    } catch (error) {
        console.error('Error checking campaign acknowledgment:', error);
        return {
            allAcknowledged: false,
            unacknowledgedCount: 0,
            totalRequired: 0,
        };
    }
}

/**
 * Get unacknowledged instructions for a campaign
 * @param creatorId - The ID of the creator
 * @param campaignId - The ID of the campaign
 * @returns Array of unacknowledged instructions
 */
export async function getUnacknowledgedInstructions(creatorId: string, campaignId: string) {
    try {
        const instructions = await db.instruction.findMany({
            where: {
                campaignId,
                requiresAcknowledgment: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return instructions.filter((inst) => !inst.acknowledgedBy.includes(creatorId));
    } catch (error) {
        console.error('Error fetching unacknowledged instructions:', error);
        return [];
    }
}
