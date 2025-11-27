import { NextResponse } from "next/server";
import { recommendationsJob } from "@/lib/jobs/recommendationsJob";
import { verifyAccessToken } from "@/lib/auth";
import { cacheService } from "@/lib/services/cacheService";

export async function POST(req: Request) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const decoded = verifyAccessToken(token);
        if (!decoded) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        await recommendationsJob();

        // Invalidate all recommendations cache
        cacheService.deletePattern('^recommendations:');

        return NextResponse.json({ success: true, message: "Recommendations refresh triggered and cache cleared" });
    } catch (error) {
        console.error("Error triggering recommendations refresh:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
