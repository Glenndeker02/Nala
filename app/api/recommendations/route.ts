import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";
import { cacheService, CacheKeys, CacheTTL } from "@/lib/services/cacheService";

export async function GET(req: Request) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const decoded = verifyAccessToken(token);
        if (!decoded) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type") as 'CAMPAIGN' | 'FORMAT' | 'CREATOR' | null;
        const limit = parseInt(searchParams.get("limit") || "10");

        // Check cache first
        const cacheKey = CacheKeys.userRecommendations(decoded.userId, type || undefined);
        const cached = cacheService.get(cacheKey);

        if (cached) {
            return NextResponse.json({ success: true, data: { recommendations: cached }, cached: true });
        }

        const where: any = {
            userId: decoded.userId,
            expiresAt: { gte: new Date() }
        };

        if (type) {
            where.type = type;
        }

        const recommendations = await prisma.recommendation.findMany({
            where,
            orderBy: { score: 'desc' },
            take: limit
        });

        // Enrich with target data
        const enriched = await Promise.all(recommendations.map(async (rec) => {
            let targetData = null;

            if (rec.type === 'CAMPAIGN') {
                targetData = await prisma.campaign.findUnique({
                    where: { id: rec.targetId },
                    select: {
                        id: true,
                        title: true,
                        industry: true,
                        totalBudget: true,
                        status: true
                    }
                });
            }

            return {
                ...rec,
                target: targetData
            };
        }));

        // Cache for 5 minutes
        cacheService.set(cacheKey, enriched, CacheTTL.MEDIUM);

        return NextResponse.json({ success: true, data: { recommendations: enriched }, cached: false });
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
