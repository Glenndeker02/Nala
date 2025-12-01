import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';

// GET - Get competitive benchmarks for a campaign
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireRole(req, ['FOUNDER', 'ADMIN']);
        const campaignId = params.id;

        // Verify campaign ownership
        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
            select: { founderId: true },
        });

        if (!campaign) {
            return ApiResponse.error('Campaign not found', 404);
        }

        if (campaign.founderId !== user.id && user.role !== 'ADMIN') {
            return ApiResponse.error('Unauthorized', 403);
        }

        // Fetch competitor videos and campaign videos
        const [competitorVideos, campaignVideos] = await Promise.all([
            db.competitorVideo.findMany({
                where: { campaignId },
                select: {
                    id: true,
                    competitorName: true,
                    platform: true,
                    viewCount: true,
                    likes: true,
                    comments: true,
                    shares: true,
                    createdAt: true,
                },
            }),
            db.video.findMany({
                where: { campaignId },
                select: {
                    currentViewCount: true,
                    likes: true,
                    comments: true,
                    shares: true,
                },
            }),
        ]);

        // Calculate campaign averages
        const campaignStats = {
            avgViews: campaignVideos.length > 0
                ? campaignVideos.reduce((sum, v) => sum + (v.currentViewCount || 0), 0) / campaignVideos.length
                : 0,
            avgLikes: campaignVideos.length > 0
                ? campaignVideos.reduce((sum, v) => sum + (v.likes || 0), 0) / campaignVideos.length
                : 0,
            avgComments: campaignVideos.length > 0
                ? campaignVideos.reduce((sum, v) => sum + (v.comments || 0), 0) / campaignVideos.length
                : 0,
            avgShares: campaignVideos.length > 0
                ? campaignVideos.reduce((sum, v) => sum + (v.shares || 0), 0) / campaignVideos.length
                : 0,
        };

        // Calculate competitor averages
        const competitorStats = {
            avgViews: competitorVideos.length > 0
                ? competitorVideos.reduce((sum, v) => sum + (v.viewCount || 0), 0) / competitorVideos.length
                : 0,
            avgLikes: competitorVideos.length > 0
                ? competitorVideos.reduce((sum, v) => sum + (v.likes || 0), 0) / competitorVideos.length
                : 0,
            avgComments: competitorVideos.length > 0
                ? competitorVideos.reduce((sum, v) => sum + (v.comments || 0), 0) / competitorVideos.length
                : 0,
            avgShares: competitorVideos.length > 0
                ? competitorVideos.reduce((sum, v) => sum + (v.shares || 0), 0) / competitorVideos.length
                : 0,
        };

        // Calculate performance comparison
        const comparison = {
            viewsRatio: competitorStats.avgViews > 0 ? campaignStats.avgViews / competitorStats.avgViews : 0,
            likesRatio: competitorStats.avgLikes > 0 ? campaignStats.avgLikes / competitorStats.avgLikes : 0,
            commentsRatio: competitorStats.avgComments > 0 ? campaignStats.avgComments / competitorStats.avgComments : 0,
            sharesRatio: competitorStats.avgShares > 0 ? campaignStats.avgShares / competitorStats.avgShares : 0,
        };

        // Group by competitor
        const competitorBreakdown = competitorVideos.reduce((acc: any, video) => {
            const name = video.competitorName;
            if (!acc[name]) {
                acc[name] = {
                    name,
                    videos: 0,
                    totalViews: 0,
                    totalLikes: 0,
                    totalComments: 0,
                    totalShares: 0,
                };
            }
            acc[name].videos++;
            acc[name].totalViews += video.viewCount || 0;
            acc[name].totalLikes += video.likes || 0;
            acc[name].totalComments += video.comments || 0;
            acc[name].totalShares += video.shares || 0;
            return acc;
        }, {});

        const topCompetitors = Object.values(competitorBreakdown)
            .sort((a: any, b: any) => b.totalViews - a.totalViews)
            .slice(0, 5);

        return ApiResponse.success({
            campaignStats,
            competitorStats,
            comparison,
            topCompetitors,
            competitorVideos: competitorVideos.slice(0, 10), // Top 10 competitor videos
        });
    } catch (error: any) {
        console.error('Error fetching competitive benchmarks:', error);
        return ApiResponse.error(error.message || 'Failed to fetch benchmarks', 500);
    }
}
