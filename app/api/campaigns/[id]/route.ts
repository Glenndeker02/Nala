import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(['FOUNDER', 'CREATOR'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;

        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
            include: {
                founder: {
                    select: {
                        fullName: true,
                        companyName: true,
                    },
                },
                videos: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                applications: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                creatorProfile: {
                                    select: {
                                        verificationStatus: true,
                                    }
                                }
                            }
                        }
                    }
                },
                payments: {
                    include: {
                        recipient: {
                            select: {
                                fullName: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            },
        });

        if (!campaign) {
            return ApiResponse.error('Campaign not found', 404);
        }

        // Access control
        if (user.role === 'FOUNDER' && campaign.founderId !== user.userId) {
            return ApiResponse.error('Unauthorized', 403);
        }

        // Calculate aggregated metrics
        const videos = campaign.videos || [];
        const payments = campaign.payments || [];

        // Video status counts
        const videoStats = {
            total: campaign.videosRequested,
            submitted: videos.filter(v => v.status === 'DRAFT_SUBMITTED').length,
            inReview: videos.filter(v => v.status === 'IN_REVIEW').length,
            approved: videos.filter(v => v.status === 'APPROVED').length,
            posted: videos.filter(v => v.status === 'POSTED').length,
            rejected: videos.filter(v => v.status === 'REJECTED').length,
            pending: campaign.videosRequested - videos.length,
        };

        // Performance metrics
        const totalViews = videos.reduce((sum, v) => sum + (v.currentViewCount || 0), 0);
        const totalLikes = videos.reduce((sum, v) => sum + (v.likes || 0), 0);
        const totalComments = videos.reduce((sum, v) => sum + (v.comments || 0), 0);
        const totalShares = videos.reduce((sum, v) => sum + (v.shares || 0), 0);

        const performanceMetrics = {
            totalViews,
            totalLikes,
            totalComments,
            totalShares,
            avgViewsPerVideo: videos.length > 0 ? Math.round(totalViews / videos.length) : 0,
            engagementRate: totalViews > 0 ? ((totalLikes + totalComments + totalShares) / totalViews * 100).toFixed(2) : '0.00',
            targetProgress: campaign.targetViews ? ((totalViews / campaign.targetViews) * 100).toFixed(1) : '0.0',
        };

        // Financial breakdown
        const baseFeesPaid = payments
            .filter(p => p.type === 'BASE_FEE' && p.status === 'COMPLETED')
            .reduce((sum, p) => sum + Number(p.amount), 0);

        const bonusesPaid = payments
            .filter(p => p.type === 'PERFORMANCE_BONUS' && p.status === 'COMPLETED')
            .reduce((sum, p) => sum + Number(p.amount), 0);

        const totalSpent = baseFeesPaid + bonusesPaid;
        const remainingBudget = Number(campaign.totalBudget) - totalSpent;
        const refundedAmount = Number(campaign.totalRefundedToFounder || 0);

        const financialData = {
            totalBudget: Number(campaign.totalBudget),
            baseFeesPaid,
            bonusesPaid,
            totalSpent,
            remainingBudget,
            refundedAmount,
            budgetUsedPercentage: ((totalSpent / Number(campaign.totalBudget)) * 100).toFixed(1),
            platformRevenue: Number(campaign.platformRevenue || 0),
        };

        // Creator statistics
        const uniqueCreators = Array.from(new Set(videos.map(v => v.creatorId).filter(Boolean)));
        const creatorStats = uniqueCreators.map(creatorId => {
            const creatorVideos = videos.filter(v => v.creatorId === creatorId);
            const creator = creatorVideos[0]?.creator;
            const creatorPayments = payments.filter(p => p.recipientId === creatorId);

            return {
                id: creatorId,
                name: creator?.fullName || 'Unknown',
                email: creator?.email,
                videosCount: creatorVideos.length,
                totalViews: creatorVideos.reduce((sum, v) => sum + (v.currentViewCount || 0), 0),
                totalEarned: creatorPayments.reduce((sum, p) => sum + Number(p.amount), 0),
                avgViewsPerVideo: creatorVideos.length > 0
                    ? Math.round(creatorVideos.reduce((sum, v) => sum + (v.currentViewCount || 0), 0) / creatorVideos.length)
                    : 0,
            };
        });

        // Timeline calculations
        const now = new Date();
        const startDate = campaign.startDate ? new Date(campaign.startDate) : null;
        const deadline = campaign.deadline ? new Date(campaign.deadline) : null;

        let timelineData = null;
        if (startDate && deadline) {
            const totalDays = Math.ceil((deadline.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const elapsedDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const remainingDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            timelineData = {
                startDate: startDate.toISOString(),
                deadline: deadline.toISOString(),
                totalDays,
                elapsedDays: Math.max(0, elapsedDays),
                remainingDays: Math.max(0, remainingDays),
                percentComplete: totalDays > 0 ? Math.min(100, (elapsedDays / totalDays) * 100).toFixed(1) : '0.0',
                isOverdue: now > deadline,
            };
        }

        // ROI calculation (for completed campaigns)
        let roiData = null;
        if (campaign.status === 'COMPLETED') {
            const costPerView = totalViews > 0 ? (totalSpent / totalViews).toFixed(4) : '0.0000';
            const targetAchievement = campaign.targetViews
                ? ((totalViews / campaign.targetViews) * 100).toFixed(1)
                : '0.0';

            roiData = {
                totalSpent,
                totalViews,
                costPerView,
                targetAchievement,
                videosCompleted: videoStats.posted,
                completionDate: campaign.completedAt?.toISOString() || null,
            };
        }

        return ApiResponse.success({
            campaign,
            analytics: {
                videoStats,
                performanceMetrics,
                financialData,
                creatorStats,
                timelineData,
                roiData,
            }
        });
    } catch (error) {
        console.error('Error fetching campaign:', error);
        return ApiResponse.error('Failed to fetch campaign', 500);
    }
});
