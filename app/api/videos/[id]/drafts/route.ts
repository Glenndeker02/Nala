import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

/**
 * Get draft history for a video
 * GET /api/videos/[id]/drafts
 */
export const GET = requireRole(['FOUNDER', 'CREATOR'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const videoId = params.id;

        // Get video with drafts
        const video = await db.video.findUnique({
            where: { id: videoId },
            include: {
                campaign: {
                    select: {
                        id: true,
                        founderId: true,
                    },
                },
                draftSubmissions: {
                    orderBy: { version: 'desc' },
                },
            },
        });

        if (!video) {
            return ApiResponse.error('Video not found', 404);
        }

        // Verify access (founder or assigned creator)
        const isFounder = video.campaign.founderId === user.userId;
        const isCreator = video.creatorId === user.userId;

        if (!isFounder && !isCreator) {
            return ApiResponse.error('Unauthorized', 403);
        }

        return ApiResponse.success({
            video: {
                id: video.id,
                status: video.status,
                revisionCount: video.revisionCount,
                founderComments: video.founderComments,
                revisionDeadline: video.revisionDeadline,
            },
            drafts: video.draftSubmissions.map(draft => ({
                id: draft.id,
                version: draft.version,
                draftUrl: draft.draftUrl,
                status: draft.status,
                submittedAt: draft.submittedAt,
                reviewedAt: draft.reviewedAt,
            })),
            totalDrafts: video.draftSubmissions.length,
        });
    } catch (error) {
        console.error('Error fetching drafts:', error);
        return ApiResponse.error('Failed to fetch drafts', 500);
    }
});
