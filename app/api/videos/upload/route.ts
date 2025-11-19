import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';
import { processVideoSubmission } from '@/lib/video-processing';

/**
 * Upload and process video submission with watermark
 */
export const POST = requireRole(['CREATOR'], async (request: NextRequest, user) => {
  try {
    const formData = await request.formData();

    const videoFile = formData.get('video') as File;
    const campaignId = formData.get('campaignId') as string;
    const videoId = formData.get('videoId') as string;
    const submissionNotes = formData.get('notes') as string | null;

    if (!videoFile || !campaignId || !videoId) {
      return ApiResponse.error('Missing required fields', 400);
    }

    // Validate file type
    if (!videoFile.type.startsWith('video/')) {
      return ApiResponse.error('Invalid file type. Please upload a video file.', 400);
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (videoFile.size > maxSize) {
      return ApiResponse.error('File too large. Maximum size is 500MB.', 400);
    }

    // Verify campaign exists and creator is assigned
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return ApiResponse.error('Campaign not found', 404);
    }

    if (campaign.creatorId !== user.userId) {
      return ApiResponse.error('You are not assigned to this campaign', 403);
    }

    // Verify video exists
    const video = await db.video.findUnique({
      where: { id: videoId },
    });

    if (!video || video.campaignId !== campaignId) {
      return ApiResponse.error('Video not found', 404);
    }

    // Convert File to Buffer
    const arrayBuffer = await videoFile.arrayBuffer();
    const videoBuffer = Buffer.from(arrayBuffer);

    // Process video: watermark, thumbnail, upload to S3
    const processedVideo = await processVideoSubmission({
      videoBuffer,
      originalFilename: videoFile.name,
      videoId,
      campaignId,
      creatorId: user.userId,
    });

    // Create video submission record
    const submission = await db.videoSubmission.create({
      data: {
        videoId,
        campaignId,
        creatorId: user.userId,
        originalUrl: processedVideo.originalUrl,
        originalFilename: videoFile.name,
        fileSize: processedVideo.fileSize,
        duration: processedVideo.duration,
        resolution: processedVideo.resolution,
        watermarkedUrl: processedVideo.watermarkedUrl,
        thumbnailUrl: processedVideo.thumbnailUrl,
        processingStatus: 'COMPLETED',
        submissionNotes,
      },
    });

    // Update video status
    await db.video.update({
      where: { id: videoId },
      data: {
        draftVideoUrl: processedVideo.watermarkedUrl,
        status: 'DRAFT_SUBMITTED',
        submittedAt: new Date(),
      },
    });

    // Notify founder
    await db.notification.create({
      data: {
        userId: campaign.founderId,
        type: 'video_submitted',
        title: 'New video submitted for review',
        message: `Creator has submitted a video for ${campaign.name}`,
        metadata: {
          campaignId,
          videoId,
          submissionId: submission.id,
        },
      },
    });

    return ApiResponse.success({
      submission: {
        id: submission.id,
        watermarkedUrl: submission.watermarkedUrl,
        thumbnailUrl: submission.thumbnailUrl,
        duration: submission.duration,
        resolution: submission.resolution,
        fileSize: submission.fileSize,
      },
      message:
        'Video uploaded and watermarked successfully! Waiting for founder approval.',
    });
  } catch (error) {
    console.error('Video upload error:', error);
    return ApiResponse.error(
      error instanceof Error ? error.message : 'Failed to upload video',
      500
    );
  }
});

// Configure API route to handle large files
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '500mb',
    },
  },
};
