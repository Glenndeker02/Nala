import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { ApiResponse } from '@/lib/api-middleware';

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        if (!token) {
            return ApiResponse.error('Token is required', 400);
        }

        // Find token in database
        const verificationToken = await db.verificationToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!verificationToken) {
            return ApiResponse.error('Invalid token', 400);
        }

        // Check if expired
        if (new Date() > verificationToken.expiresAt) {
            return ApiResponse.error('Token has expired', 400);
        }

        // Update user status
        await db.user.update({
            where: { id: verificationToken.userId },
            data: { emailVerified: true },
        });

        // Delete used token
        await db.verificationToken.delete({
            where: { id: verificationToken.id },
        });

        return ApiResponse.success({
            message: 'Email verified successfully',
        });
    } catch (error) {
        console.error('Verification error:', error);
        return ApiResponse.error('Failed to verify email', 500);
    }
}
