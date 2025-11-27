import { rankingService } from "@/lib/services/rankingService";

export const rankingJob = async () => {
    console.log("Running ranking calculation job...");
    try {
        await rankingService.updateAllRankings();
    } catch (error) {
        console.error("Error in ranking job:", error);
    }
};
