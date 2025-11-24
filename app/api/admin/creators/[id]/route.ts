import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";

/**
 * GET /api/admin/creators/[id]
 * Get detailed creator profile for admin
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    // Wrap in requireRole middleware
    return requireRole('ADMIN', async (req: NextRequest, user: JWTPayload) => {
        try {
            const creatorId = params.id;

            // Fetch creator with all related data
            const creator = await db.user.findUnique({
                where: {
                    id: creatorId,
                    role: 'CREATOR',
                },
                include: {
                    creatorProfile: true,
                    socialAccounts: {
                        select: {
                            platform: true,
                            username: true,
                            followers: true,
                            isActive: true,
                            connectedAt: true,
                        },
                    },
                    assignedVideos: {
                        include: {
                            campaign: {
                                select: {
                                    id: true,
                                    name: true,
                                    status: true,
                                },
                            },
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                        take: 10,
                    },
                    payments: {
                        where: {
                            status: 'COMPLETED',
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                        take: 10,
                    },
                    initiatedDisputes: {
                        select: {
                            id: true,
                            category: true,
                            status: true,
                            createdAt: true,
                        },
                    },
                },
            });

            if (!creator) {
                return ApiResponse.error('Creator not found', 404);
            }

            // Calculate earnings summary
            const earningsAgg = await db.payment.aggregate({
                where: {
                    userId: creatorId,
                    status: 'COMPLETED',
                },
                _sum: {
                    amount: true,
                },
            });

            const baseFeeAgg = await db.payment.aggregate({
                where: {
                    userId: creatorId,
                    status: 'COMPLETED',
                    type: 'BASE_FEE',
                },
                _sum: {
                    amount: true,
                },
            });

            const bonusAgg = await db.payment.aggregate({
                where: {
                    userId: creatorId,
                    status: 'COMPLETED',
                    type: 'PERFORMANCE_BONUS',
                },
                _sum: {
                    amount: true,
                },
            });

            // Get pending balance (payments created but not yet paid out)
            const pendingAgg = await db.payment.aggregate({
                where: {
                    userId: creatorId,
                    status: 'PENDING',
                },
                _sum: {
                    amount: true,
                },
            });

            // Calculate campaign stats
            const totalCampaigns = await db.video.count({
                where: {
                    creatorId,
                    status: {
                        in: ['APPROVED', 'POSTED', 'LOCKED'],
                    },
                },
            });

            const completedVideos = creator.assignedVideos.filter(
                (v) => v.status === 'POSTED' || v.status === 'LOCKED'
            ).length;
            const totalAssigned = creator.assignedVideos.length;
            const completionRate = totalAssigned > 0 ? (completedVideos / totalAssigned) * 100 : 0;

            // Calculate average views (from completed videos)
            const viewsAgg = await db.video.aggregate({
                where: {
                    creatorId,
                    status: 'LOCKED',
                    lockedViewCount: {
                        not: null,
                    },
                },
                _avg: {
                    lockedViewCount: true,
                },
            });

            // Get last payout
            const lastPayout = await db.payment.findFirst({
                where: {
                    userId: creatorId,
                    status: 'COMPLETED',
                    type: {
                        in: ['BASE_FEE', 'PERFORMANCE_BONUS'],
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            // Calculate performance metrics
            const avgRating = 4.5; // Placeholder - would calculate from actual ratings
            const onTimeRate = 95; // Placeholder - would calculate from actual data

            // Get activity log (recent actions)
            const activityLog = [
                ...creator.assignedVideos.slice(0, 5).map((video) => ({
                    timestamp: video.createdAt,
                    action: `Assigned to campaign: ${video.campaign.name}`,
                    details: `Video ID: ${video.id}`,
                })),
                ...creator.payments.slice(0, 5).map((payment) => ({
                    timestamp: payment.createdAt,
                    action: `Payment ${payment.type}`,
                    details: `Amount: $${payment.amount}`,
                })),
            ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);

            // Build response
            const response = {
                // Basic info
                creatorId: creator.id,
                userInfo: {
                    email: creator.email,
                    fullName: creator.fullName,
                    phone: null, // Add if available
                    joinedDate: creator.createdAt,
                    lastLogin: creator.lastLoginAt,
                    status: creator.suspendedUntil && creator.suspendedUntil > new Date()
                        ? 'SUSPENDED'
                        : creator.bannedReason
                            ? 'BANNED'
                            : 'ACTIVE',
                },

                // KYC verification
                kycVerification: {
                    status: creator.creatorProfile?.verificationStatus || 'PENDING',
                    identityVerified: creator.creatorProfile?.verificationStatus === 'VERIFIED',
                    addressVerified: creator.creatorProfile?.verificationStatus === 'VERIFIED',
                    sanctionCheck: 'CLEAR', // Placeholder
                    verifiedAt: creator.creatorProfile?.updatedAt,
                },

                // Social accounts
                socialAccounts: creator.socialAccounts.map((sa) => ({
                    platform: sa.platform,
                    username: sa.username,
                    followers: sa.followers,
                    verified: sa.isActive,
                    connectedAt: sa.connectedAt,
                })),

                // Bank account (Stripe Connect)
                stripeConnect: {
                    accountId: creator.stripeAccountId,
                    accountHolder: creator.fullName,
                    status: creator.stripeAccountId ? 'ACTIVE' : 'NOT_CONNECTED',
                    bank: null, // Would fetch from Stripe
                },

                // Earnings summary
                earnings: {
                    totalEarnings: Number(earningsAgg._sum.amount || 0),
                    lifetimeBaseFees: Number(baseFeeAgg._sum.amount || 0),
                    lifetimeBonuses: Number(bonusAgg._sum.amount || 0),
                    availableBalance: 0, // Would calculate from wallet
                    pending: Number(pendingAgg._sum.amount || 0),
                    lastPayout: lastPayout ? {
                        amount: Number(lastPayout.amount),
                        date: lastPayout.createdAt,
                    } : null,
                },

                // Campaign history
                campaigns: {
                    total: totalCampaigns,
                    completionRate: Math.round(completionRate),
                    avgViews: Math.round(Number(viewsAgg._avg.lockedViewCount || 0)),
                    avgBaseFee: Number(creator.creatorProfile?.baseFeeTiktok || 0),
                },

                // Performance metrics
                performance: {
                    avgRating,
                    contentApprovalRate: 98, // Placeholder
                    onTimePostingRate: onTimeRate,
                    latePostIncidents: 0, // Placeholder
                    disputeCount: creator.initiatedDisputes.length,
                },

                // Activity log
                activityLog,

                // Admin notes
                adminNotes: creator.creatorProfile?.adminNotes || '',

                // Suspension/ban info
                suspension: creator.suspendedUntil ? {
                    until: creator.suspendedUntil,
                    reason: creator.suspensionReason,
                } : null,
                ban: creator.bannedReason ? {
                    reason: creator.bannedReason,
                } : null,

                // Profile data
                profile: {
                    bio: creator.creatorProfile?.bio,
                    categories: creator.creatorProfile?.categories,
                    portfolioVideos: creator.creatorProfile?.portfolioVideos,
                    baseRates: {
                        tiktok: Number(creator.creatorProfile?.baseFeeTiktok || 0),
                        instagram: Number(creator.creatorProfile?.baseFeeInstagram || 0),
                        facebook: Number(creator.creatorProfile?.baseFeeFacebook || 0),
                    },
                },
            };

            return ApiResponse.success(response);
        } catch (error) {
            console.error('Fetch creator detail error:', error);
            return ApiResponse.error('Failed to fetch creator details', 500);
        }
    })(request);
}

/**
 * PATCH /api/admin/creators/[id]
 * Update creator details (currently just admin notes)
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return requireRole('ADMIN', async (req: NextRequest, user: JWTPayload) => {
        try {
            const creatorId = params.id;
            const body = await request.json();
            const { adminNotes } = body;

            if (typeof adminNotes !== 'string') {
                return ApiResponse.error('Invalid admin notes', 400);
            }

            // Update creator profile
            await db.creatorProfile.update({
                where: {
                    userId: creatorId,
                },
                data: {
                    adminNotes,
                },
            });

            return ApiResponse.success({ message: 'Admin notes updated successfully' });
        } catch (error) {
            console.error('Update creator error:', error);
            return ApiResponse.error('Failed to update creator', 500);
        }
    })(request);
}
