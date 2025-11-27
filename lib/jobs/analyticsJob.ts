import { prisma } from "@/lib/prisma";
import { analyticsService } from "@/lib/services/analyticsService";

export const analyticsJob = async () => {
    console.log("Running analytics aggregation job...");

    try {
        // 1. Fetch all posted videos
        const videos = await prisma.video.findMany({
            where: {
                status: 'POSTED',
                finalPostUrl: { not: null }
            }
        });

        console.log(`Found ${videos.length} videos to process.`);

        // 2. Process each video
        for (const video of videos) {
            // In a real app, we might fetch fresh stats from social APIs here
            // For now, we use the stored currentViewCount

            // Calculate a mock engagement rate since we don't have it on Video model
            // In production, this would come from the API
            const mockEngagement = Number((Math.random() * 5 + 1).toFixed(2)); // 1-6%

            await analyticsService.updateVideoMetrics(
                video.id,
                video.currentViewCount,
                mockEngagement
            );
        }

        console.log("Analytics aggregation complete.");
    } catch (error) {
        console.error("Error in analytics job:", error);
    }
};
