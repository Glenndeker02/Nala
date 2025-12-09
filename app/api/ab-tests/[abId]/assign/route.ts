import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// POST - Assign creators/videos to AB test variation
export const POST = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { abId: string } }) => {
    try {
        const { abId } = params;
        const body = await request.json();
        const { creatorIds, videoIds, variationId } = body;

        if (!variationId || (!creatorIds && !videoIds)) {
            return NextResponse.json(
                { success: false, error: 'variationId and either creatorIds or videoIds are required' },
                { status: 400 }
            );
        }

        // Get AB test with campaign
        const abTest = await prisma.aBTest.findUnique({
            where: { id: abId },
            include: {
                campaign: {
                    select: {
                        founderId: true,
                        id: true
                    }
                },
                variants: true
            }
        });

        if (!abTest) {
            return NextResponse.json(
                { success: false, error: 'AB test not found' },
                { status: 404 }
            );
        }

        if (abTest.campaign.founderId !== user.userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Verify variation belongs to this AB test
        const variation = abTest.variants.find(v => v.id === variationId);
        if (!variation) {
            return NextResponse.json(
                { success: false, error: 'Variation not found in this AB test' },
                { status: 404 }
            );
        }

        // Assign creators if provided
        if (creatorIds && creatorIds.length > 0) {
            await prisma.aBTestVariant.update({
                where: { id: variationId },
                data: {
                    creatorId: creatorIds[0] // Assign first creator (simplified)
                }
            });
        }

        // Assign videos if provided
        if (videoIds && videoIds.length > 0) {
            // Update the first video to link to this variant
            await prisma.aBTestVariant.update({
                where: { id: variationId },
                data: {
                    videoId: videoIds[0]
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Assignment successful',
            data: {
                variationId,
                assignedCreators: creatorIds?.length || 0,
                assignedVideos: videoIds?.length || 0
            }
        });

    } catch (error: any) {
        console.error('Error assigning to AB test:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
