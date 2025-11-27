import cron from 'node-cron';
import { analyticsJob } from './analyticsJob';
import { rankingJob } from './rankingJob';
import { recommendationsJob } from './recommendationsJob';

export function initScheduler() {
    // Prevent multiple initializations in dev mode
    if ((global as any).schedulerInitialized) {
        return;
    }
    (global as any).schedulerInitialized = true;

    console.log('Initializing background job scheduler...');

    // Analytics aggregation - Every hour
    cron.schedule('0 * * * *', async () => {
        console.log('Triggering scheduled analytics job');
        await analyticsJob();
    });

    // Ranking calculation - Every 6 hours
    cron.schedule('0 */6 * * *', async () => {
        console.log('Triggering scheduled ranking job');
        await rankingJob();
    });

    // Recommendations refresh - Daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
        console.log('Triggering scheduled recommendations job');
        await recommendationsJob();
    });

    console.log('Scheduler initialized.');
}
