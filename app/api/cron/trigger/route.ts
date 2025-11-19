import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api-middleware';
import { runViewPolling } from '@/lib/cron/view-polling';
import { runSettlement } from '@/lib/cron/settlement';
import { runPostPublisher } from '@/lib/cron/post-publisher';

/**
 * Manual trigger for cron jobs (for testing/debugging)
 * In production, use actual cron jobs or serverless scheduled functions
 */
export async function POST(request: NextRequest) {
  try {
    // Simple auth check (in production, use proper auth)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || 'dev-secret';

    if (authHeader !== `Bearer ${expectedToken}`) {
      return ApiResponse.error('Unauthorized', 401);
    }

    const { job } = await request.json();

    if (!job) {
      return ApiResponse.error('Job type is required', 400);
    }

    let result;

    switch (job) {
      case 'view-polling':
        result = await runViewPolling();
        break;

      case 'settlement':
        result = await runSettlement();
        break;

      case 'post-publisher':
        result = await runPostPublisher();
        break;

      case 'all':
        const viewPollingResult = await runViewPolling();
        // Wait a bit before settlement to ensure view counts are updated
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const settlementResult = await runSettlement();
        const publisherResult = await runPostPublisher();
        result = {
          viewPolling: viewPollingResult,
          settlement: settlementResult,
          postPublisher: publisherResult,
        };
        break;

      default:
        return ApiResponse.error('Invalid job type', 400);
    }

    return ApiResponse.success({
      job,
      result,
      executedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron trigger error:', error);
    return ApiResponse.error('Cron job execution failed', 500);
  }
}
