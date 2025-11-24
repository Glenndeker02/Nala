import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, JWTPayload, requireRole } from "@/lib/api-middleware";
import { z } from "zod";

const querySchema = z.object({
    tier: z.enum(['SILVER', 'GOLD', 'PLATINUM']).optional(),
    sortBy: z.enum(['spending', 'campaigns', 'joined_date', 'name']).optional().default('joined_date'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    limit: z.string().optional().default('20'),
    offset: z.string().optional().default('0'),
    search: z.string().optional(),
});

/**
 * GET /api/admin/founders
 * List all founders with filters and pagination
 */
export const GET = requireRole('ADMIN', async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse({
            tier: searchParams.get('tier') || undefined,
            sortBy: searchParams.get('sortBy') || 'joined_date',
            order: searchParams.get('order') || 'desc',
            limit: searchParams.get('limit') || '20',
            offset: searchParams.get('offset') || '0',
            search: searchParams.get('search') || undefined,
        });

        const limit = parseInt(query.limit);
        const offset = parseInt(query.offset);

        // Build where clause
        const where: any = {
            role: 'FOUNDER',
        };

        // Search filter
        if (query.search) {
            where.OR = [
                { fullName: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
                { companyName: { contains: query.search, mode: 'insensitive' } },
                { id: { contains: query.search } },
            ];
        }

        // Tier filter
        if (query.tier) {
            where.founderTier = query.tier;
        }

        // Get total count
        const totalCount = await db.user.count({ where });

        // Build orderBy
        let orderBy: any = {};
        switch (query.sortBy) {
            case 'name':
                orderBy = { fullName: query.order };
                break;
            case 'joined_date':
                orderBy = { createdAt: query.order };
                break;
            case 'spending':
                // Complex sort, fallback to joined_date for now in Prisma
                // Real implementation might need raw query or post-sort
                orderBy = { createdAt: query.order };
                break;
            case 'campaigns':
                // Complex sort, fallback
                orderBy = { createdAt: query.order };
                break;
            default:
                orderBy = { createdAt: query.order };
        }

        // Fetch founders
        const founders = await db.user.findMany({
            where,
            include: {
                campaigns: {
                    select: {
                        id: true,
                        status: true,
                        totalBudget: true,
                    },
                },
                payments: {
                    where: {
                        status: 'COMPLETED',
                        type: 'CAMPAIGN_FUNDING',
                    },
                    select: {
                        amount: true,
                    },
                },
            },
            orderBy,
            take: limit,
            skip: offset,
        });

        // Process founders to add stats
        const foundersWithStats = founders.map((founder) => {
            const totalSpending = founder.payments.reduce((sum, p) => sum + Number(p.amount), 0);
            const activeCampaigns = founder.campaigns.filter(c => ['ACTIVE', 'IN_PROGRESS'].includes(c.status)).length;
            const totalCampaigns = founder.campaigns.length;

            return {
                id: founder.id,
                name: founder.fullName,
                email: founder.email,
                companyName: founder.companyName,
                joinedDate: founder.createdAt,
                tier: founder.founderTier || 'SILVER', // Default to SILVER
                totalSpending,
                activeCampaigns,
                totalCampaigns,
                status: founder.suspendedUntil && founder.suspendedUntil > new Date()
                    ? 'SUSPENDED'
                    : founder.bannedReason
                        ? 'BANNED'
                        : 'ACTIVE',
            };
        });

        // Handle manual sorting if needed (e.g. spending)
        if (query.sortBy === 'spending') {
            foundersWithStats.sort((a, b) => {
                return query.order === 'asc'
                    ? a.totalSpending - b.totalSpending
                    : b.totalSpending - a.totalSpending;
            });
        } else if (query.sortBy === 'campaigns') {
            foundersWithStats.sort((a, b) => {
                return query.order === 'asc'
                    ? a.totalCampaigns - b.totalCampaigns
                    : b.totalCampaigns - a.totalCampaigns;
            });
        }

        // Get status counts
        const [activeCount, suspendedCount, bannedCount] = await Promise.all([
            db.user.count({ where: { role: 'FOUNDER', suspendedUntil: null, bannedReason: null } }),
            db.user.count({ where: { role: 'FOUNDER', suspendedUntil: { not: null } } }),
            db.user.count({ where: { role: 'FOUNDER', bannedReason: { not: null } } }),
        ]);

        return ApiResponse.success({
            founders: foundersWithStats,
            totalCount,
            hasMore: offset + limit < totalCount,
            statusCounts: {
                active: activeCount,
                suspended: suspendedCount,
                banned: bannedCount,
            },
        });
    } catch (error) {
        console.error('Fetch founders error:', error);
        return ApiResponse.error('Failed to fetch founders', 500);
    }
});
