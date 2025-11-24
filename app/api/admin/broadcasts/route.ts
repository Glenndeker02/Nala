import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";
import { z } from "zod";

const broadcastSchema = z.object({
    recipientType: z.enum(['ALL_CREATORS', 'ALL_FOUNDERS', 'CUSTOM_LIST']),
    recipientIds: z.array(z.string()).optional(),
    subject: z.string().min(5),
    bodyHtml: z.string().min(10),
    scheduledFor: z.string().optional(), // ISO date string
});

/**
 * POST /api/admin/broadcasts
 * Create a new email broadcast
 */
export async function POST(request: NextRequest) {
    return requireRole('ADMIN', async (req: NextRequest, user: JWTPayload) => {
        try {
            const body = await request.json();
            const validation = broadcastSchema.safeParse(body);

            if (!validation.success) {
                return ApiResponse.error('Invalid request', 400, validation.error.errors);
            }

            const { recipientType, recipientIds, subject, bodyHtml, scheduledFor } = validation.data;

            // Create broadcast record
            const broadcast = await db.emailBroadcast.create({
                data: {
                    adminId: user.userId,
                    recipientType,
                    recipientIds: recipientIds || [],
                    subject,
                    bodyHtml,
                    scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
                    status: scheduledFor ? 'PENDING' : 'PROCESSING', // If no schedule, start processing immediately
                },
            });

            // Log action
            await db.adminAuditLog.create({
                data: {
                    adminId: user.userId,
                    actionType: 'BROADCAST_CREATE',
                    resourceType: 'BROADCAST',
                    resourceId: broadcast.id,
                    details: {
                        recipientType,
                        subject,
                    },
                    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                    userAgent: request.headers.get('user-agent') || 'unknown',
                },
            });

            // In a real system, we would trigger a background job here.
            // For this demo, if it's not scheduled, we'll simulate sending asynchronously
            if (!scheduledFor) {
                // Simulate background process (fire and forget)
                (async () => {
                    try {
                        // 1. Fetch recipients
                        let recipients = [];
                        if (recipientType === 'ALL_CREATORS') {
                            recipients = await db.user.findMany({ where: { role: 'CREATOR' }, select: { email: true } });
                        } else if (recipientType === 'ALL_FOUNDERS') {
                            recipients = await db.user.findMany({ where: { role: 'FOUNDER' }, select: { email: true } });
                        } else if (recipientType === 'CUSTOM_LIST' && recipientIds) {
                            recipients = await db.user.findMany({ where: { id: { in: recipientIds } }, select: { email: true } });
                        }

                        // 2. "Send" emails (simulate delay)
                        await new Promise(resolve => setTimeout(resolve, 2000));

                        // 3. Update status
                        await db.emailBroadcast.update({
                            where: { id: broadcast.id },
                            data: {
                                status: 'COMPLETED',
                                sentCount: recipients.length,
                                sentAt: new Date(),
                            },
                        });
                    } catch (err) {
                        console.error('Background broadcast error:', err);
                        await db.emailBroadcast.update({
                            where: { id: broadcast.id },
                            data: { status: 'FAILED' },
                        });
                    }
                })();
            }

            return ApiResponse.success({
                broadcastId: broadcast.id,
                status: broadcast.status,
            });
        } catch (error) {
            console.error('Create broadcast error:', error);
            return ApiResponse.error('Failed to create broadcast', 500);
        }
    })(request);
}
