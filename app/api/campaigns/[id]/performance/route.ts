import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// GET - Performance analytics with full financial breakdown
export const GET = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;
        const { searchParams } = new URL(request.url);
        const platform = searchParams.get('platform') || 'all'; // tiktok, instagram, all
        const range = searchParams.get('range') || '30d'; // 7d, 30d, year

        // Verify campaign belongs to founder
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            include: {
                videos: {
                    include: {
                        creator: {
                            select: {
                                id: true,
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

        if (campaign.founderId !== user.userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Calculate date range for filtering videos (if needed for charts, but for totals we might want all)
        // For now, let's keep the platform filter but maybe apply range only to charts if we had them.
        // The current frontend design shows totals, so we should probably include all videos for the financial breakdown.

        let filteredVideos = campaign.videos;
        if (platform !== 'all') {
            filteredVideos = filteredVideos.filter(v => v.platform === platform.toUpperCase());
        }

        // --- Financial & Performance Calculations ---

        const totalBudget = Number(campaign.totalBudget);
        const baseFeePerVideo = Number(campaign.baseFeePerVideo);
        const videosRequested = campaign.videosRequested;
        const videosCompleted = campaign.videosCompleted; // Or count from videos array with status APPROVED/POSTED

        // Base Fee Calculation
        // Assuming baseFeeBudget is pre-calculated or derived
        const baseFeeBudget = Number(campaign.baseFeeBudget) || (baseFeePerVideo * videosRequested);
        const baseFeeTotal = baseFeeBudget; // Total allocated for base fees

        // Performance Budget Calculation
        const performanceBudget = Number(campaign.performanceBudget) || (totalBudget - baseFeeBudget);

        // Metrics
        const totalViews = filteredVideos.reduce((sum, v) => sum + (v.currentViewCount || 0), 0);
        const maxViews = Math.floor(performanceBudget * 1000 / 4); // Assuming $4 CPM roughly, or derived from max budget
        // Better: if we have a target view count, use it. If not, estimate based on budget.
        // Let's assume a standard CPM for calculation if not stored.
        // For now, let's use a placeholder or derived value.
        const estimatedMaxViews = maxViews || 100000; // Fallback

        const achievementPercent = estimatedMaxViews > 0 ? (totalViews / estimatedMaxViews) * 100 : 0;

        // Performance Cost (Actual Spent)
        // This should ideally be sum of (views * rate) for each video, capped at some limit per video or total
        // For simplicity, let's assume a flat CPM of $4 for now, or use data if available.
        const CPM = 4;
        const performanceCost = (totalViews / 1000) * CPM;

        // Refund Amount (Projected)
        // Unspent performance budget
        const refundAmount = Math.max(0, performanceBudget - performanceCost);

        // Video Performance Data for Table
        const videosData = filteredVideos.map(v => {
            const views = v.currentViewCount || 0;
            const likes = v.likes || 0;
            const comments = v.comments || 0;
            const shares = v.shares || 0;
            const completedViews = 0; // Need this field in DB or mock it
            const watchTimeHours = 0; // Need this field in DB or mock it

            const performanceBonus = (views / 1000) * CPM;
            const totalEarnings = (Number(campaign.baseFeePerVideo) || 0) + performanceBonus;
            const nalaRevenue = (views / 1000) * 1; // Mock: $1 CPM revenue for Tupstory

            return {
                id: v.id,
                title: v.title || `Video #${v.videoNumber}`,
                creatorName: v.creator?.fullName || 'Unknown',
                creatorRating: 5.0, // Mock
                platform: v.platform,
                postedAt: v.postedAt?.toISOString() || v.createdAt.toISOString(),
                videoUrl: v.finalPostUrl || v.draftVideoUrl || '',
                views,
                likes,
                comments,
                shares,
                completedViews,
                watchTimeHours,
                baseFee: Number(campaign.baseFeePerVideo) || 0,
                performanceBonus,
                totalEarnings,
                nalaRevenue
            };
        });

        const responseData = {
            campaignId: campaign.id,
            campaignName: campaign.name,
            status: campaign.status,
            startDate: campaign.startDate?.toISOString() || campaign.createdAt.toISOString(),
            lockDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Mock: 2 days from now
            daysRemaining: 2, // Mock
            totalBudget,
            baseFeeTotal,
            performanceBudget,
            maxViews: estimatedMaxViews,
            totalViews,
            achievementPercent,
            performanceCost,
            refundAmount,
            videosPosted: videosCompleted,
            videosTotal: videosRequested,
            lastUpdated: new Date().toISOString(),
            videos: videosData
        };

        return NextResponse.json({
            success: true,
            data: responseData
        });

    } catch (error: any) {
        console.error('Error fetching performance analytics:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
