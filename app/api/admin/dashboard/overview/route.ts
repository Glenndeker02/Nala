import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole, JWTPayload } from "@/lib/api-middleware";

/**
 * GET /api/admin/dashboard/overview
 * Returns comprehensive dashboard metrics for admin
 */
export const GET = requireRole('ADMIN', async (request: NextRequest) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Check cache first
        const cachedMetrics = await db.adminDashboardMetric.findFirst({
            where: {
                metricType: 'overview',
                dateRange: 'TODAY',
                expiresAt: {
                    gt: now,
                },
            },
        });

        if (cachedMetrics) {
            return ApiResponse.success(cachedMetrics.metricValue);
        }

        // Calculate fresh metrics
        const [
            activeCampaigns,
            completedCampaignsLast7Days,
            launchedCampaignsLast7Days,
            totalUsers,
            creatorsOnlineToday,
            foundersOnlineToday,
            pendingKYC,
            openDisputes,
            todayPayments,
            last30DaysPayments,
            last30DaysRefunds,
        ] = await Promise.all([
            // Active campaigns
            db.campaign.count({
                where: {
                    status: {
                        in: ['IN_PROGRESS', 'ACTIVE'],
                    },
                },
            }),

            // Completed campaigns (last 7 days)
            db.campaign.count({
                where: {
                    status: 'COMPLETED',
                    completedAt: {
                        gte: last7Days,
                    },
                },
            }),

            // Launched campaigns (last 7 days)
            db.campaign.count({
                where: {
                    createdAt: {
                        gte: last7Days,
                    },
                },
            }),

            // Total users
            db.user.count(),

            // Creators online today (logged in today)
            db.user.count({
                where: {
                    role: 'CREATOR',
                    lastLoginAt: {
                        gte: todayStart,
                    },
                },
            }),

            // Founders online today
            db.user.count({
                where: {
                    role: 'FOUNDER',
                    lastLoginAt: {
                        gte: todayStart,
                    },
                },
            }),

            // Pending KYC verifications
            db.creatorProfile.count({
                where: {
                    verificationStatus: 'PENDING',
                },
            }),

            // Open disputes
            db.dispute.count({
                where: {
                    status: 'PENDING',
                },
            }),

            // Today's payments
            db.payment.aggregate({
                where: {
                    createdAt: {
                        gte: todayStart,
                    },
                    status: 'COMPLETED',
                },
                _sum: {
                    amount: true,
                },
            }),

            // Last 30 days payments (GMV calculation)
            db.payment.aggregate({
                where: {
                    createdAt: {
                        gte: last30Days,
                    },
                    status: 'COMPLETED',
                    type: 'CAMPAIGN_FUNDING', // Founder payments
                },
                _sum: {
                    amount: true,
                },
            }),

            // Last 30 days refunds
            db.payment.aggregate({
                where: {
                    createdAt: {
                        gte: last30Days,
                    },
                    status: 'COMPLETED',
                    type: 'REFUND',
                },
                _sum: {
                    amount: true,
                },
            }),
        ]);

        // Calculate derived metrics
        const todayGMV = Number(todayPayments._sum.amount || 0);
        const last30DaysGMV = Number(last30DaysPayments._sum.amount || 0);
        const totalRefunds = Number(last30DaysRefunds._sum.amount || 0);

        // Tupstory revenue (1% of GMV)
        const nalaRevenue = last30DaysGMV * 0.01;

        // Creator payouts (estimated 60% of GMV)
        const creatorPayouts = last30DaysGMV * 0.6;

        // Platform fee percentage
        const platformFeePercentage = 1.0;

        // Average campaign budget (last 7 days)
        const avgBudgetResult = await db.campaign.aggregate({
            where: {
                createdAt: {
                    gte: last7Days,
                },
            },
            _avg: {
                totalBudget: true,
            },
        });
        const avgBudget = Number(avgBudgetResult._avg.totalBudget || 0);

        // Refund rate calculation
        const refundRate = last30DaysGMV > 0 ? (totalRefunds / last30DaysGMV) * 100 : 0;

        // New creator signups today
        const newCreatorsToday = await db.user.count({
            where: {
                role: 'CREATOR',
                createdAt: {
                    gte: todayStart,
                },
            },
        });

        // KYC verified today
        const kycVerifiedToday = await db.creatorProfile.count({
            where: {
                verificationStatus: 'VERIFIED',
                updatedAt: {
                    gte: todayStart,
                },
            },
        });

        // Suspended users
        const suspendedUsers = await db.user.count({
            where: {
                suspendedUntil: {
                    gt: now,
                },
            },
        });

        // System status (simplified - would integrate with actual health checks)
        const systemStatus = {
            api: 'healthy',
            database: 'healthy',
            stripe: 'connected',
            viewSync: 'healthy',
            lastSyncAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 mins ago
        };

        // Alerts (enhanced with additional types)
        const alerts = [];

        // Alert: KYC Backlog
        if (pendingKYC > 50) {
            alerts.push({
                severity: 'warning',
                type: 'KYC_BACKLOG',
                count: pendingKYC,
                message: `${pendingKYC} creators awaiting KYC verification`,
                actionItems: ['Batch Review', 'Auto-Approve', 'Send Reminders'],
            });
        }

        // Alert: Open Disputes
        if (openDisputes > 0) {
            alerts.push({
                severity: openDisputes > 5 ? 'critical' : 'warning',
                type: 'OPEN_DISPUTES',
                count: openDisputes,
                message: `${openDisputes} active disputes need attention`,
                actionItems: ['Review', 'Escalate', 'Auto-Resolve'],
            });
        }

        // Alert: Failed Payments
        const failedPayments = await db.payment.count({
            where: {
                status: 'FAILED',
                createdAt: {
                    gte: todayStart,
                },
            },
        });

        if (failedPayments > 0) {
            alerts.push({
                severity: failedPayments > 5 ? 'critical' : 'warning',
                type: 'FAILED_PAYMENTS',
                count: failedPayments,
                message: `${failedPayments} payment(s) failed today`,
                actionItems: ['Retry', 'Manual Review', 'Contact Support'],
            });
        }

        // Alert: High Refund Rate
        if (refundRate > 35) {
            alerts.push({
                severity: refundRate > 50 ? 'critical' : 'warning',
                type: 'HIGH_REFUND_RATE',
                count: Math.round(refundRate),
                message: `Refund rate at ${Math.round(refundRate)}% (target: 25-35%)`,
                actionItems: ['Analyze Campaigns', 'Review Pricing', 'Check Quality'],
            });
        }

        // Alert: Stale Campaigns
        const staleCampaigns = await db.campaign.count({
            where: {
                status: {
                    in: ['ACTIVE', 'IN_PROGRESS'],
                },
                updatedAt: {
                    lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                },
            },
        });

        if (staleCampaigns > 0) {
            alerts.push({
                severity: 'info',
                type: 'STALE_CAMPAIGNS',
                count: staleCampaigns,
                message: `${staleCampaigns} campaign(s) with no activity for 7+ days`,
                actionItems: ['Contact Founders', 'Review Status', 'Force Close'],
            });
        }

        // Alert: High Suspended User Count
        if (suspendedUsers > 10) {
            alerts.push({
                severity: 'warning',
                type: 'HIGH_SUSPENSIONS',
                count: suspendedUsers,
                message: `${suspendedUsers} users currently suspended`,
                actionItems: ['Review Cases', 'Lift Suspensions', 'Investigate'],
            });
        }

        // Alert: Low Creator Availability
        const availableCreators = await db.creatorProfile.count({
            where: {
                verificationStatus: 'VERIFIED',
                availabilityStatus: 'AVAILABLE',
            },
        });

        if (availableCreators < 20) {
            alerts.push({
                severity: 'warning',
                type: 'LOW_CREATOR_AVAILABILITY',
                count: availableCreators,
                message: `Only ${availableCreators} verified creators available`,
                actionItems: ['Recruit Creators', 'Approve Pending', 'Send Invites'],
            });
        }

        const metrics = {
            // Key metrics
            todayGMV,
            activeCampaigns,
            creatorsOnline: creatorsOnlineToday,
            foundersOnline: foundersOnlineToday,
            payoutsProcessedToday: todayGMV * 0.6, // Estimated

            // System status
            systemStatus,

            // Alerts
            alerts,
            alertCount: alerts.length,

            // Campaign activity (last 7 days)
            campaignActivity: {
                launched: launchedCampaignsLast7Days,
                completed: completedCampaignsLast7Days,
                avgBudget,
                refundRate: Math.round(refundRate * 100) / 100,
            },

            // Creator activity
            creatorActivity: {
                newSignupsToday: newCreatorsToday,
                kycVerifiedToday,
                suspended: suspendedUsers,
                totalCreators: await db.user.count({ where: { role: 'CREATOR' } }),
            },

            // Financial summary (last 30 days)
            financialSummary: {
                totalGMV: last30DaysGMV,
                nalaRevenue,
                creatorPayouts,
                founderRefunds: totalRefunds,
                platformFeePercentage,
            },

            // General stats
            totalUsers,
            pendingKYC,
            openDisputes,
        };

        // Cache for 60 seconds
        const expiresAt = new Date(now.getTime() + 60 * 1000);
        await db.adminDashboardMetric.upsert({
            where: {
                metricType_dateRange: {
                    metricType: 'overview',
                    dateRange: 'TODAY',
                },
            },
            create: {
                metricType: 'overview',
                dateRange: 'TODAY',
                metricValue: metrics,
                expiresAt,
            },
            update: {
                metricValue: metrics,
                calculatedAt: now,
                expiresAt,
            },
        });

        return ApiResponse.success(metrics);
    } catch (error) {
        console.error('Dashboard overview error:', error);
        return ApiResponse.error('Failed to fetch dashboard metrics', 500);
    }
});
