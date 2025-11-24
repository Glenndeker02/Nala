import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import db from '@/lib/db';
import { exchangeTikTokCode } from '@/lib/oauth/tiktok';
import { ApiResponse } from '@/lib/api-middleware';

/**
 * TikTok OAuth Callback
 * 
 * This endpoint is called by TikTok after user authorizes the app
 * URL: /api/auth/tiktok/callback?code=...&state=...
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle user denial
    if (error) {
      console.error('TikTok OAuth error:', error);
      return redirect('/creator/settings/connect?error=tiktok_denied');
    }

    if (!code || !state) {
      return redirect('/creator/settings/connect?error=invalid_callback');
    }

    // TODO: Verify state matches what we stored
    // const isValidState = await verifyOAuthState(userId, 'TIKTOK', state);
    // if (!isValidState) {
    //   return redirect('/creator/settings/connect?error=invalid_state');
    // }

    // Exchange code for access token
    const tokenData = await exchangeTikTokCode(code);

    // Get user ID from session/cookie
    // For now, we'll need to pass userId in state or use session
    // TODO: Implement proper session management
    const userId = request.cookies.get('userId')?.value;

    if (!userId) {
      return redirect('/auth/login?error=session_expired');
    }

    // Store tokens in database
    await db.socialConnection.upsert({
      where: {
        userId_platform: {
          userId,
          platform: 'TIKTOK',
        },
      },
      create: {
        userId,
        platform: 'TIKTOK',
        platformUserId: tokenData.openId,
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresAt: tokenData.expiresAt,
        scope: tokenData.scope,
        isActive: true,
      },
      update: {
        platformUserId: tokenData.openId,
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresAt: tokenData.expiresAt,
        scope: tokenData.scope,
        isActive: true,
        connectedAt: new Date(),
      },
    });

    // Redirect to settings page with success message
    return redirect('/creator/settings/connect?success=tiktok_connected');
  } catch (error) {
    console.error('TikTok OAuth callback error:', error);
    return redirect('/creator/settings/connect?error=connection_failed');
  }
}
