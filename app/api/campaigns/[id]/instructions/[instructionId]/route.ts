import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// PUT - Update instruction
export const PUT = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { id: string; instructionId: string } }) => {
    try {
        const { instructionId } = params;
        const body = await request.json();
        const { text, status } = body;

        // Get instruction with campaign
        const instruction = await prisma.instruction.findUnique({
            where: { id: instructionId },
            include: {
                campaign: {
                    select: {
                        founderId: true
                    }
                }
            }
        });

        if (!instruction) {
            return NextResponse.json(
                { success: false, error: 'Instruction not found' },
                { status: 404 }
            );
        }

        if (instruction.campaign.founderId !== user.userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Track changes
        const changes: any = {};
        if (text && text !== instruction.text) {
            changes.text = { from: instruction.text, to: text };
        }
        if (status && status !== instruction.status) {
            changes.status = { from: instruction.status, to: status };
        }

        // Update instruction
        const updated = await prisma.instruction.update({
            where: { id: instructionId },
            data: {
                ...(text && { text }),
                ...(status && { status })
            },
            include: {
                author: {
                    select: {
                        fullName: true
                    }
                }
            }
        });

        // Create audit log
        const action = status === 'CLOSED' ? 'CLOSED' : 'UPDATED';
        await prisma.instructionAudit.create({
            data: {
                instructionId,
                action,
                actorId: user.userId,
                changes
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                instructionId: updated.id,
                text: updated.text,
                attachedLibraryItemId: updated.attachedLibraryItemId,
                authorId: updated.authorId,
                authorName: updated.author.fullName,
                createdAt: updated.createdAt.toISOString(),
                updatedAt: updated.updatedAt.toISOString(),
                appliesTo: updated.appliesTo,
                status: updated.status
            }
        });

    } catch (error: any) {
        console.error('Error updating instruction:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
