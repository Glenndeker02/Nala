import { recommendationService } from "@/lib/services/recommendationService";

export const recommendationsJob = async () => {
    console.log("Running recommendations refresh job...");
    try {
        await recommendationService.updateAllRecommendations();
    } catch (error) {
        console.error("Error in recommendations job:", error);
    }
};
