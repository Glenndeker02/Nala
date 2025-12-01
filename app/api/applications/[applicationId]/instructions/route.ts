import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(
    ['CREATOR'],
    async (
        request: NextRequest,
        user,
        { params }: { params: { applicationId: string } }
    ) => {
        try {
            const applicationId = params.applicationId;

            // Fetch application with campaign details
            const application = await db.application.findUnique({
                where: { id: applicationId },
                include: {
                    campaign: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            briefData: true,
                            deadline: true
                        }
                    }
                }
            });

            if (!application) {
                return ApiResponse.error('Application not found', 404);
            }

            // Verify the creator owns this application
            if (application.creatorId !== user.userId) {
                return ApiResponse.error('Unauthorized', 403);
            }

            // Check if application is accepted
            if (application.status !== 'ACCEPTED') {
                return ApiResponse.error('Application has not been accepted yet', 400);
            }

            return ApiResponse.success({
                instructions: application.acceptanceInstructions,
                deadline: application.acceptanceDeadline,
                acceptedAt: application.acceptedAt,
                campaign: application.campaign
            });
        } catch (error) {
            console.error('Error fetching instructions:', error);
            return ApiResponse.error('Failed to fetch instructions', 500);
        }
    }
);
