import { NextResponse } from "next/server";
import { analyticsService } from "@/lib/services/analyticsService";
import { verifyAccessToken } from "@/lib/auth";
import { cacheService, CacheKeys, CacheTTL } from "@/lib/services/cacheService";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const decoded = verifyAccessToken(token);
        if (!decoded) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const period = (searchParams.get("period") as 'daily' | 'weekly' | 'monthly') || 'daily';

        // Default to last 30 days
        const defaultStart = new Date();
        defaultStart.setDate(defaultStart.getDate() - 30);

        const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : defaultStart;
        const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : new Date();

        // Check cache first
        const cacheKey = CacheKeys.videoAnalytics(params.id, period, startDate.toISOString(), endDate.toISOString());
        const cached = cacheService.get(cacheKey);

        if (cached) {
            return NextResponse.json({ success: true, data: cached, cached: true });
        }

        // Fetch from database
        const data = await analyticsService.getEntityAnalytics('video', params.id, period, startDate, endDate);

        // Cache for 5 minutes
        cacheService.set(cacheKey, data, CacheTTL.MEDIUM);

        return NextResponse.json({ success: true, data, cached: false });
    } catch (error) {
        console.error("Error fetching video analytics:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
