import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// GET - List video submissions for a campaign
export const GET = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;
        const { searchParams } = new URL(request.url);
        const sort = searchParams.get('sort') || 'uploadedAt'; // platform, creator, views, uploadedAt
        const status = searchParams.get('status'); // pending, approved, revision_requested
        const platform = searchParams.get('platform'); // tiktok, instagram, facebook

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

        // Build where clause
        const whereClause: any = { campaignId };

        if (status) {
            const statusMap: any = {
                'pending': ['DRAFT_SUBMITTED', 'IN_REVIEW'],
                'approved': 'APPROVED',
                'revision_requested': 'REVISION_REQUESTED'
            };
            const mappedStatus = statusMap[status.toLowerCase()];
            whereClause.status = Array.isArray(mappedStatus) ? { in: mappedStatus } : mappedStatus;
        }

        if (platform) {
            whereClause.platform = platform.toUpperCase();
        }

        // Get videos (submissions)
        const videos = await prisma.video.findMany({
            where: whereClause,
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePictureUrl: true
                    }
                }
            },
            orderBy: sort === 'creator'
                ? { creator: { fullName: 'asc' } }
                : sort === 'views'
                    ? { currentViewCount: 'desc' }
                    : sort === 'platform'
                        ? { platform: 'asc' }
                        : { submittedAt: 'desc' }
        });

        const submissions = videos.map(video => ({
            submissionId: video.id,
            videoId: video.id,
            creator: video.creator ? {
                id: video.creator.id,
                fullName: video.creator.fullName,
                profilePictureUrl: video.creator.profilePictureUrl
            } : null,
            platform: video.platform,
            status: video.status,
            assetUrl: video.draftVideoUrl,
            thumbnailUrl: null, // Could be extracted from video metadata
            uploadedAt: video.submittedAt?.toISOString() || video.createdAt.toISOString(),
            deadline: video.deadline?.toISOString() || null,
            revisionCount: video.revisionCount,
            lastReviewedAt: video.lastReviewedAt?.toISOString() || null
        }));

        return NextResponse.json({
            success: true,
            data: submissions
        });

    } catch (error: any) {
        console.error('Error fetching submissions:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
