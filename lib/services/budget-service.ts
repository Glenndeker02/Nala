import db from '@/lib/db';

export class BudgetService {

    /**
     * Reserves funds from the campaign's budget into escrow.
     * Throws error if insufficient budget (though total budget usually implies limit).
     * 
     * @param campaignId 
     * @param amount 
     */
    static async reserveFunds(campaignId: string, amount: number) {
        // Validation: Check if Total Budget allows?
        // Usually, Total Budget is the cap. 
        // reservedBudget tracks how much is currently "locked" for pending work.
        // escrowBalance might track actual cash held?

        // Simpler logic: Increment budgetReserved. 
        // Ensure budgetReserved + amount <= totalBudget?

        const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
        if (!campaign) throw new Error("Campaign not found");

        // Assumption: totalBudget is the Max Spend.
        const currentReserved = campaign.budgetReserved.toNumber();
        const total = campaign.totalBudget.toNumber();

        if (currentReserved + amount > total) {
            throw new Error("Insufficient budget remaining");
        }

        await db.campaign.update({
            where: { id: campaignId },
            data: {
                budgetReserved: { increment: amount },
                // If we are moving money to escrow, maybe increment escrowBalance too?
                // escrowBalance usually means "Funds collected from Founder".
                // Let's assume Stripe Payment happens separately and fills escrowBalance.
                // For now, track Reservation.
            }
        });
    }

    /**
     * Releases funds from escrow/reserved to Payout.
     * Decreases reserved budget and escrow balance (if paid out).
     * 
     * @param campaignId 
     * @param amount 
     */
    static async releaseFundsForPayout(campaignId: string, amount: number) {
        // When payout is made, we decrease reserved amount (task done) 
        // AND decrease escrow balance (money leaves system).

        await db.campaign.update({
            where: { id: campaignId },
            data: {
                budgetReserved: { decrement: amount },
                escrowBalance: { decrement: amount }
            }
        });
    }

    /**
     * Refunds unused reserved funds back to available budget (un-reserve).
     */
    static async unreserveFunds(campaignId: string, amount: number) {
        await db.campaign.update({
            where: { id: campaignId },
            data: {
                budgetReserved: { decrement: amount }
            }
        });
    }
}
