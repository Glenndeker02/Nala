/**
 * Daily View Polling Cron Job
 * Runs daily at 12:00 AM EST
 * Fetches view counts for all active (posted) videos
 */

import db from '../db';
import { fetchVideoViewCount } from '../social-apis';

export async function runViewPolling() {
  console.log('[View Polling] Starting daily view polling job...');

  try {
    // Find all videos that are posted but not locked
    const activeVideos = await db.video.findMany({
      where: {
        status: 'POSTED',
        postedAt: {
          not: null,
        },
        lockedAt: null,
      },
      include: {
        campaign: true,
      },
    });

    console.log(`[View Polling] Found ${activeVideos.length} active videos to poll`);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as { videoId: string; error: string }[],
    };

    // Process videos in batches of 50
    const batchSize = 50;
    for (let i = 0; i < activeVideos.length; i += batchSize) {
      const batch = activeVideos.slice(i, i + batchSize);

      await Promise.allSettled(
        batch.map(async (video) => {
          try {
            const result = await fetchVideoViewCount(video.id);

            if (result.success) {
              results.success++;
              console.log(
                `[View Polling] ✓ Video ${video.id}: ${result.viewCount} views`
              );
            } else {
              results.failed++;
              results.errors.push({
                videoId: video.id,
                error: result.error || 'Unknown error',
              });
              console.error(
                `[View Polling] ✗ Video ${video.id}: ${result.error}`
              );
            }
          } catch (error) {
            results.failed++;
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            results.errors.push({
              videoId: video.id,
              error: errorMsg,
            });
            console.error(`[View Polling] ✗ Video ${video.id}: ${errorMsg}`);
          }
        })
      );

      // Small delay between batches to respect rate limits
      if (i + batchSize < activeVideos.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log('[View Polling] Job completed:', results);

    // Alert if failure rate is high (>10%)
    const failureRate = results.failed / (results.success + results.failed);
    if (failureRate > 0.1) {
      console.error(
        `[View Polling] HIGH FAILURE RATE: ${(failureRate * 100).toFixed(2)}%`
      );
      // TODO: Send alert to ops team
    }

    return results;
  } catch (error) {
    console.error('[View Polling] Fatal error:', error);
    throw error;
  }
}
