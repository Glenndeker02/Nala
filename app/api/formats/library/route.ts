import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, ApiResponse } from '@/lib/api-middleware';

export const GET = requireAuth(async (request: NextRequest, user) => {
    try {
        const savedFormats = await db.creatorFormatLibrary.findMany({
            where: {
                creatorId: user.userId,
            },
            include: {
                format: true,
            },
            orderBy: {
                savedAt: 'desc',
            },
        });

        return ApiResponse.success({ savedFormats });
    } catch (error) {
        console.error('Error fetching saved formats:', error);
        return ApiResponse.error('Failed to fetch saved formats', 500);
    }
});

export const POST = requireAuth(async (request: NextRequest, user) => {
    try {
        const { formatId } = await request.json();

        if (!formatId) {
            return ApiResponse.error('Format ID is required', 400);
        }

        const savedFormat = await db.creatorFormatLibrary.create({
            data: {
                creatorId: user.userId,
                formatId,
            },
        });

        return ApiResponse.success({ savedFormat });
    } catch (error) {
        console.error('Error saving format:', error);
        return ApiResponse.error('Failed to save format', 500);
    }
});

export const DELETE = requireAuth(async (request: NextRequest, user) => {
    try {
        const { searchParams } = new URL(request.url);
        const formatId = searchParams.get('formatId');

        if (!formatId) {
            return ApiResponse.error('Format ID is required', 400);
        }

        await db.creatorFormatLibrary.delete({
            where: {
                creatorId_formatId: {
                    creatorId: user.userId,
                    formatId,
                },
            },
        });

        return ApiResponse.success({ success: true });
    } catch (error) {
        console.error('Error removing format:', error);
        return ApiResponse.error('Failed to remove format', 500);
    }
});
