import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export const GET = requireRole(['CREATOR'], async (request: NextRequest, user) => {
    try {
        const profile = await prisma.creatorProfile.findUnique({
            where: { userId: user.userId },
            select: {
                baseFeeTiktok: true,
                baseFeeInstagram: true,
                baseFeeFacebook: true
            }
        });

        if (!profile) {
            return NextResponse.json(
                { success: false, error: 'Creator profile not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                baseFeeTiktok: Number(profile.baseFeeTiktok),
                baseFeeInstagram: Number(profile.baseFeeInstagram),
                baseFeeFacebook: Number(profile.baseFeeFacebook)
            }
        });

    } catch (error: any) {
        console.error('Error fetching creator rates:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});

export const PUT = requireRole(['CREATOR'], async (request: NextRequest, user) => {
    try {
        const body = await request.json();
        const { baseFeeTiktok, baseFeeInstagram, baseFeeFacebook } = body;

        const updateData: any = {};
        if (baseFeeTiktok !== undefined) updateData.baseFeeTiktok = baseFeeTiktok;
        if (baseFeeInstagram !== undefined) updateData.baseFeeInstagram = baseFeeInstagram;
        if (baseFeeFacebook !== undefined) updateData.baseFeeFacebook = baseFeeFacebook;

        const profile = await prisma.creatorProfile.upsert({
            where: { userId: user.userId },
            update: updateData,
            create: {
                userId: user.userId,
                ...updateData
            },
            select: {
                baseFeeTiktok: true,
                baseFeeInstagram: true,
                baseFeeFacebook: true
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                baseFeeTiktok: Number(profile.baseFeeTiktok),
                baseFeeInstagram: Number(profile.baseFeeInstagram),
                baseFeeFacebook: Number(profile.baseFeeFacebook)
            },
            message: 'Platform rates updated successfully'
        });

    } catch (error: any) {
        console.error('Error updating creator rates:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
