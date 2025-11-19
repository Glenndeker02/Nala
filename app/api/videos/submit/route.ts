import { NextRequest } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

const submitVideoSchema = z.object({
  campaignId: z.string().uuid(),
  videoId: z.string().uuid(),
  draftVideoUrl: z.string().url(),
  creatorNotes: z.string().optional(),
});

/**
 * Submit video draft for review (Creator only)
 */
export const POST = requireRole(['CREATOR'], async (request: NextRequest, user) => {
  try {
    const body = await request.json();

    // Validate input
    const validation = submitVideoSchema.safeParse(body);
    if (!validation.success) {
      return ApiResponse.error('Validation failed', 400, validation.error.errors);
    }

    const { campaignId, videoId, draftVideoUrl, creatorNotes } = validation.data;

    // Verify campaign exists and is assigned to this creator
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: {
        videos: {
          where: { id: videoId },
        },
      },
    });

    if (!campaign) {
      return ApiResponse.error('Campaign not found', 404);
    }

    if (campaign.creatorId !== user.userId) {
      return ApiResponse.error('You are not assigned to this campaign', 403);
    }

    const video = campaign.videos[0];
    if (!video) {
      return ApiResponse.error('Video not found', 404);
    }

    if (video.status !== 'PENDING' && video.status !== 'REVISION_REQUESTED') {
      return ApiResponse.error('Video is not in a submittable state', 400);
    }

    // Update video status
    const updatedVideo = await db.video.update({
      where: { id: videoId },
      data: {
        draftVideoUrl,
        status: 'DRAFT_SUBMITTED',
        submittedAt: new Date(),
      },
    });

    // TODO: Send notification to founder
    // await sendVideoSubmittedNotification(campaign.founderId, campaign.id, video.id);

    // Create notification
    await db.notification.create({
      data: {
        userId: campaign.founderId,
        type: 'video_submitted',
        title: 'New video submitted for review',
        message: `${user.email} has submitted a video for ${campaign.name}`,
        metadata: {
          campaignId,
          videoId,
        },
      },
    });

    return ApiResponse.success({
      video: {
        id: updatedVideo.id,
        status: updatedVideo.status,
        submittedAt: updatedVideo.submittedAt,
      },
      message: 'Video submitted successfully. Waiting for founder review.',
    });
  } catch (error) {
    console.error('Video submission error:', error);
    return ApiResponse.error('Failed to submit video', 500);
  }
});
