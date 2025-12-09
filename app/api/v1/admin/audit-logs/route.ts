import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(['ADMIN'], async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        const entity = searchParams.get('entity');
        const userId = searchParams.get('userId');

        const where: any = {};
        if (entity) where.entity = entity;
        if (userId) where.userId = userId;

        const logs = await db.auditLog.findMany({
            where,
            include: { user: { select: { fullName: true, email: true } } },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        return ApiResponse.success({ logs });

    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return ApiResponse.error('Internal Server Error', 500);
    }
});
