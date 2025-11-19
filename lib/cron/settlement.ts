/**
 * 7-Day Metric Lock & Settlement Cron Job
 * Runs daily at 12:05 AM EST
 * Locks view counts and processes Phase 2 payments
 */

import db from '../db';
import {
  calculateSettlement,
  transferPerformanceBonus,
  refundUnspentBudget,
} from '../stripe';
import { fetchVideoViewCount } from '../social-apis';

export async function runSettlement() {
  console.log('[Settlement] Starting 7-day settlement job...');

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Find videos posted >= 7 days ago that haven't been locked
    const videosToLock = await db.video.findMany({
      where: {
        status: 'POSTED',
        postedAt: {
          lte: sevenDaysAgo,
        },
        lockedAt: null,
      },
      include: {
        campaign: {
          include: {
            creator: true,
            founder: true,
          },
        },
      },
    });

    console.log(`[Settlement] Found ${videosToLock.length} videos to settle`);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as { videoId: string; error: string }[],
    };

    for (const video of videosToLock) {
      try {
        await processVideoSettlement(video);
        results.success++;
      } catch (error) {
        results.failed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push({
          videoId: video.id,
          error: errorMsg,
        });
        console.error(`[Settlement] Failed to settle video ${video.id}:`, errorMsg);
      }
    }

    console.log('[Settlement] Job completed:', results);

    return results;
  } catch (error) {
    console.error('[Settlement] Fatal error:', error);
    throw error;
  }
}

async function processVideoSettlement(video: any) {
  console.log(`[Settlement] Processing video ${video.id}...`);

  // 1. Fetch final view count
  const viewResult = await fetchVideoViewCount(video.id);
  const finalViewCount = viewResult.success ? viewResult.viewCount! : video.currentViewCount;

  if (!viewResult.success) {
    console.warn(
      `[Settlement] Using cached view count for video ${video.id}: ${finalViewCount}`
    );
    // TODO: Flag for manual review
  }

  // 2. Start transaction
  await db.$transaction(async (tx) => {
    // Lock the view count
    const lockedVideo = await tx.video.update({
      where: { id: video.id },
      data: {
        lockedViewCount: finalViewCount,
        lockedAt: new Date(),
        status: 'LOCKED',
      },
    });

    // Calculate settlement
    const campaign = video.campaign;
    const settlement = calculateSettlement(
      finalViewCount,
      campaign.performanceBudget.toNumber()
    );

    console.log(`[Settlement] Video ${video.id} settlement:`, settlement);

    // Create settlement record
    await tx.settlement.create({
      data: {
        videoId: video.id,
        campaignId: campaign.id,
        lockedViews: finalViewCount,
        creatorPerformanceBonus: settlement.creatorPerformanceBonus,
        nalaRevenue: settlement.nalaRevenue,
        founderRefund: settlement.founderRefund,
      },
    });

    // 3. Process creator performance bonus (if any)
    if (settlement.creatorPerformanceBonus > 0) {
      const creator = campaign.creator;

      if (!creator.stripeAccountId) {
        throw new Error('Creator has no Stripe account');
      }

      const transfer = await transferPerformanceBonus({
        amount: Math.round(settlement.creatorPerformanceBonus * 100), // Convert to cents
        creatorAccountId: creator.stripeAccountId,
        campaignId: campaign.id,
        videoId: video.id,
        viewsAchieved: finalViewCount,
      });

      // Record payment
      await tx.payment.create({
        data: {
          campaignId: campaign.id,
          videoId: video.id,
          recipientId: creator.id,
          amount: settlement.creatorPerformanceBonus,
          type: 'PERFORMANCE_BONUS',
          status: 'COMPLETED',
          stripeTransferId: transfer.id,
          processedAt: new Date(),
          metadata: {
            views: finalViewCount,
            rate: 4.0,
          },
        },
      });

      // Update video
      await tx.video.update({
        where: { id: video.id },
        data: {
          performanceBonusPaid: true,
          performanceBonusAmount: settlement.creatorPerformanceBonus,
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId: creator.id,
          type: 'performance_bonus',
          title: 'Performance bonus paid!',
          message: `You earned $${settlement.creatorPerformanceBonus.toFixed(
            2
          )} for ${finalViewCount.toLocaleString()} views`,
          metadata: {
            campaignId: campaign.id,
            videoId: video.id,
            amount: settlement.creatorPerformanceBonus,
            views: finalViewCount,
          },
        },
      });
    }

    // 4. Record Nala revenue
    await tx.revenue.create({
      data: {
        campaignId: campaign.id,
        videoId: video.id,
        amount: settlement.nalaRevenue,
        type: 'markup',
        viewsCount: finalViewCount,
      },
    });

    // 5. Check if all videos in campaign are locked
    const campaignVideos = await tx.video.findMany({
      where: { campaignId: campaign.id },
    });

    const allLocked = campaignVideos.every((v) => v.lockedAt !== null);

    if (allLocked) {
      // Calculate total campaign-level refund
      const totalPerformanceCost = await tx.payment.aggregate({
        where: {
          campaignId: campaign.id,
          type: 'PERFORMANCE_BONUS',
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
      });

      const performanceBudget = campaign.performanceBudget.toNumber();
      const totalCost = totalPerformanceCost._sum.amount?.toNumber() || 0;
      const refundAmount = Math.max(0, performanceBudget - totalCost);

      // Process refund if applicable
      if (refundAmount > 0 && campaign.stripePaymentIntentId) {
        const refund = await refundUnspentBudget(
          campaign.stripePaymentIntentId,
          Math.round(refundAmount * 100), // Convert to cents
          campaign.id
        );

        // Record refund payment
        await tx.payment.create({
          data: {
            campaignId: campaign.id,
            recipientId: campaign.founderId,
            amount: refundAmount,
            type: 'REFUND',
            status: 'COMPLETED',
            stripeRefundId: refund.id,
            processedAt: new Date(),
          },
        });

        // Update campaign
        await tx.campaign.update({
          where: { id: campaign.id },
          data: {
            totalRefundedToFounder: refundAmount,
          },
        });

        // Create notification
        await tx.notification.create({
          data: {
            userId: campaign.founderId,
            type: 'refund_processed',
            title: 'Campaign refund processed',
            message: `$${refundAmount.toFixed(2)} refunded for unspent performance budget`,
            metadata: {
              campaignId: campaign.id,
              amount: refundAmount,
            },
          },
        });
      }

      // Mark campaign as completed
      await tx.campaign.update({
        where: { id: campaign.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      // TODO: Generate license documents
      // TODO: Send campaign completion emails

      console.log(`[Settlement] Campaign ${campaign.id} completed!`);
    }
  });

  console.log(`[Settlement] ✓ Video ${video.id} settled successfully`);
}
