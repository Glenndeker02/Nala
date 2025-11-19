import axios from 'axios';
import { decrypt } from './encryption';
import db from './db';

/**
 * TikTok API Integration
 */
export class TikTokAPI {
  private baseUrl = 'https://open.tiktokapis.com';

  /**
   * Fetch video analytics (view count)
   */
  async getVideoAnalytics(
    videoId: string,
    accessToken: string
  ): Promise<{ viewCount: number } | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/v2/video/query/`, {
        params: {
          fields: 'view_count,like_count,share_count,comment_count',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data && response.data.data) {
        return {
          viewCount: response.data.data.view_count || 0,
        };
      }

      return null;
    } catch (error) {
      console.error('TikTok API error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      const response = await axios.post(
        'https://open-api.tiktok.com/oauth/access_token/',
        {
          client_key: process.env.TIKTOK_CLIENT_KEY,
          client_secret: process.env.TIKTOK_CLIENT_SECRET,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.error('TikTok token refresh error:', error);
      throw error;
    }
  }
}

/**
 * Meta (Instagram/Facebook) API Integration
 */
export class MetaAPI {
  private baseUrl = 'https://graph.facebook.com/v18.0';

  /**
   * Fetch Instagram Reel metrics
   */
  async getInstagramReelMetrics(
    mediaId: string,
    accessToken: string
  ): Promise<{ viewCount: number } | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/${mediaId}/insights`, {
        params: {
          metric: 'plays,reach,impressions',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data && response.data.data) {
        // Instagram Reels use 'plays' as view count
        const playsMetric = response.data.data.find((m: any) => m.name === 'plays');
        return {
          viewCount: playsMetric?.values[0]?.value || 0,
        };
      }

      return null;
    } catch (error) {
      console.error('Instagram API error:', error);
      throw error;
    }
  }

  /**
   * Fetch Facebook Reel metrics
   */
  async getFacebookReelMetrics(
    videoId: string,
    accessToken: string
  ): Promise<{ viewCount: number } | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/${videoId}`, {
        params: {
          fields: 'post_video_views,video_view_time',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data) {
        return {
          viewCount: response.data.post_video_views || 0,
        };
      }

      return null;
    } catch (error) {
      console.error('Facebook API error:', error);
      throw error;
    }
  }

  /**
   * Refresh long-lived token (60 days)
   */
  async refreshLongLivedToken(accessToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          fb_exchange_token: accessToken,
        },
      });

      return {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.error('Meta token refresh error:', error);
      throw error;
    }
  }
}

/**
 * Fetch view count for a video from the appropriate platform
 */
export async function fetchVideoViewCount(
  videoId: string
): Promise<{ success: boolean; viewCount?: number; error?: string }> {
  try {
    const video = await db.video.findUnique({
      where: { id: videoId },
      include: {
        campaign: {
          include: {
            creator: {
              include: {
                socialAccounts: true,
              },
            },
          },
        },
      },
    });

    if (!video || !video.platform || !video.platformVideoId) {
      return { success: false, error: 'Video or platform info not found' };
    }

    const creator = video.campaign?.creator;
    if (!creator) {
      return { success: false, error: 'Creator not found' };
    }

    // Find the social account for this platform
    const socialAccount = creator.socialAccounts.find(
      (acc) => acc.platform === video.platform
    );

    if (!socialAccount || !socialAccount.accessToken) {
      return { success: false, error: 'Social account not connected' };
    }

    // Decrypt access token
    const accessToken = decrypt(socialAccount.accessToken);

    // Fetch view count based on platform
    let viewCount = 0;

    if (video.platform === 'TIKTOK') {
      const tiktokAPI = new TikTokAPI();
      const result = await tiktokAPI.getVideoAnalytics(video.platformVideoId, accessToken);
      viewCount = result?.viewCount || 0;
    } else if (video.platform === 'INSTAGRAM') {
      const metaAPI = new MetaAPI();
      const result = await metaAPI.getInstagramReelMetrics(video.platformVideoId, accessToken);
      viewCount = result?.viewCount || 0;
    } else if (video.platform === 'FACEBOOK') {
      const metaAPI = new MetaAPI();
      const result = await metaAPI.getFacebookReelMetrics(video.platformVideoId, accessToken);
      viewCount = result?.viewCount || 0;
    }

    // Store view snapshot
    await db.viewSnapshot.create({
      data: {
        videoId: video.id,
        viewCount,
        dataSource: `${video.platform.toLowerCase()}_api`,
      },
    });

    // Update video's current view count
    await db.video.update({
      where: { id: video.id },
      data: {
        currentViewCount: viewCount,
        lastViewUpdate: new Date(),
      },
    });

    return { success: true, viewCount };
  } catch (error) {
    console.error('Error fetching view count:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
