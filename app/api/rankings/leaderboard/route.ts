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
        const category = searchParams.get("category");
        const limit = parseInt(searchParams.get("limit") || "10");

        // Check cache first
        const cacheKey = CacheKeys.leaderboard(category || undefined, limit);
        const cached = cacheService.get(cacheKey);

        if (cached) {
            return NextResponse.json({ success: true, data: { rankings: cached }, cached: true });
        }

        const where: any = {};
        if (category) {
            where.category = category;
        }

        // Filter for rankings calculated in the last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        where.calculatedAt = { gte: oneDayAgo };

        const rankings = await prisma.creatorRanking.findMany({
            where,
            orderBy: { score: 'desc' },
            take: limit,
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                    }
                }
            },
        });

        // Deduplicate to get latest per creator
        const uniqueRankings = Array.from(new Map(rankings.map(item => [item.creatorId, item])).values());
        uniqueRankings.sort((a, b) => Number(b.score) - Number(a.score));
        const finalRankings = uniqueRankings.slice(0, limit);

        // Cache for 15 minutes
        cacheService.set(cacheKey, finalRankings, CacheTTL.LONG);

        return NextResponse.json({ success: true, data: { rankings: finalRankings }, cached: false });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
