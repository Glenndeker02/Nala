import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export const GET = requireRole(['FOUNDER', 'CREATOR'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;

        // Get campaign progress
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            select: {
                id: true,
                videosRequested: true,
                videosCompleted: true,
                targetViews: true,
                videos: {
                    select: {
                        id: true,
                        status: true,
                        currentViewCount: true,
                        creator: {
                            select: {
                                fullName: true
                            }
                        }
                    }
                }
            }
        });

        if (!campaign) {
            return NextResponse.json(
                { success: false, error: 'Campaign not found' },
                { status: 404 }
            );
        }

        // Calculate progress metrics
        const videosTotal = campaign.videosRequested;
        const videosCompleted = campaign.videos.filter(v =>
            v.status === 'APPROVED' || v.status === 'POSTED' || v.status === 'LOCKED'
        ).length;

        const videosPosted = campaign.videos.filter(v =>
            v.status === 'POSTED' || v.status === 'LOCKED'
        ).length;

        const videosPostedAndTracked = campaign.videos.filter(v =>
            (v.status === 'POSTED' || v.status === 'LOCKED') && v.currentViewCount > 0
        ).length;

        // Calculate views achieved
        const viewsAchieved = campaign.videos.reduce((sum, v) => sum + v.currentViewCount, 0);
        const viewsTarget = campaign.targetViews;
        const completionPercent = viewsTarget > 0 ? (viewsAchieved / viewsTarget) * 100 : 0;

        // Build per-video details
        const perVideoDetails = campaign.videos.map(v => ({
            videoId: v.id,
            status: v.status,
            views: v.currentViewCount,
            creatorName: v.creator?.fullName || 'Unassigned'
        }));

        return NextResponse.json({
            success: true,
            data: {
                videosTotal,
                videosCompleted,
                videosPosted,
                videosPostedAndTracked,
                viewsAchieved,
                viewsTarget,
                completionPercent: Math.round(completionPercent * 10) / 10, // Round to 1 decimal
                perVideoDetails
            }
        });

    } catch (error: any) {
        console.error('Error fetching campaign progress:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
