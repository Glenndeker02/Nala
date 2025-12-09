import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const user = await requireRole(['FOUNDER']);
        const body = await request.json();
        const { name, content, type, attachedLinks, attachedLibraryItems } = body;

        if (!name || !content) {
            return NextResponse.json(
                { error: 'Name and content are required' },
                { status: 400 }
            );
        }

        const template = await prisma.instructionTemplate.create({
            data: {
                founderId: user.id,
                name,
                content,
                type: type || 'GLOBAL',
                attachedLinks: attachedLinks || [],
                attachedLibraryItems: attachedLibraryItems || []
            }
        });

        return NextResponse.json({
            message: 'Template created successfully',
            template
        });

    } catch (error: any) {
        console.error('Error creating template:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
