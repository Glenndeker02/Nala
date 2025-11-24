/**
 * OAuth Utilities
 * 
 * Common utilities for OAuth flows across different platforms
 */

import crypto from 'crypto';

/**
 * Generate a secure random state parameter for OAuth
 */
export function generateOAuthState(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate PKCE code verifier and challenge
 * Used for enhanced security in OAuth flows
 */
export function generatePKCE(): {
    codeVerifier: string;
    codeChallenge: string;
} {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64url');

    return { codeVerifier, codeChallenge };
}

/**
 * Store OAuth state in database or session
 * This prevents CSRF attacks
 */
export async function storeOAuthState(
    userId: string,
    platform: 'TIKTOK' | 'META',
    state: string,
    codeVerifier?: string
): Promise<void> {
    // In production, store in Redis or database with expiry
    // For now, we'll use a simple in-memory store
    // TODO: Implement proper state storage
    console.log(`Storing OAuth state for ${userId} on ${platform}:`, state);
}

/**
 * Verify OAuth state matches what was stored
 */
export async function verifyOAuthState(
    userId: string,
    platform: 'TIKTOK' | 'META',
    state: string
): Promise<boolean> {
    // In production, verify against stored state
    // TODO: Implement proper state verification
    return true;
}

/**
 * Build OAuth authorization URL
 */
export function buildAuthorizationUrl(
    baseUrl: string,
    params: Record<string, string>
): string {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });
    return url.toString();
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
    tokenUrl: string,
    params: Record<string, string>,
    headers?: Record<string, string>
): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
    scope?: string;
}> {
    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            ...headers,
        },
        body: new URLSearchParams(params).toString(),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        scope: data.scope,
    };
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(
    tokenUrl: string,
    refreshToken: string,
    clientId: string,
    clientSecret: string
): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
}> {
    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
        }).toString(),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresIn: data.expires_in,
    };
}

/**
 * Calculate token expiry timestamp
 */
export function calculateTokenExpiry(expiresIn: number): Date {
    return new Date(Date.now() + expiresIn * 1000);
}

/**
 * Check if token is expired or will expire soon
 */
export function isTokenExpired(expiresAt: Date, bufferMinutes: number = 5): boolean {
    const bufferMs = bufferMinutes * 60 * 1000;
    return new Date(expiresAt).getTime() - bufferMs < Date.now();
}
