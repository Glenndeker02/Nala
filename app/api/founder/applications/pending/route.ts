import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(['FOUNDER'], async (request: NextRequest, user) => {
    try {
        const applications = await db.application.findMany({
            where: {
                campaign: {
                    founderId: user.userId
                },
                status: 'PENDING'
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true,
                        title: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        creatorProfile: {
                            select: {
                                bio: true,
                                categories: true,
                                portfolioVideos: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Transform data for frontend
        const formattedApplications = applications.map(app => ({
            id: app.id,
            campaignId: app.campaign.id,
            campaignName: app.campaign.title || app.campaign.name,
            creatorId: app.creator.id,
            creatorName: app.creator.fullName,
            creatorEmail: app.creator.email,
            creatorBio: app.creator.creatorProfile?.bio,
            creatorCategories: app.creator.creatorProfile?.categories || [],
            portfolioLinks: app.portfolioLinks,
            message: app.message,
            appliedAt: app.createdAt,
            status: app.status
        }));

        return ApiResponse.success(formattedApplications);
    } catch (error) {
        console.error('Error fetching pending applications:', error);
        return ApiResponse.error('Failed to fetch pending applications', 500);
    }
});
