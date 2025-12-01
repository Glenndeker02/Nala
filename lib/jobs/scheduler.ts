import cron from 'node-cron';
import { analyticsJob } from './analyticsJob';
import { rankingJob } from './rankingJob';
import { recommendationsJob } from './recommendationsJob';
import { runMetricsUpdate } from '../cron/metrics-updater';
import { runABTestCalculation } from '../cron/ab-test-calculator';
import { runGoalCheck } from '../cron/goal-checker';

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

    // Metrics Update - Every 4 hours
    cron.schedule('0 */4 * * *', async () => {
        console.log('Triggering scheduled metrics update job');
        await runMetricsUpdate();
    });

    // A/B Test Calculation - Daily at 3 AM
    cron.schedule('0 3 * * *', async () => {
        console.log('Triggering scheduled A/B test calculation job');
        await runABTestCalculation();
    });

    // Goal Check - Daily at 4 AM
    cron.schedule('0 4 * * *', async () => {
        console.log('Triggering scheduled goal check job');
        await runGoalCheck();
    });

    console.log('Scheduler initialized.');
}
