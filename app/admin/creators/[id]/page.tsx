"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface CreatorDetail {
    creatorId: string;
    userInfo: {
        email: string;
        fullName: string;
        joinedDate: string;
        lastLogin: string | null;
        status: string;
    };
    kycVerification: {
        status: string;
        identityVerified: boolean;
        addressVerified: boolean;
        sanctionCheck: string;
        verifiedAt: string | null;
    };
    socialAccounts: Array<{
        platform: string;
        username: string;
        followers: number;
        verified: boolean;
        connectedAt: string;
    }>;
    stripeConnect: {
        accountId: string | null;
        accountHolder: string;
        status: string;
    };
    earnings: {
        totalEarnings: number;
        lifetimeBaseFees: number;
        lifetimeBonuses: number;
        availableBalance: number;
        pending: number;
        lastPayout: {
            amount: number;
            date: string;
        } | null;
    };
    campaigns: {
        total: number;
        completionRate: number;
        avgViews: number;
        avgBaseFee: number;
    };
    performance: {
        avgRating: number;
        contentApprovalRate: number;
        onTimePostingRate: number;
        latePostIncidents: number;
        disputeCount: number;
    };
    activityLog: Array<{
        timestamp: string;
        action: string;
        details: string;
    }>;
    adminNotes: string;
    suspension: {
        until: string;
        reason: string;
    } | null;
    ban: {
        reason: string;
    } | null;
    profile: {
        bio: string | null;
        categories: any;
        portfolioVideos: any;
        baseRates: {
            tiktok: number;
            instagram: number;
            facebook: number;
        };
    };
}

export default function CreatorDetailPage() {
    const params = useParams();
    const router = useRouter();
    const creatorId = params.id as string;

    const [creator, setCreator] = useState<CreatorDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Form states
    const [kycDecision, setKycDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
    const [kycReason, setKycReason] = useState('');
    const [suspendDays, setSuspendDays] = useState('30');
    const [suspendReason, setSuspendReason] = useState('');
    const [banReason, setBanReason] = useState('');
    const [adjustAmount, setAdjustAmount] = useState('');
    const [adjustReason, setAdjustReason] = useState<'ERROR_CORRECTION' | 'DISPUTE_RESOLUTION' | 'COMPENSATION'>('ERROR_CORRECTION');
    const [adjustNotes, setAdjustNotes] = useState('');
    const [payoutAmount, setPayoutAmount] = useState('');
    const [payoutReason, setPayoutReason] = useState('');
    const [adminNotes, setAdminNotes] = useState('');

    const fetchCreatorDetail = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/admin/creators/${creatorId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCreator(data);
                setAdminNotes(data.adminNotes || '');
            } else {
                alert('Failed to load creator details');
                router.push('/admin/creators');
            }
        } catch (error) {
            console.error("Failed to fetch creator:", error);
            alert('Error loading creator');
        } finally {
            setLoading(false);
        }
    }, [creatorId, router]);

    useEffect(() => {
        fetchCreatorDetail();
    }, [fetchCreatorDetail]);

    const handleKYCVerification = async () => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/admin/creators/${creatorId}/verify-kyc`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    approvalStatus: kycDecision,
                    reason: kycReason || undefined,
                }),
            });

            if (response.ok) {
                alert(`KYC ${kycDecision.toLowerCase()} successfully!`);
                setActiveModal(null);
                fetchCreatorDetail();
            } else {
                const error = await response.json();
                alert(`Failed: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('KYC verification error:', error);
            alert('Error processing KYC verification');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSuspend = async () => {
        if (!suspendReason || suspendReason.length < 10) {
            alert('Please provide a reason (at least 10 characters)');
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/admin/creators/${creatorId}/suspend`, {
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
                alert('Creator suspended successfully!');
                setActiveModal(null);
                fetchCreatorDetail();
            } else {
                const error = await response.json();
                alert(`Failed: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Suspend error:', error);
            alert('Error suspending creator');
        } finally {
            setActionLoading(false);
        }
    };

    const handleBan = async () => {
        if (!banReason || banReason.length < 10) {
            alert('Please provide a reason (at least 10 characters)');
            return;
        }

        if (!confirm('Are you sure you want to PERMANENTLY BAN this creator? This action cannot be undone.')) {
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/admin/creators/${creatorId}/ban`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    reason: banReason,
                    refundPendingEarnings: true,
                }),
            });

            if (response.ok) {
                alert('Creator banned successfully!');
                setActiveModal(null);
                fetchCreatorDetail();
            } else {
                const error = await response.json();
                alert(`Failed: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Ban error:', error);
            alert('Error banning creator');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAdjustEarnings = async () => {
        if (!adjustAmount || !adjustNotes || adjustNotes.length < 10) {
            alert('Please provide amount and notes (at least 10 characters)');
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/admin/creators/${creatorId}/adjust-earnings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    adjustmentAmount: parseFloat(adjustAmount),
                    reason: adjustReason,
                    notes: adjustNotes,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.requiresApproval
                    ? 'Adjustment created and pending approval!'
                    : 'Earnings adjusted successfully!');
                setActiveModal(null);
                fetchCreatorDetail();
            } else {
                const error = await response.json();
                alert(`Failed: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Adjust earnings error:', error);
            alert('Error adjusting earnings');
        } finally {
            setActionLoading(false);
        }
    };

    const handleForcePayout = async () => {
        if (!payoutReason || payoutReason.length < 10) {
            alert('Please provide a reason (at least 10 characters)');
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/admin/creators/${creatorId}/force-payout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    amount: payoutAmount ? parseFloat(payoutAmount) : undefined,
                    reason: payoutReason,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Payout of $${data.amount} initiated successfully!`);
                setActiveModal(null);
                fetchCreatorDetail();
            } else {
                const error = await response.json();
                alert(`Failed: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Force payout error:', error);
            alert('Error processing payout');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveNotes = async () => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/admin/creators/${creatorId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    adminNotes,
                }),
            });

            if (response.ok) {
                alert('Admin notes saved successfully!');
            } else {
                const error = await response.json();
                alert(`Failed: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Save notes error:', error);
            alert('Error saving notes');
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
                    <p className="mt-4 text-gray-600">Loading creator details...</p>
                </div>
            </div>
        );
    }

    if (!creator) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">Creator not found</p>
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
                        href="/admin/creators"
                        className="text-sm text-red-600 hover:text-red-800 mb-2 inline-block"
                    >
                        ← Back to Creators
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {creator.userInfo.fullName}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">{creator.userInfo.email}</p>
                </div>
                <div className="flex gap-2">
                    {creator.kycVerification.status === 'PENDING' && (
                        <button
                            onClick={() => setActiveModal('kyc')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Verify KYC
                        </button>
                    )}
                    {creator.userInfo.status === 'ACTIVE' && (
                        <button
                            onClick={() => setActiveModal('suspend')}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                        >
                            Suspend
                        </button>
                    )}
                    {creator.userInfo.status !== 'BANNED' && (
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
            {creator.suspension && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="font-semibold text-yellow-800">⚠️ Account Suspended</p>
                    <p className="text-sm text-yellow-700 mt-1">
                        Until: {formatDate(creator.suspension.until)}
                    </p>
                    <p className="text-sm text-yellow-700">Reason: {creator.suspension.reason}</p>
                </div>
            )}

            {creator.ban && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="font-semibold text-red-800">🚫 Account Banned</p>
                    <p className="text-sm text-red-700 mt-1">Reason: {creator.ban.reason}</p>
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
                                <dt className="text-sm text-gray-500">Creator ID</dt>
                                <dd className="text-sm font-mono text-gray-900">{creator.creatorId.slice(0, 8)}...</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Joined Date</dt>
                                <dd className="text-sm text-gray-900">{formatDate(creator.userInfo.joinedDate)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Last Login</dt>
                                <dd className="text-sm text-gray-900">{formatDate(creator.userInfo.lastLogin)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Status</dt>
                                <dd>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${creator.userInfo.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                        creator.userInfo.status === 'SUSPENDED' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {creator.userInfo.status}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* KYC Verification */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">KYC Verification</h2>
                        <dl className="space-y-3">
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Status:</dt>
                                <dd>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${creator.kycVerification.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                                        creator.kycVerification.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {creator.kycVerification.status}
                                    </span>
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Identity Verified:</dt>
                                <dd className="text-sm">{creator.kycVerification.identityVerified ? '✅ Yes' : '❌ No'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Address Verified:</dt>
                                <dd className="text-sm">{creator.kycVerification.addressVerified ? '✅ Yes' : '❌ No'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Sanction Check:</dt>
                                <dd className="text-sm">{creator.kycVerification.sanctionCheck}</dd>
                            </div>
                            {creator.kycVerification.verifiedAt && (
                                <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Verified At:</dt>
                                    <dd className="text-sm">{formatDate(creator.kycVerification.verifiedAt)}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Social Accounts */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Accounts</h2>
                        <div className="space-y-3">
                            {creator.socialAccounts.map((account, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                    <div>
                                        <p className="font-medium text-gray-900">{account.platform}</p>
                                        <p className="text-sm text-gray-500">@{account.username}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold">{(account.followers / 1000).toFixed(1)}K followers</p>
                                        <p className="text-xs text-gray-500">
                                            {account.verified ? '✅ Verified' : '⏳ Pending'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Earnings Summary */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Earnings Summary</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveModal('adjust')}
                                    className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Adjust Earnings
                                </button>
                                <button
                                    onClick={() => setActiveModal('payout')}
                                    className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Force Payout
                                </button>
                            </div>
                        </div>
                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm text-gray-500">Total Earnings</dt>
                                <dd className="text-lg font-semibold text-gray-900">
                                    {formatCurrency(creator.earnings.totalEarnings)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Available Balance</dt>
                                <dd className="text-lg font-semibold text-green-600">
                                    {formatCurrency(creator.earnings.availableBalance)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Lifetime Base Fees</dt>
                                <dd className="text-sm text-gray-900">
                                    {formatCurrency(creator.earnings.lifetimeBaseFees)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Lifetime Bonuses</dt>
                                <dd className="text-sm text-gray-900">
                                    {formatCurrency(creator.earnings.lifetimeBonuses)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Pending</dt>
                                <dd className="text-sm text-yellow-600">
                                    {formatCurrency(creator.earnings.pending)}
                                </dd>
                            </div>
                            {creator.earnings.lastPayout && (
                                <div>
                                    <dt className="text-sm text-gray-500">Last Payout</dt>
                                    <dd className="text-sm text-gray-900">
                                        {formatCurrency(creator.earnings.lastPayout.amount)} on{' '}
                                        {formatDate(creator.earnings.lastPayout.date)}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Campaign History */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign History</h2>
                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm text-gray-500">Total Campaigns</dt>
                                <dd className="text-lg font-semibold text-gray-900">{creator.campaigns.total}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Completion Rate</dt>
                                <dd className="text-lg font-semibold text-gray-900">{creator.campaigns.completionRate}%</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Avg Views</dt>
                                <dd className="text-sm text-gray-900">{creator.campaigns.avgViews.toLocaleString()}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Avg Base Fee</dt>
                                <dd className="text-sm text-gray-900">{formatCurrency(creator.campaigns.avgBaseFee)}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Performance Metrics */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm text-gray-500">Avg Rating</dt>
                                <dd className="text-lg font-semibold text-yellow-600">
                                    ⭐ {creator.performance.avgRating.toFixed(1)}/5.0
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Content Approval Rate</dt>
                                <dd className="text-sm text-gray-900">{creator.performance.contentApprovalRate}%</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">On-Time Posting Rate</dt>
                                <dd className="text-sm text-gray-900">{creator.performance.onTimePostingRate}%</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Late Post Incidents</dt>
                                <dd className="text-sm text-gray-900">{creator.performance.latePostIncidents}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Dispute Count</dt>
                                <dd className="text-sm text-gray-900">{creator.performance.disputeCount}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Stripe Connect */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Bank Account</h2>
                        <dl className="space-y-3">
                            <div>
                                <dt className="text-sm text-gray-500">Stripe Account</dt>
                                <dd className="text-sm font-mono text-gray-900">
                                    {creator.stripeConnect.accountId || 'Not connected'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Status</dt>
                                <dd>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${creator.stripeConnect.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {creator.stripeConnect.status}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Admin Notes */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h2>
                        <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                            placeholder="Internal notes about this creator..."
                        />
                        <button
                            onClick={handleSaveNotes}
                            disabled={actionLoading}
                            className="mt-2 w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                            {actionLoading ? 'Saving...' : 'Save Notes'}
                        </button>
                    </div>

                    {/* Activity Log */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {creator.activityLog.map((log, idx) => (
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
            {activeModal === 'kyc' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">KYC Verification</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Decision
                                </label>
                                <select
                                    value={kycDecision}
                                    onChange={(e) => setKycDecision(e.target.value as 'APPROVED' | 'REJECTED')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="APPROVED">Approve</option>
                                    <option value="REJECTED">Reject</option>
                                </select>
                            </div>
                            {kycDecision === 'REJECTED' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Reason (optional)
                                    </label>
                                    <textarea
                                        value={kycReason}
                                        onChange={(e) => setKycReason(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="Reason for rejection..."
                                    />
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button
                                    onClick={handleKYCVerification}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                    {actionLoading ? 'Processing...' : 'Confirm'}
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

            {activeModal === 'suspend' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Suspend Creator</h3>
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
                        <h3 className="text-lg font-semibold mb-4 text-red-600">⚠️ Ban Creator (Permanent)</h3>
                        <div className="space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded p-3">
                                <p className="text-sm text-red-800">
                                    This action is <strong>permanent</strong> and cannot be undone. All active campaigns will be cancelled.
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

            {activeModal === 'adjust' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Adjust Earnings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={adjustAmount}
                                    onChange={(e) => setAdjustAmount(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Positive or negative amount"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason
                                </label>
                                <select
                                    value={adjustReason}
                                    onChange={(e) => setAdjustReason(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="ERROR_CORRECTION">Error Correction</option>
                                    <option value="DISPUTE_RESOLUTION">Dispute Resolution</option>
                                    <option value="COMPENSATION">Compensation</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes (required, min 10 chars)
                                </label>
                                <textarea
                                    value={adjustNotes}
                                    onChange={(e) => setAdjustNotes(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Detailed explanation..."
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAdjustEarnings}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {actionLoading ? 'Processing...' : 'Adjust'}
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

            {activeModal === 'payout' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Force Payout</h3>
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                <p className="text-sm text-blue-800">
                                    Available balance: <strong>{formatCurrency(creator.earnings.availableBalance)}</strong>
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={payoutAmount}
                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Leave empty for full balance"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason (required, min 10 chars)
                                </label>
                                <textarea
                                    value={payoutReason}
                                    onChange={(e) => setPayoutReason(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Reason for immediate payout..."
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleForcePayout}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                    {actionLoading ? 'Processing...' : 'Process Payout'}
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
