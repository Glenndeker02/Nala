import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// GET - Get submission details
export const GET = requireRole(['FOUNDER', 'CREATOR'], async (request: NextRequest, user, { params }: { params: { submissionId: string } }) => {
    try {
        const { submissionId } = params;

        const video = await prisma.video.findUnique({
            where: { id: submissionId },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true,
                        founderId: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePictureUrl: true
                    }
                },
                revisions: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 10
                }
            }
        });

        if (!video) {
            return NextResponse.json(
                { success: false, error: 'Submission not found' },
                { status: 404 }
            );
        }

        // Check authorization
        if (user.role === 'FOUNDER' && video.campaign.founderId !== user.userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        if (user.role === 'CREATOR' && video.creatorId !== user.userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                submissionId: video.id,
                videoId: video.id,
                campaignId: video.campaignId,
                campaignName: video.campaign.name,
                assetUrl: video.draftVideoUrl,
                finalPostUrl: video.finalPostUrl,
                platform: video.platform,
                status: video.status,
                creator: video.creator,
                submittedAt: video.submittedAt?.toISOString(),
                approvedAt: video.approvedAt?.toISOString(),
                deadline: video.deadline?.toISOString(),
                revisionCount: video.revisionCount,
                founderComments: video.founderComments,
                lastReviewedAt: video.lastReviewedAt?.toISOString(),
                revisionHistory: video.revisions.map(r => ({
                    id: r.id,
                    comments: r.comments,
                    requestedAt: r.createdAt.toISOString(),
                    deadline: r.deadline?.toISOString()
                }))
            }
        });

    } catch (error: any) {
        console.error('Error fetching submission details:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
