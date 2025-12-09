import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // In production, this would be called by a cron job with a system key
        // For dev, allowing authenticated users to "simulate" tracking
        const user = await requireRole(['CREATOR', 'FOUNDER', 'ADMIN']);
        const { views, likes, comments, shares } = await request.json();

        const video = await prisma.video.findUnique({
            where: { id: params.id },
            include: { campaign: true }
        });

        if (!video) {
            return NextResponse.json(
                { error: 'Video not found' },
                { status: 404 }
            );
        }

        // Update metrics
        const metrics = {
            views: views || 0,
            likes: likes || 0,
            comments: comments || 0,
            shares: shares || 0,
            updatedAt: new Date().toISOString()
        };

        const updatedVideo = await prisma.video.update({
            where: { id: params.id },
            data: {
                currentViewCount: views || video.currentViewCount,
                performanceMetrics: metrics,
                lastViewUpdate: new Date()
            }
        });

        // Create snapshot for history
        await prisma.viewSnapshot.create({
            data: {
                videoId: video.id,
                viewCount: views || 0,
                dataSource: 'manual_update'
            }
        });

        return NextResponse.json({
            message: 'Performance tracked successfully',
            metrics
        });

    } catch (error: any) {
        console.error('Error tracking performance:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
