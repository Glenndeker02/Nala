
import { BudgetService } from '../../lib/services/budget-service';
import db from '../../lib/db';
import { Decimal } from '@prisma/client/runtime/library';

// Mock the db module
jest.mock('../../lib/db', () => ({
    __esModule: true,
    default: {
        campaign: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    },
}));

describe('BudgetService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('reserveFunds', () => {
        it('should reserve funds if budget is available', async () => {
            (db.campaign.findUnique as jest.Mock).mockResolvedValue({
                id: 'camp-1',
                budgetReserved: new Decimal(100),
                totalBudget: new Decimal(500),
            });

            await BudgetService.reserveFunds('camp-1', 50);

            expect(db.campaign.update).toHaveBeenCalledWith({
                where: { id: 'camp-1' },
                data: {
                    budgetReserved: { increment: 50 }
                }
            });
        });

        it('should throw error if budget is insufficient', async () => {
            (db.campaign.findUnique as jest.Mock).mockResolvedValue({
                id: 'camp-1',
                budgetReserved: new Decimal(450),
                totalBudget: new Decimal(500),
            });

            await expect(BudgetService.reserveFunds('camp-1', 100))
                .rejects
                .toThrow("Insufficient budget remaining");

            expect(db.campaign.update).not.toHaveBeenCalled();
        });

        it('should throw if campaign not found', async () => {
            (db.campaign.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(BudgetService.reserveFunds('bad-id', 10))
                .rejects
                .toThrow("Campaign not found");
        });
    });

    describe('releaseFundsForPayout', () => {
        it('should decrement reserved and escrow', async () => {
            await BudgetService.releaseFundsForPayout('camp-1', 100);

            expect(db.campaign.update).toHaveBeenCalledWith({
                where: { id: 'camp-1' },
                data: {
                    budgetReserved: { decrement: 100 },
                    escrowBalance: { decrement: 100 }
                }
            });
        });
    });

});
