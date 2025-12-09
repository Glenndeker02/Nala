import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/api-middleware';

// PUT - Update a creator code
export const PUT = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { id: string; codeId: string } }) => {
    try {
        const { codeId } = params;
        const body = await request.json();
        const { notes, active, expirationDate } = body;

        // Find the code and verify ownership
        const creatorCode = await prisma.creatorCode.findFirst({
            where: { id: codeId },
            include: {
                campaign: {
                    select: {
                        founderId: true
                    }
                }
            }
        });

        if (!creatorCode) {
            return NextResponse.json(
                { success: false, error: 'Code not found' },
                { status: 404 }
            );
        }

        if (creatorCode.campaign.founderId !== user.userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Update the code
        const updatedCode = await prisma.creatorCode.update({
            where: { id: codeId },
            data: {
                ...(notes !== undefined && { notes }),
                ...(active !== undefined && { active }),
                ...(expirationDate !== undefined && { expirationDate: expirationDate ? new Date(expirationDate) : null })
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                id: updatedCode.id,
                code: updatedCode.code,
                notes: updatedCode.notes,
                active: updatedCode.active,
                expirationDate: updatedCode.expirationDate?.toISOString() || null,
                updatedAt: updatedCode.updatedAt.toISOString()
            }
        });

    } catch (error: any) {
        console.error('Error updating creator code:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});

// DELETE - Deactivate a creator code (soft delete)
export const DELETE = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { id: string; codeId: string } }) => {
    try {
        const { codeId } = params;

        // Find the code and verify ownership
        const creatorCode = await prisma.creatorCode.findFirst({
            where: { id: codeId },
            include: {
                campaign: {
                    select: {
                        founderId: true
                    }
                }
            }
        });

        if (!creatorCode) {
            return NextResponse.json(
                { success: false, error: 'Code not found' },
                { status: 404 }
            );
        }

        if (creatorCode.campaign.founderId !== user.userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Soft delete - just deactivate
        await prisma.creatorCode.update({
            where: { id: codeId },
            data: { active: false }
        });

        return NextResponse.json({
            success: true,
            message: 'Code deactivated successfully'
        });

    } catch (error: any) {
        console.error('Error deactivating creator code:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
