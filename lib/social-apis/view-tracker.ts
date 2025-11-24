/**
 * Unified View Tracker
 * 
 * This module provides a unified interface for tracking views across all platforms.
 */

import { getTikTokViewCount } from './tiktok';
import { getMetaViewCount } from './meta';

export type Platform = 'TIKTOK' | 'INSTAGRAM' | 'FACEBOOK';

export interface ViewTrackingResult {
    success: boolean;
    viewCount: number | null;
    error?: string;
    dataSource: 'api' | 'fallback' | 'manual';
}

/**
 * Fetch view count for any platform
 */
export async function fetchViewCount(
    platform: Platform,
    platformVideoId: string,
    postUrl?: string
): Promise<ViewTrackingResult> {
    try {
        let viewCount: number | null = null;
        let dataSource: 'api' | 'fallback' | 'manual' = 'api';

        switch (platform) {
            case 'TIKTOK':
                viewCount = await getTikTokViewCount(platformVideoId, postUrl);
                if (viewCount === null && postUrl) {
                    dataSource = 'fallback';
                }
                break;

            case 'INSTAGRAM':
                viewCount = await getMetaViewCount('INSTAGRAM', platformVideoId);
                break;

            case 'FACEBOOK':
                viewCount = await getMetaViewCount('FACEBOOK', platformVideoId);
                break;

            default:
                return {
                    success: false,
                    viewCount: null,
                    error: `Unsupported platform: ${platform}`,
                    dataSource: 'manual',
                };
        }

        if (viewCount === null) {
            return {
                success: false,
                viewCount: null,
                error: 'Failed to fetch view count from API',
                dataSource: 'manual',
            };
        }

        return {
            success: true,
            viewCount,
            dataSource,
        };
    } catch (error) {
        console.error('Error in fetchViewCount:', error);
        return {
            success: false,
            viewCount: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            dataSource: 'manual',
        };
    }
}

/**
 * Batch fetch view counts for multiple videos
 */
export async function batchFetchViewCounts(
    videos: Array<{
        id: string;
        platform: Platform;
        platformVideoId: string;
        postUrl?: string;
    }>
): Promise<Map<string, ViewTrackingResult>> {
    const results = new Map<string, ViewTrackingResult>();

    // Process in parallel with rate limiting
    const BATCH_SIZE = 5; // Process 5 at a time to avoid rate limits

    for (let i = 0; i < videos.length; i += BATCH_SIZE) {
        const batch = videos.slice(i, i + BATCH_SIZE);

        const batchResults = await Promise.all(
            batch.map(async (video) => {
                const result = await fetchViewCount(
                    video.platform,
                    video.platformVideoId,
                    video.postUrl
                );
                return { videoId: video.id, result };
            })
        );

        batchResults.forEach(({ videoId, result }) => {
            results.set(videoId, result);
        });

        // Add delay between batches to respect rate limits
        if (i + BATCH_SIZE < videos.length) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
    }

    return results;
}

/**
 * Check if API credentials are configured
 */
export function areAPICredentialsConfigured(): {
    tiktok: boolean;
    meta: boolean;
} {
    return {
        tiktok: !!process.env.TIKTOK_ACCESS_TOKEN,
        meta: !!process.env.META_ACCESS_TOKEN,
    };
}

/**
 * Get platform-specific rate limits
 */
export function getPlatformRateLimits(platform: Platform): {
    requestsPerHour: number;
    requestsPerDay: number;
} {
    switch (platform) {
        case 'TIKTOK':
            return {
                requestsPerHour: 100,
                requestsPerDay: 1000,
            };
        case 'INSTAGRAM':
        case 'FACEBOOK':
            return {
                requestsPerHour: 200,
                requestsPerDay: 4800,
            };
        default:
            return {
                requestsPerHour: 100,
                requestsPerDay: 1000,
            };
    }
}
