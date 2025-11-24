import { NextRequest } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

const updateProfileSchema = z.object({
    bio: z.string().max(500).optional(),
    categories: z.array(z.string()).optional(),
    baseFeeTiktok: z.number().min(50).max(500).optional(),
    baseFeeInstagram: z.number().min(50).max(500).optional(),
    baseFeeFacebook: z.number().min(50).max(500).optional(),
});

export const PUT = requireRole(['CREATOR'], async (request: NextRequest, user) => {
    try {
        const body = await request.json();

        const validation = updateProfileSchema.safeParse(body);
        if (!validation.success) {
            return ApiResponse.error('Validation failed', 400, validation.error.errors);
        }

        const data = validation.data;

        const updatedProfile = await db.creatorProfile.update({
            where: { userId: user.userId },
            data: {
                ...(data.bio && { bio: data.bio }),
                ...(data.categories && { categories: data.categories }),
                ...(data.baseFeeTiktok && { baseFeeTiktok: data.baseFeeTiktok }),
                ...(data.baseFeeInstagram && { baseFeeInstagram: data.baseFeeInstagram }),
                ...(data.baseFeeFacebook && { baseFeeFacebook: data.baseFeeFacebook }),
            },
        });

        return ApiResponse.success({
            profile: updatedProfile,
            message: 'Profile updated successfully',
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return ApiResponse.error('Failed to update profile', 500);
    }
});
