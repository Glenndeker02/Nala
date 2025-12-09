import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export const GET = requireRole(['FOUNDER', 'CREATOR'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;

        // Get campaign with brief data
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            select: {
                id: true,
                name: true,
                description: true,
                briefData: true,
                founderId: true
            }
        });

        if (!campaign) {
            return NextResponse.json(
                { success: false, error: 'Campaign not found' },
                { status: 404 }
            );
        }

        // Extract brief data from JSON field
        const briefData = campaign.briefData as any || {};

        return NextResponse.json({
            success: true,
            data: {
                campaignId: campaign.id,
                title: campaign.name,
                description: campaign.description || '',
                targetAudience: briefData.targetAudience || '',
                platforms: briefData.platforms || [],
                mustHaves: briefData.mustHaves || [],
                videoSpecs: briefData.videoSpecs || {},
                talkingPoints: briefData.talkingPoints || []
            }
        });

    } catch (error: any) {
        console.error('Error fetching campaign brief:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
