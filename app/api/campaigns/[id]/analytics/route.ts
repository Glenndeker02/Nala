import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';

// GET - Get unified analytics for a campaign
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

        // Fetch all data sources
        const [founderVideos, creatorVideos, abTests, formatTemplates] = await Promise.all([
            // Founder Videos Analytics
            db.founderVideo.findMany({
                where: { campaignId },
                select: {
                    id: true,
                    platform: true,
                    status: true,
                    currentViewCount: true,
                    likes: true,
                    comments: true,
                    shares: true,
                    createdAt: true,
                },
            }),

            // Creator Videos Analytics
            db.video.findMany({
                where: { campaignId },
                select: {
                    id: true,
                    status: true,
                    currentViewCount: true,
                    likes: true,
                    comments: true,
                    shares: true,
                    createdAt: true,
                    creator: {
                        select: {
                            id: true,
                            fullName: true,
                        },
                    },
                },
            }),

            // A/B Test Results
            db.aBTest.findMany({
                where: { campaignId },
                select: {
                    id: true,
                    name: true,
                    status: true,
                    winnerVariantId: true,
                    results: true,
                    variants: {
                        select: {
                            id: true,
                            variantName: true,
                            video: {
                                select: {
                                    currentViewCount: true,
                                    likes: true,
                                    comments: true,
                                    shares: true,
                                },
                            },
                        },
                    },
                },
            }),

            // Format Template Adoption
            db.formatTemplate.findMany({
                where: { campaignId },
                select: {
                    id: true,
                    name: true,
                    _count: {
                        select: {
                            adoptedFormats: true,
                        },
                    },
                    adoptedFormats: {
                        select: {
                            status: true,
                            video: {
                                select: {
                                    currentViewCount: true,
                                    likes: true,
                                },
                            },
                        },
                    },
                },
            }),
        ]);

        // Calculate aggregated metrics
        const totalFounderViews = founderVideos.reduce((sum, v) => sum + (v.currentViewCount || 0), 0);
        const totalFounderEngagement = founderVideos.reduce(
            (sum, v) => sum + (v.likes || 0) + (v.comments || 0) + (v.shares || 0),
            0
        );

        const totalCreatorViews = creatorVideos.reduce((sum, v) => sum + (v.currentViewCount || 0), 0);
        const totalCreatorEngagement = creatorVideos.reduce(
            (sum, v) => sum + (v.likes || 0) + (v.comments || 0) + (v.shares || 0),
            0
        );

        const totalViews = totalFounderViews + totalCreatorViews;
        const totalEngagement = totalFounderEngagement + totalCreatorEngagement;
        const engagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;

        // Platform breakdown
        const platformBreakdown = founderVideos.reduce((acc: any, video) => {
            const platform = video.platform || 'UNKNOWN';
            if (!acc[platform]) {
                acc[platform] = {
                    videos: 0,
                    views: 0,
                    engagement: 0,
                };
            }
            acc[platform].videos++;
            acc[platform].views += video.currentViewCount || 0;
            acc[platform].engagement += (video.likes || 0) + (video.comments || 0) + (video.shares || 0);
            return acc;
        }, {});

        // Top performing videos
        const allVideos = [
            ...founderVideos.map(v => ({
                id: v.id,
                type: 'founder' as const,
                views: v.currentViewCount || 0,
                engagement: (v.likes || 0) + (v.comments || 0) + (v.shares || 0),
            })),
            ...creatorVideos.map(v => ({
                id: v.id,
                type: 'creator' as const,
                views: v.currentViewCount || 0,
                engagement: (v.likes || 0) + (v.comments || 0) + (v.shares || 0),
                creatorName: v.creator?.fullName,
            })),
        ];

        const topVideos = allVideos
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);

        // A/B Test Summary
        const abTestSummary = {
            total: abTests.length,
            active: abTests.filter(t => t.status === 'ACTIVE').length,
            completed: abTests.filter(t => t.status === 'COMPLETED').length,
            testsWithWinner: abTests.filter(t => t.winnerVariantId).length,
        };

        // Format Template Performance
        const formatPerformance = formatTemplates.map(template => {
            const adoptedVideos = template.adoptedFormats
                .filter(af => af.video)
                .map(af => af.video);

            const totalViews = adoptedVideos.reduce((sum, v) => sum + (v!.currentViewCount || 0), 0);
            const totalLikes = adoptedVideos.reduce((sum, v) => sum + (v!.likes || 0), 0);

            return {
                templateId: template.id,
                templateName: template.name,
                adoptions: template._count.adoptedFormats,
                totalViews,
                totalLikes,
                avgViewsPerAdoption: adoptedVideos.length > 0 ? totalViews / adoptedVideos.length : 0,
            };
        });

        // Time series data (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const timeSeriesData = await db.founderVideoSnapshot.findMany({
            where: {
                founderVideo: {
                    campaignId,
                },
                createdAt: {
                    gte: thirtyDaysAgo,
                },
            },
            select: {
                viewCount: true,
                likes: true,
                comments: true,
                shares: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return ApiResponse.success({
            overview: {
                totalVideos: founderVideos.length + creatorVideos.length,
                founderVideos: founderVideos.length,
                creatorVideos: creatorVideos.length,
                totalViews,
                totalEngagement,
                engagementRate,
            },
            platformBreakdown,
            topVideos,
            abTestSummary,
            formatPerformance,
            timeSeriesData,
        });
    } catch (error: any) {
        console.error('Error fetching unified analytics:', error);
        return ApiResponse.error(error.message || 'Failed to fetch analytics', 500);
    }
}
