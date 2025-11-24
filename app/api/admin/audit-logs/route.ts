import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";
import { z } from "zod";

const querySchema = z.object({
    adminId: z.string().optional(),
    actionType: z.string().optional(),
    resourceType: z.string().optional(),
    limit: z.string().optional().default('50'),
    offset: z.string().optional().default('0'),
});

/**
 * GET /api/admin/audit-logs
 * List admin audit logs
 */
export const GET = requireRole('ADMIN', async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse({
            adminId: searchParams.get('adminId') || undefined,
            actionType: searchParams.get('actionType') || undefined,
            resourceType: searchParams.get('resourceType') || undefined,
            limit: searchParams.get('limit') || '50',
            offset: searchParams.get('offset') || '0',
        });

        const limit = parseInt(query.limit);
        const offset = parseInt(query.offset);

        const where: any = {};

        if (query.adminId) where.adminId = query.adminId;
        if (query.actionType) where.actionType = query.actionType;
        if (query.resourceType) where.resourceType = query.resourceType;

        const totalCount = await db.adminAuditLog.count({ where });

        const logs = await db.adminAuditLog.findMany({
            where,
            include: {
                admin: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
            skip: offset,
        });

        const formattedLogs = logs.map(log => ({
            id: log.id,
            adminName: log.admin.user.fullName,
            adminEmail: log.admin.user.email,
            action: log.actionType,
            resource: log.resourceType,
            resourceId: log.resourceId,
            details: log.details,
            ipAddress: log.ipAddress,
            createdAt: log.createdAt,
        }));

        return ApiResponse.success({
            logs: formattedLogs,
            totalCount,
            hasMore: offset + limit < totalCount,
        });
    } catch (error) {
        console.error('Audit logs error:', error);
        return ApiResponse.error('Failed to fetch audit logs', 500);
    }
});
