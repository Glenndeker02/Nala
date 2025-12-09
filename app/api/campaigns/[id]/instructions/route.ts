import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/api-middleware';

// GET - Fetch instructions for a campaign
export const GET = requireRole(['FOUNDER', 'CREATOR'], async (req: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;
        const { searchParams } = new URL(req.url);
        const videoNumber = searchParams.get('videoNumber');

        // Build conditions array
        const conditions: any[] = [
            { campaignId }
        ];

        // If creator, add filter for instructions that apply to them
        if (user.role === 'CREATOR') {
            conditions.push({
                OR: [
                    { appliesTo: 'ALL' },
                    { appliesTo: { contains: user.userId } }
                ]
            });
        }

        // Optional filter by video number - include global (null) + specific video
        if (videoNumber) {
            conditions.push({
                OR: [
                    { videoNumber: null },
                    { videoNumber: parseInt(videoNumber) }
                ]
            });
        }

        const instructions = await prisma.instruction.findMany({
            where: {
                AND: conditions
            },
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { fullName: true, profilePictureUrl: true }
                }
            }
        });

        // Debug logging
        console.log(`[Instructions API] User: ${user.userId}, Role: ${user.role}, CampaignId: ${campaignId}`);
        console.log(`[Instructions API] Conditions:`, JSON.stringify(conditions, null, 2));
        console.log(`[Instructions API] Found ${instructions.length} instructions`);

        return NextResponse.json({ success: true, data: instructions });
    } catch (error: any) {
        console.error('Error fetching instructions:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});

// POST - Create a new instruction
export const POST = requireRole(['FOUNDER'], async (req: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;
        const body = await req.json();
        const { text, appliesTo, videoNumber, requiresAcknowledgment, instructionType } = body;

        if (!text || !appliesTo) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const instruction = await prisma.instruction.create({
            data: {
                campaignId,
                authorId: user.userId,
                text,
                appliesTo, // 'ALL' or creatorId(s)
                videoNumber: videoNumber ? parseInt(videoNumber) : null,
                requiresAcknowledgment: requiresAcknowledgment ?? true,
                instructionType: instructionType || 'GENERAL',
                status: 'OPEN'
            }
        });

        return NextResponse.json({ success: true, data: instruction });

    } catch (error: any) {
        console.error('Error creating instruction:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
