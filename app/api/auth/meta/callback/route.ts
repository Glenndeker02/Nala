import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import db from '@/lib/db';
import { exchangeMetaCode, getInstagramBusinessAccountId } from '@/lib/oauth/meta';
import { ApiResponse } from '@/lib/api-middleware';

/**
 * Meta OAuth Callback
 * 
 * This endpoint is called by Meta after user authorizes the app
 * URL: /api/auth/meta/callback?code=...&state=...
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorReason = searchParams.get('error_reason');

    // Handle user denial
    if (error) {
      console.error('Meta OAuth error:', error, errorReason);
      return redirect('/creator/settings/connect?error=meta_denied');
    }

    if (!code || !state) {
      return redirect('/creator/settings/connect?error=invalid_callback');
    }

    // TODO: Verify state matches what we stored
    // const isValidState = await verifyOAuthState(userId, 'META', state);
    // if (!isValidState) {
    //   return redirect('/creator/settings/connect?error=invalid_state');
    // }

    // Exchange code for long-lived access token
    const tokenData = await exchangeMetaCode(code);

    // Get Instagram Business Account ID
    const instagramAccountId = await getInstagramBusinessAccountId(tokenData.accessToken);

    // Get user ID from session/cookie
    const userId = request.cookies.get('userId')?.value;

    if (!userId) {
      return redirect('/auth/login?error=session_expired');
    }

    // Store tokens in database
    await db.socialConnection.upsert({
      where: {
        userId_platform: {
          userId,
          platform: 'INSTAGRAM', // We'll use INSTAGRAM as primary, can add FACEBOOK separately
        },
      },
      create: {
        userId,
        platform: 'INSTAGRAM',
        platformUserId: instagramAccountId || '',
        accessToken: tokenData.accessToken,
        refreshToken: null, // Meta doesn't provide refresh tokens
        expiresAt: tokenData.expiresAt,
        scope: 'instagram_basic,instagram_manage_insights',
        isActive: true,
      },
      update: {
        platformUserId: instagramAccountId || '',
        accessToken: tokenData.accessToken,
        expiresAt: tokenData.expiresAt,
        isActive: true,
        connectedAt: new Date(),
      },
    });

    // Also create Facebook connection if needed
    await db.socialConnection.upsert({
      where: {
        userId_platform: {
          userId,
          platform: 'FACEBOOK',
        },
      },
      create: {
        userId,
        platform: 'FACEBOOK',
        platformUserId: '', // Will be populated when user posts
        accessToken: tokenData.accessToken,
        refreshToken: null,
        expiresAt: tokenData.expiresAt,
        scope: 'pages_read_engagement,read_insights',
        isActive: true,
      },
      update: {
        accessToken: tokenData.accessToken,
        expiresAt: tokenData.expiresAt,
        isActive: true,
        connectedAt: new Date(),
      },
    });

    // Redirect to settings page with success message
    return redirect('/creator/settings/connect?success=meta_connected');
  } catch (error) {
    console.error('Meta OAuth callback error:', error);
    return redirect('/creator/settings/connect?error=connection_failed');
  }
}
