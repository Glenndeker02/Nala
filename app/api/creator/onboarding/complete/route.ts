import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';
import { z } from 'zod';

const onboardingSchema = z.object({
    baseFeeTiktok: z.number().min(0),
    baseFeeInstagram: z.number().min(0),
    baseFeeFacebook: z.number().min(0),
    categories: z.array(z.string()),
    bio: z.string().max(500).optional(),
    portfolioVideos: z.array(z.any()).optional(),
});

export const POST = requireRole(['CREATOR'], async (request: NextRequest, user) => {
    try {
        const body = await request.json();
        const validation = onboardingSchema.safeParse(body);

        if (!validation.success) {
            return ApiResponse.error('Invalid data', 400, validation.error.errors);
        }

        const data = validation.data;

        // Update creator profile
        const profile = await db.creatorProfile.upsert({
            where: {
                userId: user.userId,
            },
            create: {
                userId: user.userId,
                baseFeeTiktok: data.baseFeeTiktok,
                baseFeeInstagram: data.baseFeeInstagram,
                baseFeeFacebook: data.baseFeeFacebook,
                categories: data.categories,
                bio: data.bio,
                portfolioVideos: data.portfolioVideos || [],
                isOnboardingComplete: true,
            },
            update: {
                baseFeeTiktok: data.baseFeeTiktok,
                baseFeeInstagram: data.baseFeeInstagram,
                baseFeeFacebook: data.baseFeeFacebook,
                categories: data.categories,
                bio: data.bio,
                portfolioVideos: data.portfolioVideos || [],
                isOnboardingComplete: true,
            },
        });

        return ApiResponse.success({
            message: 'Onboarding completed successfully',
            profile,
        });
    } catch (error) {
        console.error('Error completing onboarding:', error);
        return ApiResponse.error('Failed to complete onboarding', 500);
    }
});
