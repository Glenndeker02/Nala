import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, JWTPayload, requireRole } from "@/lib/api-middleware";
import { z } from "zod";

const querySchema = z.object({
    kycStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
    platform: z.string().optional(),
    location: z.string().optional(),
    sortBy: z.enum(['earnings', 'rating', 'joined_date', 'name']).optional().default('joined_date'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    limit: z.string().optional().default('20'),
    offset: z.string().optional().default('0'),
    search: z.string().optional(),
});

/**
 * GET /api/admin/creators
 * List all creators with filters and pagination
 */
export const GET = requireRole('ADMIN', async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse({
            kycStatus: searchParams.get('kycStatus') || undefined,
            platform: searchParams.get('platform') || undefined,
            location: searchParams.get('location') || undefined,
            sortBy: searchParams.get('sortBy') || 'joined_date',
            order: searchParams.get('order') || 'desc',
            limit: searchParams.get('limit') || '20',
            offset: searchParams.get('offset') || '0',
            search: searchParams.get('search') || undefined,
        });

        const limit = parseInt(query.limit);
        const offset = parseInt(query.offset);

        // Build where clause
        const where: any = {
            role: 'CREATOR',
        };

        // Search filter
        if (query.search) {
            where.OR = [
                { fullName: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
                { id: { contains: query.search } },
            ];
        }

        // KYC status filter
        if (query.kycStatus) {
            where.creatorProfile = {
                verificationStatus: query.kycStatus,
            };
        }

        // Get total count
        const totalCount = await db.user.count({ where });

        // Build orderBy
        let orderBy: any = {};
        switch (query.sortBy) {
            case 'name':
                orderBy = { fullName: query.order };
                break;
            case 'joined_date':
                orderBy = { createdAt: query.order };
                break;
            case 'earnings':
                // Would need to join with payments table
                orderBy = { createdAt: query.order }; // Fallback
                break;
            case 'rating':
                // Would need to calculate from campaigns
                orderBy = { createdAt: query.order }; // Fallback
                break;
            default:
                orderBy = { createdAt: query.order };
        }

        // Fetch creators
        const creators = await db.user.findMany({
            where,
            include: {
                creatorProfile: {
                    select: {
                        verificationStatus: true,
                        baseFeeTiktok: true,
                        baseFeeInstagram: true,
                        baseFeeFacebook: true,
                        categories: true,
                        adminNotes: true,
                    },
                },
                socialAccounts: {
                    select: {
                        platform: true,
                        followers: true,
                        isActive: true,
                    },
                },
                assignedVideos: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
            orderBy,
            take: limit,
            skip: offset,
        });

        // Calculate earnings for each creator (simplified)
        const creatorsWithStats = await Promise.all(
            creators.map(async (creator) => {
                // Get total earnings
                const earnings = await db.payment.aggregate({
                    where: {
                        recipientId: creator.id,
                        status: 'COMPLETED',
                        type: {
                            in: ['BASE_FEE', 'PERFORMANCE_BONUS'],
                        },
                    },
                    _sum: {
                        amount: true,
                    },
                });

                // Get campaign count
                const campaignCount = await db.video.count({
                    where: {
                        creatorId: creator.id,
                        status: {
                            in: ['APPROVED', 'POSTED', 'LOCKED'],
                        },
                    },
                });

                // Calculate completion rate
                const totalAssigned = creator.assignedVideos.length;
                const completed = creator.assignedVideos.filter(
                    (v) => v.status === 'POSTED' || v.status === 'LOCKED'
                ).length;
                const completionRate = totalAssigned > 0 ? (completed / totalAssigned) * 100 : 0;

                // Get average rating (simplified - would calculate from actual ratings)
                const avgRating = 4.5; // Placeholder

                return {
                    id: creator.id,
                    name: creator.fullName,
                    email: creator.email,
                    joinedDate: creator.createdAt,
                    kycStatus: creator.creatorProfile?.verificationStatus || 'PENDING',
                    totalEarnings: Number(earnings._sum.amount || 0),
                    campaignsCompleted: campaignCount,
                    completionRate: Math.round(completionRate),
                    avgRating,
                    socialAccounts: creator.socialAccounts.map((sa) => ({
                        platform: sa.platform,
                        followers: sa.followers,
                        isActive: sa.isActive,
                    })),
                    status: creator.suspendedUntil && creator.suspendedUntil > new Date()
                        ? 'SUSPENDED'
                        : creator.bannedReason
                            ? 'BANNED'
                            : 'ACTIVE',
                    adminNotes: creator.creatorProfile?.adminNotes,
                };
            })
        );

        // Get status counts
        const [pendingCount, verifiedCount, rejectedCount, bannedCount] = await Promise.all([
            db.creatorProfile.count({ where: { verificationStatus: 'PENDING' } }),
            db.creatorProfile.count({ where: { verificationStatus: 'VERIFIED' } }),
            db.creatorProfile.count({ where: { verificationStatus: 'REJECTED' } }),
            db.user.count({ where: { role: 'CREATOR', bannedReason: { not: null } } }),
        ]);

        return ApiResponse.success({
            creators: creatorsWithStats,
            totalCount,
            hasMore: offset + limit < totalCount,
            statusCounts: {
                pending: pendingCount,
                verified: verifiedCount,
                rejected: rejectedCount,
                banned: bannedCount,
            },
        });
    } catch (error) {
        console.error('Fetch creators error:', error);
        return ApiResponse.error('Failed to fetch creators', 500);
    }
});
