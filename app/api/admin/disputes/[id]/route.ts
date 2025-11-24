import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";

/**
 * GET /api/admin/disputes/[id]
 * Get detailed dispute info including messages and evidence
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return requireRole('ADMIN', async (req: NextRequest, user: JWTPayload) => {
        try {
            const disputeId = params.id;

            const dispute = await db.dispute.findUnique({
                where: { id: disputeId },
                include: {
                    initiator: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: true,
                        },
                    },
                    respondent: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: true,
                        },
                    },
                    campaign: {
                        select: {
                            id: true,
                            name: true,
                            totalBudget: true,
                        },
                    },
                    video: {
                        select: {
                            id: true,
                            title: true,
                            videoUrl: true,
                        },
                    },
                    messages: {
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    role: true,
                                },
                            },
                        },
                        orderBy: { createdAt: 'asc' },
                    },
                    evidence: {
                        include: {
                            uploader: {
                                select: {
                                    id: true,
                                    fullName: true,
                                },
                            },
                        },
                        orderBy: { createdAt: 'desc' },
                    },
                },
            });

            if (!dispute) {
                return ApiResponse.error('Dispute not found', 404);
            }

            // Calculate priority (same logic as list)
            let priority = 'LOW';
            const now = new Date();
            const daysOpen = Math.ceil((now.getTime() - dispute.createdAt.getTime()) / (1000 * 60 * 60 * 24));

            if (dispute.category === 'PAYMENT_ISSUE' || dispute.category === 'FRAUD') {
                priority = 'HIGH';
            } else if (daysOpen > 7 && dispute.status === 'OPEN') {
                priority = 'HIGH';
            } else if (dispute.category === 'CONTENT_QUALITY') {
                priority = 'MEDIUM';
            }

            const response = {
                id: dispute.id,
                category: dispute.category,
                status: dispute.status,
                priority,
                description: dispute.description,
                resolution: dispute.resolution,
                createdAt: dispute.createdAt,
                updatedAt: dispute.updatedAt,
                resolvedAt: dispute.resolvedAt,

                initiator: {
                    id: dispute.initiator.id,
                    name: dispute.initiator.fullName,
                    email: dispute.initiator.email,
                    role: dispute.initiator.role,
                },

                respondent: {
                    id: dispute.respondent.id,
                    name: dispute.respondent.fullName,
                    email: dispute.respondent.email,
                    role: dispute.respondent.role,
                },

                context: {
                    campaign: dispute.campaign ? {
                        id: dispute.campaign.id,
                        name: dispute.campaign.name,
                        budget: Number(dispute.campaign.totalBudget),
                    } : null,
                    video: dispute.video ? {
                        id: dispute.video.id,
                        title: dispute.video.title,
                        url: dispute.video.videoUrl,
                    } : null,
                },

                timeline: dispute.messages.map(m => ({
                    id: m.id,
                    senderId: m.senderId,
                    senderName: m.sender.fullName,
                    senderRole: m.sender.role,
                    content: m.content,
                    isInternal: m.isInternal,
                    createdAt: m.createdAt,
                })),

                evidence: dispute.evidence.map(e => ({
                    id: e.id,
                    uploaderName: e.uploader.fullName,
                    fileUrl: e.fileUrl,
                    fileType: e.fileType,
                    description: e.description,
                    createdAt: e.createdAt,
                })),
            };

            return ApiResponse.success(response);
        } catch (error) {
            console.error('Fetch dispute detail error:', error);
            return ApiResponse.error('Failed to fetch dispute details', 500);
        }
    })(request);
}
