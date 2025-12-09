import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// POST - Request revision for video submission
export const POST = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { submissionId: string } }) => {
    try {
        const { submissionId } = params;
        const body = await request.json();
        const { comments, newDeadline } = body;

        if (!comments) {
            return NextResponse.json(
                { success: false, error: 'Comments are required for revision request' },
                { status: 400 }
            );
        }

        // Get video with campaign
        const video = await prisma.video.findUnique({
            where: { id: submissionId },
            include: {
                campaign: {
                    select: {
                        founderId: true,
                        name: true
                    }
                },
                creator: {
                    select: {
                        id: true
                    }
                }
            }
        });

        if (!video) {
            return NextResponse.json(
                { success: false, error: 'Submission not found' },
                { status: 404 }
            );
        }

        if (video.campaign.founderId !== user.userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Create revision request
        const revision = await prisma.revision.create({
            data: {
                videoId: video.id,
                comments,
                deadline: newDeadline ? new Date(newDeadline) : null,
                requestedById: user.userId
            }
        });

        // Update video status and metadata
        const updated = await prisma.video.update({
            where: { id: submissionId },
            data: {
                status: 'REVISION_REQUESTED',
                revisionCount: {
                    increment: 1
                },
                revisionDeadline: newDeadline ? new Date(newDeadline) : null,
                founderComments: comments,
                lastReviewedAt: new Date()
            }
        });

        // TODO: Send notification to creator
        // await sendNotification({
        //     userId: video.creatorId,
        //     type: 'REVISION_REQUESTED',
        //     message: `Revision requested for your video in "${video.campaign.name}"`,
        //     actionRoute: `/creator/campaigns/${video.campaignId}/videos/${video.id}`
        // });

        return NextResponse.json({
            success: true,
            message: 'Revision requested successfully',
            data: {
                videoId: updated.id,
                status: updated.status,
                revisionId: revision.id,
                revisionCount: updated.revisionCount,
                deadline: updated.revisionDeadline?.toISOString() || null
            }
        });

    } catch (error: any) {
        console.error('Error requesting revision:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
