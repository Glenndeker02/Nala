/**
 * Meta Graph API Integration (Instagram & Facebook)
 * 
 * This module handles fetching video/post statistics from Meta's Graph API.
 * 
 * API Documentation: https://developers.facebook.com/docs/graph-api
 * Instagram API: https://developers.facebook.com/docs/instagram-api
 * 
 * Required Environment Variables:
 * - META_APP_ID: Your Meta app ID
 * - META_APP_SECRET: Your Meta app secret
 * - META_ACCESS_TOKEN: User access token (obtained via OAuth)
 */

interface MetaVideoInfo {
    id: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    shareCount?: number;
    impressions?: number;
}

interface InstagramMediaResponse {
    id: string;
    media_type: string;
    like_count?: number;
    comments_count?: number;
    timestamp: string;
    insights?: {
        data: Array<{
            name: string;
            values: Array<{
                value: number;
            }>;
        }>;
    };
}

interface FacebookVideoResponse {
    id: string;
    views?: number;
    likes?: {
        summary: {
            total_count: number;
        };
    };
    comments?: {
        summary: {
            total_count: number;
        };
    };
    shares?: {
        count: number;
    };
}

/**
 * Fetch Instagram Reel/Post insights
 */
export async function getInstagramMediaInfo(mediaId: string): Promise<MetaVideoInfo | null> {
    try {
        const accessToken = process.env.META_ACCESS_TOKEN;

        if (!accessToken) {
            console.warn('Meta access token not configured');
            return null;
        }

        // First, get basic media info
        const mediaUrl = `https://graph.facebook.com/v18.0/${mediaId}`;
        const mediaParams = new URLSearchParams({
            fields: 'id,media_type,like_count,comments_count,timestamp',
            access_token: accessToken,
        });

        const mediaResponse = await fetch(`${mediaUrl}?${mediaParams}`);

        if (!mediaResponse.ok) {
            const errorText = await mediaResponse.text();
            console.error('Instagram API error:', mediaResponse.status, errorText);
            return null;
        }

        const mediaData: InstagramMediaResponse = await mediaResponse.json();

        // Get insights (views, impressions, etc.)
        const insightsUrl = `https://graph.facebook.com/v18.0/${mediaId}/insights`;
        const insightsParams = new URLSearchParams({
            metric: 'impressions,reach,plays,total_interactions',
            access_token: accessToken,
        });

        let viewCount = 0;

        try {
            const insightsResponse = await fetch(`${insightsUrl}?${insightsParams}`);

            if (insightsResponse.ok) {
                const insightsData = await insightsResponse.json();

                // Extract view count (plays for reels, impressions for posts)
                const playsMetric = insightsData.data?.find((m: any) => m.name === 'plays');
                const impressionsMetric = insightsData.data?.find((m: any) => m.name === 'impressions');

                viewCount = playsMetric?.values[0]?.value || impressionsMetric?.values[0]?.value || 0;
            }
        } catch (insightsError) {
            console.warn('Could not fetch Instagram insights:', insightsError);
        }

        return {
            id: mediaData.id,
            viewCount,
            likeCount: mediaData.like_count || 0,
            commentCount: mediaData.comments_count || 0,
        };
    } catch (error) {
        console.error('Error fetching Instagram media info:', error);
        return null;
    }
}

/**
 * Fetch Facebook Video insights
 */
export async function getFacebookVideoInfo(videoId: string): Promise<MetaVideoInfo | null> {
    try {
        const accessToken = process.env.META_ACCESS_TOKEN;

        if (!accessToken) {
            console.warn('Meta access token not configured');
            return null;
        }

        const url = `https://graph.facebook.com/v18.0/${videoId}`;
        const params = new URLSearchParams({
            fields: 'id,views,likes.summary(true),comments.summary(true),shares',
            access_token: accessToken,
        });

        const response = await fetch(`${url}?${params}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Facebook API error:', response.status, errorText);
            return null;
        }

        const data: FacebookVideoResponse = await response.json();

        return {
            id: data.id,
            viewCount: data.views || 0,
            likeCount: data.likes?.summary?.total_count || 0,
            commentCount: data.comments?.summary?.total_count || 0,
            shareCount: data.shares?.count || 0,
        };
    } catch (error) {
        console.error('Error fetching Facebook video info:', error);
        return null;
    }
}

/**
 * Get view count for any Meta platform (Instagram or Facebook)
 */
export async function getMetaViewCount(
    platform: 'INSTAGRAM' | 'FACEBOOK',
    mediaId: string
): Promise<number | null> {
    try {
        if (platform === 'INSTAGRAM') {
            const info = await getInstagramMediaInfo(mediaId);
            return info?.viewCount || null;
        } else if (platform === 'FACEBOOK') {
            const info = await getFacebookVideoInfo(mediaId);
            return info?.viewCount || null;
        }

        return null;
    } catch (error) {
        console.error('Error getting Meta view count:', error);
        return null;
    }
}

/**
 * Extract media ID from Instagram URL
 */
export function extractInstagramMediaId(url: string): string | null {
    try {
        const match = url.match(/\/(p|reel)\/([\w-]+)/);
        return match ? match[2] : null;
    } catch (error) {
        return null;
    }
}

/**
 * Extract video ID from Facebook URL
 */
export function extractFacebookVideoId(url: string): string | null {
    try {
        const match = url.match(/\/(videos|posts)\/(\d+)/);
        return match ? match[2] : null;
    } catch (error) {
        return null;
    }
}
