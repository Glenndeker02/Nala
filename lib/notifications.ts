import { emitToUser, emitToCampaign } from './websocket';

// Helper function to send notifications
export async function sendNotification(params: {
    userId: string;
    type: string;
    message: string;
    actionRoute?: string;
    metadata?: any;
}) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            console.error('Failed to send notification:', await response.text());
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error sending notification:', error);
        return false;
    }
}

// Real-time event emitters for specific events
export const realtimeEvents = {
    // Budget updates
    budgetUpdated: (campaignId: string, budgetData: any) => {
        emitToCampaign(campaignId, 'budget:updated', budgetData);
    },

    // Progress updates
    progressUpdated: (campaignId: string, progressData: any) => {
        emitToCampaign(campaignId, 'progress:updated', progressData);
    },

    // Application events
    applicationSubmitted: (campaignId: string, founderId: string, applicationData: any) => {
        emitToUser(founderId, 'application:submitted', applicationData);
        emitToCampaign(campaignId, 'application:submitted', applicationData);
    },

    applicationAccepted: (creatorId: string, applicationData: any) => {
        emitToUser(creatorId, 'application:accepted', applicationData);
    },

    applicationRejected: (creatorId: string, applicationData: any) => {
        emitToUser(creatorId, 'application:rejected', applicationData);
    },

    // Submission events
    submissionUploaded: (campaignId: string, founderId: string, submissionData: any) => {
        emitToUser(founderId, 'submission:uploaded', submissionData);
        emitToCampaign(campaignId, 'submission:uploaded', submissionData);
    },

    submissionApproved: (creatorId: string, submissionData: any) => {
        emitToUser(creatorId, 'submission:approved', submissionData);
    },

    revisionRequested: (creatorId: string, revisionData: any) => {
        emitToUser(creatorId, 'revision:requested', revisionData);
    },

    // Payment events
    paymentSent: (userId: string, paymentData: any) => {
        emitToUser(userId, 'payment:sent', paymentData);
    },

    // Deadline events
    deadlineUpdated: (campaignId: string, deadlineData: any) => {
        emitToCampaign(campaignId, 'deadline:updated', deadlineData);
    },

    // Instruction events
    instructionCreated: (campaignId: string, instructionData: any) => {
        emitToCampaign(campaignId, 'instruction:created', instructionData);
    },

    instructionUpdated: (campaignId: string, instructionData: any) => {
        emitToCampaign(campaignId, 'instruction:updated', instructionData);
    }
};
