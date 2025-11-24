import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";
import { z } from "zod";

const querySchema = z.object({
    period: z.enum(['7d', '30d', '90d', '12m', 'all']).optional().default('30d'),
    groupBy: z.enum(['day', 'week', 'month']).optional().default('day'),
});

/**
 * GET /api/admin/analytics/revenue
 * Get detailed revenue breakdown
 */
export const GET = requireRole('ADMIN', async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse({
            period: searchParams.get('period') || '30d',
            groupBy: searchParams.get('groupBy') || 'day',
        });

        const now = new Date();
        let startDate = new Date();

        switch (query.period) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            case '12m':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            case 'all':
                startDate = new Date(0); // Beginning of time
                break;
        }

        // Fetch revenue records
        const revenueRecords = await db.revenue.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        // Fetch GMV (Total Payments excluding refunds)
        const payments = await db.payment.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                },
                type: {
                    not: 'REFUND',
                },
                status: 'COMPLETED',
            },
        });

        // Calculate totals
        const totalRevenue = revenueRecords.reduce((sum, r) => sum + Number(r.amount), 0);
        const totalGMV = payments.reduce((sum, p) => sum + Number(p.amount), 0);

        // Calculate revenue by type
        const revenueByType: Record<string, number> = {};
        revenueRecords.forEach(r => {
            revenueByType[r.type] = (revenueByType[r.type] || 0) + Number(r.amount);
        });

        // Group data for charts
        const chartData: Record<string, { revenue: number; gmv: number }> = {};

        // Helper to format date key
        const getDateKey = (date: Date) => {
            if (query.groupBy === 'month') {
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            } else if (query.groupBy === 'week') {
                // Simple week grouping (start of week)
                const d = new Date(date);
                const day = d.getDay();
                const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
                d.setDate(diff);
                return d.toISOString().split('T')[0];
            }
            return date.toISOString().split('T')[0];
        };

        // Initialize chart data with 0s for the period (simplified for now, just filling existing data)
        // In a production app, we'd fill gaps with 0s

        revenueRecords.forEach(r => {
            const key = getDateKey(r.createdAt);
            if (!chartData[key]) chartData[key] = { revenue: 0, gmv: 0 };
            chartData[key].revenue += Number(r.amount);
        });

        payments.forEach(p => {
            const key = getDateKey(p.createdAt);
            if (!chartData[key]) chartData[key] = { revenue: 0, gmv: 0 };
            chartData[key].gmv += Number(p.amount);
        });

        // Convert to array and sort
        const timeline = Object.entries(chartData)
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return ApiResponse.success({
            totalRevenue,
            totalGMV,
            revenueByType,
            timeline,
            period: query.period,
        });
    } catch (error) {
        console.error('Revenue analytics error:', error);
        return ApiResponse.error('Failed to fetch revenue analytics', 500);
    }
});
