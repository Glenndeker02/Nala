import { prisma } from "@/lib/prisma";

export class RankingService {

    /**
     * Calculate and update ranking for a creator
     */
    async calculateCreatorRank(creatorId: string) {
        // 1. Fetch creator's videos AND variants
        const videos = await prisma.video.findMany({
            where: { creatorId, status: 'POSTED' }
        });

        const variants = await prisma.uGCVariant.findMany({
            where: { creatorId, status: 'ACTIVE' },
            include: { metrics: { orderBy: { date: 'desc' }, take: 1 } }
        });

        // If no videos or variants, score is 0
        if (videos.length === 0 && variants.length === 0) {
            await prisma.creatorRanking.create({
                data: {
                    creatorId,
                    score: 0,
                    viewsScore: 0,
                    engagementScore: 0,
                    deliveryScore: 0,
                    qualityScore: 0,
                    category: 'General'
                }
            });
            return;
        }

        const totalViews = videos.reduce((sum: number, v: any) => sum + v.currentViewCount, 0);

        // 2. Calculate scores
        // Normalize views: 100k views = 100 points (capped)
        const viewsScore = Math.min(100, (totalViews / 100000) * 100);

        // Engagement: 10% = 100 points
        // In a real system, we'd calculate this from analytics snapshots
        const engagementScore = 65; // Placeholder

        // Calculate Variant Performance
        let avgConversionRate = 0;
        let avgRoi = 0;

        if (variants.length > 0) {
            const totalConversionRate = variants.reduce((sum, v) => sum + Number(v.metrics[0]?.conversionRate || 0), 0);
            const totalRoi = variants.reduce((sum, v) => sum + Number(v.metrics[0]?.roi || 0), 0);
            avgConversionRate = totalConversionRate / variants.length;
            avgRoi = totalRoi / variants.length;
        }

        // Conversion Score: 5% conversion rate = 100 points
        const conversionScore = Math.min(100, (avgConversionRate / 5) * 100);

        // ROI Score: 300% ROI = 100 points
        const roiScore = Math.min(100, (avgRoi / 300) * 100);

        // Delivery: On time rate
        const deliveryScore = 85; // Placeholder

        // Quality: Approval rate
        const qualityScore = 90; // Placeholder

        // Weighted average including Conversion and ROI
        // Views 30%, Engagement 20%, Conversion 30%, ROI 20%
        // Note: Delivery and Quality are tracked but currently less weighted in this specific formula for A/B focus
        const totalScore = (
            viewsScore * 0.3 +
            engagementScore * 0.2 +
            conversionScore * 0.3 +
            roiScore * 0.2
        );

        // 3. Save ranking
        await prisma.creatorRanking.create({
            data: {
                creatorId,
                score: totalScore,
                viewsScore,
                engagementScore,
                deliveryScore,
                qualityScore,
                category: 'General' // Should fetch from creator profile
            }
        });
    }

    /**
     * Update all rankings
     */
    async updateAllRankings() {
        console.log("Starting ranking calculation...");
        const creators = await prisma.user.findMany({
            where: { role: 'CREATOR' }
        });

        console.log(`Found ${creators.length} creators.`);

        for (const creator of creators) {
            try {
                await this.calculateCreatorRank(creator.id);
            } catch (err) {
                console.error(`Error calculating rank for creator ${creator.id}:`, err);
            }
        }
        console.log("Ranking calculation complete.");
    }
}

export const rankingService = new RankingService();
