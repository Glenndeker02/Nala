import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// POST - Approve video submission
export const POST = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { submissionId: string } }) => {
    try {
        const { submissionId } = params;

        // Get video with campaign
        const video = await prisma.video.findUnique({
            where: { id: submissionId },
            include: {
                campaign: {
                    select: {
                        founderId: true,
                        baseFeePerVideo: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        fullName: true
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

        if (video.status === 'APPROVED' || video.status === 'POSTED') {
            return NextResponse.json(
                { success: false, error: 'Video already approved' },
                { status: 400 }
            );
        }

        // Update video status
        const updated = await prisma.video.update({
            where: { id: submissionId },
            data: {
                status: 'APPROVED',
                approvedAt: new Date(),
                lastReviewedAt: new Date()
            }
        });

        // Trigger base fee payment if not already paid
        if (!video.baseFeePaid && video.creatorId) {
            const baseFeeAmount = Number(video.baseFeeAmount || video.campaign.baseFeePerVideo);

            await prisma.payment.create({
                data: {
                    campaignId: video.campaignId,
                    videoId: video.id,
                    recipientId: video.creatorId,
                    senderId: video.campaign.founderId,
                    amount: baseFeeAmount,
                    type: 'BASE_FEE',
                    status: 'COMPLETED',
                    description: `Base fee for video approval - ${video.campaign.founderId}`
                }
            });

            await prisma.video.update({
                where: { id: submissionId },
                data: {
                    baseFeePaid: true,
                    baseFeeAmount: baseFeeAmount
                }
            });
        }

        // Update campaign progress
        await prisma.campaign.update({
            where: { id: video.campaignId },
            data: {
                videosCompleted: {
                    increment: 1
                }
            }
        });

        // TODO: Send notification to creator
        // await sendNotification({
        //     userId: video.creatorId,
        //     type: 'SUBMISSION_APPROVED',
        //     message: `Your video for "${video.campaign.name}" has been approved!`,
        //     actionRoute: `/creator/campaigns/${video.campaignId}`
        // });

        return NextResponse.json({
            success: true,
            message: 'Video approved successfully',
            data: {
                videoId: updated.id,
                status: updated.status,
                approvedAt: updated.approvedAt?.toISOString(),
                baseFeePaid: true
            }
        });

    } catch (error: any) {
        console.error('Error approving submission:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
