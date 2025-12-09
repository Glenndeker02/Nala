import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export const GET = requireRole(['FOUNDER'], async (request: NextRequest, user) => {
    try {
        // Get top-performing videos from founder's campaigns as recommended content
        const topVideos = await prisma.video.findMany({
            where: {
                campaign: {
                    founderId: user.userId
                },
                status: {
                    in: ['POSTED', 'COMPLETED']
                },
                views: {
                    gt: 1000 // Only videos with significant views
                }
            },
            include: {
                campaign: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                views: 'desc'
            },
            take: 15
        });

        const content = topVideos.map(video => {
            const metrics = video.performanceMetrics as any;
            const engagement = metrics?.engagementRate || 0;

            // Calculate performance score (0-10)
            const viewScore = Math.min((video.views || 0) / 10000, 1) * 5; // Max 5 points for views
            const engagementScore = Math.min(engagement / 10, 1) * 5; // Max 5 points for engagement
            const performanceScore = Number((viewScore + engagementScore).toFixed(1));

            return {
                id: video.id,
                title: video.title || `Video ${video.videoNumber}`,
                videoUrl: video.postingUrl || video.draftUrl || '',
                thumbnailUrl: video.thumbnailUrl || '',
                platform: video.platform || 'TIKTOK',
                duration: 45, // Default duration, could be extracted from metadata
                performanceScore,
                views: video.views || 0,
                engagement,
                category: 'General', // Could be derived from campaign data
                tags: [], // Could be extracted from video metadata
                hooks: [], // Could be extracted from video content
                campaignName: video.campaign.name
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                content
            }
        });

    } catch (error: any) {
        console.error('Error fetching content library:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
