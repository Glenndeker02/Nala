import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(['FOUNDER', 'CREATOR'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;

        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
            include: {
                founder: {
                    select: {
                        fullName: true,
                        companyName: true,
                    },
                },
                videos: {
                    include: {
                        creator: {
                            select: {
                                fullName: true,
                                email: true,
                            }
                        }
                    }
                },
                applications: {
                    include: {
                        creator: {
                            select: {
                                fullName: true,
                                email: true,
                                creatorProfile: {
                                    select: {
                                        verificationStatus: true,
                                    }
                                }
                            }
                        }
                    }
                }
            },
        });

        if (!campaign) {
            return ApiResponse.error('Campaign not found', 404);
        }

        // Access control
        if (user.role === 'FOUNDER' && campaign.founderId !== user.userId) {
            return ApiResponse.error('Unauthorized', 403);
        }

        // Creators can see campaigns, but maybe limited details if not assigned?
        // For "Brief" view (unassigned creator), we might want to hide internal details.
        // But for simplicity, we return full details for now as per spec which implies full visibility for brief.

        return ApiResponse.success({
            campaign,
        });
    } catch (error) {
        console.error('Error fetching campaign:', error);
        return ApiResponse.error('Failed to fetch campaign', 500);
    }
});
