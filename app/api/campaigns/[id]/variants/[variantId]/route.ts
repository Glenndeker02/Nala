import { NextRequest, NextResponse } from "next/server";
import { VariantService } from "@/lib/services/variantService";
import { withAuth } from "@/lib/api-middleware";

export const PATCH = withAuth(async (req: NextRequest, { params }: { params: { id: string; variantId: string } }) => {
    try {
        const body = await req.json();
        const variant = await VariantService.updateVariant(params.variantId, body);
        return NextResponse.json(variant);
    } catch (error) {
        console.error("Error updating variant:", error);
        return NextResponse.json({ error: "Failed to update variant" }, { status: 500 });
    }
});
