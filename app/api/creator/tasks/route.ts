import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(['CREATOR'], async (request: NextRequest, user) => {
    try {
        // 1. Fetch all accepted applications (Active Campaigns)
        const applications = await db.application.findMany({
            where: {
                creatorId: user.userId,
                status: 'ACCEPTED',
            },
            include: {
                campaign: {
                    include: {
                        founder: {
                            select: {
                                fullName: true,
                                companyName: true,
                            }
                        },
                        videos: {
                            where: {
                                creatorId: user.userId
                            }
                        }
                    }
                }
            }
        });

        // 2. Process data into flat list of tasks
        const tasks = [];

        for (const app of applications) {
            const campaign = app.campaign;
            const videos = campaign.videos;

            // Calculate earnings
            const baseFee = Number(campaign.baseFeePerVideo || 0);
            const performanceRate = Number(campaign.performanceRate || 0);

            // Create a task entry for each video
            for (const video of videos) {
                const isPosted = video.status === 'POSTED' || video.status === 'COMPLETED';
                const views = video.currentViewCount || 0;
                const performanceBonus = isPosted ? (views / 1000) * performanceRate : 0;

                tasks.push({
                    id: video.id,
                    campaignId: campaign.id,
                    campaignName: campaign.name,
                    founderName: campaign.founder.companyName || campaign.founder.fullName,
                    status: video.status,
                    assignedAt: video.createdAt,
                    deadline: video.revisionDeadline || video.deadline || campaign.deadline,
                    baseFee: Number(video.baseFeeAmount || baseFee),
                    draftUrl: video.draftVideoUrl,
                    postingUrl: video.finalPostUrl,
                    revisionFeedback: video.founderComments,
                    revisionDeadline: video.revisionDeadline,
                    views: views,
                    performanceBonus: performanceBonus,
                    totalEarnings: Number(video.baseFeeAmount || baseFee) + performanceBonus,
                    daysUntilLock: video.lockedAt ? Math.ceil((new Date(video.lockedAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
                });
            }
        }

        // 3. Return flat list
        // 3. Group and sort tasks
        const groupedTasks = {
            actionRequired: [] as any[],
            active: [] as any[],
            inReview: [] as any[],
            completed: [] as any[]
        };

        const now = new Date();
        const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

        for (const task of tasks) {
            // Action Required Logic:
            // 1. Status is ASSIGNED (needs draft), REVISION_REQUESTED (needs fix), or APPROVED (needs post)
            // 2. OR Deadline is within 48 hours and not completed/posted
            const isUrgent = new Date(task.deadline) <= twoDaysFromNow;
            const needsAction = ['ASSIGNED', 'REVISION_REQUESTED', 'APPROVED'].includes(task.status);

            if ((needsAction || isUrgent) && !['POSTED', 'COMPLETED'].includes(task.status)) {
                groupedTasks.actionRequired.push(task);
            } else if (['DRAFT_UPLOADED'].includes(task.status)) {
                groupedTasks.inReview.push(task);
            } else if (['POSTED', 'COMPLETED'].includes(task.status)) {
                groupedTasks.completed.push(task);
            } else {
                groupedTasks.active.push(task);
            }
        }

        // Sort lists
        // Action Required: Earliest deadline first
        groupedTasks.actionRequired.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

        // Active: Earliest deadline first
        groupedTasks.active.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

        // In Review: Oldest submission first (FIFO)
        groupedTasks.inReview.sort((a, b) => new Date(a.assignedAt).getTime() - new Date(b.assignedAt).getTime());

        // Completed: Most recent first
        groupedTasks.completed.sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());

        // Calculate stats
        const stats = {
            active: groupedTasks.active.length + groupedTasks.actionRequired.length + groupedTasks.inReview.length,
            actionRequired: groupedTasks.actionRequired.length,
            inReview: groupedTasks.inReview.length,
            completed: groupedTasks.completed.length
        };

        return ApiResponse.success({
            stats,
            tasks: groupedTasks
        });

    } catch (error) {
        console.error('Error fetching creator tasks:', error);
        return ApiResponse.error('Failed to fetch tasks', 500);
    }
});
