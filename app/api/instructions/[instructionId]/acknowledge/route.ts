import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/api-middleware';

// POST - Acknowledge an instruction
export const POST = requireRole(['CREATOR'], async (req: NextRequest, user, { params }: { params: { instructionId: string } }) => {
    try {
        const instructionId = params.instructionId;
        const creatorId = user.userId;

        // Check if instruction exists
        const instruction = await prisma.instruction.findUnique({
            where: { id: instructionId }
        });

        if (!instruction) {
            return NextResponse.json(
                { success: false, error: 'Instruction not found' },
                { status: 404 }
            );
        }

        // Check if already acknowledged
        if (instruction.acknowledgedBy.includes(creatorId)) {
            return NextResponse.json({ success: true, message: 'Already acknowledged' });
        }

        // Update acknowledgedBy array
        await prisma.instruction.update({
            where: { id: instructionId },
            data: {
                acknowledgedBy: {
                    push: creatorId
                }
            }
        });

        // Create audit log (optional but good for tracking)
        await prisma.instructionAudit.create({
            data: {
                instructionId,
                action: 'ACKNOWLEDGE',
                actorId: creatorId,
                changes: { status: 'ACKNOWLEDGED' }
            }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error acknowledging instruction:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
