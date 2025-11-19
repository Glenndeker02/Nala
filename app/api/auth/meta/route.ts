import { NextRequest } from 'next/server';
import { requireAuth, ApiResponse } from '@/lib/api-middleware';
import { generateVerificationToken } from '@/lib/auth';

/**
 * Initiate Meta (Instagram/Facebook) OAuth flow
 */
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    if (user.role !== 'CREATOR') {
      return ApiResponse.error('Only creators can connect Instagram/Facebook accounts', 403);
    }

    const appId = process.env.META_APP_ID;
    const redirectUri = process.env.META_REDIRECT_URI || 'http://localhost:3000/api/auth/meta/callback';

    if (!appId) {
      return ApiResponse.error('Meta app ID not configured', 500);
    }

    // Generate state token for CSRF protection
    const state = generateVerificationToken();

    // Store state in session/cookie (simplified)
    const stateWithUser = `${state}_${user.userId}`;

    // Build Facebook/Instagram authorization URL
    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    authUrl.searchParams.append('client_id', appId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append(
      'scope',
      'instagram_basic,instagram_manage_insights,pages_read_engagement,pages_show_list'
    );
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('state', stateWithUser);

    return ApiResponse.success({
      authUrl: authUrl.toString(),
      state: stateWithUser,
    });
  } catch (error) {
    console.error('Meta OAuth initiation error:', error);
    return ApiResponse.error('Failed to initiate Meta OAuth', 500);
  }
});
