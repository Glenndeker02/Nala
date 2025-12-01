import db from '@/lib/db';

export enum NotificationType {
    FORMAT_ASSIGNED = 'FORMAT_ASSIGNED',
    AB_TEST_COMPLETED = 'AB_TEST_COMPLETED',
    GOAL_MILESTONE = 'GOAL_MILESTONE',
    FOUNDER_VIDEO_POSTED = 'FOUNDER_VIDEO_POSTED',
    PERFORMANCE_ALERT = 'PERFORMANCE_ALERT',
    APPLICATION_RECEIVED = 'APPLICATION_RECEIVED',
    APPLICATION_ACCEPTED = 'APPLICATION_ACCEPTED',
    APPLICATION_REJECTED = 'APPLICATION_REJECTED',
    DRAFT_SUBMITTED = 'DRAFT_SUBMITTED',
}

export class NotificationService {
    /**
     * Create a notification for a user
     */
    static async createNotification(
        userId: string,
        type: NotificationType | string,
        title: string,
        message: string,
        metadata?: any
    ) {
        try {
            return await db.notification.create({
                data: {
                    userId,
                    type: type as string,
                    title,
                    message,
                    metadata: metadata || {},
                    read: false,
                },
            });
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    /**
     * Notify creator when a format is assigned to them
     */
    static async notifyFormatAssigned(creatorId: string, formatName: string, campaignName: string) {
        return this.createNotification(
            creatorId,
            NotificationType.FORMAT_ASSIGNED,
            'New Format Assigned',
            `You have been assigned the "${formatName}" format for campaign "${campaignName}".`,
            { formatName, campaignName }
        );
    }

    /**
     * Notify founder when an A/B test is completed
     */
    static async notifyABTestCompleted(founderId: string, testName: string, winnerVariant: string) {
        return this.createNotification(
            founderId,
            NotificationType.AB_TEST_COMPLETED,
            'A/B Test Completed',
            `Your A/B test "${testName}" has completed. The winning variant is "${winnerVariant}".`,
            { testName, winnerVariant }
        );
    }

    /**
     * Notify founder when a campaign goal milestone is reached
     */
    static async notifyGoalMilestone(founderId: string, goalType: string, value: number, campaignName: string) {
        return this.createNotification(
            founderId,
            NotificationType.GOAL_MILESTONE,
            'Goal Milestone Reached! 🎉',
            `Congratulations! Your campaign "${campaignName}" has reached ${value} ${goalType.toLowerCase()}.`,
            { goalType, value, campaignName }
        );
    }

    /**
     * Notify founder when a founder video is posted
     */
    static async notifyFounderVideoPosted(founderId: string, videoTitle: string) {
        return this.createNotification(
            founderId,
            NotificationType.FOUNDER_VIDEO_POSTED,
            'Video Posted',
            `Your video "${videoTitle}" has been successfully posted.`,
            { videoTitle }
        );
    }

    /**
     * Notify founder of a performance alert (e.g., high engagement, low views)
     */
    static async notifyPerformanceAlert(founderId: string, metric: string, value: number, threshold: string) {
        return this.createNotification(
            founderId,
            NotificationType.PERFORMANCE_ALERT,
            'Performance Alert',
            `Your campaign metric ${metric} is ${threshold} with a value of ${value}.`,
            { metric, value, threshold }
        );
    }
}
