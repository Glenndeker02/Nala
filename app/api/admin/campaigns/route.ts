import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";
import { z } from "zod";

const querySchema = z.object({
    status: z.string().optional(),
    platform: z.string().optional(),
    sortBy: z.enum(['budget', 'created_at', 'applications', 'deadline']).optional().default('created_at'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    limit: z.string().optional().default('20'),
    offset: z.string().optional().default('0'),
    search: z.string().optional(),
    hasAlerts: z.string().optional(), // 'true' or 'false'
});

/**
 * GET /api/admin/campaigns
 * List all campaigns with filters and alerts
 */
export const GET = requireRole('ADMIN', async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse({
            status: searchParams.get('status') || undefined,
            platform: searchParams.get('platform') || undefined,
            sortBy: searchParams.get('sortBy') || 'created_at',
            order: searchParams.get('order') || 'desc',
            limit: searchParams.get('limit') || '20',
            offset: searchParams.get('offset') || '0',
            search: searchParams.get('search') || undefined,
            hasAlerts: searchParams.get('hasAlerts') || undefined,
        });

        const limit = parseInt(query.limit);
        const offset = parseInt(query.offset);

        // Build where clause
        const where: any = {};

        // Search filter
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { brandName: { contains: query.search, mode: 'insensitive' } },
                { id: { contains: query.search } },
            ];
        }

        // Status filter
        if (query.status) {
            where.status = query.status;
        }

        // Platform filter
        if (query.platform) {
            where.platform = { has: query.platform };
        }

        // Get total count
        const totalCount = await db.campaign.count({ where });

        // Build orderBy
        let orderBy: any = {};
        switch (query.sortBy) {
            case 'budget':
                orderBy = { totalBudget: query.order };
                break;
            case 'created_at':
                orderBy = { createdAt: query.order };
                break;
            case 'deadline':
                orderBy = { deadline: query.order };
                break;
            case 'applications':
                orderBy = { applications: { _count: query.order } };
                break;
            default:
                orderBy = { createdAt: query.order };
        }

        // Fetch campaigns
        const campaigns = await db.campaign.findMany({
            where,
            include: {
                founder: {
                    select: {
                        id: true,
                        fullName: true,
                        companyName: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        applications: true,
                        videos: true,
                        disputes: true,
                    },
                },
            },
            orderBy,
            take: limit,
            skip: offset,
        });

        // Process campaigns to add alerts and derived status
        const campaignsWithAlerts = campaigns.map((campaign) => {
            const alerts = [];
            const now = new Date();
            const deadline = campaign.deadline ? new Date(campaign.deadline) : null;
            const daysUntilDeadline = deadline ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

            // Alert: High Dispute Rate
            if (campaign._count.disputes > 0) {
                alerts.push({
                    type: 'DISPUTE',
                    severity: 'HIGH',
                    message: `${campaign._count.disputes} active disputes`,
                });
            }

            // Alert: Approaching Deadline with Low Applications
            if (campaign.status === 'ACTIVE' && daysUntilDeadline !== null && daysUntilDeadline < 3 && campaign._count.applications < 5) {
                alerts.push({
                    type: 'LOW_APPLICATIONS',
                    severity: 'MEDIUM',
                    message: `Deadline in ${daysUntilDeadline} days with only ${campaign._count.applications} applications`,
                });
            }

            // Alert: Stalled Campaign (No activity for 7 days)
            const lastActivity = new Date(campaign.updatedAt);
            const daysSinceActivity = Math.ceil((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

            if (['ACTIVE', 'IN_PROGRESS'].includes(campaign.status) && daysSinceActivity > 7) {
                alerts.push({
                    type: 'STALLED',
                    severity: 'LOW',
                    message: `No activity for ${daysSinceActivity} days`,
                });
            }

            return {
                id: campaign.id,
                name: campaign.name,
                brandName: campaign.brandName,
                founder: {
                    name: campaign.founder.fullName,
                    company: campaign.founder.companyName,
                    email: campaign.founder.email,
                },
                status: campaign.status,
                platform: campaign.platform,
                budget: Number(campaign.totalBudget),
                deadline: campaign.deadline,
                stats: {
                    applications: campaign._count.applications,
                    videos: campaign._count.videos,
                    disputes: campaign._count.disputes,
                },
                alerts,
                createdAt: campaign.createdAt,
            };
        });

        // Filter by alerts if requested
        let result = campaignsWithAlerts;
        if (query.hasAlerts === 'true') {
            result = campaignsWithAlerts.filter(c => c.alerts.length > 0);
        }

        // Get status counts
        const [activeCount, completedCount, disputeCount] = await Promise.all([
            db.campaign.count({ where: { status: { in: ['ACTIVE', 'IN_PROGRESS'] } } }),
            db.campaign.count({ where: { status: 'COMPLETED' } }),
            db.campaign.count({ where: { disputes: { some: {} } } }), // Campaigns with disputes
        ]);

        return ApiResponse.success({
            campaigns: result,
            totalCount,
            hasMore: offset + limit < totalCount,
            statusCounts: {
                active: activeCount,
                completed: completedCount,
                withDisputes: disputeCount,
            },
        });
    } catch (error) {
        console.error('Fetch campaigns error:', error);
        return ApiResponse.error('Failed to fetch campaigns', 500);
    }
});
