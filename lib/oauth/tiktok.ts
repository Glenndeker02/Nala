/**
 * TikTok OAuth Integration
 * 
 * Handles TikTok OAuth 2.0 flow for obtaining user access tokens
 * Documentation: https://developers.tiktok.com/doc/login-kit-web
 */

import {
    generateOAuthState,
    buildAuthorizationUrl,
    exchangeCodeForToken,
    refreshAccessToken,
    calculateTokenExpiry,
} from './utils';

const TIKTOK_AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';
const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';

/**
 * Required TikTok scopes for view tracking
 */
const REQUIRED_SCOPES = [
    'user.info.basic',      // Basic user info
    'video.list',           // List user's videos
    'video.insights',       // Video analytics/insights
];

/**
 * Generate TikTok OAuth authorization URL
 */
export function getTikTokAuthUrl(userId: string): {
    url: string;
    state: string;
} {
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const redirectUri = process.env.TIKTOK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/tiktok/callback`;

    if (!clientKey) {
        throw new Error('TIKTOK_CLIENT_KEY not configured');
    }

    const state = generateOAuthState();

    const params = {
        client_key: clientKey,
        scope: REQUIRED_SCOPES.join(','),
        response_type: 'code',
        redirect_uri: redirectUri,
        state,
    };

    const url = buildAuthorizationUrl(TIKTOK_AUTH_URL, params);

    // TODO: Store state in database for verification
    // await storeOAuthState(userId, 'TIKTOK', state);

    return { url, state };
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeTikTokCode(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    expiresAt: Date;
    scope: string;
    openId: string;
}> {
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    const redirectUri = process.env.TIKTOK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/tiktok/callback`;

    if (!clientKey || !clientSecret) {
        throw new Error('TikTok OAuth credentials not configured');
    }

    const params = {
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
    };

    const response = await fetch(TIKTOK_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache',
        },
        body: new URLSearchParams(params).toString(),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TikTok token exchange failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(`TikTok OAuth error: ${data.error} - ${data.error_description}`);
    }

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        expiresAt: calculateTokenExpiry(data.expires_in),
        scope: data.scope,
        openId: data.open_id,
    };
}

/**
 * Refresh TikTok access token
 */
export async function refreshTikTokToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    expiresAt: Date;
}> {
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

    if (!clientKey || !clientSecret) {
        throw new Error('TikTok OAuth credentials not configured');
    }

    const params = {
        client_key: clientKey,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
    };

    const response = await fetch(TIKTOK_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(params).toString(),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TikTok token refresh failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(`TikTok refresh error: ${data.error} - ${data.error_description}`);
    }

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        expiresAt: calculateTokenExpiry(data.expires_in),
    };
}

/**
 * Revoke TikTok access token
 */
export async function revokeTikTokToken(accessToken: string): Promise<void> {
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

    if (!clientKey || !clientSecret) {
        throw new Error('TikTok OAuth credentials not configured');
    }

    const url = 'https://open.tiktokapis.com/v2/oauth/revoke/';

    const params = {
        client_key: clientKey,
        client_secret: clientSecret,
        token: accessToken,
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(params).toString(),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('TikTok token revocation failed:', errorText);
    }
}
