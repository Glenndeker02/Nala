import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';
import { z } from 'zod';

const viewUpdateSchema = z.object({
    videoId: z.string().uuid(),
    viewCount: z.number().int().nonnegative(),
    capturedAt: z.string().datetime().optional(),
    dataSource: z.string().default('MANUAL_UPLOAD'),
});

const batchSchema = z.object({
    updates: z.array(viewUpdateSchema).min(1),
});

export const POST = requireRole(['FOUNDER', 'ADMIN'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;
        const body = await request.json();

        // Validation
        const result = batchSchema.safeParse(body);
        if (!result.success) {
            return ApiResponse.error("Invalid input", 400, result.error.errors);
        }
        const { updates } = result.data;

        // Verify Campaign Ownership
        const campaign = await db.campaign.findUnique({
            where: { id: campaignId }
        });

        if (!campaign) {
            return ApiResponse.error("Campaign not found", 404);
        }

        if (user.role === 'FOUNDER' && campaign.founderId !== user.userId) {
            return ApiResponse.error("Unauthorized", 403);
        }

        const stats = {
            processed: 0,
            failed: 0,
            errors: [] as any[]
        };

        // Process sequentially (or transaction? Batch implies all or nothing? Or partial success?)
        // Reporting is often partial success ok. But usually easier to atomic.
        // Let's try transaction.

        await db.$transaction(async (tx) => {
            for (const update of updates) {
                // Verify video belongs to campaign
                const video = await tx.video.findUnique({
                    where: { id: update.videoId }
                });

                if (!video || video.campaignId !== campaignId) {
                    throw new Error(`Video ${update.videoId} not found in this campaign`);
                }

                // Create snapshot
                await tx.viewSnapshot.create({
                    data: {
                        videoId: update.videoId,
                        viewCount: update.viewCount,
                        dataSource: update.dataSource,
                        snapshotAt: update.capturedAt ? new Date(update.capturedAt) : new Date(),
                    }
                });

                // Update current count if higher
                // Use raw query or logic? 
                // We should blindly trust the latest update? Or only if higher?
                // Usually "current_view_count" is MAX of reported.
                if (update.viewCount > (video.currentViewCount || 0)) {
                    await tx.video.update({
                        where: { id: update.videoId },
                        data: { currentViewCount: update.viewCount }
                    });
                }

                stats.processed++;
            }
        });

        return ApiResponse.success({ message: "Views updated successfully", stats });

    } catch (error: any) {
        console.error('Error updating views:', error);
        return ApiResponse.error(error.message || 'Internal Server Error', 500);
    }
});
