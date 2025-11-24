import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const POST = requireRole(
    ['FOUNDER'],
    async (
        request: NextRequest,
        user,
        { params }: { params: { id: string; applicationId: string } }
    ) => {
        try {
            const campaignId = params.id;
            const applicationId = params.applicationId;

            // Verify campaign ownership
            const campaign = await db.campaign.findUnique({
                where: { id: campaignId },
            });

            if (!campaign) {
                return ApiResponse.error('Campaign not found', 404);
            }

            if (campaign.founderId !== user.userId) {
                return ApiResponse.error('Unauthorized', 403);
            }

            // Verify application exists and is pending
            const application = await db.application.findUnique({
                where: { id: applicationId },
            });

            if (!application) {
                return ApiResponse.error('Application not found', 404);
            }

            if (application.status !== 'PENDING') {
                return ApiResponse.error('Application has already been processed', 400);
            }

            // Update application status
            await db.application.update({
                where: { id: applicationId },
                data: { status: 'REJECTED' },
            });

            // TODO: Send notification to creator
            // TODO: Send email to creator

            return ApiResponse.success({
                message: 'Application rejected',
            });
        } catch (error) {
            console.error('Error rejecting application:', error);
            return ApiResponse.error('Failed to reject application', 500);
        }
    }
);
