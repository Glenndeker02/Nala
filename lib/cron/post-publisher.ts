/**
 * Scheduled Post Publisher Cron Job
 * Runs every 5 minutes
 * Checks for posts that are due to be published
 */

import db from '../db';
import { processScheduledPost } from '../post-scheduler';

export async function runPostPublisher() {
  console.log('[Post Publisher] Starting scheduled post publisher job...');

  try {
    const now = new Date();

    // Find all pending scheduled posts that are due
    const duePosts = await db.scheduledPost.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: {
          lte: now,
        },
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    });

    console.log(`[Post Publisher] Found ${duePosts.length} posts to publish`);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as { postId: string; error: string }[],
    };

    // Process posts one by one (to avoid rate limits)
    for (const post of duePosts) {
      try {
        await processScheduledPost(post.id);
        results.success++;
        console.log(`[Post Publisher] ✓ Published post ${post.id} to ${post.platform}`);

        // Small delay between posts to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        results.failed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push({
          postId: post.id,
          error: errorMsg,
        });
        console.error(`[Post Publisher] ✗ Failed to publish post ${post.id}:`, errorMsg);
      }
    }

    console.log('[Post Publisher] Job completed:', results);

    // Alert if many failures
    if (results.failed > 0 && results.failed / (results.success + results.failed) > 0.3) {
      console.error(
        `[Post Publisher] HIGH FAILURE RATE: ${results.failed}/${
          results.success + results.failed
        } posts failed`
      );
      // TODO: Send alert to ops team
    }

    return results;
  } catch (error) {
    console.error('[Post Publisher] Fatal error:', error);
    throw error;
  }
}
