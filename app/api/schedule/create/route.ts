import { NextRequest } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';
import { Platform } from '@prisma/client';

const schedulePostSchema = z.object({
  videoId: z.string().uuid(),
  platform: z.enum(['TIKTOK', 'INSTAGRAM', 'FACEBOOK']),
  scheduledFor: z.string().datetime(),
  timezone: z.string().default('America/New_York'),
  caption: z.string().optional(),
  hashtags: z.string().optional(),
});

/**
 * Schedule a post for automatic publishing
 */
export const POST = requireRole(['CREATOR'], async (request: NextRequest, user) => {
  try {
    const body = await request.json();

    // Validate input
    const validation = schedulePostSchema.safeParse(body);
    if (!validation.success) {
      return ApiResponse.error('Validation failed', 400, validation.error.errors);
    }

    const { videoId, platform, scheduledFor, timezone, caption, hashtags } =
      validation.data;

    // Get video and verify ownership
    const video = await db.video.findUnique({
      where: { id: videoId },
      include: {
        campaign: true,
      },
    });

    if (!video) {
      return ApiResponse.error('Video not found', 404);
    }

    if (video.campaign.creatorId !== user.userId) {
      return ApiResponse.error('You do not own this video', 403);
    }

    // Video must be approved before scheduling
    if (video.status !== 'APPROVED') {
      return ApiResponse.error('Video must be approved before scheduling', 400);
    }

    // Check if video submission exists (we need the original video URL)
    const submission = await db.videoSubmission.findFirst({
      where: { videoId },
    });

    if (!submission) {
      return ApiResponse.error('Video submission not found', 404);
    }

    // Verify creator has connected this platform
    const socialAccount = await db.socialAccount.findFirst({
      where: {
        creatorId: user.userId,
        platform: platform as Platform,
      },
    });

    if (!socialAccount) {
      return ApiResponse.error(`${platform} account not connected`, 400);
    }

    // Validate scheduled time is in the future
    const scheduledDate = new Date(scheduledFor);
    if (scheduledDate <= new Date()) {
      return ApiResponse.error('Scheduled time must be in the future', 400);
    }

    // Create scheduled post
    const scheduledPost = await db.scheduledPost.create({
      data: {
        videoId,
        creatorId: user.userId,
        campaignId: video.campaignId,
        platform: platform as Platform,
        scheduledFor: scheduledDate,
        timezone,
        caption,
        hashtags,
        videoUrl: submission.originalUrl, // Use original (unwatermarked) for publishing
        thumbnailUrl: submission.thumbnailUrl,
      },
    });

    return ApiResponse.success({
      scheduledPost: {
        id: scheduledPost.id,
        platform: scheduledPost.platform,
        scheduledFor: scheduledPost.scheduledFor,
        status: scheduledPost.status,
      },
      message: `Post scheduled for ${platform} on ${scheduledDate.toLocaleString()}`,
    });
  } catch (error) {
    console.error('Schedule post error:', error);
    return ApiResponse.error('Failed to schedule post', 500);
  }
});
