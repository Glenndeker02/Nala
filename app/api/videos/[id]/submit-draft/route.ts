import { NextRequest } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

// Validation schema for draft submission
const submitDraftSchema = z.object({
    draftUrl: z.string().url('Must be a valid URL'),
});

/**
 * Submit a draft for review
 * POST /api/videos/[id]/submit-draft
 */
export const POST = requireRole(['CREATOR'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const videoId = params.id;
        const body = await request.json();

        // Validate input
        const validation = submitDraftSchema.safeParse(body);
        if (!validation.success) {
            return ApiResponse.error('Validation failed', 400, validation.error.errors);
        }

        const { draftUrl } = validation.data;

        // Get video with campaign details
        const video = await db.video.findUnique({
            where: { id: videoId },
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
                draftSubmissions: {
                    orderBy: { version: 'desc' },
                    take: 1,
                },
            },
        });

        if (!video) {
            return ApiResponse.error('Video not found', 404);
        }

        // Verify ownership
        if (video.creatorId !== user.userId) {
            return ApiResponse.error('Unauthorized', 403);
        }

        // Check if video is in correct status
        if (video.status !== 'PENDING' && video.status !== 'REVISION_REQUESTED') {
            return ApiResponse.error(`Cannot submit draft for video with status: ${video.status}`, 400);
        }

        // Calculate version number
        const latestVersion = video.draftSubmissions[0]?.version || 0;
        const newVersion = latestVersion + 1;

        // Create draft submission and update video in transaction
        const result = await db.$transaction(async (tx) => {
            // Create draft submission
            const draftSubmission = await tx.draftSubmission.create({
                data: {
                    videoId,
                    draftUrl,
                    version: newVersion,
                    status: 'PENDING_REVIEW',
                },
            });

            // Update video status and URL
            const updatedVideo = await tx.video.update({
                where: { id: videoId },
                data: {
                    status: 'DRAFT_SUBMITTED',
                    draftVideoUrl: draftUrl,
                    submittedAt: new Date(),
                },
            });

            // Send notification to founder
            await tx.notification.create({
                data: {
                    userId: video.campaign.founderId,
                    type: 'VIDEO_STATUS',
                    title: 'New Draft Submitted',
                    message: `${video.creator?.fullName} submitted a draft for "${video.campaign.name}"${video.title ? ` - ${video.title}` : ''}`,
                    link: `/founder/campaigns/${video.campaign.id}/review`,
                    metadata: {
                        videoId,
                        campaignId: video.campaign.id,
                        version: newVersion,
                    },
                },
            });

            return { draftSubmission, video: updatedVideo };
        });

        return ApiResponse.success({
            message: 'Draft submitted successfully',
            draft: {
                id: result.draftSubmission.id,
                version: result.draftSubmission.version,
                status: result.draftSubmission.status,
                submittedAt: result.draftSubmission.submittedAt,
            },
            video: {
                id: result.video.id,
                status: result.video.status,
            },
        });
    } catch (error) {
        console.error('Error submitting draft:', error);
        return ApiResponse.error('Failed to submit draft', 500);
    }
});
