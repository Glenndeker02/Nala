import { NextRequest } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';
import { transferBaseFee, generateIdempotencyKey } from '@/lib/stripe';

const approveVideoSchema = z.object({
  videoId: z.string().uuid(),
  comments: z.string().optional(),
});

/**
 * Approve video and trigger Phase 1 payment (Founder only)
 */
export const POST = requireRole(['FOUNDER'], async (request: NextRequest, user) => {
  try {
    const body = await request.json();

    // Validate input
    const validation = approveVideoSchema.safeParse(body);
    if (!validation.success) {
      return ApiResponse.error('Validation failed', 400, validation.error.errors);
    }

    const { videoId, comments } = validation.data;

    // Get video with campaign and creator info
    const video = await db.video.findUnique({
      where: { id: videoId },
      include: {
        campaign: {
          include: {
            founder: true,
            creator: true,
          },
        },
      },
    });

    if (!video || !video.campaign) {
      return ApiResponse.error('Video or campaign not found', 404);
    }

    // Verify founder owns this campaign
    if (video.campaign.founderId !== user.userId) {
      return ApiResponse.error('You do not have permission to approve this video', 403);
    }

    // Check video is in correct state
    if (video.status !== 'DRAFT_SUBMITTED' && video.status !== 'IN_REVIEW') {
      return ApiResponse.error('Video is not in a reviewable state', 400);
    }

    // Check if base fee already paid
    if (video.baseFeePaid) {
      return ApiResponse.error('Base fee already paid for this video', 400);
    }

    // Get creator's Stripe account
    const creator = video.campaign.creator;
    if (!creator || !creator.stripeAccountId) {
      return ApiResponse.error('Creator has not completed payment setup', 400);
    }

    // Get creator's base fee for this platform
    const creatorProfile = await db.creatorProfile.findUnique({
      where: { userId: creator.id },
    });

    if (!creatorProfile) {
      return ApiResponse.error('Creator profile not found', 404);
    }

    // Determine base fee amount (use platform-specific or default)
    let baseFeeAmount = 75; // Default
    if (video.platform === 'TIKTOK') {
      baseFeeAmount = creatorProfile.baseFeeTiktok.toNumber();
    } else if (video.platform === 'INSTAGRAM') {
      baseFeeAmount = creatorProfile.baseFeeInstagram.toNumber();
    } else if (video.platform === 'FACEBOOK') {
      baseFeeAmount = creatorProfile.baseFeeFacebook.toNumber();
    }

    // Verify escrow has sufficient funds
    if (video.campaign.escrowBalance.toNumber() < baseFeeAmount) {
      return ApiResponse.error('Insufficient escrow balance', 400, {
        required: baseFeeAmount,
        available: video.campaign.escrowBalance.toNumber(),
      });
    }

    // Start database transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Update video status
      const approvedVideo = await tx.video.update({
        where: { id: videoId },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          baseFeePaid: true,
          baseFeeAmount,
        },
      });

      // 2. Create payment record
      const payment = await tx.payment.create({
        data: {
          campaignId: video.campaign.id,
          videoId: video.id,
          recipientId: creator.id,
          amount: baseFeeAmount,
          type: 'BASE_FEE',
          status: 'PROCESSING',
        },
      });

      // 3. Update campaign escrow balance
      await tx.campaign.update({
        where: { id: video.campaign.id },
        data: {
          escrowBalance: {
            decrement: baseFeeAmount,
          },
        },
      });

      return { approvedVideo, payment };
    });

    // 4. Process Stripe transfer (outside transaction)
    try {
      const transfer = await transferBaseFee({
        amount: Math.round(baseFeeAmount * 100), // Convert to cents
        creatorAccountId: creator.stripeAccountId,
        campaignId: video.campaign.id,
        videoId: video.id,
        founderId: video.campaign.founderId,
        creatorId: creator.id,
      });

      // Update payment with Stripe transfer ID
      await db.payment.update({
        where: { id: result.payment.id },
        data: {
          status: 'COMPLETED',
          stripeTransferId: transfer.id,
          processedAt: new Date(),
        },
      });

      // Create notification for creator
      await db.notification.create({
        data: {
          userId: creator.id,
          type: 'payment_sent',
          title: 'Base fee payment sent',
          message: `You've received $${baseFeeAmount} for video approval`,
          metadata: {
            campaignId: video.campaign.id,
            videoId: video.id,
            amount: baseFeeAmount,
          },
        },
      });

      return ApiResponse.success({
        video: {
          id: result.approvedVideo.id,
          status: result.approvedVideo.status,
          approvedAt: result.approvedVideo.approvedAt,
        },
        payment: {
          id: result.payment.id,
          amount: baseFeeAmount,
          status: 'COMPLETED',
          transferId: transfer.id,
        },
        message: `Video approved! $${baseFeeAmount} payment sent to creator.`,
      });
    } catch (stripeError) {
      console.error('Stripe transfer error:', stripeError);

      // Mark payment as failed
      await db.payment.update({
        where: { id: result.payment.id },
        data: {
          status: 'FAILED',
          failureReason: stripeError instanceof Error ? stripeError.message : 'Unknown error',
        },
      });

      return ApiResponse.error('Video approved but payment failed. Will retry automatically.', 500, {
        video: {
          id: result.approvedVideo.id,
          status: result.approvedVideo.status,
        },
        payment: {
          id: result.payment.id,
          status: 'FAILED',
        },
      });
    }
  } catch (error) {
    console.error('Video approval error:', error);
    return ApiResponse.error('Failed to approve video', 500);
  }
});
