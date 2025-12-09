import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

/**
 * Get creator's assigned video tasks
 * GET /api/videos/my-tasks
 */
export const GET = requireRole(['CREATOR'], async (request: NextRequest, user) => {
    try {
        console.log('=== My Tasks API Called ===');
        console.log('Creator ID:', user.userId);

        // Fetch all videos assigned to this creator with full campaign and application data
        const videos = await db.video.findMany({
            where: {
                creatorId: user.userId,
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true,
                        founderId: true,
                        briefData: true,
                        description: true,
                        videosRequested: true,
                        baseFeePerVideo: true,
                        performanceRate: true,
                    },
                },
            },
            orderBy: [
                { status: 'asc' }, // Pending/revision requested first
                { deadline: 'asc' }, // Then by deadline
            ],
        });

        console.log('Videos found:', videos.length);
        if (videos.length > 0) {
            console.log('Sample video:', {
                id: videos[0].id,
                campaignId: videos[0].campaignId,
                status: videos[0].status,
                deadline: videos[0].deadline
            });
        }

        // Get accepted applications for this creator to fetch instructions
        const applications = await db.application.findMany({
            where: {
                creatorId: user.userId,
                status: 'ACCEPTED',
            },
            select: {
                campaignId: true,
                acceptanceInstructions: true,
                instructionLinks: true,
                overallInstructions: true,
                acceptanceDeadline: true,
            },
        });

        // Create a map of campaign instructions
        const instructionsMap = new Map(
            applications.map(app => [app.campaignId, app])
        );

        // Enrich videos with application instructions
        const enrichedVideos = videos.map(video => {
            const appInstructions = instructionsMap.get(video.campaignId);

            return {
                id: video.id,
                campaignId: video.campaignId,
                videoNumber: video.videoNumber,
                title: video.title,
                status: video.status,
                deadline: video.deadline,
                revisionDeadline: video.revisionDeadline,
                revisionCount: video.revisionCount,
                founderComments: video.founderComments,
                draftVideoUrl: video.draftVideoUrl,
                submittedAt: video.submittedAt,
                approvedAt: video.approvedAt,
                campaign: {
                    id: video.campaign.id,
                    name: video.campaign.name,
                    founderId: video.campaign.founderId,
                    description: video.campaign.description,
                    videosRequested: video.campaign.videosRequested,
                    baseFeePerVideo: video.campaign.baseFeePerVideo ? Number(video.campaign.baseFeePerVideo) : null,
                    performanceRate: video.campaign.performanceRate ? Number(video.campaign.performanceRate) : null,
                    briefData: video.campaign.briefData,
                    // Add application instructions
                    acceptanceInstructions: appInstructions?.acceptanceInstructions,
                    instructionLinks: appInstructions?.instructionLinks,
                    overallInstructions: appInstructions?.overallInstructions,
                },
            };
        });

        return ApiResponse.success({
            videos: enrichedVideos,
            total: enrichedVideos.length,
            pending: enrichedVideos.filter(v => v.status === 'PENDING' || v.status === 'REVISION_REQUESTED').length,
            inReview: enrichedVideos.filter(v => v.status === 'DRAFT_SUBMITTED' || v.status === 'IN_REVIEW').length,
            completed: enrichedVideos.filter(v => v.status === 'APPROVED' || v.status === 'POSTED').length,
        });
    } catch (error) {
        console.error('Error fetching my tasks:', error);
        return ApiResponse.error('Failed to fetch tasks', 500);
    }
});
