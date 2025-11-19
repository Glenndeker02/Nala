import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import db from '@/lib/db';
import { encrypt } from '@/lib/encryption';

/**
 * Handle TikTok OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/creator/onboarding?error=${error}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/creator/onboarding?error=missing_params', request.url)
      );
    }

    // Extract userId from state (simplified - use proper session storage in production)
    const [, userId] = state.split('_');

    if (!userId) {
      return NextResponse.redirect(
        new URL('/creator/onboarding?error=invalid_state', request.url)
      );
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://open.tiktokapis.com/v2/oauth/token/',
      {
        client_key: process.env.TIKTOK_CLIENT_KEY,
        client_secret: process.env.TIKTOK_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.TIKTOK_REDIRECT_URI,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token, expires_in, open_id } = tokenResponse.data;

    // Fetch user profile
    const profileResponse = await axios.get(
      'https://open.tiktokapis.com/v2/user/info/',
      {
        params: {
          fields: 'display_name,follower_count,username',
        },
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const userData = profileResponse.data.data.user;

    // Validate follower count (minimum 10,000)
    if (userData.follower_count < 10000) {
      return NextResponse.redirect(
        new URL(
          `/creator/onboarding?error=insufficient_followers&required=10000&current=${userData.follower_count}`,
          request.url
        )
      );
    }

    // Encrypt tokens before storing
    const encryptedAccessToken = encrypt(access_token);
    const encryptedRefreshToken = encrypt(refresh_token);

    // Store social account
    await db.socialAccount.upsert({
      where: {
        creatorId_platform: {
          creatorId: userId,
          platform: 'TIKTOK',
        },
      },
      update: {
        platformUserId: open_id,
        username: userData.username,
        followerCount: userData.follower_count,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
        verifiedAt: new Date(),
        lastSyncedAt: new Date(),
      },
      create: {
        creatorId: userId,
        platform: 'TIKTOK',
        platformUserId: open_id,
        username: userData.username,
        followerCount: userData.follower_count,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
        verifiedAt: new Date(),
        lastSyncedAt: new Date(),
      },
    });

    // Update creator profile verification status
    await db.creatorProfile.updateMany({
      where: { userId },
      data: {
        verificationStatus: 'VERIFIED',
      },
    });

    return NextResponse.redirect(
      new URL('/creator/onboarding?tiktok=connected', request.url)
    );
  } catch (error) {
    console.error('TikTok OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/creator/onboarding?error=connection_failed', request.url)
    );
  }
}
