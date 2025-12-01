import { runMetricsUpdate } from '../lib/cron/metrics-updater';
import { runABTestCalculation } from '../lib/cron/ab-test-calculator';
import { runGoalCheck } from '../lib/cron/goal-checker';

async function main() {
    console.log('--- Starting Manual Cron Job Test ---');

    console.log('\n1. Testing Metrics Updater...');
    try {
        await runMetricsUpdate();
        console.log('✓ Metrics Updater completed successfully');
    } catch (error) {
        console.error('✗ Metrics Updater failed:', error);
    }

    console.log('\n2. Testing A/B Test Calculator...');
    try {
        await runABTestCalculation();
        console.log('✓ A/B Test Calculator completed successfully');
    } catch (error) {
        console.error('✗ A/B Test Calculator failed:', error);
    }

    console.log('\n3. Testing Goal Checker...');
    try {
        await runGoalCheck();
        console.log('✓ Goal Checker completed successfully');
    } catch (error) {
        console.error('✗ Goal Checker failed:', error);
    }

    console.log('\n--- Test Completed ---');
    process.exit(0);
}

main();
