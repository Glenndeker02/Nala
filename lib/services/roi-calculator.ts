import db from '@/lib/db';

export interface CalculatorInputs {
    budget: number;
    videos: number;
    views: number;
    downloadRate: number; // Percentage 0-100
    conversionRate: number; // Percentage 0-100
    averagePrice: number;
    churnRate: number; // Percentage 0-100
    months?: number; // Default 12
}

export interface MonthlyProjection {
    month: number;
    newCustomers: number;
    lostCustomers: number;
    totalCustomers: number;
    mrr: number;
    revenue: number; // One-time revenue from new customers
    totalRevenue: number; // MRR + One-time (if applicable, but usually MRR is the focus for SaaS)
}

export interface CalculatorResults {
    summary: {
        totalImpressions: number;
        totalDownloads: number;
        totalPayingCustomers: number;
        initialRevenue: number;
        month1MRR: number;
    };
    projections: MonthlyProjection[];
}

export class ROICalculatorService {
    /**
     * Calculate ROI projections based on inputs
     */
    static calculateProjections(inputs: CalculatorInputs): CalculatorResults {
        const {
            views,
            downloadRate,
            conversionRate,
            averagePrice,
            churnRate,
            months = 12,
        } = inputs;

        // 1. Initial Funnel Calculations
        // Impressions / Views -> Downloads
        const totalDownloads = Math.floor(views * (downloadRate / 100));

        // Downloads -> Paying Customers
        const totalPayingCustomers = Math.floor(totalDownloads * (conversionRate / 100));

        // New Revenue (One-time / Initial)
        const initialRevenue = totalPayingCustomers * averagePrice;

        // Month 1 MRR
        const month1MRR = totalPayingCustomers * averagePrice;

        // 2. Monthly Projections (Cohort Model)
        const projections: MonthlyProjection[] = [];
        let currentCustomers = 0;

        for (let i = 1; i <= months; i++) {
            let newCustomers = 0;

            // For Month 1, we attribute all the campaign's new customers
            // For subsequent months, we assume 0 new customers from THIS specific campaign
            // unless we want to model recurring ad spend, but requirements say "single campaign lift"
            if (i === 1) {
                newCustomers = totalPayingCustomers;
            }

            // Calculate Churn
            // Churn applies to customers from previous month
            const lostCustomers = Math.floor(currentCustomers * (churnRate / 100));

            // Update Total Customers
            currentCustomers = currentCustomers + newCustomers - lostCustomers;

            // Calculate MRR
            const mrr = currentCustomers * averagePrice;

            projections.push({
                month: i,
                newCustomers,
                lostCustomers,
                totalCustomers: currentCustomers,
                mrr,
                revenue: newCustomers * averagePrice, // Revenue from NEW customers this month
                totalRevenue: mrr // Total recurring revenue for this month
            });
        }

        return {
            summary: {
                totalImpressions: views,
                totalDownloads,
                totalPayingCustomers,
                initialRevenue,
                month1MRR
            },
            projections
        };
    }

    /**
     * Save a calculator scenario for a user
     */
    static async saveScenario(userId: string, name: string, inputs: CalculatorInputs, campaignId?: string) {
        // Run calculation to ensure results are up to date
        const results = this.calculateProjections(inputs);

        return await db.calculatorScenario.create({
            data: {
                ownerId: userId,
                campaignId,
                name,
                inputs: inputs as any,
                results: results as any,
            },
        });
    }

    /**
     * Get a scenario by ID
     */
    static async getScenario(id: string) {
        return await db.calculatorScenario.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                }
            }
        });
    }

    /**
     * List scenarios for a user
     */
    static async getUserScenarios(userId: string) {
        return await db.calculatorScenario.findMany({
            where: { ownerId: userId },
            orderBy: { createdAt: 'desc' }
        });
    }
}
