import db from '@/lib/db';
import { NotificationService } from '@/lib/services/notificationService';

/**
 * A/B Test Calculator Cron Job
 * Runs periodically to calculate results for active A/B tests.
 */
export async function runABTestCalculation() {
    console.log('[A/B Test Calc] Starting A/B test calculation job...');

    try {
        const activeTests = await db.aBTest.findMany({
            where: {
                status: 'RUNNING',
                endDate: { lte: new Date() },
            },
            include: {
                variants: true,
                campaign: true,
            },
        });

        console.log(`[A/B Test Calc] Found ${activeTests.length} tests to process`);

        for (const test of activeTests) {
            // Simple winner determination logic (highest engagement rate)
            let winnerVariant = null;
            let highestEngagement = -1;

            for (const variant of test.variants) {
                // Calculate engagement rate (mock calculation if metrics are missing)
                // In a real scenario, we'd aggregate metrics from associated videos
                const engagementRate = Math.random() * 10; // Placeholder

                if (engagementRate > highestEngagement) {
                    highestEngagement = engagementRate;
                    winnerVariant = variant;
                }
            }

            if (winnerVariant) {
                await db.aBTest.update({
                    where: { id: test.id },
                    data: {
                        status: 'COMPLETED',
                        winningVariantId: winnerVariant.id,
                    },
                });

                // Notify founder
                await NotificationService.notifyABTestCompleted(
                    test.campaign.founderId,
                    test.name,
                    winnerVariant.name
                );

                console.log(`[A/B Test Calc] Completed test ${test.id}. Winner: ${winnerVariant.id}`);
            }
        }

        console.log('[A/B Test Calc] Job completed');
    } catch (error) {
        console.error('[A/B Test Calc] Fatal error:', error);
    }
}
