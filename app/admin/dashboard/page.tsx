"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardMetrics {
    todayGMV: number;
    activeCampaigns: number;
    creatorsOnline: number;
    foundersOnline: number;
    payoutsProcessedToday: number;
    systemStatus: {
        api: string;
        database: string;
        stripe: string;
        viewSync: string;
        lastSyncAt: Date;
    };
    alerts: Array<{
        severity: string;
        type: string;
        count: number;
        message: string;
        actionItems: string[];
    }>;
    alertCount: number;
    campaignActivity: {
        launched: number;
        completed: number;
        avgBudget: number;
        refundRate: number;
    };
    creatorActivity: {
        newSignupsToday: number;
        kycVerifiedToday: number;
        suspended: number;
        totalCreators: number;
    };
    financialSummary: {
        totalGMV: number;
        nalaRevenue: number;
        creatorPayouts: number;
        founderRefunds: number;
        platformFeePercentage: number;
    };
    totalUsers: number;
    pendingKYC: number;
    openDisputes: number;
}

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    useEffect(() => {
        fetchMetrics();

        // Auto-refresh every 60 seconds
        const interval = setInterval(() => {
            fetchMetrics();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const fetchMetrics = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/admin/dashboard/overview", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setMetrics(data);
                setLastUpdate(new Date());
            }
        } catch (error) {
            console.error("Failed to fetch metrics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">Failed to load dashboard metrics</p>
                </div>
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Last updated: {lastUpdate.toLocaleTimeString()}
                    </p>
                </div>
                <button
                    onClick={fetchMetrics}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Today&apos;s GMV</dt>
                                    <dd className="text-lg font-semibold text-gray-900">{formatCurrency(metrics.todayGMV)}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Active Campaigns</dt>
                                    <dd className="text-lg font-semibold text-gray-900">{formatNumber(metrics.activeCampaigns)}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Creators Online</dt>
                                    <dd className="text-lg font-semibold text-gray-900">{formatNumber(metrics.creatorsOnline)}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Founders Online</dt>
                                    <dd className="text-lg font-semibold text-gray-900">{formatNumber(metrics.foundersOnline)}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Status */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center">
                        <span className={`h-3 w-3 rounded-full mr-2 ${metrics.systemStatus.api === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-sm text-gray-600">API: {metrics.systemStatus.api}</span>
                    </div>
                    <div className="flex items-center">
                        <span className={`h-3 w-3 rounded-full mr-2 ${metrics.systemStatus.database === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-sm text-gray-600">Database: {metrics.systemStatus.database}</span>
                    </div>
                    <div className="flex items-center">
                        <span className={`h-3 w-3 rounded-full mr-2 ${metrics.systemStatus.stripe === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        <span className="text-sm text-gray-600">Stripe: {metrics.systemStatus.stripe}</span>
                    </div>
                    <div className="flex items-center">
                        <span className={`h-3 w-3 rounded-full mr-2 ${metrics.systemStatus.viewSync === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        <span className="text-sm text-gray-600">View Sync: {metrics.systemStatus.viewSync}</span>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {metrics.alerts.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        ⚠️ Urgent Alerts ({metrics.alertCount})
                    </h2>
                    <div className="space-y-4">
                        {metrics.alerts.map((alert, index) => (
                            <div
                                key={index}
                                className={`border-l-4 p-4 ${alert.severity === 'critical'
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-yellow-500 bg-yellow-50'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-gray-900">{alert.message}</p>
                                        <div className="mt-2 flex gap-2">
                                            {alert.actionItems.map((action, i) => (
                                                <button
                                                    key={i}
                                                    className="text-xs px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                                                >
                                                    {action}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Activity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Campaign Activity */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Activity (Last 7 Days)</h2>
                    <dl className="space-y-3">
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Launched:</dt>
                            <dd className="text-sm font-semibold text-gray-900">{metrics.campaignActivity.launched}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Completed:</dt>
                            <dd className="text-sm font-semibold text-gray-900">{metrics.campaignActivity.completed}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Avg Budget:</dt>
                            <dd className="text-sm font-semibold text-gray-900">{formatCurrency(metrics.campaignActivity.avgBudget)}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Refund Rate:</dt>
                            <dd className={`text-sm font-semibold ${metrics.campaignActivity.refundRate > 35 ? 'text-red-600' : 'text-gray-900'}`}>
                                {metrics.campaignActivity.refundRate}%
                            </dd>
                        </div>
                    </dl>
                </div>

                {/* Creator Activity */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Creator Activity</h2>
                    <dl className="space-y-3">
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">New Signups Today:</dt>
                            <dd className="text-sm font-semibold text-gray-900">{metrics.creatorActivity.newSignupsToday}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">KYC Verified Today:</dt>
                            <dd className="text-sm font-semibold text-gray-900">{metrics.creatorActivity.kycVerifiedToday}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Suspended:</dt>
                            <dd className="text-sm font-semibold text-gray-900">{metrics.creatorActivity.suspended}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Total Creators:</dt>
                            <dd className="text-sm font-semibold text-gray-900">{formatNumber(metrics.creatorActivity.totalCreators)}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary (Last 30 Days)</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                        <p className="text-xs text-gray-500">Total GMV</p>
                        <p className="text-lg font-semibold text-gray-900">{formatCurrency(metrics.financialSummary.totalGMV)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Tupstory Revenue</p>
                        <p className="text-lg font-semibold text-green-600">{formatCurrency(metrics.financialSummary.nalaRevenue)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Creator Payouts</p>
                        <p className="text-lg font-semibold text-gray-900">{formatCurrency(metrics.financialSummary.creatorPayouts)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Founder Refunds</p>
                        <p className="text-lg font-semibold text-gray-900">{formatCurrency(metrics.financialSummary.founderRefunds)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Platform Fee</p>
                        <p className="text-lg font-semibold text-gray-900">{metrics.financialSummary.platformFeePercentage}%</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                    href="/admin/disputes"
                    className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Open Disputes</p>
                            <p className="text-2xl font-bold text-gray-900">{metrics.openDisputes}</p>
                        </div>
                        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </Link>

                <Link
                    href="/admin/creators?kycStatus=PENDING"
                    className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending KYC</p>
                            <p className="text-2xl font-bold text-gray-900">{metrics.pendingKYC}</p>
                        </div>
                        <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </Link>

                <Link
                    href="/admin/creators"
                    className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalUsers)}</p>
                        </div>
                        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                </Link>
            </div>
        </div>
    );
}
