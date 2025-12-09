import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const user = await requireRole(['FOUNDER']);

        const templates = await prisma.instructionTemplate.findMany({
            where: {
                founderId: user.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            templates
        });

    } catch (error: any) {
        console.error('Error fetching templates:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
