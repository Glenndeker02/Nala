import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(['ADMIN'], async (request: NextRequest, user) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Today's GMV (Gross Merchandise Volume)
        const todaysGMV = await db.campaign.aggregate({
            where: {
                createdAt: { gte: todayStart },
                status: { in: ['ACTIVE', 'COMPLETED'] }
            },
            _sum: { totalBudget: true }
        });

        // Active campaigns breakdown
        const activeCampaigns = await db.campaign.groupBy({
            by: ['status'],
            _count: true,
            where: {
                status: { in: ['ACTIVE', 'IN_PROGRESS', 'IN_REVIEW', 'PENDING_CREATOR'] }
            }
        });

        // Total active campaigns
        const totalActiveCampaigns = await db.campaign.count({
            where: {
                status: { in: ['ACTIVE', 'IN_PROGRESS', 'IN_REVIEW', 'PENDING_CREATOR'] }
            }
        });

        // Creators online (active in last 24 hours)
        const creatorsOnline = await db.user.count({
            where: {
                role: 'CREATOR',
                lastLoginAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
            }
        });

        // Founders online
        const foundersOnline = await db.user.count({
            where: {
                role: 'FOUNDER',
                lastLoginAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
            }
        });

        // Payouts processed today
        const payoutsToday = await db.payment.aggregate({
            where: {
                createdAt: { gte: todayStart },
                type: { in: ['BASE_FEE', 'PERFORMANCE_BONUS'] },
                status: 'COMPLETED'
            },
            _sum: { amount: true }
        });

        // System status (simplified - in production, check actual health endpoints)
        const systemStatus = {
            api: 'healthy',
            database: 'healthy',
            stripe: 'connected',
            viewSync: {
                status: 'healthy',
                lastRun: '30m ago' // In production, check actual last run time
            }
        };

        // Urgent alerts
        const alerts = [];

        // Check for failed payments
        const failedPayments = await db.payment.findMany({
            where: {
                status: 'FAILED',
                createdAt: { gte: last7Days }
            },
            include: {
                recipient: { select: { fullName: true } }
            },
            take: 10
        });

        if (failedPayments.length > 0) {
            const totalAmount = failedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
            alerts.push({
                severity: 'critical',
                type: 'payment_error',
                count: failedPayments.length,
                message: `${failedPayments.length} payouts failed`,
                amount: totalAmount,
                creators: failedPayments.slice(0, 3).map(p => p.recipient.fullName),
                actionItems: ['investigate', 'manual_payout', 'email_creators']
            });
        }

        // Check KYC verification queue
        const pendingKYC = await db.creatorProfile.count({
            where: {
                verificationStatus: 'PENDING'
            }
        });

        if (pendingKYC > 0) {
            const oldestPending = await db.creatorProfile.findFirst({
                where: { verificationStatus: 'PENDING' },
                orderBy: { createdAt: 'asc' },
                select: { createdAt: true }
            });

            const daysPending = oldestPending
                ? Math.floor((now.getTime() - oldestPending.createdAt.getTime()) / (1000 * 60 * 60 * 24))
                : 0;

            alerts.push({
                severity: daysPending > 7 ? 'warning' : 'info',
                type: 'kyc_pending',
                count: pendingKYC,
                message: `${pendingKYC} creators waiting for KYC verification`,
                oldestDays: daysPending,
                actionItems: ['batch_review', 'auto_approve', 'send_reminders']
            });
        }

        // Check open disputes
        const openDisputes = await db.dispute.count({
            where: {
                status: { in: ['PENDING', 'UNDER_REVIEW'] }
            }
        });

        if (openDisputes > 0) {
            const latestDispute = await db.dispute.findFirst({
                where: { status: { in: ['PENDING', 'UNDER_REVIEW'] } },
                orderBy: { createdAt: 'desc' },
                select: { category: true, description: true }
            });

            alerts.push({
                severity: 'warning',
                type: 'open_disputes',
                count: openDisputes,
                message: `${openDisputes} active disputes`,
                latest: latestDispute?.description.substring(0, 50) + '...',
                actionItems: ['review', 'escalate', 'auto_resolve']
            });
        }

        // Campaign activity (last 7 days)
        const campaignsLaunched = await db.campaign.count({
            where: {
                createdAt: { gte: last7Days },
                status: { not: 'DRAFT' }
            }
        });

        const campaignsCompleted = await db.campaign.count({
            where: {
                completedAt: { gte: last7Days },
                status: 'COMPLETED'
            }
        });

        const avgBudget = await db.campaign.aggregate({
            where: {
                createdAt: { gte: last7Days }
            },
            _avg: { totalBudget: true }
        });

        // Creator activity
        const newSignupsToday = await db.user.count({
            where: {
                role: 'CREATOR',
                createdAt: { gte: todayStart }
            }
        });

        const kycVerifiedToday = await db.creatorProfile.count({
            where: {
                verificationStatus: 'VERIFIED',
                updatedAt: { gte: todayStart }
            }
        });

        const suspendedCreators = await db.user.count({
            where: {
                role: 'CREATOR',
                suspendedUntil: { gte: now }
            }
        });

        const avgBaseFee = await db.creatorProfile.aggregate({
            _avg: {
                baseFeeTiktok: true
            }
        });

        // Top earner today
        const topEarner = await db.payment.groupBy({
            by: ['recipientId'],
            where: {
                createdAt: { gte: todayStart },
                type: 'PERFORMANCE_BONUS',
                status: 'COMPLETED'
            },
            _sum: { amount: true },
            orderBy: { _sum: { amount: 'desc' } },
            take: 1
        });

        let topEarnerData = null;
        if (topEarner.length > 0) {
            const topUser = await db.user.findUnique({
                where: { id: topEarner[0].recipientId },
                select: { fullName: true }
            });
            topEarnerData = {
                name: topUser?.fullName,
                amount: Number(topEarner[0]._sum.amount)
            };
        }

        // Financial summary (last 30 days)
        const totalGMV30Days = await db.campaign.aggregate({
            where: {
                createdAt: { gte: last30Days }
            },
            _sum: { totalBudget: true }
        });

        const creatorPayouts30Days = await db.payment.aggregate({
            where: {
                createdAt: { gte: last30Days },
                type: { in: ['BASE_FEE', 'PERFORMANCE_BONUS'] },
                status: 'COMPLETED'
            },
            _sum: { amount: true }
        });

        const founderRefunds30Days = await db.payment.aggregate({
            where: {
                createdAt: { gte: last30Days },
                type: 'REFUND',
                status: 'COMPLETED'
            },
            _sum: { amount: true }
        });

        const nalaRevenue = Number(totalGMV30Days._sum.totalBudget || 0) * 0.01; // 1% platform fee

        return ApiResponse.success({
            keyMetrics: {
                todaysGMV: Number(todaysGMV._sum.totalBudget || 0),
                activeCampaigns: totalActiveCampaigns,
                creatorsOnline,
                foundersOnline,
                payoutsProcessedToday: Number(payoutsToday._sum.amount || 0)
            },
            systemStatus,
            alerts,
            campaignActivity: {
                launched: campaignsLaunched,
                completed: campaignsCompleted,
                avgBudget: Number(avgBudget._avg.totalBudget || 0),
                refundRate: 0.34 // Calculate from actual data
            },
            creatorActivity: {
                newSignupsToday,
                kycVerified: kycVerifiedToday,
                suspended: suspendedCreators,
                avgBaseFee: Number(avgBaseFee._avg.baseFeeTiktok || 0),
                topEarner: topEarnerData
            },
            financialSummary: {
                totalGMV: Number(totalGMV30Days._sum.totalBudget || 0),
                nalaRevenue,
                creatorPayouts: Number(creatorPayouts30Days._sum.amount || 0),
                founderRefunds: Number(founderRefunds30Days._sum.amount || 0),
                platformFeePercent: 1.0
            }
        });
    } catch (error) {
        console.error('Error fetching admin dashboard metrics:', error);
        return ApiResponse.error('Failed to fetch dashboard metrics', 500);
    }
});
