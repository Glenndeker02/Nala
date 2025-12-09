import { NextRequest } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

// Validation schema for accepting an application
const acceptSchema = z.object({
    overallInstructions: z.string().min(10, 'Overall instructions must be at least 10 characters'),
    videoInstructions: z.array(z.object({
        videoNumber: z.number().int().min(1),
        title: z.string().optional(),
        specificInstructions: z.string().optional(),
        deadline: z.string().optional(), // ISO date string
        requirements: z.array(z.string()).optional(),
    })).optional(),
    acceptanceDeadline: z.string().optional(), // ISO date string for overall deadline
});

/**
 * Accept an application and assign creator to campaign
 * POST /api/applications/[id]/accept
 */
export const POST = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const applicationId = params.id;
        const body = await request.json();

        // Validate input
        const validation = acceptSchema.safeParse(body);
        if (!validation.success) {
            return ApiResponse.error('Validation failed', 400, validation.error.errors);
        }

        const { overallInstructions, videoInstructions, acceptanceDeadline } = validation.data;

        // Fetch application with campaign details
        const application = await db.application.findUnique({
            where: { id: applicationId },
            include: {
                campaign: {
                    select: {
                        id: true,
                        founderId: true,
                        name: true,
                        videosRequested: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        if (!application) {
            return ApiResponse.error('Application not found', 404);
        }

        // Verify ownership
        if (application.campaign.founderId !== user.userId) {
            return ApiResponse.error('Unauthorized', 403);
        }

        // Check if application is pending
        if (application.status !== 'PENDING') {
            return ApiResponse.error(`Application is already ${application.status.toLowerCase()}`, 400);
        }

        // Use transaction to ensure atomicity
        const result = await db.$transaction(async (tx) => {
            // Update application status
            const updatedApplication = await tx.application.update({
                where: { id: applicationId },
                data: {
                    status: 'ACCEPTED',
                    acceptedAt: new Date(),
                    assignedAt: new Date(),
                    acceptanceInstructions: overallInstructions,
                    acceptanceDeadline: acceptanceDeadline ? new Date(acceptanceDeadline) : null,
                    videoInstructions: videoInstructions || [],
                },
            });

            // Create Video records for each video requested
            const videoRecords = [];
            for (let i = 1; i <= application.campaign.videosRequested; i++) {
                const videoInstruction = videoInstructions?.find(vi => vi.videoNumber === i);

                const video = await tx.video.create({
                    data: {
                        campaignId: application.campaignId,
                        creatorId: application.creatorId,
                        videoNumber: i,
                        status: 'PENDING',
                        title: videoInstruction?.title || `Video ${i}`,
                        deadline: videoInstruction?.deadline ? new Date(videoInstruction.deadline) : null,
                    },
                });

                videoRecords.push(video);
            }

            // Increment accepted creators count
            await tx.campaign.update({
                where: { id: application.campaignId },
                data: {
                    acceptedCreatorsCount: {
                        increment: 1,
                    },
                },
            });

            // Send notification to creator
            await tx.notification.create({
                data: {
                    userId: application.creatorId,
                    type: 'APPLICATION_UPDATE',
                    title: 'Application Accepted! 🎉',
                    message: `Congratulations! Your application for "${application.campaign.name}" has been accepted. Check your tasks to get started.`,
                    link: `/creator/tasks`,
                    metadata: {
                        campaignId: application.campaignId,
                        applicationId: application.id,
                        videosAssigned: videoRecords.length,
                    },
                },
            });

            // Auto-generate creator codes if campaign has codes enabled
            const campaignDetails = await tx.campaign.findUnique({
                where: { id: application.campaignId },
                select: {
                    enableCreatorCodes: true,
                    autoGenerateCodes: true,
                }
            });

            const creatorCodes: any[] = [];
            if (campaignDetails?.enableCreatorCodes && campaignDetails?.autoGenerateCodes) {
                // Generate code for primary platform (TikTok by default)
                const platforms = ['TIKTOK', 'INSTAGRAM'];

                for (const platform of platforms) {
                    // Generate unique code
                    const initials = application.creator.fullName
                        .split(' ')
                        .map((n: string) => n.charAt(0).toUpperCase())
                        .join('')
                        .substring(0, 4);
                    const platformCode = platform.substring(0, 2).toUpperCase();
                    const year = new Date().getFullYear().toString().substring(2);
                    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                    const code = `${initials}${platformCode}${year}${random}`;

                    // Check uniqueness and create
                    const existingCode = await tx.creatorCode.findUnique({
                        where: { code }
                    });

                    if (!existingCode) {
                        const newCode = await tx.creatorCode.create({
                            data: {
                                campaignId: application.campaignId,
                                creatorId: application.creatorId,
                                platform: platform as any,
                                code,
                                createdBy: user.userId,
                                active: true,
                            }
                        });
                        creatorCodes.push(newCode);
                    }
                }
            }

            return {
                application: updatedApplication,
                videos: videoRecords,
                creatorCodes,
            };
        });

        return ApiResponse.success({
            message: 'Application accepted successfully',
            application: {
                id: result.application.id,
                status: result.application.status,
                acceptedAt: result.application.acceptedAt,
                assignedAt: result.application.assignedAt,
            },
            videosCreated: result.videos.length,
            videoIds: result.videos.map(v => v.id),
            creatorCodesGenerated: result.creatorCodes.length,
            creatorCodes: result.creatorCodes.map(c => ({ code: c.code, platform: c.platform })),
        });
    } catch (error) {
        console.error('Error accepting application:', error);
        return ApiResponse.error('Failed to accept application', 500);
    }
});
