import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(['CREATOR'], async (request: NextRequest, user) => {
    try {
        // Fetch all videos assigned to this creator with campaign details
        const videos = await db.video.findMany({
            where: {
                creatorId: user.userId
            },
            include: {
                campaign: {
                    include: {
                        founder: {
                            select: {
                                fullName: true,
                                companyName: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Transform videos into task format matching frontend expectations
        const tasks = videos.map(video => {
            const campaign = video.campaign;
            const founder = campaign.founder;

            // Calculate performance metrics
            const views = video.views || 0;
            const performanceBonus = views > 0 ? (views / 1000) * 4 : 0; // $4 per 1k views
            const baseFee = Number(campaign.baseFeePerVideo) || 0;
            const totalEarnings = baseFee + performanceBonus;

            // Calculate days until metrics lock (7 days after posting)
            let daysUntilLock = null;
            if (video.postedAt) {
                const lockDate = new Date(video.postedAt);
                lockDate.setDate(lockDate.getDate() + 7);
                const now = new Date();
                daysUntilLock = Math.max(0, Math.ceil((lockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
            }

            return {
                id: video.id,
                campaignId: campaign.id,
                campaignName: campaign.title || campaign.name,
                founderName: founder.companyName || founder.fullName,
                status: video.status, // ASSIGNED, DRAFT_UPLOADED, REVISION_REQUESTED, APPROVED, POSTED, COMPLETED
                assignedAt: video.createdAt.toISOString(),
                deadline: video.deadline?.toISOString() || null,
                baseFee,
                draftUrl: video.draftUrl,
                postingUrl: video.postingUrl,
                revisionFeedback: video.revisionFeedback,
                revisionDeadline: video.revisionDeadline?.toISOString() || null,
                views,
                performanceBonus,
                totalEarnings,
                daysUntilLock
            };
        });

        return ApiResponse.success(tasks);
    } catch (error) {
        console.error('Error fetching creator tasks:', error);
        return ApiResponse.error('Failed to fetch tasks', 500);
    }
});
