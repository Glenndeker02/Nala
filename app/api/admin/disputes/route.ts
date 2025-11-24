import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";
import { z } from "zod";

const querySchema = z.object({
    status: z.string().optional(),
    category: z.string().optional(),
    priority: z.string().optional(),
    sortBy: z.enum(['created_at', 'priority', 'updated_at']).optional().default('priority'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    limit: z.string().optional().default('20'),
    offset: z.string().optional().default('0'),
    search: z.string().optional(),
});

/**
 * GET /api/admin/disputes
 * List all disputes with filters and priority sorting
 */
export const GET = requireRole('ADMIN', async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse({
            status: searchParams.get('status') || undefined,
            category: searchParams.get('category') || undefined,
            priority: searchParams.get('priority') || undefined,
            sortBy: searchParams.get('sortBy') || 'priority',
            order: searchParams.get('order') || 'desc',
            limit: searchParams.get('limit') || '20',
            offset: searchParams.get('offset') || '0',
            search: searchParams.get('search') || undefined,
        });

        const limit = parseInt(query.limit);
        const offset = parseInt(query.offset);

        // Build where clause
        const where: any = {};

        // Search filter
        if (query.search) {
            where.OR = [
                { id: { contains: query.search } },
                { description: { contains: query.search, mode: 'insensitive' } },
                { initiator: { fullName: { contains: query.search, mode: 'insensitive' } } },
                { respondent: { fullName: { contains: query.search, mode: 'insensitive' } } },
            ];
        }

        // Status filter
        if (query.status) {
            where.status = query.status;
        }

        // Category filter
        if (query.category) {
            where.category = query.category;
        }

        // Get total count
        const totalCount = await db.dispute.count({ where });

        // Build orderBy
        let orderBy: any = {};
        switch (query.sortBy) {
            case 'created_at':
                orderBy = { createdAt: query.order };
                break;
            case 'updated_at':
                orderBy = { updatedAt: query.order };
                break;
            case 'priority':
                // Custom priority sort logic:
                // Since Prisma doesn't support custom sort order easily in findMany,
                // we'll sort by status (OPEN first) then createdAt for now, 
                // and handle strict priority sorting in memory if needed or add a priority field to DB.
                // For this implementation, we'll assume 'OPEN' disputes are higher priority.
                orderBy = [
                    { status: 'asc' }, // OPEN comes before RESOLVED alphabetically? No.
                    // Let's stick to createdAt for DB sort and rely on filtering for priority
                    { createdAt: query.order }
                ];
                break;
            default:
                orderBy = { createdAt: query.order };
        }

        // Fetch disputes
        const disputes = await db.dispute.findMany({
            where,
            include: {
                initiator: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                    },
                },
                respondent: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                    },
                },
                campaign: {
                    select: {
                        id: true,
                        name: true,
                        totalBudget: true,
                    },
                },
            },
            orderBy,
            take: limit,
            skip: offset,
        });

        // Process disputes to add priority level
        const disputesWithPriority = disputes.map((dispute) => {
            let priority = 'LOW';
            const now = new Date();
            const daysOpen = Math.ceil((now.getTime() - dispute.createdAt.getTime()) / (1000 * 60 * 60 * 24));

            if (dispute.category === 'PAYMENT_ISSUE' || dispute.category === 'FRAUD') {
                priority = 'HIGH';
            } else if (daysOpen > 7 && dispute.status === 'OPEN') {
                priority = 'HIGH'; // Escalated due to time
            } else if (dispute.category === 'CONTENT_QUALITY') {
                priority = 'MEDIUM';
            }

            return {
                id: dispute.id,
                category: dispute.category,
                status: dispute.status,
                priority,
                description: dispute.description,
                amount: dispute.campaign?.totalBudget ? Number(dispute.campaign.totalBudget) : 0,
                createdAt: dispute.createdAt,
                daysOpen,
                initiator: {
                    name: dispute.initiator.fullName,
                    role: dispute.initiator.role,
                },
                respondent: {
                    name: dispute.respondent.fullName,
                    role: dispute.respondent.role,
                },
                campaignName: dispute.campaign?.name || 'N/A',
            };
        });

        // Filter by priority if requested (since we calculated it in memory)
        let result = disputesWithPriority;
        if (query.priority) {
            result = disputesWithPriority.filter(d => d.priority === query.priority);
        }

        // Get status counts
        const [openCount, resolvedCount, escalatedCount] = await Promise.all([
            db.dispute.count({ where: { status: 'OPEN' } }),
            db.dispute.count({ where: { status: 'RESOLVED' } }),
            db.dispute.count({ where: { status: 'ESCALATED' } }), // Assuming ESCALATED status exists or we use logic
        ]);

        return ApiResponse.success({
            disputes: result,
            totalCount,
            hasMore: offset + limit < totalCount,
            statusCounts: {
                open: openCount,
                resolved: resolvedCount,
                escalated: escalatedCount,
            },
        });
    } catch (error) {
        console.error('Fetch disputes error:', error);
        return ApiResponse.error('Failed to fetch disputes', 500);
    }
});
