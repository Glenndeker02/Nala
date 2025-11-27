import { NextRequest, NextResponse } from "next/server";
import { VariantService } from "@/lib/services/variantService";
import { withAuth } from "@/lib/api-middleware";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
        const variants = await VariantService.getVariants(params.id);
        return NextResponse.json(variants);
    } catch (error) {
        console.error("Error fetching variants:", error);
        return NextResponse.json({ error: "Failed to fetch variants" }, { status: 500 });
    }
});

export const POST = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
        const body = await req.json();
        const { creatorId, label } = body;

        if (!creatorId || !label) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const variant = await VariantService.createVariant(params.id, creatorId, label);
        return NextResponse.json(variant);
    } catch (error) {
        console.error("Error creating variant:", error);
        return NextResponse.json({ error: "Failed to create variant" }, { status: 500 });
    }
});
