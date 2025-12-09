import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// POST - Approve a submission
export const POST = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { id: string, submissionId: string } }) => {
    try {
        const { id: campaignId, submissionId } = params;

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
            where: { id: submissionId },
            include: { creator: true }
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

        if (video.status === 'APPROVED') {
            return NextResponse.json(
                { success: false, error: 'Submission is already approved' },
                { status: 400 }
            );
        }

        // Update video status
        const updatedVideo = await prisma.video.update({
            where: { id: submissionId },
            data: {
                status: 'APPROVED',
                approvedAt: new Date(),
                // In a real scenario, you might trigger payment logic here
            }
        });

        // Create notification for creator (mock)
        // await createNotification(video.creatorId, 'Your submission has been approved!');

        return NextResponse.json({
            success: true,
            data: updatedVideo
        });

    } catch (error: any) {
        console.error('Error approving submission:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
