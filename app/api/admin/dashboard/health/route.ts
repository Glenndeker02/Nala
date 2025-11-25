import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, requireRole } from "@/lib/api-middleware";

/**
 * GET /api/admin/dashboard/health
 * Real-time system health monitoring
 */
export const GET = requireRole('ADMIN', async (request: NextRequest) => {
    try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        // Database Health Check
        const dbStartTime = Date.now();
        try {
            await db.$queryRaw`SELECT 1`;
            var dbStatus = 'healthy';
            var dbResponseTime = Date.now() - dbStartTime;
        } catch (error) {
            var dbStatus = 'down';
            var dbResponseTime = -1;
        }

        // Stripe Connectivity Check
        const stripeConnected = !!process.env.STRIPE_SECRET_KEY;
        const stripeStatus = stripeConnected ? 'connected' : 'not_configured';

        // API Error Rate (last hour)
        const totalRequests = await db.adminAuditLog.count({
            where: {
                createdAt: {
                    gte: oneHourAgo,
                },
            },
        });

        const failedRequests = await db.adminAuditLog.count({
            where: {
                createdAt: {
                    gte: oneHourAgo,
                },
                action: {
                    contains: 'ERROR',
                },
            },
        });

        const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;

        // View Sync Status
        const lastViewSync = await db.viewSnapshot.findFirst({
            orderBy: {
                snapshotAt: 'desc',
            },
        });

        const minutesSinceLastSync = lastViewSync
            ? Math.floor((now.getTime() - lastViewSync.snapshotAt.getTime()) / (1000 * 60))
            : null;

        const viewSyncStatus = !lastViewSync
            ? 'unknown'
            : minutesSinceLastSync! < 30
                ? 'healthy'
                : minutesSinceLastSync! < 60
                    ? 'degraded'
                    : 'down';

        // Payment Processing Health
        const recentPayments = await db.payment.findMany({
            where: {
                createdAt: {
                    gte: oneHourAgo,
                },
            },
            select: {
                status: true,
            },
        });

        const paymentSuccessRate = recentPayments.length > 0
            ? (recentPayments.filter(p => p.status === 'COMPLETED').length / recentPayments.length) * 100
            : 100;

        const paymentStatus = paymentSuccessRate >= 95
            ? 'healthy'
            : paymentSuccessRate >= 85
                ? 'degraded'
                : 'down';

        // Overall System Status
        const criticalServicesHealthy = dbStatus === 'healthy' && paymentStatus !== 'down';
        const overallStatus = !criticalServicesHealthy
            ? 'down'
            : (viewSyncStatus === 'degraded' || paymentStatus === 'degraded')
                ? 'degraded'
                : 'operational';

        return ApiResponse.success({
            status: overallStatus,
            timestamp: now,
            services: {
                database: {
                    status: dbStatus,
                    responseTime: dbResponseTime,
                    message: dbStatus === 'healthy'
                        ? `Responding in ${dbResponseTime}ms`
                        : 'Database connection failed',
                },
                stripe: {
                    status: stripeStatus,
                    message: stripeConnected
                        ? 'Stripe API key configured'
                        : 'Stripe not configured',
                },
                viewSync: {
                    status: viewSyncStatus,
                    lastSync: lastViewSync?.snapshotAt || null,
                    minutesSinceLastSync,
                    message: !lastViewSync
                        ? 'No sync data available'
                        : minutesSinceLastSync! < 30
                            ? `Last synced ${minutesSinceLastSync} minutes ago`
                            : `Warning: Last sync was ${minutesSinceLastSync} minutes ago`,
                },
                api: {
                    status: errorRate < 5 ? 'healthy' : errorRate < 10 ? 'degraded' : 'down',
                    errorRate: Math.round(errorRate * 100) / 100,
                    totalRequests,
                    failedRequests,
                    message: `${Math.round(errorRate * 100) / 100}% error rate (last hour)`,
                },
                payments: {
                    status: paymentStatus,
                    successRate: Math.round(paymentSuccessRate * 100) / 100,
                    totalProcessed: recentPayments.length,
                    message: `${Math.round(paymentSuccessRate * 100) / 100}% success rate (last hour)`,
                },
            },
            metrics: {
                databaseResponseTime: dbResponseTime,
                apiErrorRate: errorRate,
                paymentSuccessRate,
                viewSyncDelay: minutesSinceLastSync,
            },
        });
    } catch (error) {
        console.error('Health check error:', error);
        return ApiResponse.success({
            status: 'down',
            timestamp: new Date(),
            error: 'Health check failed',
        });
    }
});
