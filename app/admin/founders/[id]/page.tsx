"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface FounderDetail {
    founderId: string;
    userInfo: {
        email: string;
        fullName: string;
        companyName: string;
        joinedDate: string;
        lastLogin: string | null;
        status: string;
        tier: string;
    };
    financials: {
        totalSpending: number;
        totalRefunds: number;
        lastPayment: {
            amount: number;
            date: string;
        } | null;
        stripeCustomerId: string | null;
    };
    campaignStats: {
        total: number;
        active: number;
        completed: number;
    };
    recentCampaigns: Array<{
        id: string;
        name: string;
        status: string;
        budget: number;
        createdAt: string;
        videoCount: number;
        applicationCount: number;
    }>;
    recentPayments: Array<{
        id: string;
        amount: number;
        type: string;
        status: string;
        createdAt: string;
    }>;
    activityLog: Array<{
        timestamp: string;
        action: string;
        details: string;
    }>;
    suspension: {
        until: string;
        reason: string;
    } | null;
    ban: {
        reason: string;
    } | null;
}

export default function FounderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const founderId = params.id as string;

    const [founder, setFounder] = useState<FounderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Form states
    const [suspendDays, setSuspendDays] = useState('30');
    const [suspendReason, setSuspendReason] = useState('');
    const [banReason, setBanReason] = useState('');
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReason, setRefundReason] = useState('');

    const fetchFounderDetail = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/admin/founders/${founderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setFounder(data);
            } else {
                alert('Failed to load founder details');
                router.push('/admin/founders');
            }
        } catch (error) {
            console.error("Failed to fetch founder:", error);
            alert('Error loading founder');
        } finally {
            setLoading(false);
        }
    }, [founderId, router]);

    useEffect(() => {
        fetchFounderDetail();
    }, [fetchFounderDetail]);

    const handleSuspend = async () => {
        if (!suspendReason || suspendReason.length < 10) {
            alert('Please provide a reason (at least 10 characters)');
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/admin/founders/${founderId}/suspend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    reason: suspendReason,
                    durationDays: suspendDays ? parseInt(suspendDays) : undefined,
                }),
            });

            if (response.ok) {
                alert('Founder suspended successfully!');
                setActiveModal(null);
                fetchFounderDetail();
            } else {
                const error = await response.json();
                alert(`Failed: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Suspend error:', error);
            alert('Error suspending founder');
        } finally {
            setActionLoading(false);
        }
    };

    const handleBan = async () => {
        if (!banReason || banReason.length < 10) {
            alert('Please provide a reason (at least 10 characters)');
            return;
        }

        if (!confirm('Are you sure you want to PERMANENTLY BAN this founder? This action cannot be undone.')) {
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/admin/founders/${founderId}/ban`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    reason: banReason,
                }),
            });

            if (response.ok) {
                alert('Founder banned successfully!');
                setActiveModal(null);
                fetchFounderDetail();
            } else {
                const error = await response.json();
                alert(`Failed: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Ban error:', error);
            alert('Error banning founder');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRefund = async () => {
        if (!refundAmount || !refundReason || refundReason.length < 10) {
            alert('Please provide amount and reason (at least 10 characters)');
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/admin/founders/${founderId}/force-refund`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    amount: parseFloat(refundAmount),
                    reason: refundReason,
                }),
            });

            if (response.ok) {
                alert('Refund processed successfully!');
                setActiveModal(null);
                fetchFounderDetail();
            } else {
                const error = await response.json();
                alert(`Failed: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Refund error:', error);
            alert('Error processing refund');
        } finally {
            setActionLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading founder details...</p>
                </div>
            </div>
        );
    }

    if (!founder) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">Founder not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <Link
                        href="/admin/founders"
                        className="text-sm text-red-600 hover:text-red-800 mb-2 inline-block"
                    >
                        ← Back to Founders
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {founder.userInfo.companyName || founder.userInfo.fullName}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">{founder.userInfo.email}</p>
                </div>
                <div className="flex gap-2">
                    {founder.userInfo.status === 'ACTIVE' && (
                        <button
                            onClick={() => setActiveModal('suspend')}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                        >
                            Suspend
                        </button>
                    )}
                    {founder.userInfo.status !== 'BANNED' && (
                        <button
                            onClick={() => setActiveModal('ban')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Ban
                        </button>
                    )}
                </div>
            </div>

            {/* Status Alerts */}
            {founder.suspension && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="font-semibold text-yellow-800">⚠️ Account Suspended</p>
                    <p className="text-sm text-yellow-700 mt-1">
                        Until: {formatDate(founder.suspension.until)}
                    </p>
                    <p className="text-sm text-yellow-700">Reason: {founder.suspension.reason}</p>
                </div>
            )}

            {founder.ban && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="font-semibold text-red-800">🚫 Account Banned</p>
                    <p className="text-sm text-red-700 mt-1">Reason: {founder.ban.reason}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Information */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm text-gray-500">Founder ID</dt>
                                <dd className="text-sm font-mono text-gray-900">{founder.founderId.slice(0, 8)}...</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Contact Name</dt>
                                <dd className="text-sm text-gray-900">{founder.userInfo.fullName}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Joined Date</dt>
                                <dd className="text-sm text-gray-900">{formatDate(founder.userInfo.joinedDate)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Last Login</dt>
                                <dd className="text-sm text-gray-900">{formatDate(founder.userInfo.lastLogin)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Tier</dt>
                                <dd>
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                        {founder.userInfo.tier}
                                    </span>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Status</dt>
                                <dd>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${founder.userInfo.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                        founder.userInfo.status === 'SUSPENDED' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {founder.userInfo.status}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Financial Summary</h2>
                            <button
                                onClick={() => setActiveModal('refund')}
                                className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Force Refund
                            </button>
                        </div>
                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm text-gray-500">Total Spending</dt>
                                <dd className="text-lg font-semibold text-gray-900">
                                    {formatCurrency(founder.financials.totalSpending)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Total Refunds</dt>
                                <dd className="text-lg font-semibold text-red-600">
                                    {formatCurrency(founder.financials.totalRefunds)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Stripe Customer ID</dt>
                                <dd className="text-sm font-mono text-gray-900">
                                    {founder.financials.stripeCustomerId || 'Not connected'}
                                </dd>
                            </div>
                            {founder.financials.lastPayment && (
                                <div>
                                    <dt className="text-sm text-gray-500">Last Payment</dt>
                                    <dd className="text-sm text-gray-900">
                                        {formatCurrency(founder.financials.lastPayment.amount)} on{' '}
                                        {formatDate(founder.financials.lastPayment.date)}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Recent Campaigns */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Campaigns</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stats</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {founder.recentCampaigns.map((campaign) => (
                                        <tr key={campaign.id}>
                                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{campaign.name}</td>
                                            <td className="px-4 py-2 text-sm">
                                                <span className={`px-2 py-1 text-xs rounded-full ${campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                    campaign.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {campaign.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(campaign.budget)}</td>
                                            <td className="px-4 py-2 text-xs text-gray-500">
                                                {campaign.applicationCount} apps, {campaign.videoCount} videos
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Campaign Stats */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Stats</h2>
                        <dl className="space-y-3">
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Total Campaigns</dt>
                                <dd className="text-sm font-semibold">{founder.campaignStats.total}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Active</dt>
                                <dd className="text-sm font-semibold text-green-600">{founder.campaignStats.active}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Completed</dt>
                                <dd className="text-sm font-semibold text-blue-600">{founder.campaignStats.completed}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Activity Log */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {founder.activityLog.map((log, idx) => (
                                <div key={idx} className="text-sm border-l-2 border-gray-200 pl-3">
                                    <p className="font-medium text-gray-900">{log.action}</p>
                                    <p className="text-xs text-gray-500">{log.details}</p>
                                    <p className="text-xs text-gray-400">{formatDate(log.timestamp)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {activeModal === 'suspend' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Suspend Founder</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Duration (days)
                                </label>
                                <input
                                    type="number"
                                    value={suspendDays}
                                    onChange={(e) => setSuspendDays(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Leave empty for indefinite"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason (required, min 10 chars)
                                </label>
                                <textarea
                                    value={suspendReason}
                                    onChange={(e) => setSuspendReason(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Reason for suspension..."
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSuspend}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                                >
                                    {actionLoading ? 'Processing...' : 'Suspend'}
                                </button>
                                <button
                                    onClick={() => setActiveModal(null)}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'ban' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4 text-red-600">⚠️ Ban Founder (Permanent)</h3>
                        <div className="space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded p-3">
                                <p className="text-sm text-red-800">
                                    This action is <strong>permanent</strong>. All active campaigns will be cancelled.
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason (required, min 10 chars)
                                </label>
                                <textarea
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Reason for permanent ban..."
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleBan}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                >
                                    {actionLoading ? 'Processing...' : 'Confirm Ban'}
                                </button>
                                <button
                                    onClick={() => setActiveModal(null)}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'refund' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Force Refund</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Amount to refund"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason (required, min 10 chars)
                                </label>
                                <textarea
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Reason for refund..."
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleRefund}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                >
                                    {actionLoading ? 'Processing...' : 'Process Refund'}
                                </button>
                                <button
                                    onClick={() => setActiveModal(null)}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
