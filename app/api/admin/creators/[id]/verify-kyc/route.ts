import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";
import { z } from "zod";

const verifySchema = z.object({
    approvalStatus: z.enum(['APPROVED', 'REJECTED']),
    reason: z.string().optional(),
});

/**
 * POST /api/admin/creators/[id]/verify-kyc
 * Approve or reject creator KYC verification
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return requireRole('ADMIN', async (req: NextRequest, user: JWTPayload) => {
        try {
            const creatorId = params.id;
            const body = await request.json();
            const validation = verifySchema.safeParse(body);

            if (!validation.success) {
                return ApiResponse.error('Invalid request', 400, validation.error.errors);
            }

            const { approvalStatus, reason } = validation.data;

            // Check if creator exists
            const creator = await db.user.findUnique({
                where: {
                    id: creatorId,
                    role: 'CREATOR',
                },
                include: {
                    creatorProfile: true,
                },
            });

            if (!creator) {
                return ApiResponse.error('Creator not found', 404);
            }

            if (!creator.creatorProfile) {
                return ApiResponse.error('Creator profile not found', 404);
            }

            // Update verification status
            const newStatus = approvalStatus === 'APPROVED' ? 'VERIFIED' : 'REJECTED';

            const updatedProfile = await db.creatorProfile.update({
                where: {
                    userId: creatorId,
                },
                data: {
                    verificationStatus: newStatus,
                },
            });

            // Create notification for creator
            await db.notification.create({
                data: {
                    userId: creatorId,
                    type: 'KYC_UPDATE',
                    title: 'KYC Status Updated',
                    message: `Your KYC verification has been ${approvalStatus.toLowerCase()}`,
                },
            });

            return ApiResponse.success({
                creatorId,
                status: newStatus,
                message: `Creator ${approvalStatus.toLowerCase()} successfully`,
            });
        } catch (error) {
            console.error('KYC verification error:', error);
            return ApiResponse.error('Failed to update KYC status', 500);
        }
    })(request);
}
