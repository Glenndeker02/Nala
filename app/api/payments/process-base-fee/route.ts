import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        // In production, this should be restricted to ADMIN or triggered internally
        // For now, allowing FOUNDER to trigger it manually if needed, or system
        const user = await requireRole(['FOUNDER', 'ADMIN']);
        const { videoId } = await request.json();

        if (!videoId) {
            return NextResponse.json(
                { error: 'Video ID is required' },
                { status: 400 }
            );
        }

        const video = await prisma.video.findUnique({
            where: { id: videoId },
            include: {
                campaign: true,
                creator: true
            }
        });

        if (!video || !video.creator) {
            return NextResponse.json(
                { error: 'Video or creator not found' },
                { status: 404 }
            );
        }

        // Verify ownership if founder
        if (user.role === 'FOUNDER' && video.campaign.founderId !== user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        if (video.baseFeePaid) {
            return NextResponse.json(
                { error: 'Base fee already paid' },
                { status: 400 }
            );
        }

        if (video.status !== 'APPROVED' && video.status !== 'POSTED') {
            return NextResponse.json(
                { error: 'Video must be approved to process payment' },
                { status: 400 }
            );
        }

        // Calculate amount (fallback to campaign budget / video count if not set)
        // Note: In Phase 1 we set baseFeePerVideo on Campaign, but schema might not have it directly on Video
        // Let's assume baseFeeAmount is already set on Video during approval (Phase 4), or calculate it here.
        let amount = video.baseFeeAmount;

        if (!amount) {
            // Fallback calculation
            // This assumes we have access to the budget. 
            // For simplicity, let's assume 100 if not set, or fetch from campaign
            amount = new Prisma.Decimal(100.00);
        }

        // Create Payment Record
        const payment = await prisma.payment.create({
            data: {
                campaignId: video.campaignId,
                videoId: video.id,
                recipientId: video.creatorId!,
                amount: amount,
                type: 'BASE_FEE',
                status: 'COMPLETED', // Mocking instant success
                description: `Base fee for video ${video.title || video.videoNumber}`,
                metadata: {
                    mock_transfer: true,
                    processed_by: user.id
                }
            }
        });

        // Update Video
        await prisma.video.update({
            where: { id: video.id },
            data: {
                baseFeePaid: true,
                baseFeeAmount: amount
            }
        });

        // Notify Creator
        await prisma.notification.create({
            data: {
                userId: video.creatorId!,
                type: 'BASE_FEE_PAID',
                title: 'Payment Received',
                message: `You received $${amount} for your video in ${video.campaign.name}`,
                link: `/creator/dashboard`, // Future: payments page
                metadata: { paymentId: payment.id }
            }
        });

        return NextResponse.json({
            message: 'Base fee processed successfully',
            payment
        });

    } catch (error: any) {
        console.error('Error processing base fee:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

import { Prisma } from '@prisma/client';
