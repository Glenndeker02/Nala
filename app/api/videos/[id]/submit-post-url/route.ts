import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireRole(['CREATOR']);
        const { postUrl } = await request.json();

        if (!postUrl) {
            return NextResponse.json(
                { error: 'Post URL is required' },
                { status: 400 }
            );
        }

        // Basic URL validation
        const isTikTok = postUrl.includes('tiktok.com');
        const isInstagram = postUrl.includes('instagram.com');

        if (!isTikTok && !isInstagram) {
            return NextResponse.json(
                { error: 'Only TikTok and Instagram URLs are supported' },
                { status: 400 }
            );
        }

        // Verify video belongs to creator
        const video = await prisma.video.findUnique({
            where: { id: params.id },
            include: { campaign: true }
        });

        if (!video) {
            return NextResponse.json(
                { error: 'Video not found' },
                { status: 404 }
            );
        }

        if (video.creatorId !== user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        if (video.status !== 'APPROVED') {
            return NextResponse.json(
                { error: 'Video must be approved before posting' },
                { status: 400 }
            );
        }

        // Update video
        const updatedVideo = await prisma.video.update({
            where: { id: params.id },
            data: {
                status: 'POSTED',
                finalPostUrl: postUrl,
                postedAt: new Date(),
                // Initialize empty metrics
                performanceMetrics: {
                    views: 0,
                    likes: 0,
                    comments: 0,
                    shares: 0,
                    engagementRate: 0
                }
            }
        });

        // Notify founder
        await prisma.notification.create({
            data: {
                userId: video.campaign.founderId,
                type: 'VIDEO_POSTED',
                title: 'Video Posted',
                message: `Creator has posted the video for ${video.campaign.name}`,
                link: `/founder/campaigns/${video.campaignId}/review`,
                metadata: { videoId: video.id, postUrl }
            }
        });

        return NextResponse.json({
            message: 'Post URL submitted successfully',
            video: updatedVideo
        });

    } catch (error: any) {
        console.error('Error submitting post URL:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
