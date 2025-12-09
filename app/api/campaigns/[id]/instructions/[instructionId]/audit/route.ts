import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// GET - Get audit history for an instruction
export const GET = requireRole(['FOUNDER', 'CREATOR'], async (request: NextRequest, user, { params }: { params: { id: string; instructionId: string } }) => {
    try {
        const { instructionId } = params;

        const auditLogs = await prisma.instructionAudit.findMany({
            where: { instructionId },
            include: {
                actor: {
                    select: {
                        id: true,
                        fullName: true
                    }
                }
            },
            orderBy: {
                timestamp: 'asc'
            }
        });

        const formattedLogs = auditLogs.map(log => ({
            timestamp: log.timestamp.toISOString(),
            action: log.action,
            actorId: log.actorId,
            actorName: log.actor.fullName,
            changes: log.changes
        }));

        return NextResponse.json({
            success: true,
            data: formattedLogs
        });

    } catch (error: any) {
        console.error('Error fetching instruction audit:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
