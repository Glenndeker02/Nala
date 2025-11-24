import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";

/**
 * GET /api/admin/founders/[id]
 * Get detailed founder profile for admin
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return requireRole('ADMIN', async (req: NextRequest, user: JWTPayload) => {
        try {
            const founderId = params.id;

            // Fetch founder with all related data
            const founder = await db.user.findUnique({
                where: {
                    id: founderId,
                    role: 'FOUNDER',
                },
                include: {
                    campaigns: {
                        include: {
                            _count: {
                                select: {
                                    videos: true,
                                    applications: true,
                                }
                            }
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

            if (!founder) {
                return ApiResponse.error('Founder not found', 404);
            }

            // Calculate spending summary
            const spendingAgg = await db.payment.aggregate({
                where: {
                    userId: founderId,
                    status: 'COMPLETED',
                    type: 'CAMPAIGN_FUNDING',
                },
                _sum: {
                    amount: true,
                },
            });

            const refundsAgg = await db.payment.aggregate({
                where: {
                    userId: founderId,
                    status: 'COMPLETED',
                    type: 'REFUND',
                },
                _sum: {
                    amount: true,
                },
            });

            // Calculate campaign stats
            const totalCampaigns = await db.campaign.count({
                where: { founderId },
            });

            const activeCampaigns = await db.campaign.count({
                where: {
                    founderId,
                    status: { in: ['ACTIVE', 'IN_PROGRESS'] }
                },
            });

            const completedCampaigns = await db.campaign.count({
                where: {
                    founderId,
                    status: 'COMPLETED'
                },
            });

            // Get last payment
            const lastPayment = await db.payment.findFirst({
                where: {
                    userId: founderId,
                    status: 'COMPLETED',
                    type: 'CAMPAIGN_FUNDING',
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            // Activity log (recent actions)
            const activityLog = [
                ...founder.campaigns.slice(0, 5).map((campaign) => ({
                    timestamp: campaign.createdAt,
                    action: `Created campaign: ${campaign.name}`,
                    details: `Budget: $${campaign.totalBudget}`,
                })),
                ...founder.payments.slice(0, 5).map((payment) => ({
                    timestamp: payment.createdAt,
                    action: `Payment ${payment.type}`,
                    details: `Amount: $${payment.amount}`,
                })),
            ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);

            const response = {
                founderId: founder.id,
                userInfo: {
                    email: founder.email,
                    fullName: founder.fullName,
                    companyName: founder.companyName,
                    joinedDate: founder.createdAt,
                    lastLogin: founder.lastLoginAt,
                    status: founder.suspendedUntil && founder.suspendedUntil > new Date()
                        ? 'SUSPENDED'
                        : founder.bannedReason
                            ? 'BANNED'
                            : 'ACTIVE',
                    tier: founder.founderTier || 'SILVER',
                },

                financials: {
                    totalSpending: Number(spendingAgg._sum.amount || 0),
                    totalRefunds: Number(refundsAgg._sum.amount || 0),
                    lastPayment: lastPayment ? {
                        amount: Number(lastPayment.amount),
                        date: lastPayment.createdAt,
                    } : null,
                    stripeCustomerId: founder.stripeCustomerId,
                },

                campaignStats: {
                    total: totalCampaigns,
                    active: activeCampaigns,
                    completed: completedCampaigns,
                },

                recentCampaigns: founder.campaigns.map(c => ({
                    id: c.id,
                    name: c.name,
                    status: c.status,
                    budget: Number(c.totalBudget),
                    createdAt: c.createdAt,
                    videoCount: c._count.videos,
                    applicationCount: c._count.applications,
                })),

                recentPayments: founder.payments.map(p => ({
                    id: p.id,
                    amount: Number(p.amount),
                    type: p.type,
                    status: p.status,
                    createdAt: p.createdAt,
                })),

                disputes: founder.initiatedDisputes,

                activityLog,

                suspension: founder.suspendedUntil ? {
                    until: founder.suspendedUntil,
                    reason: founder.suspensionReason,
                } : null,

                ban: founder.bannedReason ? {
                    reason: founder.bannedReason,
                } : null,
            };

            return ApiResponse.success(response);
        } catch (error) {
            console.error('Fetch founder detail error:', error);
            return ApiResponse.error('Failed to fetch founder details', 500);
        }
    })(request);
}
