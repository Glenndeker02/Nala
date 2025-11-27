import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VariantService } from "@/lib/services/variantService";

export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
        const trackingId = params.id;

        // Find variant by tracking ID (assuming it's the last part of the URL)
        const variant = await prisma.uGCVariant.findFirst({
            where: {
                trackingUrl: {
                    endsWith: trackingId
                }
            }
        });

        if (!variant) {
            return new NextResponse("Variant not found", { status: 404 });
        }

        // Record click
        await VariantService.recordMetric(variant.id, 'click');

        // Redirect to video URL or fallback
        const destinationUrl = variant.videoUrl || process.env.NEXT_PUBLIC_APP_URL || '/';
        return NextResponse.redirect(destinationUrl);
    } catch (error) {
        console.error("Error in tracking redirect:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
