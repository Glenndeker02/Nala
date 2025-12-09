import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const POST = requireRole(['CREATOR'], async (request: NextRequest, user) => {
  try {
    const formData = await request.formData();
    const file = formData.get('video') as File;
    const videoId = formData.get('videoId') as string;
    const notes = formData.get('notes') as string;

    if (!file) {
      return ApiResponse.error('No video file provided', 400);
    }

    if (!videoId) {
      return ApiResponse.error('Video ID is required', 400);
    }

    // Verify video exists and belongs to creator
    const video = await db.video.findUnique({
      where: { id: videoId },
      include: { campaign: true },
    });

    if (!video) {
      return ApiResponse.error('Video not found', 404);
    }

    if (video.creatorId !== user.userId) {
      return ApiResponse.error('Unauthorized', 403);
    }

    if (video.status !== 'PENDING' && video.status !== 'REVISION_REQUESTED') {
      return ApiResponse.error('Video is not in a state that accepts uploads', 400);
    }

    // Check if creator has acknowledged all required campaign instructions
    const instructions = await db.instruction.findMany({
      where: {
        campaignId: video.campaignId,
        requiresAcknowledgment: true,
      },
    });

    const unacknowledged = instructions.filter(
      (inst) => !inst.acknowledgedBy.includes(user.userId)
    );

    if (unacknowledged.length > 0) {
      return ApiResponse.error(
        `You must acknowledge all campaign requirements before uploading. ${unacknowledged.length} instruction(s) pending acknowledgment.`,
        403,
        {
          requiresAcknowledgment: true,
          unacknowledgedCount: unacknowledged.length,
          campaignId: video.campaignId,
        }
      );
    }


    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      return ApiResponse.error('Invalid file type. Only MP4, MOV, and WebM are allowed', 400);
    }

    // Validate file size (1GB max)
    const maxSize = 1024 * 1024 * 1024; // 1GB
    if (file.size > maxSize) {
      return ApiResponse.error('File size exceeds 1GB limit', 400);
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'drafts');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `${videoId}_${timestamp}.${fileExtension}`;
    const filepath = join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Update video record
    const updatedVideo = await db.video.update({
      where: { id: videoId },
      data: {
        draftVideoUrl: `/uploads/drafts/${filename}`,
        status: 'DRAFT_SUBMITTED',
        submittedAt: new Date(),
      },
    });

    // TODO: Create notification for founder
    // TODO: Process video for watermarking (future enhancement)
    // TODO: Generate thumbnail

    return ApiResponse.success({
      message: 'Draft uploaded successfully',
      video: {
        id: updatedVideo.id,
        draftVideoUrl: updatedVideo.draftVideoUrl,
        status: updatedVideo.status,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return ApiResponse.error('Failed to upload video', 500);
  }
});

// Route segment config for video uploads
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// Body parser is automatically disabled for route handlers with FormData
