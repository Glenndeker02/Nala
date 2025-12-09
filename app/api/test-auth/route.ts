import { NextRequest } from 'next/server';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

/**
 * Test endpoint to verify authentication is working
 */
export const GET = requireRole(['FOUNDER', 'CREATOR'], async (request: NextRequest, user) => {
    return ApiResponse.success({
        message: 'Authentication successful!',
        user: {
            userId: user.userId,
            email: user.email,
            role: user.role,
        },
    });
});
