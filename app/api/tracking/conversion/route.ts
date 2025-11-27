import { NextRequest, NextResponse } from "next/server";
import { VariantService } from "@/lib/services/variantService";

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { variantId, amount, type } = body; // type: 'view', 'click', 'conversion'

        if (!variantId || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await VariantService.recordMetric(variantId, type, amount || 0);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error recording conversion:", error);
        return NextResponse.json({ error: "Failed to record conversion" }, { status: 500 });
    }
};
