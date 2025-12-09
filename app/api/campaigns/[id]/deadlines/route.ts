import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

type UrgencyLevel = 'URGENT' | 'NEAR' | 'NORMAL';

interface Deadline {
    deadlineId: string;
    type: 'APPLICATION_ACCEPTANCE' | 'VIDEO_REVIEW' | 'REVISION' | 'POSTING';
    dueDate: string;
    urgency: UrgencyLevel;
    relatedEntity: {
        type: 'application' | 'video' | 'revision';
        id: string;
        name: string;
    };
    actionRoute: string;
}

function calculateUrgency(dueDate: Date): UrgencyLevel {
    const now = new Date();
    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDue < 24) return 'URGENT';
    if (hoursUntilDue < 72) return 'NEAR';
    return 'NORMAL';
}

// GET - Get deadlines for a campaign with urgency calculation
export const GET = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;

        // Verify campaign ownership
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            select: {
                founderId: true,
                name: true,
                deadline: true
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

        const deadlines: Deadline[] = [];
        const now = new Date();

        // 1. Application acceptance deadlines (pending applications)
        const pendingApplications = await prisma.application.findMany({
            where: {
                campaignId,
                status: 'PENDING',
                acceptanceDeadline: {
                    gte: now
                }
            },
            include: {
                creator: {
                    select: {
                        fullName: true
                    }
                }
            }
        });

        pendingApplications.forEach(app => {
            if (app.acceptanceDeadline) {
                deadlines.push({
                    deadlineId: `app-${app.id}`,
                    type: 'APPLICATION_ACCEPTANCE',
                    dueDate: app.acceptanceDeadline.toISOString(),
                    urgency: calculateUrgency(app.acceptanceDeadline),
                    relatedEntity: {
                        type: 'application',
                        id: app.id,
                        name: `Application from ${app.creator.fullName}`
                    },
                    actionRoute: `/founder/campaigns/${campaignId}/applications`
                });
            }
        });

        // 2. Video review deadlines (submitted videos pending review)
        const pendingReviews = await prisma.video.findMany({
            where: {
                campaignId,
                status: {
                    in: ['DRAFT_SUBMITTED', 'IN_REVIEW']
                },
                deadline: {
                    gte: now
                }
            },
            include: {
                creator: {
                    select: {
                        fullName: true
                    }
                }
            }
        });

        pendingReviews.forEach(video => {
            if (video.deadline) {
                deadlines.push({
                    deadlineId: `review-${video.id}`,
                    type: 'VIDEO_REVIEW',
                    dueDate: video.deadline.toISOString(),
                    urgency: calculateUrgency(video.deadline),
                    relatedEntity: {
                        type: 'video',
                        id: video.id,
                        name: `Video from ${video.creator?.fullName || 'Unknown'}`
                    },
                    actionRoute: `/founder/campaigns/${campaignId}/review`
                });
            }
        });

        // 3. Revision deadlines (videos with revision requests)
        const revisionVideos = await prisma.video.findMany({
            where: {
                campaignId,
                status: 'REVISION_REQUESTED',
                revisionDeadline: {
                    gte: now
                }
            },
            include: {
                creator: {
                    select: {
                        fullName: true
                    }
                }
            }
        });

        revisionVideos.forEach(video => {
            if (video.revisionDeadline) {
                deadlines.push({
                    deadlineId: `revision-${video.id}`,
                    type: 'REVISION',
                    dueDate: video.revisionDeadline.toISOString(),
                    urgency: calculateUrgency(video.revisionDeadline),
                    relatedEntity: {
                        type: 'video',
                        id: video.id,
                        name: `Revision for ${video.creator?.fullName || 'Unknown'}`
                    },
                    actionRoute: `/founder/campaigns/${campaignId}/review`
                });
            }
        });

        // 4. Posting deadlines (approved videos not yet posted)
        const approvedVideos = await prisma.video.findMany({
            where: {
                campaignId,
                status: 'APPROVED',
                deadline: {
                    gte: now
                }
            },
            include: {
                creator: {
                    select: {
                        fullName: true
                    }
                }
            }
        });

        approvedVideos.forEach(video => {
            if (video.deadline) {
                deadlines.push({
                    deadlineId: `posting-${video.id}`,
                    type: 'POSTING',
                    dueDate: video.deadline.toISOString(),
                    urgency: calculateUrgency(video.deadline),
                    relatedEntity: {
                        type: 'video',
                        id: video.id,
                        name: `Posting deadline for ${video.creator?.fullName || 'Unknown'}`
                    },
                    actionRoute: `/founder/campaigns/${campaignId}/videos/${video.id}`
                });
            }
        });

        // Sort deadlines: URGENT first, then NEAR, then NORMAL, then by due date
        const urgencyOrder: Record<UrgencyLevel, number> = {
            'URGENT': 0,
            'NEAR': 1,
            'NORMAL': 2
        };

        deadlines.sort((a, b) => {
            // First sort by urgency
            const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
            if (urgencyDiff !== 0) return urgencyDiff;

            // Then sort by due date (earliest first)
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });

        // Return top 10 most urgent deadlines
        const topDeadlines = deadlines.slice(0, 10);

        return NextResponse.json({
            success: true,
            data: {
                deadlines: topDeadlines,
                summary: {
                    urgent: deadlines.filter(d => d.urgency === 'URGENT').length,
                    near: deadlines.filter(d => d.urgency === 'NEAR').length,
                    normal: deadlines.filter(d => d.urgency === 'NORMAL').length,
                    total: deadlines.length
                }
            }
        });

    } catch (error: any) {
        console.error('Error fetching deadlines:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
