import { NextRequest, NextResponse } from "next/server";
import { VariantService } from "@/lib/services/variantService";
import { requireAuth } from "@/lib/api-middleware";

export const PATCH = requireAuth(async (req: NextRequest, user: any, { params }: { params: { id: string; variantId: string } }) => {
    try {
        const body = await req.json();
        const variant = await VariantService.updateVariant(params.variantId, body);
        return NextResponse.json(variant);
    } catch (error) {
        console.error("Error updating variant:", error);
        return NextResponse.json({ error: "Failed to update variant" }, { status: 500 });
    }
});
