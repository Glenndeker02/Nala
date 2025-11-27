/**
 * Simple in-memory cache implementation
 * For production, consider Redis or similar
 */

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

class CacheService {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor() {
        // Clean up expired entries every 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
    }

    /**
     * Get value from cache
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Set value in cache with TTL in seconds
     */
    set<T>(key: string, data: T, ttlSeconds: number = 300): void {
        const expiresAt = Date.now() + (ttlSeconds * 1000);
        this.cache.set(key, { data, expiresAt });
    }

    /**
     * Delete specific key
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Delete all keys matching pattern
     */
    deletePattern(pattern: string): void {
        const regex = new RegExp(pattern);
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Remove expired entries
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Get cache stats
     */
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }

    /**
     * Destroy cache and cleanup
     */
    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.cache.clear();
    }
}

// Singleton instance
export const cacheService = new CacheService();

/**
 * Cache key generators for consistency
 */
export const CacheKeys = {
    // Analytics
    videoAnalytics: (videoId: string, period: string, start: string, end: string) =>
        `analytics:video:${videoId}:${period}:${start}:${end}`,
    campaignAnalytics: (campaignId: string, period: string, start: string, end: string) =>
        `analytics:campaign:${campaignId}:${period}:${start}:${end}`,

    // Rankings
    leaderboard: (category?: string, limit?: number) =>
        `rankings:leaderboard:${category || 'all'}:${limit || 10}`,
    creatorRank: (creatorId: string) =>
        `rankings:creator:${creatorId}`,

    // Recommendations
    userRecommendations: (userId: string, type?: string) =>
        `recommendations:user:${userId}:${type || 'all'}`,

    // Dashboard data
    founderDashboard: (founderId: string) =>
        `dashboard:founder:${founderId}`,
    creatorDashboard: (creatorId: string) =>
        `dashboard:creator:${creatorId}`,

    // Campaign data
    campaignDetails: (campaignId: string) =>
        `campaign:${campaignId}`,
    campaignVideos: (campaignId: string) =>
        `campaign:${campaignId}:videos`,
};

/**
 * Cache TTL constants (in seconds)
 */
export const CacheTTL = {
    SHORT: 60,           // 1 minute
    MEDIUM: 300,         // 5 minutes
    LONG: 900,           // 15 minutes
    HOUR: 3600,          // 1 hour
    DAY: 86400,          // 24 hours
};
