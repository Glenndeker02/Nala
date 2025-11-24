import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";

/**
 * GET /api/admin/campaigns/[id]
 * Get detailed campaign info for admin
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return requireRole('ADMIN', async (req: NextRequest, user: JWTPayload) => {
        try {
            const campaignId = params.id;

            // Fetch campaign with all related data
            const campaign = await db.campaign.findUnique({
                where: { id: campaignId },
                include: {
                    founder: {
                        select: {
                            id: true,
                            fullName: true,
                            companyName: true,
                            email: true,
                            founderTier: true,
                        },
                    },
                    videos: {
                        include: {
                            creator: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    email: true,
                                },
                            },
                        },
                        orderBy: { createdAt: 'desc' },
                    },
                    applications: {
                        include: {
                            creator: {
                                select: {
                                    id: true,
                                    fullName: true,
                                },
                            },
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 20, // Limit recent applications
                    },
                    disputes: {
                        select: {
                            id: true,
                            status: true,
                            category: true,
                            createdAt: true,
                        },
                    },
                    _count: {
                        select: {
                            applications: true,
                            videos: true,
                            disputes: true,
                        },
                    },
                },
            });

            if (!campaign) {
                return ApiResponse.error('Campaign not found', 404);
            }

            // Calculate stats
            const approvedVideos = campaign.videos.filter(v => v.status === 'APPROVED').length;
            const postedVideos = campaign.videos.filter(v => v.status === 'POSTED').length;
            const revisionRequestedVideos = campaign.videos.filter(v => v.status === 'REVISION_REQUESTED').length;

            // Activity log (simulated from related data)
            const activityLog = [
                {
                    timestamp: campaign.createdAt,
                    action: 'Campaign Created',
                    details: `Budget: $${campaign.totalBudget}`,
                },
                ...campaign.videos.slice(0, 5).map(v => ({
                    timestamp: v.createdAt,
                    action: 'Video Submitted',
                    details: `By ${v.creator?.fullName || 'Unknown'}`,
                })),
                ...campaign.applications.slice(0, 5).map(a => ({
                    timestamp: a.createdAt,
                    action: 'Application Received',
                    details: `From ${a.creator?.fullName || 'Unknown'}`,
                })),
            ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);

            const response = {
                id: campaign.id,
                name: campaign.name,
                brandName: campaign.brandName,
                description: campaign.description,
                status: campaign.status,
                platform: campaign.platform,
                budget: Number(campaign.totalBudget),
                deadline: campaign.deadline,
                createdAt: campaign.createdAt,
                updatedAt: campaign.updatedAt,

                founder: {
                    id: campaign.founder.id,
                    name: campaign.founder.fullName,
                    company: campaign.founder.companyName,
                    email: campaign.founder.email,
                    tier: campaign.founder.founderTier || 'SILVER',
                },

                stats: {
                    totalApplications: campaign._count.applications,
                    totalVideos: campaign._count.videos,
                    approvedVideos,
                    postedVideos,
                    revisionRequestedVideos,
                    disputes: campaign._count.disputes,
                },

                videos: campaign.videos.map(v => ({
                    id: v.id,
                    status: v.status,
                    draftVideoUrl: v.draftVideoUrl,
                    finalPostUrl: v.finalPostUrl,
                    platform: v.platform,
                    creatorName: v.creator?.fullName || 'Unknown',
                    submittedAt: v.submittedAt,
                    currentViewCount: v.currentViewCount,
                })),

                recentApplications: campaign.applications.map(a => ({
                    id: a.id,
                    creatorName: a.creator.fullName,
                    status: a.status,
                    appliedAt: a.createdAt,
                })),

                activeDisputes: campaign.disputes.filter(d => d.status === 'PENDING' || d.status === 'UNDER_REVIEW'),

                activityLog,
            };

            return ApiResponse.success(response);
        } catch (error) {
            console.error('Fetch campaign detail error:', error);
            return ApiResponse.error('Failed to fetch campaign details', 500);
        }
    })(request);
}
