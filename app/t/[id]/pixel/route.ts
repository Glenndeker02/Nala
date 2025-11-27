import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VariantService } from "@/lib/services/variantService";

export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
        const trackingId = params.id;

        // Find variant
        const variant = await prisma.uGCVariant.findFirst({
            where: {
                trackingUrl: {
                    endsWith: trackingId
                }
            }
        });

        if (variant) {
            // Record view
            // We don't await this to keep response fast
            VariantService.recordMetric(variant.id, 'view').catch(err => console.error("Error recording view:", err));
        }

        // Return 1x1 transparent GIF
        const gifBuffer = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

        return new NextResponse(gifBuffer, {
            headers: {
                "Content-Type": "image/gif",
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
            },
        });
    } catch (error) {
        console.error("Error in tracking pixel:", error);
        // Still return a pixel to avoid breaking the client
        const gifBuffer = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
        return new NextResponse(gifBuffer, { headers: { "Content-Type": "image/gif" } });
    }
};
