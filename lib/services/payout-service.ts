import { Campaign } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

interface PayoutCalculation {
    creatorAmount: number;
    platformFee: number;
    founderCharge: number;
}

export class PayoutService {

    /**
     * Calculates the Base Fee payout.
     * Platform takes 10% of the Base Fee budget.
     * 
     * @param baseFee - The amount the Founder pays (or budget).
     * @returns 
     */
    static calculateBaseFeeSplit(baseFee: number): PayoutCalculation {
        // Founder pays Base Fee. 
        // Platform takes 10%.
        // Creator gets 90%.
        // OR does Founder pay Base Fee + 10%?
        // Scenario: "Mike sets Base Fee Budget $500."
        // "Platform Fee: 10% of base fees."
        // Usually, the Fee is deducted from the Budget reserved.
        // So Creator gets $450, Platform $50.

        const platformFee = baseFee * 0.10;
        const creatorAmount = baseFee - platformFee;

        return {
            creatorAmount,
            platformFee,
            founderCharge: baseFee
        };
    }

    /**
     * Calculates breakdown for View-based payments.
     * Founder pays $3 per 1000 views.
     * Creator gets $2 per 1000 views.
     * Platform keeps $1 per 1000 views.
     * 
     * @param views - Number of views
     */
    static calculateViewPayout(views: number): PayoutCalculation {
        const units = views / 1000;

        const founderRate = 3.00;
        const creatorRate = 2.00;
        const platformRate = 1.00; // Derived (3 - 2)

        const founderCharge = units * founderRate;
        const creatorAmount = units * creatorRate;
        const platformFee = units * platformRate;

        return {
            creatorAmount: Number(creatorAmount.toFixed(2)),
            platformFee: Number(platformFee.toFixed(2)),
            founderCharge: Number(founderCharge.toFixed(2))
        };
    }

    /**
     * Calculates Subscription Revenue Share.
     * 5% of Plan Price is the Total Pool.
     * Share between Creator and Platform depends on Campaign settings.
     * Default: 50/50 split of the 5% (i.e. 2.5% each).
     * 
     * @param planPrice - Monthly price of the plan
     * @param creatorSharePercent - Percentage of the PLAN PRICE the creator gets (e.g. 2.5)
     */
    static calculateSubscriptionBonus(planPrice: number, creatorSharePercent: number = 2.5): PayoutCalculation {
        const totalPoolPercent = 5.0; // 5% total
        // If creator gets 2.5%, platform gets 2.5%.
        // If creator gets 5%, platform gets 0%.

        const creatorAmount = planPrice * (creatorSharePercent / 100);
        const platformFee = (planPrice * (totalPoolPercent / 100)) - creatorAmount;

        // Ensure platform fee is not negative? 
        // "Founder pays" implies the 5% is coming out of Revenue, so Founder "pays" the 5% (deducted).
        // Technically, Founder "Charges" are 0 here if it's revenue share deduction?
        // But for "Payout System", we are transferring money FROM Founder's account (Escrow or Stripe) TO Creator.
        // So Founder starts with $100. Verification says "Send 5% to Nala/Creator".
        // Founder Charge = $5. (5% of $100).

        const founderCharge = planPrice * (totalPoolPercent / 100);

        return {
            creatorAmount: Number(creatorAmount.toFixed(2)),
            platformFee: Number(platformFee.toFixed(2)),
            founderCharge: Number(founderCharge.toFixed(2))
        };
    }
}
