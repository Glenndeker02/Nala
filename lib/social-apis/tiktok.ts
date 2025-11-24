/**
 * TikTok Display API Integration
 * 
 * This module handles fetching video statistics from TikTok's Display API.
 * 
 * API Documentation: https://developers.tiktok.com/doc/display-api-get-started
 * 
 * Required Environment Variables:
 * - TIKTOK_CLIENT_KEY: Your TikTok app client key
 * - TIKTOK_CLIENT_SECRET: Your TikTok app client secret
 * - TIKTOK_ACCESS_TOKEN: User access token (obtained via OAuth)
 */

interface TikTokVideoInfo {
    videoId: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    createTime: number;
}

interface TikTokAPIResponse {
    data: {
        videos: Array<{
            id: string;
            video_description: string;
            create_time: number;
            share_url: string;
            duration: number;
            height: number;
            width: number;
            title: string;
            embed_link: string;
            like_count: number;
            comment_count: number;
            share_count: number;
            view_count: number;
        }>;
    };
    error?: {
        code: string;
        message: string;
    };
}

/**
 * Fetch video information from TikTok Display API
 */
export async function getTikTokVideoInfo(videoId: string): Promise<TikTokVideoInfo | null> {
    try {
        const accessToken = process.env.TIKTOK_ACCESS_TOKEN;

        if (!accessToken) {
            console.warn('TikTok access token not configured');
            return null;
        }

        // TikTok Display API endpoint
        const url = 'https://open.tiktokapis.com/v2/video/query/';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filters: {
                    video_ids: [videoId],
                },
                fields: [
                    'id',
                    'create_time',
                    'view_count',
                    'like_count',
                    'comment_count',
                    'share_count',
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('TikTok API error:', response.status, errorText);
            return null;
        }

        const data: TikTokAPIResponse = await response.json();

        if (data.error) {
            console.error('TikTok API error:', data.error);
            return null;
        }

        if (!data.data?.videos || data.data.videos.length === 0) {
            console.warn('No video found for ID:', videoId);
            return null;
        }

        const video = data.data.videos[0];

        return {
            videoId: video.id,
            viewCount: video.view_count || 0,
            likeCount: video.like_count || 0,
            commentCount: video.comment_count || 0,
            shareCount: video.share_count || 0,
            createTime: video.create_time,
        };
    } catch (error) {
        console.error('Error fetching TikTok video info:', error);
        return null;
    }
}

/**
 * Fallback: Parse view count from public TikTok page (web scraping)
 * Note: This is less reliable and may break if TikTok changes their HTML structure
 * Use only as a fallback when API is not available
 */
export async function getTikTokViewCountFallback(videoUrl: string): Promise<number | null> {
    try {
        console.warn('Using TikTok fallback scraping method - not recommended for production');

        const response = await fetch(videoUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        if (!response.ok) {
            return null;
        }

        const html = await response.text();

        // Try to find view count in the HTML
        // This is a simplified example - actual implementation would need more robust parsing
        const viewCountMatch = html.match(/"viewCount":(\d+)/);

        if (viewCountMatch && viewCountMatch[1]) {
            return parseInt(viewCountMatch[1], 10);
        }

        return null;
    } catch (error) {
        console.error('Error in TikTok fallback scraping:', error);
        return null;
    }
}

/**
 * Get view count with automatic fallback
 */
export async function getTikTokViewCount(videoId: string, videoUrl?: string): Promise<number | null> {
    // Try API first
    const apiResult = await getTikTokVideoInfo(videoId);

    if (apiResult) {
        return apiResult.viewCount;
    }

    // Fallback to scraping if API fails and URL is provided
    if (videoUrl) {
        return await getTikTokViewCountFallback(videoUrl);
    }

    return null;
}
