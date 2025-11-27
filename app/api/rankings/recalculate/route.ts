import { NextResponse } from "next/server";
import { rankingJob } from "@/lib/jobs/rankingJob";
import { verifyAccessToken } from "@/lib/auth";
import { cacheService } from "@/lib/services/cacheService";

export async function POST(req: Request) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const decoded = verifyAccessToken(token);
        if (!decoded) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        await rankingJob();

        // Invalidate all ranking cache
        cacheService.deletePattern('^rankings:');

        return NextResponse.json({ success: true, message: "Ranking recalculation triggered and cache cleared" });
    } catch (error) {
        console.error("Error triggering ranking recalculation:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
