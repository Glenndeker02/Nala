import { NextResponse } from "next/server";
import { isAIConfigured } from "@/lib/ai/gemini";

export async function GET() {
    const configured = isAIConfigured();

    return NextResponse.json({
        configured,
        provider: "Google Gemini",
        features: configured
            ? ["campaign-brief", "content-suggestions", "performance-analysis"]
            : ["mock-data-fallback"],
        message: configured
            ? "AI is configured and ready to use"
            : "AI is not configured. Using mock data fallback. Add GEMINI_API_KEY to .env.local to enable AI features."
    });
}
