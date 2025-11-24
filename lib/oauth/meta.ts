/**
 * Meta OAuth Integration
 * 
 * Handles Meta (Facebook/Instagram) OAuth 2.0 flow for obtaining user access tokens
 * Documentation: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow
 */

import {
    generateOAuthState,
    buildAuthorizationUrl,
    exchangeCodeForToken,
    refreshAccessToken,
    calculateTokenExpiry,
} from './utils';

const META_AUTH_URL = 'https://www.facebook.com/v18.0/dialog/oauth';
const META_TOKEN_URL = 'https://graph.facebook.com/v18.0/oauth/access_token';

/**
 * Required Meta permissions for Instagram/Facebook insights
 */
const REQUIRED_PERMISSIONS = [
    'instagram_basic',              // Basic Instagram profile
    'instagram_manage_insights',    // Instagram insights
    'pages_read_engagement',        // Facebook page engagement
    'pages_show_list',              // List user's pages
    'read_insights',                // Facebook insights
];

/**
 * Generate Meta OAuth authorization URL
 */
export function getMetaAuthUrl(userId: string): {
    url: string;
    state: string;
} {
    const appId = process.env.META_APP_ID;
    const redirectUri = process.env.META_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/meta/callback`;

    if (!appId) {
        throw new Error('META_APP_ID not configured');
    }

    const state = generateOAuthState();

    const params = {
        client_id: appId,
        redirect_uri: redirectUri,
        scope: REQUIRED_PERMISSIONS.join(','),
        response_type: 'code',
        state,
    };

    const url = buildAuthorizationUrl(META_AUTH_URL, params);

    // TODO: Store state in database for verification
    // await storeOAuthState(userId, 'META', state);

    return { url, state };
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeMetaCode(code: string): Promise<{
    accessToken: string;
    expiresIn: number;
    expiresAt: Date;
}> {
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const redirectUri = process.env.META_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/meta/callback`;

    if (!appId || !appSecret) {
        throw new Error('Meta OAuth credentials not configured');
    }

    const params = {
        client_id: appId,
        client_secret: appSecret,
        code,
        redirect_uri: redirectUri,
    };

    const url = new URL(META_TOKEN_URL);
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Meta token exchange failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(`Meta OAuth error: ${data.error.message}`);
    }

    // Exchange short-lived token for long-lived token
    const longLivedToken = await exchangeForLongLivedToken(data.access_token);

    return longLivedToken;
}

/**
 * Exchange short-lived token for long-lived token (60 days)
 */
export async function exchangeForLongLivedToken(shortLivedToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
    expiresAt: Date;
}> {
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;

    if (!appId || !appSecret) {
        throw new Error('Meta OAuth credentials not configured');
    }

    const url = new URL(META_TOKEN_URL);
    url.searchParams.append('grant_type', 'fb_exchange_token');
    url.searchParams.append('client_id', appId);
    url.searchParams.append('client_secret', appSecret);
    url.searchParams.append('fb_exchange_token', shortLivedToken);

    const response = await fetch(url.toString());

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Meta long-lived token exchange failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(`Meta token exchange error: ${data.error.message}`);
    }

    return {
        accessToken: data.access_token,
        expiresIn: data.expires_in || 5184000, // 60 days default
        expiresAt: calculateTokenExpiry(data.expires_in || 5184000),
    };
}

/**
 * Refresh Meta access token
 * Note: Meta tokens are long-lived (60 days) and don't have refresh tokens
 * Instead, we need to prompt user to re-authenticate before expiry
 */
export async function refreshMetaToken(currentToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
    expiresAt: Date;
}> {
    // Meta doesn't support refresh tokens for user access tokens
    // We can only exchange for a new long-lived token
    return await exchangeForLongLivedToken(currentToken);
}

/**
 * Get user's Instagram Business Account ID
 */
export async function getInstagramBusinessAccountId(accessToken: string): Promise<string | null> {
    try {
        // First, get user's Facebook pages
        const pagesUrl = 'https://graph.facebook.com/v18.0/me/accounts';
        const pagesParams = new URLSearchParams({
            access_token: accessToken,
            fields: 'id,name,instagram_business_account',
        });

        const pagesResponse = await fetch(`${pagesUrl}?${pagesParams}`);
        const pagesData = await pagesResponse.json();

        if (pagesData.error) {
            console.error('Error fetching Facebook pages:', pagesData.error);
            return null;
        }

        // Find first page with Instagram business account
        const pageWithInstagram = pagesData.data?.find(
            (page: any) => page.instagram_business_account
        );

        return pageWithInstagram?.instagram_business_account?.id || null;
    } catch (error) {
        console.error('Error getting Instagram business account:', error);
        return null;
    }
}

/**
 * Verify token is still valid
 */
export async function verifyMetaToken(accessToken: string): Promise<boolean> {
    try {
        const url = 'https://graph.facebook.com/v18.0/me';
        const params = new URLSearchParams({
            access_token: accessToken,
            fields: 'id',
        });

        const response = await fetch(`${url}?${params}`);
        const data = await response.json();

        return !data.error;
    } catch (error) {
        return false;
    }
}

/**
 * Revoke Meta access token
 */
export async function revokeMetaToken(accessToken: string): Promise<void> {
    try {
        const url = 'https://graph.facebook.com/v18.0/me/permissions';
        const params = new URLSearchParams({
            access_token: accessToken,
        });

        await fetch(`${url}?${params}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error('Error revoking Meta token:', error);
    }
}
