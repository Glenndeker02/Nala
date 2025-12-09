import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// POST - Reject a submission (Request Revision)
export const POST = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { id: string, submissionId: string } }) => {
    try {
        const { id: campaignId, submissionId } = params;
        const body = await request.json();
        const { comments, revisionDeadline } = body;

        if (!comments) {
            return NextResponse.json(
                { success: false, error: 'Revision comments are required' },
                { status: 400 }
            );
        }

        // Verify campaign ownership
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            select: { founderId: true }
        });

        if (!campaign) {
            return NextResponse.json(
                { success: false, error: 'Campaign not found' },
                { status: 404 }
            );
        }

        if (campaign.founderId !== user.userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Verify submission exists and belongs to campaign
        const video = await prisma.video.findUnique({
            where: { id: submissionId }
        });

        if (!video) {
            return NextResponse.json(
                { success: false, error: 'Submission not found' },
                { status: 404 }
            );
        }

        if (video.campaignId !== campaignId) {
            return NextResponse.json(
                { success: false, error: 'Submission does not belong to this campaign' },
                { status: 400 }
            );
        }

        // Update video status and add feedback
        const updatedVideo = await prisma.video.update({
            where: { id: submissionId },
            data: {
                status: 'REVISION_REQUESTED',
                founderComments: comments,
                revisionCount: { increment: 1 },
                deadline: revisionDeadline ? new Date(revisionDeadline) : undefined
            }
        });

        return NextResponse.json({
            success: true,
            data: updatedVideo
        });

    } catch (error: any) {
        console.error('Error rejecting submission:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
