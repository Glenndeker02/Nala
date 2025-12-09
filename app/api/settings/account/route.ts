import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export const GET = requireRole(['FOUNDER', 'CREATOR'], async (request: NextRequest, user) => {
    try {
        const userData = await prisma.user.findUnique({
            where: { id: user.userId },
            select: {
                id: true,
                email: true,
                emailVerified: true,
                emailVerifiedAt: true,
                twoFactorEnabled: true,
                createdAt: true,
                lastLoginAt: true,
                founderTier: true,
                role: true
            }
        });

        if (!userData) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: userData
        });

    } catch (error: any) {
        console.error('Error fetching account info:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
