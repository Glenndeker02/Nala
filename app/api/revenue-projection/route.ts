import { NextRequest, NextResponse } from 'next/server';

interface RevenueProjectionRequest {
    impressions: number;
    downloadRate: number;
    paidConversionRate: number;
    monthlyPrice: number;
    monthlyChurnRate: number;
    months: number;
}

interface MonthlyData {
    month: number;
    totalImpressions: number;
    totalDownloads: number;
    newCustomers: number;
    lostCustomers: number;
    totalCustomers: number;
    mrr: number;
}

export async function POST(request: NextRequest) {
    try {
        const body: RevenueProjectionRequest = await request.json();

        const {
            impressions,
            downloadRate,
            paidConversionRate,
            monthlyPrice,
            monthlyChurnRate,
            months = 12
        } = body;

        // Validate inputs
        if (!impressions || !downloadRate || !paidConversionRate || !monthlyPrice || monthlyChurnRate === undefined) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Calculate base metrics
        const downloadsPerMonth = Math.floor(impressions * (downloadRate / 100));
        const newCustomersPerMonth = Math.floor(downloadsPerMonth * (paidConversionRate / 100));
        const churnRate = monthlyChurnRate / 100;

        // Calculate 12-month projection
        const monthlyData: MonthlyData[] = [];
        let totalCustomers = 0;

        for (let month = 1; month <= months; month++) {
            // Calculate cumulative impressions and downloads
            const totalImpressions = impressions * month;
            const totalDownloads = downloadsPerMonth * month;

            // New customers this month
            const newCustomers = newCustomersPerMonth;

            // Calculate lost customers (churn only applies from month 2 onwards)
            // Month 1: customers just signed up, they pay for the first month (0 lost)
            // Month 2+: apply churn to existing customer base
            let lostCustomers = 0;
            if (month > 1) {
                lostCustomers = Math.round(totalCustomers * churnRate);
            }

            // Update total customers
            totalCustomers = totalCustomers + newCustomers - lostCustomers;

            // Calculate MRR
            const mrr = totalCustomers * monthlyPrice;

            monthlyData.push({
                month,
                totalImpressions,
                totalDownloads,
                newCustomers,
                lostCustomers,
                totalCustomers,
                mrr: parseFloat(mrr.toFixed(2))
            });
        }

        // Summary metrics
        const summary = {
            impressions,
            downloads: downloadsPerMonth,
            payingCustomers: newCustomersPerMonth,
            newRevenue: newCustomersPerMonth * monthlyPrice
        };

        return NextResponse.json({
            success: true,
            summary,
            monthlyData
        });

    } catch (error) {
        console.error('Revenue projection error:', error);
        return NextResponse.json(
            { error: 'Failed to calculate revenue projection' },
            { status: 500 }
        );
    }
}
