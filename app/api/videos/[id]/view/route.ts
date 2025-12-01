import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/utils/ApiResponse";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const videoId = params.id;
        const { count = 1, source = 'manual' } = await req.json().catch(() => ({}));

        // 1. Update Video view count
        const video = await prisma.video.update({
            where: { id: videoId },
            data: {
                currentViewCount: {
                    increment: count
                },
                lastViewUpdate: new Date()
            },
            include: {
                campaign: true,
                creator: true
            }
        });

        // 2. Create ViewSnapshot for history
        await prisma.viewSnapshot.create({
            data: {
                videoId,
                viewCount: video.currentViewCount,
                dataSource: source
            }
        });

        // 3. Check for Performance Bonus Triggers (Simplified logic)
        // In a real system, this would check against campaign.performanceBudget and tiers
        // For now, we just log that a trigger point was reached
        if (video.campaign.performanceBudget && video.currentViewCount % 1000 === 0) {
            console.log(`[Performance Trigger] Video ${videoId} reached ${video.currentViewCount} views. Checking bonus eligibility...`);
            // Future: Create Payment record for bonus
        }

        return ApiResponse.success({
            views: video.currentViewCount,
            updatedAt: video.lastViewUpdate
        });

    } catch (error) {
        console.error("Error updating view count:", error);
        return ApiResponse.error("Failed to update view count", 500);
    }
}
