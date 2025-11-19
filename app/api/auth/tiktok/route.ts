import { NextRequest } from 'next/server';
import { requireAuth, ApiResponse } from '@/lib/api-middleware';
import { generateVerificationToken } from '@/lib/auth';

/**
 * Initiate TikTok OAuth flow
 */
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    if (user.role !== 'CREATOR') {
      return ApiResponse.error('Only creators can connect TikTok accounts', 403);
    }

    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const redirectUri = process.env.TIKTOK_REDIRECT_URI || 'http://localhost:3000/api/auth/tiktok/callback';

    if (!clientKey) {
      return ApiResponse.error('TikTok client key not configured', 500);
    }

    // Generate state token for CSRF protection
    const state = generateVerificationToken();

    // Store state in session/cookie (simplified - use Redis in production)
    // For now, we'll encode the userId in the state
    const stateWithUser = `${state}_${user.userId}`;

    // Build TikTok authorization URL
    const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
    authUrl.searchParams.append('client_key', clientKey);
    authUrl.searchParams.append('scope', 'user.info.basic,video.list,video.insights');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('state', stateWithUser);

    return ApiResponse.success({
      authUrl: authUrl.toString(),
      state: stateWithUser,
    });
  } catch (error) {
    console.error('TikTok OAuth initiation error:', error);
    return ApiResponse.error('Failed to initiate TikTok OAuth', 500);
  }
});
