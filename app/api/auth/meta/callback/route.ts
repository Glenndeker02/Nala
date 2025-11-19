import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import db from '@/lib/db';
import { encrypt } from '@/lib/encryption';

/**
 * Handle Meta (Instagram/Facebook) OAuth callback
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

    // Extract userId from state
    const [, userId] = state.split('_');

    if (!userId) {
      return NextResponse.redirect(
        new URL('/creator/onboarding?error=invalid_state', request.url)
      );
    }

    // Exchange code for access token
    const tokenResponse = await axios.get(
      'https://graph.facebook.com/v18.0/oauth/access_token',
      {
        params: {
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          code,
          redirect_uri: process.env.META_REDIRECT_URI,
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Get user's Facebook pages
    const pagesResponse = await axios.get(
      'https://graph.facebook.com/v18.0/me/accounts',
      {
        params: {
          access_token,
        },
      }
    );

    if (!pagesResponse.data.data || pagesResponse.data.data.length === 0) {
      return NextResponse.redirect(
        new URL('/creator/onboarding?error=no_pages_found', request.url)
      );
    }

    // Get the first page (in production, let user select)
    const page = pagesResponse.data.data[0];

    // Get Instagram Business Account connected to this page
    const igAccountResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${page.id}`,
      {
        params: {
          fields: 'instagram_business_account',
          access_token,
        },
      }
    );

    const igAccountId = igAccountResponse.data.instagram_business_account?.id;

    if (!igAccountId) {
      return NextResponse.redirect(
        new URL('/creator/onboarding?error=no_instagram_business_account', request.url)
      );
    }

    // Get Instagram profile info
    const igProfileResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${igAccountId}`,
      {
        params: {
          fields: 'username,followers_count,media_count',
          access_token,
        },
      }
    );

    const igProfile = igProfileResponse.data;

    // Validate follower count (minimum 5,000)
    if (igProfile.followers_count < 5000) {
      return NextResponse.redirect(
        new URL(
          `/creator/onboarding?error=insufficient_followers&platform=instagram&required=5000&current=${igProfile.followers_count}`,
          request.url
        )
      );
    }

    // Exchange for long-lived token (60 days)
    const longLivedTokenResponse = await axios.get(
      'https://graph.facebook.com/v18.0/oauth/access_token',
      {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          fb_exchange_token: access_token,
        },
      }
    );

    const longLivedToken = longLivedTokenResponse.data.access_token;
    const expiresIn = longLivedTokenResponse.data.expires_in; // 60 days

    // Encrypt token before storing
    const encryptedAccessToken = encrypt(longLivedToken);

    // Store Instagram account
    await db.socialAccount.upsert({
      where: {
        creatorId_platform: {
          creatorId: userId,
          platform: 'INSTAGRAM',
        },
      },
      update: {
        platformUserId: igAccountId,
        username: igProfile.username,
        followerCount: igProfile.followers_count,
        accessToken: encryptedAccessToken,
        tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
        verifiedAt: new Date(),
        lastSyncedAt: new Date(),
      },
      create: {
        creatorId: userId,
        platform: 'INSTAGRAM',
        platformUserId: igAccountId,
        username: igProfile.username,
        followerCount: igProfile.followers_count,
        accessToken: encryptedAccessToken,
        tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
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
      new URL('/creator/onboarding?instagram=connected', request.url)
    );
  } catch (error) {
    console.error('Meta OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/creator/onboarding?error=connection_failed', request.url)
    );
  }
}
