import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(['CREATOR'], async (request: NextRequest, user) => {
    try {
        // Fetch videos assigned to the creator
        const videos = await db.video.findMany({
            where: {
                creatorId: user.userId,
                status: {
                    not: 'POSTED' // Show active assignments only
                }
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true,
                        brandName: true,
                        founder: {
                            select: {
                                companyName: true,
                                fullName: true
                            }
                        },
                        baseFeePerVideo: true,
                        deadline: true,
                        startDate: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Transform data for frontend
        const assignments = videos.map(video => ({
            id: video.id,
            campaignId: video.campaign.id,
            campaignName: video.campaign.name,
            brandName: video.campaign.brandName || video.campaign.founder.companyName || video.campaign.founder.fullName,
            status: video.status,
            dueDate: video.campaign.deadline ? new Date(video.campaign.deadline).toLocaleDateString() : 'No deadline',
            deliverableType: 'Video', // Could be dynamic based on campaign type
            paymentAmount: Number(video.campaign.baseFeePerVideo),
            videoUrl: video.draftVideoUrl
        }));

        return ApiResponse.success({ assignments });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        return ApiResponse.error('Failed to fetch assignments', 500);
    }
});
