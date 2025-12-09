import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// POST - Adopt winning AB test format
export const POST = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { id: string; abId: string } }) => {
    try {
        const { id: campaignId, abId } = params;
        const body = await request.json();
        const { variationLabel, assignToCreators } = body;

        // Get AB test with variants
        const abTest = await prisma.aBTest.findUnique({
            where: { id: abId },
            include: {
                campaign: {
                    select: {
                        founderId: true
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

        if (abTest.campaignId !== campaignId) {
            return NextResponse.json(
                { success: false, error: 'AB test does not belong to this campaign' },
                { status: 400 }
            );
        }

        if (abTest.campaign.founderId !== user.userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Find the variation to adopt
        const variation = variationLabel
            ? abTest.variants.find(v => v.label === variationLabel || v.variantName === variationLabel)
            : abTest.variants.find(v => v.id === abTest.winnerVariantId);

        if (!variation) {
            return NextResponse.json(
                { success: false, error: 'Variation not found' },
                { status: 404 }
            );
        }

        // Create instruction from winning variation
        if (variation.instructions || variation.scriptTemplate || variation.hookTemplate) {
            const instructionText = [
                variation.instructions,
                variation.scriptTemplate ? `Script: ${variation.scriptTemplate}` : null,
                variation.hookTemplate ? `Hook: ${variation.hookTemplate}` : null
            ].filter(Boolean).join('\n\n');

            await prisma.instruction.create({
                data: {
                    campaignId,
                    text: `Adopted from AB Test "${abTest.name}" - Winning Variation ${variation.label || variation.variantName}:\n\n${instructionText}`,
                    authorId: user.userId,
                    appliesTo: assignToCreators ? 'all' : 'future',
                    status: 'OPEN'
                }
            });

            // Create audit log
            await prisma.instructionAudit.create({
                data: {
                    instructionId: (await prisma.instruction.findFirst({
                        where: { campaignId },
                        orderBy: { createdAt: 'desc' }
                    }))!.id,
                    action: 'CREATED',
                    actorId: user.userId,
                    changes: {
                        source: 'AB_TEST_ADOPTION',
                        abTestId: abTest.id,
                        variationId: variation.id
                    }
                }
            });
        }

        // Update campaign format templates if formatId exists
        if (variation.formatId) {
            // TODO: Link format to campaign's recommended formats
        }

        return NextResponse.json({
            success: true,
            message: 'Format adopted successfully',
            data: {
                variationId: variation.id,
                variationName: variation.variantName,
                instructionCreated: !!(variation.instructions || variation.scriptTemplate || variation.hookTemplate),
                assignedToAll: assignToCreators || false
            }
        });

    } catch (error: any) {
        console.error('Error adopting AB test format:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
