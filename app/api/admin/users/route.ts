import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, JWTPayload, requireRole } from "@/lib/api-middleware";

/**
 * GET /api/admin/users
 * List all admin users
 */
export const GET = requireRole('ADMIN', async (request: NextRequest) => {
    try {
        const admins = await db.adminUser.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        lastLoginAt: true,
                    },
                },
            },
            orderBy: {
                adminLevel: 'desc', // DIRECTOR first
            },
        });

        const formattedAdmins = admins.map(admin => ({
            id: admin.id,
            recipientId: admin.userId,
            name: admin.user.fullName,
            email: admin.user.email,
            level: admin.adminLevel,
            queue: admin.assignedQueue,
            active: admin.active,
            lastLogin: admin.user.lastLoginAt,
            permissions: admin.permissions,
        }));

        return ApiResponse.success(formattedAdmins);
    } catch (error) {
        console.error('Fetch admins error:', error);
        return ApiResponse.error('Failed to fetch admin users', 500);
    }
});
