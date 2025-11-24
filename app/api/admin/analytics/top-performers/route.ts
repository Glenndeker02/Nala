import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";

/**
 * GET /api/admin/analytics/top-performers
 * Get top spending founders and top earning creators
 */
export const GET = requireRole('ADMIN', async (request: NextRequest) => {
    try {
        // Top Creators: Sum of payments where recipient is the creator
        const topCreatorsRaw = await db.payment.groupBy({
            by: ['recipientId'],
            _sum: {
                amount: true,
            },
            where: {
                status: 'COMPLETED',
                type: { in: ['BASE_FEE', 'PERFORMANCE_BONUS'] },
            },
            orderBy: {
                _sum: {
                    amount: 'desc',
                },
            },
            take: 5,
        });

        // Fetch user details for these creators
        const topCreators = await Promise.all(
            topCreatorsRaw.map(async (item) => {
                const user = await db.user.findUnique({
                    where: { id: item.recipientId },
                    select: { fullName: true, email: true },
                });
                return {
                    id: item.recipientId,
                    name: user?.fullName || 'Unknown',
                    email: user?.email,
                    totalEarnings: Number(item._sum.amount),
                };
            })
        );

        // Top Founders: Sum of budgets of active/completed campaigns
        // This is an approximation since we don't have a direct "FounderPayment" table visible in the snippet 
        // (though there might be one, or we use Stripe IDs).
        // We'll use Campaign totalBudget.
        const topFoundersRaw = await db.campaign.groupBy({
            by: ['founderId'],
            _sum: {
                totalBudget: true,
            },
            where: {
                status: { in: ['ACTIVE', 'COMPLETED', 'IN_PROGRESS'] },
            },
            orderBy: {
                _sum: {
                    totalBudget: 'desc',
                },
            },
            take: 5,
        });

        const topFounders = await Promise.all(
            topFoundersRaw.map(async (item) => {
                const user = await db.user.findUnique({
                    where: { id: item.founderId },
                    select: { fullName: true, companyName: true },
                });
                return {
                    id: item.founderId,
                    name: user?.fullName || 'Unknown',
                    company: user?.companyName,
                    totalCommitted: Number(item._sum.totalBudget),
                };
            })
        );

        return ApiResponse.success({
            topCreators,
            topFounders,
        });
    } catch (error) {
        console.error('Top performers analytics error:', error);
        return ApiResponse.error('Failed to fetch top performers', 500);
    }
});
