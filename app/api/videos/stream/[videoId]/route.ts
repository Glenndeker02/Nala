import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { extractUser } from '@/lib/api-middleware';
import { generatePresignedUrl } from '@/lib/video-processing';

/**
 * Stream video (watermarked for founders, original for approved videos)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const user = extractUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { videoId } = params;

    // Get video submission
    const submission = await db.videoSubmission.findFirst({
      where: { videoId },
      include: {
        video: {
          include: {
            campaign: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const campaign = submission.video.campaign;

    // Check permissions
    const isFounder = user.userId === campaign.founderId;
    const isCreator = user.userId === campaign.creatorId;
    const isApproved = submission.video.status === 'APPROVED' || submission.video.baseFeePaid;

    if (!isFounder && !isCreator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Determine which version to stream
    let videoKey: string;

    if (isApproved && isCreator) {
      // Creator can see original after approval
      videoKey = submission.originalUrl.split('.com/')[1];
    } else if (isFounder && !isApproved) {
      // Founder sees watermarked version until approval
      videoKey = submission.watermarkedUrl.split('.com/')[1];
    } else if (isFounder && isApproved) {
      // Founder sees original after approval/payment
      videoKey = submission.originalUrl.split('.com/')[1];
    } else {
      // Default to watermarked
      videoKey = submission.watermarkedUrl.split('.com/')[1];
    }

    // Generate pre-signed URL (valid for 1 hour)
    const streamUrl = await generatePresignedUrl(videoKey, 3600);

    return NextResponse.json({
      streamUrl,
      thumbnail: submission.thumbnailUrl,
      duration: submission.duration,
      resolution: submission.resolution,
      isWatermarked: !isApproved || (isFounder && !isApproved),
    });
  } catch (error) {
    console.error('Video stream error:', error);
    return NextResponse.json(
      { error: 'Failed to generate stream URL' },
      { status: 500 }
    );
  }
}
