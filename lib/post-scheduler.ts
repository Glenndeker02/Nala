import axios from 'axios';
import db from './db';
import { decrypt } from './encryption';
import { Platform } from '@prisma/client';

/**
 * Publish video to TikTok
 */
export async function publishToTikTok(params: {
  accessToken: string;
  videoUrl: string;
  caption: string;
  privacy?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
}): Promise<{ postId: string; postUrl: string }> {
  const { accessToken, videoUrl, caption, privacy = 'PUBLIC' } = params;

  try {
    // TikTok Direct Post API
    const response = await axios.post(
      'https://open.tiktokapis.com/v2/post/publish/video/init/',
      {
        post_info: {
          title: caption,
          privacy_level: privacy,
          disable_comment: false,
          disable_duet: false,
          disable_stitch: false,
        },
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: videoUrl,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const publishId = response.data.data.publish_id;

    // Check status (TikTok processes videos asynchronously)
    const statusResponse = await checkTikTokPublishStatus(accessToken, publishId);

    return {
      postId: publishId,
      postUrl: statusResponse.share_url || '',
    };
  } catch (error) {
    console.error('TikTok publish error:', error);
    throw new Error('Failed to publish to TikTok');
  }
}

/**
 * Check TikTok publish status
 */
async function checkTikTokPublishStatus(
  accessToken: string,
  publishId: string,
  maxAttempts: number = 10
): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await axios.post(
      'https://open.tiktokapis.com/v2/post/publish/status/fetch/',
      {
        publish_id: publishId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const status = response.data.data.status;

    if (status === 'PUBLISH_COMPLETE') {
      return response.data.data;
    } else if (status === 'FAILED') {
      throw new Error('TikTok publish failed');
    }

    // Wait 3 seconds before next check
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  throw new Error('TikTok publish timeout');
}

/**
 * Publish video to Instagram Reels
 */
export async function publishToInstagram(params: {
  accessToken: string;
  igUserId: string;
  videoUrl: string;
  caption: string;
}): Promise<{ postId: string; postUrl: string }> {
  const { accessToken, igUserId, videoUrl, caption } = params;

  try {
    // Step 1: Create media container
    const containerResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${igUserId}/media`,
      {
        media_type: 'REELS',
        video_url: videoUrl,
        caption: caption,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const creationId = containerResponse.data.id;

    // Step 2: Check container status
    await waitForInstagramContainerReady(accessToken, creationId);

    // Step 3: Publish the container
    const publishResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${igUserId}/media_publish`,
      {
        creation_id: creationId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const mediaId = publishResponse.data.id;

    // Get post permalink
    const permalinkResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${mediaId}`,
      {
        params: {
          fields: 'permalink',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return {
      postId: mediaId,
      postUrl: permalinkResponse.data.permalink,
    };
  } catch (error) {
    console.error('Instagram publish error:', error);
    throw new Error('Failed to publish to Instagram');
  }
}

/**
 * Wait for Instagram container to be ready
 */
async function waitForInstagramContainerReady(
  accessToken: string,
  containerId: string,
  maxAttempts: number = 20
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${containerId}`,
      {
        params: {
          fields: 'status_code',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const statusCode = response.data.status_code;

    if (statusCode === 'FINISHED') {
      return;
    } else if (statusCode === 'ERROR') {
      throw new Error('Instagram container processing failed');
    }

    // Wait 5 seconds before next check
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw new Error('Instagram container processing timeout');
}

/**
 * Publish video to Facebook
 */
export async function publishToFacebook(params: {
  accessToken: string;
  pageId: string;
  videoUrl: string;
  caption: string;
}): Promise<{ postId: string; postUrl: string }> {
  const { accessToken, pageId, videoUrl, caption } = params;

  try {
    // Upload video to Facebook
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${pageId}/videos`,
      {
        file_url: videoUrl,
        description: caption,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const videoId = response.data.id;

    return {
      postId: videoId,
      postUrl: `https://facebook.com/${videoId}`,
    };
  } catch (error) {
    console.error('Facebook publish error:', error);
    throw new Error('Failed to publish to Facebook');
  }
}

/**
 * Process a scheduled post (called by cron job)
 */
export async function processScheduledPost(scheduledPostId: string): Promise<void> {
  const scheduledPost = await db.scheduledPost.findUnique({
    where: { id: scheduledPostId },
  });

  if (!scheduledPost) {
    throw new Error('Scheduled post not found');
  }

  try {
    // Update status to processing
    await db.scheduledPost.update({
      where: { id: scheduledPostId },
      data: {
        status: 'PROCESSING',
        lastAttemptAt: new Date(),
        attempts: { increment: 1 },
      },
    });

    // Get creator's social account
    const socialAccount = await db.socialAccount.findFirst({
      where: {
        creatorId: scheduledPost.creatorId,
        platform: scheduledPost.platform,
      },
    });

    if (!socialAccount || !socialAccount.accessToken) {
      throw new Error('Social account not connected');
    }

    const accessToken = decrypt(socialAccount.accessToken);

    let result: { postId: string; postUrl: string };

    // Publish based on platform
    switch (scheduledPost.platform) {
      case 'TIKTOK':
        result = await publishToTikTok({
          accessToken,
          videoUrl: scheduledPost.videoUrl,
          caption: scheduledPost.caption || '',
        });
        break;

      case 'INSTAGRAM':
        result = await publishToInstagram({
          accessToken,
          igUserId: socialAccount.platformUserId,
          videoUrl: scheduledPost.videoUrl,
          caption: scheduledPost.caption || '',
        });
        break;

      case 'FACEBOOK':
        result = await publishToFacebook({
          accessToken,
          pageId: socialAccount.platformUserId,
          videoUrl: scheduledPost.videoUrl,
          caption: scheduledPost.caption || '',
        });
        break;

      default:
        throw new Error('Unsupported platform');
    }

    // Update scheduled post as published
    await db.scheduledPost.update({
      where: { id: scheduledPostId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        platformPostId: result.postId,
        platformPostUrl: result.postUrl,
      },
    });

    // Update video with post URL
    await db.video.update({
      where: { id: scheduledPost.videoId },
      data: {
        finalPostUrl: result.postUrl,
        platformVideoId: result.postId,
        postedAt: new Date(),
        status: 'POSTED',
      },
    });

    // Send notification to creator
    await db.notification.create({
      data: {
        userId: scheduledPost.creatorId,
        type: 'VIDEO_STATUS',
        title: 'Post published successfully',
        message: `Your ${scheduledPost.platform.toLowerCase()} post has been published.`,
        isRead: false,
      },
    });
  } catch (error) {
    console.error(`Failed to process scheduled post ${scheduledPostId}:`, error);

    // Update as failed
    await db.scheduledPost.update({
      where: { id: scheduledPostId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    // Retry logic: if attempts < 3, reschedule for 1 hour later
    if (scheduledPost.attempts < 3) {
      await db.scheduledPost.update({
        where: { id: scheduledPostId },
        data: {
          status: 'PENDING',
          scheduledFor: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        },
      });
    }

    throw error;
  }
}
