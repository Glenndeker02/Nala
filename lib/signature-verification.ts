import crypto from 'crypto';

/**
 * Verifies the HMAC SHA256 signature of a payload.
 * 
 * @param payload - The raw request body as string
 * @param signature - The signature from headers
 * @param secret - The shared secret key
 * @returns boolean - True if signature is valid
 */
export function verifySignature(payload: string, signature: string, secret: string): boolean {
    if (!payload || !signature || !secret) return false;

    // Create HMAC
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');

    // Constant time comparison to prevent timing attacks
    // Note: crypto.timingSafeEqual requires Buffers of equal length
    const signatureBuffer = Buffer.from(signature);
    const digestBuffer = Buffer.from(digest);

    if (signatureBuffer.length !== digestBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, digestBuffer);
}
