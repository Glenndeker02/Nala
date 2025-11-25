import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(['CREATOR'], async (request: NextRequest, user) => {
    try {
        const profile = await db.user.findUnique({
            where: { id: user.userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                creatorProfile: {
                    select: {
                        bio: true,
                        categories: true,
                        baseFeeTiktok: true,
                        baseFeeInstagram: true,
                        baseFeeFacebook: true,
                        verificationStatus: true,
                        availabilityStatus: true,
                        responseTime: true,
                        isOnboardingComplete: true,
                        portfolioVideos: true,
                    }
                },
                socialAccounts: {
                    select: {
                        platform: true,
                        username: true,
                        followerCount: true,
                        verifiedAt: true,
                    }
                }
            }
        });

        if (!profile) {
            return ApiResponse.error('Profile not found', 404);
        }

        // Transform to match spec
        const responseData = {
            creator_id: profile.id,
            email: profile.email,
            first_name: profile.fullName.split(' ')[0],
            last_name: profile.fullName.split(' ').slice(1).join(' '),
            bio: profile.creatorProfile?.bio || '',
            profile_completeness: profile.creatorProfile?.isOnboardingComplete ? 100 : 50, // Simplified logic
            kyc_status: profile.creatorProfile?.verificationStatus || 'PENDING',
            rating: 5.0, // Mock for now
            total_campaigns: 0, // Mock for now
            social_accounts: profile.socialAccounts.reduce((acc, account) => {
                acc[account.platform] = {
                    username: account.username,
                    followers: account.followerCount
                };
                return acc;
            }, {} as Record<string, any>),
            base_rate_card: {
                TIKTOK: profile.creatorProfile?.baseFeeTiktok,
                INSTAGRAM: profile.creatorProfile?.baseFeeInstagram,
                FACEBOOK: profile.creatorProfile?.baseFeeFacebook,
            },
            stripe_account_id: null // Not in schema yet or mocked
        };

        return ApiResponse.success(responseData);
    } catch (error) {
        console.error('Profile fetch error:', error);
        return ApiResponse.error('Failed to fetch profile', 500);
    }
});
