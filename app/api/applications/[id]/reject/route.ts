import { NextRequest } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

// Validation schema for rejecting an application
const rejectSchema = z.object({
    reason: z.string().optional(),
});

/**
 * Reject an application
 * POST /api/applications/[id]/reject
 */
export const POST = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const applicationId = params.id;
        const body = await request.json().catch(() => ({}));

        // Validate input
        const validation = rejectSchema.safeParse(body);
        if (!validation.success) {
            return ApiResponse.error('Validation failed', 400, validation.error.errors);
        }

        const { reason } = validation.data;

        // Get application with campaign details
        const application = await db.application.findUnique({
            where: { id: applicationId },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true,
                        founderId: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        });

        if (!application) {
            return ApiResponse.error('Application not found', 404);
        }

        // Verify ownership
        if (application.campaign.founderId !== user.userId) {
            return ApiResponse.error('Unauthorized', 403);
        }

        // Check if application is pending
        if (application.status !== 'PENDING') {
            return ApiResponse.error(`Application is already ${application.status.toLowerCase()}`, 400);
        }

        // Update application and send notification in transaction
        const result = await db.$transaction(async (tx) => {
            // Update application status
            const updatedApplication = await tx.application.update({
                where: { id: applicationId },
                data: {
                    status: 'REJECTED',
                    // Store rejection reason in acceptanceInstructions field (repurposing)
                    acceptanceInstructions: reason || null,
                },
            });

            // Send notification to creator
            await tx.notification.create({
                data: {
                    userId: application.creatorId,
                    type: 'APPLICATION_UPDATE',
                    title: 'Application Update',
                    message: `Your application for "${application.campaign.name}" was not selected at this time.${reason ? ` Reason: ${reason}` : ''}`,
                    link: `/creator/briefs`,
                    metadata: {
                        campaignId: application.campaignId,
                        applicationId: application.id,
                        reason: reason || null,
                    },
                },
            });

            return updatedApplication;
        });

        return ApiResponse.success({
            message: 'Application rejected',
            application: {
                id: result.id,
                status: result.status,
                updatedAt: result.updatedAt,
            },
        });
    } catch (error) {
        console.error('Error rejecting application:', error);
        return ApiResponse.error('Failed to reject application', 500);
    }
});
