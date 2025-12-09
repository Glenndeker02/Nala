import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

/**
 * Get creator's applications
 * GET /api/applications/my-applications
 */
export const GET = requireRole(['CREATOR'], async (request: NextRequest, user) => {
    try {
        const applications = await db.application.findMany({
            where: {
                creatorId: user.userId,
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        status: true,
                        videosRequested: true,
                        baseFeeeBudget: true,
                        totalBudget: true,
                        startDate: true,
                        deadline: true,
                        briefData: true,
                        founder: {
                            select: {
                                fullName: true,
                                companyName: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Enrich applications with computed fields
        const enrichedApplications = applications.map(app => {
            const baseFeePerVideo = app.campaign.videosRequested > 0
                ? Number(app.campaign.baseFeeeBudget) / app.campaign.videosRequested
                : 0;

            return {
                id: app.id,
                campaignId: app.campaignId,
                status: app.status,
                message: app.message,
                portfolioLinks: app.portfolioLinks,
                createdAt: app.createdAt,
                updatedAt: app.updatedAt,
                acceptedAt: app.acceptedAt,
                acceptanceInstructions: app.acceptanceInstructions,
                acceptanceDeadline: app.acceptanceDeadline,
                campaign: {
                    id: app.campaign.id,
                    name: app.campaign.name,
                    description: app.campaign.description,
                    status: app.campaign.status,
                    videosRequested: app.campaign.videosRequested,
                    baseFeePerVideo,
                    totalBudget: Number(app.campaign.totalBudget),
                    startDate: app.campaign.startDate,
                    deadline: app.campaign.deadline,
                    founderName: app.campaign.founder.companyName || app.campaign.founder.fullName,
                    briefData: app.campaign.briefData,
                },
            };
        });

        return ApiResponse.success({
            applications: enrichedApplications,
            total: enrichedApplications.length,
            pending: enrichedApplications.filter(a => a.status === 'PENDING').length,
            accepted: enrichedApplications.filter(a => a.status === 'ACCEPTED').length,
            rejected: enrichedApplications.filter(a => a.status === 'REJECTED').length,
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        return ApiResponse.error('Failed to fetch applications', 500);
    }
});
