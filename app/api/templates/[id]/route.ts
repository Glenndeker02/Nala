import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireRole(['FOUNDER']);

        const template = await prisma.instructionTemplate.findUnique({
            where: { id: params.id }
        });

        if (!template) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }

        if (template.founderId !== user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        await prisma.instructionTemplate.delete({
            where: { id: params.id }
        });

        return NextResponse.json({
            message: 'Template deleted successfully'
        });

    } catch (error: any) {
        console.error('Error deleting template:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
