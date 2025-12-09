
import { PayoutService } from '../../lib/services/payout-service';

describe('PayoutService', () => {

    describe('calculateBaseFeeSplit', () => {
        it('should split base fee 90/10 between creator and platform', () => {
            const result = PayoutService.calculateBaseFeeSplit(100);
            expect(result.creatorAmount).toBe(90);
            expect(result.platformFee).toBe(10);
            expect(result.founderCharge).toBe(100);
        });

        it('should handle decimal precision correctly', () => {
            const result = PayoutService.calculateBaseFeeSplit(123.45);
            // 10% = 12.345 -> platform
            // 90% = 111.105 -> creator
            // JS numbers might have floating point issues, let's check proximity or if logic uses explicit rounding (it doesn't in code currently, reliance on consumer formatting?)
            // Looking at code: `platformFee = baseFee * 0.10`. No toFixed there. 
            // `creatorAmount = baseFee - platformFee`. 
            // The return type is number.
            expect(result.platformFee).toBeCloseTo(12.345);
            expect(result.creatorAmount).toBeCloseTo(111.105);
        });
    });

    describe('calculateViewPayout', () => {
        it('should calculate $3/$2/$1 split per 1k views', () => {
            const views = 1000;
            const result = PayoutService.calculateViewPayout(views);

            expect(result.founderCharge).toBe(3.00);
            expect(result.creatorAmount).toBe(2.00);
            expect(result.platformFee).toBe(1.00);
        });

        it('should handle partial view counts (e.g. 500 views)', () => {
            const views = 500;
            const result = PayoutService.calculateViewPayout(views);
            // 0.5 units.
            // Founder: 0.5 * 3 = 1.50
            // Creator: 0.5 * 2 = 1.00
            // Platform: 0.5 * 1 = 0.50
            expect(result.founderCharge).toBe(1.50);
            expect(result.creatorAmount).toBe(1.00);
            expect(result.platformFee).toBe(0.50);
        });

        it('should return fixed precision numbers', () => {
            // 1234 views -> 1.234 units
            // Founder: 1.234 * 3 = 3.702 -> "3.70"
            // Creator: 1.234 * 2 = 2.468 -> "2.47"
            // Platform: 1.234 * 1 = 1.234 -> "1.23"
            const result = PayoutService.calculateViewPayout(1234);
            expect(result.founderCharge).toBe(3.70);
            expect(result.creatorAmount).toBe(2.47);
            expect(result.platformFee).toBe(1.23);
        });
    });

    describe('calculateSubscriptionBonus', () => {
        it('should default to 50/50 split of the 5% pool', () => {
            const planPrice = 100; // $100 plan
            const result = PayoutService.calculateSubscriptionBonus(planPrice);

            // Pool = 5% of 100 = $5.
            // Split 50/50 -> $2.50 each.
            expect(result.founderCharge).toBe(5.00);
            expect(result.creatorAmount).toBe(2.50);
            expect(result.platformFee).toBe(2.50);
        });

        it('should respect custom creator share', () => {
            const planPrice = 100;
            // Creator gets 4% of plan price (so Platform gets 1% of plan price, total 5%)
            const result = PayoutService.calculateSubscriptionBonus(planPrice, 4.0);

            expect(result.founderCharge).toBe(5.00);
            expect(result.creatorAmount).toBe(4.00);
            expect(result.platformFee).toBe(1.00);
        });
    });

});
