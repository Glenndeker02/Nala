import crypto from 'crypto';

/**
 * Validate campaign API key from request headers
 * Returns campaign if valid, null otherwise
 */
export async function validateCampaignApiKey(
    apiKey: string | null,
    campaignId: string,
    prisma: any
): Promise<any | null> {
    if (!apiKey) {
        return null;
    }

    // Remove 'Bearer ' prefix if present
    const cleanKey = apiKey.startsWith('Bearer ') ? apiKey.substring(7) : apiKey;

    // Find campaign with matching API key
    const campaign = await prisma.campaign.findFirst({
        where: {
            id: campaignId,
            apiKey: cleanKey,
            enableCreatorCodes: true
        },
        select: {
            id: true,
            name: true,
            founderId: true,
            conversionCommission: true,
            codeDiscountType: true,
            codeDiscountValue: true,
            attributionWindowDays: true
        }
    });

    return campaign;
}

/**
 * Generate a secure campaign API key
 */
export function generateApiKey(): string {
    return `ck_${crypto.randomBytes(32).toString('hex')}`;
}

/**
 * Hash IP address for privacy
 */
export function hashIp(ip: string): string {
    return crypto.createHash('sha256').update(ip).digest('hex');
}

/**
 * Simple in-memory rate limiter
 * In production, use Redis
 */
class RateLimiter {
    private requests: Map<string, number[]> = new Map();

    check(key: string, maxRequests: number, windowMs: number): boolean {
        const now = Date.now();
        const timestamps = this.requests.get(key) || [];

        // Remove old timestamps outside the window
        const validTimestamps = timestamps.filter(t => now - t < windowMs);

        if (validTimestamps.length >= maxRequests) {
            return false; // Rate limit exceeded
        }

        validTimestamps.push(now);
        this.requests.set(key, validTimestamps);

        // Cleanup old entries periodically
        if (this.requests.size > 10000) {
            this.cleanup(windowMs);
        }

        return true;
    }

    private cleanup(windowMs: number) {
        const now = Date.now();
        for (const [key, timestamps] of this.requests.entries()) {
            const validTimestamps = timestamps.filter(t => now - t < windowMs);
            if (validTimestamps.length === 0) {
                this.requests.delete(key);
            } else {
                this.requests.set(key, validTimestamps);
            }
        }
    }
}

export const rateLimiter = new RateLimiter();

/**
 * Rate limiting constants
 */
export const RATE_LIMITS = {
    REDEMPTION_PER_IP_HOUR: 100,
    REDEMPTION_PER_CODE_HOUR: 1000,
    CONVERSION_PER_CODE_DAY: 100
};
