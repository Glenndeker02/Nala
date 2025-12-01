import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { z } from 'zod';

// Schema for adopting a format
const adoptFormatSchema = z.object({
    creatorIds: z.array(z.string()).min(1, 'At least one creator is required'),
    notes: z.string().optional(),
    deadline: z.string().optional(),
});

// POST - Adopt a format template (assign to creators)
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string; templateId: string } }
) {
    try {
        const user = await requireRole(req, ['FOUNDER', 'ADMIN']);
        const { id: campaignId, templateId } = params;
        const body = await req.json();

        // Validate request body
        const validation = adoptFormatSchema.safeParse(body);
        if (!validation.success) {
            return ApiResponse.error('Validation failed', 400, validation.error.errors);
        }

        const { creatorIds, notes, deadline } = validation.data;

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

        // Verify template exists and belongs to campaign
        const template = await db.formatTemplate.findUnique({
            where: { id: templateId, campaignId },
            select: { id: true, name: true },
        });

        if (!template) {
            return ApiResponse.error('Format template not found', 404);
        }

        // Create adopted formats for each creator
        const adoptedFormats = await Promise.all(
            creatorIds.map((creatorId) =>
                db.adoptedFormat.create({
                    data: {
                        templateId,
                        creatorId,
                        campaignId,
                        status: 'ASSIGNED',
                        assignedAt: new Date(),
                        deadline: deadline ? new Date(deadline) : undefined,
                        notes,
                    },
                    include: {
                        creator: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                            },
                        },
                        template: {
                            select: {
                                id: true,
                                name: true,
                                formatData: true,
                            },
                        },
                    },
                })
            )
        );

        // Create notifications for each creator
        await Promise.all(
            creatorIds.map((creatorId) =>
                db.notification.create({
                    data: {
                        userId: creatorId,
                        type: 'SYSTEM',
                        title: 'New Format Template Assigned',
                        message: `You've been assigned a new format template: "${template.name}". Check your campaign dashboard for details.`,
                        link: `/creator/campaigns/${campaignId}`,
                        isRead: false,
                    },
                })
            )
        );

        return ApiResponse.success(adoptedFormats, 201);
    } catch (error: any) {
        console.error('Error adopting format:', error);
        return ApiResponse.error(error.message || 'Failed to adopt format', 500);
    }
}

// GET - Get adoption status for a template
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string; templateId: string } }
) {
    try {
        const user = await requireRole(req, ['FOUNDER', 'CREATOR', 'ADMIN']);
        const { id: campaignId, templateId } = params;

        // Fetch adopted formats
        const adoptedFormats = await db.adoptedFormat.findMany({
            where: {
                templateId,
                campaignId,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                video: {
                    select: {
                        id: true,
                        thumbnailUrl: true,
                        finalPostUrl: true,
                        currentViewCount: true,
                        status: true,
                    },
                },
            },
            orderBy: { assignedAt: 'desc' },
        });

        return ApiResponse.success(adoptedFormats);
    } catch (error: any) {
        console.error('Error fetching adopted formats:', error);
        return ApiResponse.error(error.message || 'Failed to fetch adopted formats', 500);
    }
}
