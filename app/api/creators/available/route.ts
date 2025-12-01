import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "@/lib/api-middleware";

const prisma = new PrismaClient();

export const GET = requireAuth(async (req: NextRequest, user: any) => {
    try {
        const creators = await prisma.user.findMany({
            where: {
                role: 'CREATOR',
                creatorProfile: {
                    verificationStatus: 'VERIFIED',
                    isOnboardingComplete: true,
                },
            },
            include: {
                creatorProfile: {
                    select: {
                        bio: true,
                        categories: true,
                        baseFeeTiktok: true,
                        baseFeeInstagram: true,
                        baseFeeFacebook: true,
                        portfolioVideos: true,
                        responseTime: true,
                    },
                },
                socialAccounts: {
                    select: {
                        platform: true,
                        followerCount: true,
                        username: true,
                    },
                },
            },
        });

        return NextResponse.json({ creators });
    } catch (error) {
        console.error("Error fetching available creators:", error);
        return NextResponse.json({ error: "Failed to fetch creators" }, { status: 500 });
    }
});
