import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export const GET = requireRole(['CREATOR'], async (request: NextRequest, user) => {
    try {
        const profile = await prisma.creatorProfile.findUnique({
            where: { userId: user.userId },
            select: {
                portfolioVideos: true
            }
        });

        const portfolioVideos = (profile?.portfolioVideos as any[]) || [];

        return NextResponse.json({
            success: true,
            data: {
                videos: portfolioVideos
            }
        });

    } catch (error: any) {
        console.error('Error fetching portfolio:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});

export const POST = requireRole(['CREATOR'], async (request: NextRequest, user) => {
    try {
        const body = await request.json();
        const { url, thumbnail, platform, title } = body;

        if (!url || !platform) {
            return NextResponse.json(
                { success: false, error: 'URL and platform are required' },
                { status: 400 }
            );
        }

        // Get current portfolio
        const profile = await prisma.creatorProfile.findUnique({
            where: { userId: user.userId },
            select: { portfolioVideos: true }
        });

        const currentVideos = (profile?.portfolioVideos as any[]) || [];

        // Add new video
        const newVideo = {
            id: `video-${Date.now()}`,
            url,
            thumbnail,
            platform,
            title: title || 'Untitled Video',
            addedAt: new Date().toISOString()
        };

        const updatedVideos = [...currentVideos, newVideo];

        // Update profile
        await prisma.creatorProfile.upsert({
            where: { userId: user.userId },
            update: { portfolioVideos: updatedVideos },
            create: {
                userId: user.userId,
                portfolioVideos: updatedVideos
            }
        });

        return NextResponse.json({
            success: true,
            data: newVideo,
            message: 'Portfolio video added successfully'
        });

    } catch (error: any) {
        console.error('Error adding portfolio video:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
