import { NextRequest, NextResponse } from "next/server";
import { VariantService } from "@/lib/services/variantService";
import { requireAuth } from "@/lib/api-middleware";

export const GET = requireAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
    try {
        const variants = await VariantService.getVariants(params.id);
        return NextResponse.json(variants);
    } catch (error) {
        console.error("Error fetching variants:", error);
        return NextResponse.json({ error: "Failed to fetch variants" }, { status: 500 });
    }
});

export const POST = requireAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
    try {
        const body = await req.json();
        const {
            creatorId,
            label,
            budget,
            baseFee,
            performanceBudget,
            expectedViews,
            deadline,
            instructions
        } = body;

        if (!creatorId || !label) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const variant = await VariantService.createVariant(
            params.id,
            creatorId,
            label,
            {
                budget,
                baseFee,
                performanceBudget,
                expectedViews,
                deadline: deadline ? new Date(deadline) : undefined,
                instructions
            }
        );
        return NextResponse.json(variant);
    } catch (error) {
        console.error("Error creating variant:", error);
        return NextResponse.json({ error: "Failed to create variant" }, { status: 500 });
    }
});
