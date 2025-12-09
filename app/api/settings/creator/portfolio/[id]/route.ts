import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export const DELETE = requireRole(['CREATOR'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const videoId = params.id;

        // Get current portfolio
        const profile = await prisma.creatorProfile.findUnique({
            where: { userId: user.userId },
            select: { portfolioVideos: true }
        });

        const currentVideos = (profile?.portfolioVideos as any[]) || [];

        // Remove video
        const updatedVideos = currentVideos.filter((v: any) => v.id !== videoId);

        // Update profile
        await prisma.creatorProfile.update({
            where: { userId: user.userId },
            data: { portfolioVideos: updatedVideos }
        });

        return NextResponse.json({
            success: true,
            message: 'Portfolio video removed successfully'
        });

    } catch (error: any) {
        console.error('Error removing portfolio video:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
