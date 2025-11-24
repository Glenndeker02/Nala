import { NextRequest, NextResponse } from 'next/server';
import { getTikTokAuthUrl } from '@/lib/oauth/tiktok';
import { getMetaAuthUrl } from '@/lib/oauth/meta';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const POST = requireRole(
    ['CREATOR'],
    async (request: NextRequest, user, { params }: { params: { platform: string } }) => {
        try {
            const platform = params.platform.toLowerCase();

            let authUrl: string;
            let state: string;

            if (platform === 'tiktok') {
                const result = getTikTokAuthUrl(user.userId);
                authUrl = result.url;
                state = result.state;
            } else if (platform === 'meta') {
                const result = getMetaAuthUrl(user.userId);
                authUrl = result.url;
                state = result.state;
            } else {
                return ApiResponse.error('Unsupported platform', 400);
            }

            // Store state in cookie for verification
            const response = NextResponse.json({
                authUrl,
                state,
            });

            // Set cookies for OAuth flow
            response.cookies.set('userId', user.userId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 600, // 10 minutes
            });

            response.cookies.set(`oauth_state_${platform}`, state, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 600, // 10 minutes
            });

            return response;
        } catch (error) {
            console.error('Error initiating OAuth:', error);
            return ApiResponse.error(
                error instanceof Error ? error.message : 'Failed to initiate connection',
                500
            );
        }
    }
);
