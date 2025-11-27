import { NextResponse } from "next/server";
import { analyticsJob } from "@/lib/jobs/analyticsJob";
import { verifyAccessToken } from "@/lib/auth";
import { cacheService } from "@/lib/services/cacheService";

export async function POST(req: Request) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const decoded = verifyAccessToken(token);
        if (!decoded) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        // Run the job
        await analyticsJob();

        // Invalidate all analytics cache
        cacheService.deletePattern('^analytics:');

        return NextResponse.json({ success: true, message: "Analytics sync triggered and cache cleared" });
    } catch (error) {
        console.error("Error triggering analytics sync:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
