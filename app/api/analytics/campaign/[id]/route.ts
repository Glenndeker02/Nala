import { NextResponse } from "next/server";
import { analyticsService } from "@/lib/services/analyticsService";
import { verifyAccessToken } from "@/lib/auth";

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

        const data = await analyticsService.getEntityAnalytics('campaign', params.id, period, startDate, endDate);

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching campaign analytics:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
