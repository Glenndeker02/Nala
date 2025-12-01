import db from '@/lib/db';
import { NotificationService } from '@/lib/services/notificationService';

/**
 * Goal Checker Cron Job
 * Runs periodically to check if campaign goals have been met.
 */
export async function runGoalCheck() {
    console.log('[Goal Check] Starting goal check job...');

    try {
        const activeCampaigns = await db.campaign.findMany({
            where: {
                status: 'ACTIVE',
            },
            include: {
                founderVideos: true,
                videos: true,
            },
        });

        console.log(`[Goal Check] Found ${activeCampaigns.length} active campaigns to check`);

        for (const campaign of activeCampaigns) {
            // Placeholder for goals logic until schema is fully updated/verified
            // In a real implementation, we would fetch goals from the database
            const goals: any[] = [];

            for (const goal of goals) {
                if (goal.status === 'COMPLETED') continue;

                let currentMetricValue = 0;

                // Calculate current value based on goal type
                if (goal.type === 'VIEWS') {
                    // Explicitly cast or check for existence to satisfy TS if types aren't fully synced
                    const founderVideos = (campaign as any).founderVideos || [];
                    const videos = (campaign as any).videos || [];

                    const founderViews = founderVideos.reduce((sum: number, v: any) => sum + (v.viewCount || 0), 0);
                    const creatorViews = videos.reduce((sum: number, v: any) => sum + (v.currentViewCount || 0), 0);
                    currentMetricValue = founderViews + creatorViews;
                }
                // Add other metric types as needed

                // Check if goal is met
                if (currentMetricValue >= goal.targetValue) {
                    // Update goal status
                    // await db.campaignGoal.update({ ... });

                    // Notify founder
                    await NotificationService.notifyGoalMilestone(
                        campaign.founderId,
                        goal.type,
                        goal.targetValue,
                        campaign.name
                    );

                    console.log(`[Goal Check] Goal met for campaign ${campaign.id}: ${goal.type}`);
                }
            }
        }

        console.log('[Goal Check] Job completed');
    } catch (error) {
        console.error('[Goal Check] Fatal error:', error);
    }
}
