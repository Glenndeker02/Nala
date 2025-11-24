import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { revokeTikTokToken } from '@/lib/oauth/tiktok';
import { revokeMetaToken } from '@/lib/oauth/meta';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const POST = requireRole(
    ['CREATOR'],
    async (request: NextRequest, user, { params }: { params: { platform: string } }) => {
        try {
            const platform = params.platform.toUpperCase();

            // Find the connection
            const connection = await db.socialConnection.findUnique({
                where: {
                    userId_platform: {
                        userId: user.userId,
                        platform,
                    },
                },
            });

            if (!connection) {
                return ApiResponse.error('Connection not found', 404);
            }

            // Revoke token with platform
            try {
                if (platform === 'TIKTOK') {
                    await revokeTikTokToken(connection.accessToken);
                } else if (platform === 'INSTAGRAM' || platform === 'FACEBOOK') {
                    await revokeMetaToken(connection.accessToken);
                }
            } catch (error) {
                console.error('Error revoking token:', error);
                // Continue even if revocation fails
            }

            // Mark connection as inactive
            await db.socialConnection.update({
                where: {
                    id: connection.id,
                },
                data: {
                    isActive: false,
                    disconnectedAt: new Date(),
                },
            });

            return ApiResponse.success({
                message: 'Account disconnected successfully',
            });
        } catch (error) {
            console.error('Error disconnecting account:', error);
            return ApiResponse.error('Failed to disconnect account', 500);
        }
    }
);
