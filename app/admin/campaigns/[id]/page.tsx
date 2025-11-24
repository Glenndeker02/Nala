"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface CampaignDetail {
    id: string;
    name: string;
    brandName: string;
    description: string;
    status: string;
    platform: string[];
    budget: number;
    deadline: string;
    createdAt: string;

    founder: {
        id: string;
        name: string;
        company: string;
        email: string;
        tier: string;
    };

    stats: {
        totalApplications: number;
        totalVideos: number;
        approvedVideos: number;
        postedVideos: number;
        rejectedVideos: number;
        disputes: number;
    };

    videos: Array<{
        id: string;
        title: string;
        status: string;
        videoUrl: string;
        thumbnailUrl: string;
        creatorName: string;
        submittedAt: string;
    }>;

    recentApplications: Array<{
        id: string;
        creatorName: string;
        status: string;
        appliedAt: string;
    }>;

    activeDisputes: Array<{
        id: string;
        status: string;
        category: string;
        createdAt: string;
    }>;

    activityLog: Array<{
        timestamp: string;
        action: string;
        details: string;
    }>;
}

export default function CampaignDetailPage() {
    const params = useParams();
    const router = useRouter();
    const campaignId = params.id as string;

    const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Form states
    const [pauseReason, setPauseReason] = useState('');
    const [cancelReason, setCancelReason] = useState('');
    const [settleReason, setSettleReason] = useState('');
    const [refundBudget, setRefundBudget] = useState(true);

    const fetchCampaignDetail = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCampaign(data);
            } else {
                alert('Failed to load campaign details');
                router.push('/admin/campaigns');
            }
        } catch (error) {
            console.error("Failed to fetch campaign:", error);
            alert('Error loading campaign');
        } finally {
            setLoading(false);
        }
    }, [campaignId, router]);

    useEffect(() => {
        fetchCampaignDetail();
    }, [fetchCampaignDetail]);

    const handlePauseResume = async (action: 'PAUSE' | 'RESUME') => {
        if (!pauseReason || pauseReason.length < 10) {
            alert('Please provide a reason (at least 10 characters)');
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/admin/campaigns/${campaignId}/pause`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    action,
                    reason: pauseReason,
                }),
            });

            if (response.ok) {
                alert(`Campaign ${action === 'PAUSE' ? 'paused' : 'resumed'} successfully!`);
                setActiveModal(null);
                fetchCampaignDetail();
            } else {
                const error = await response.json();
                alert(`Failed: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Pause/Resume error:', error);
            alert('Error updating campaign status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!cancelReason || cancelReason.length < 10) {
            alert('Please provide a reason (at least 10 characters)');
            return;
        }

        if (!confirm('Are you sure you want to CANCEL this campaign? This action cannot be undone.')) {
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/admin/campaigns/${campaignId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    reason: cancelReason,
                    refundBudget,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Campaign cancelled! Refund amount: $${data.refundAmount}`);
                setActiveModal(null);
                fetchCampaignDetail();
            } else {
                const error = await response.json();
                alert(`Failed: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Cancel error:', error);
            alert('Error cancelling campaign');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSettle = async () => {
        if (!settleReason || settleReason.length < 10) {
            alert('Please provide a reason (at least 10 characters)');
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/admin/campaigns/${campaignId}/force-settlement`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    reason: settleReason,
                }),
            });

            if (response.ok) {
                alert('Campaign marked as completed!');
                setActiveModal(null);
                fetchCampaignDetail();
            } else {
                const error = await response.json();
                alert(`Failed: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Settle error:', error);
            alert('Error settling campaign');
        } finally {
            setActionLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
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
                    <p className="mt-4 text-gray-600">Loading campaign details...</p>
                </div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">Campaign not found</p>
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
                        href="/admin/campaigns"
                        className="text-sm text-red-600 hover:text-red-800 mb-2 inline-block"
                    >
                        ← Back to Campaigns
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {campaign.name}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        by {campaign.brandName} • Created {formatDate(campaign.createdAt)}
                    </p>
                </div>
                <div className="flex gap-2">
                    {campaign.status === 'ACTIVE' && (
                        <button
                            onClick={() => setActiveModal('pause')}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                        >
                            Pause
                        </button>
                    )}
                    {campaign.status === 'PAUSED' && (
                        <button
                            onClick={() => setActiveModal('resume')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Resume
                        </button>
                    )}
                    {['ACTIVE', 'PAUSED', 'IN_PROGRESS'].includes(campaign.status) && (
                        <>
                            <button
                                onClick={() => setActiveModal('cancel')}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setActiveModal('settle')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Force Complete
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Status Alerts */}
            {campaign.status === 'PAUSED' && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="font-semibold text-yellow-800">⏸️ Campaign Paused</p>
                    <p className="text-sm text-yellow-700 mt-1">
                        This campaign is currently paused and not accepting new applications.
                    </p>
                </div>
            )}

            {campaign.status === 'CANCELLED' && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="font-semibold text-red-800">🚫 Campaign Cancelled</p>
                    <p className="text-sm text-red-700 mt-1">
                        This campaign has been cancelled.
                    </p>
                </div>
            )}

            {campaign.activeDisputes.length > 0 && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="font-semibold text-red-800">⚠️ Active Disputes ({campaign.activeDisputes.length})</p>
                    <div className="mt-2 space-y-1">
                        {campaign.activeDisputes.map((d) => (
                            <div key={d.id} className="text-sm text-red-700 flex justify-between">
                                <span>{d.category}</span>
                                <span>{formatDate(d.createdAt)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Campaign Details */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h2>
                        <dl className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <dt className="text-sm text-gray-500">Description</dt>
                                <dd className="text-sm text-gray-900 mt-1">{campaign.description}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Budget</dt>
                                <dd className="text-lg font-semibold text-gray-900">{formatCurrency(campaign.budget)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Deadline</dt>
                                <dd className="text-lg font-semibold text-gray-900">{formatDate(campaign.deadline)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Platforms</dt>
                                <dd className="flex gap-2 mt-1">
                                    {campaign.platform.map(p => (
                                        <span key={p} className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                                            {p}
                                        </span>
                                    ))}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Status</dt>
                                <dd>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                        campaign.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {campaign.status}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Video Submissions */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Video Submissions</h2>
                        {campaign.videos.length === 0 ? (
                            <p className="text-gray-500 text-sm">No videos submitted yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {campaign.videos.map((video) => (
                                    <div key={video.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                                        <div className="w-32 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
                                            {video.thumbnailUrl ? (
                                                <Image
                                                    src={video.thumbnailUrl}
                                                    alt={video.title}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Thumb</div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-medium text-gray-900">{video.title}</h3>
                                                <span className={`px-2 py-0.5 text-xs rounded-full ${video.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                    video.status === 'POSTED' ? 'bg-blue-100 text-blue-800' :
                                                        video.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {video.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">by {video.creatorName}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-xs text-gray-400">{formatDate(video.submittedAt)}</span>
                                                <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-red-600 hover:text-red-800">
                                                    View Video
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Founder Info */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Founder Information</h2>
                        <dl className="space-y-3">
                            <div>
                                <dt className="text-sm text-gray-500">Name</dt>
                                <dd className="text-sm font-medium text-gray-900">{campaign.founder.name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Company</dt>
                                <dd className="text-sm text-gray-900">{campaign.founder.company}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Email</dt>
                                <dd className="text-sm text-gray-900">{campaign.founder.email}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Tier</dt>
                                <dd>
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                        {campaign.founder.tier}
                                    </span>
                                </dd>
                            </div>
                            <div className="pt-2">
                                <Link
                                    href={`/admin/founders/${campaign.founder.id}`}
                                    className="text-sm text-red-600 hover:text-red-800"
                                >
                                    View Founder Profile →
                                </Link>
                            </div>
                        </dl>
                    </div>

                    {/* Campaign Stats */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
                        <dl className="space-y-3">
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Applications</dt>
                                <dd className="text-sm font-semibold">{campaign.stats.totalApplications}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Total Videos</dt>
                                <dd className="text-sm font-semibold">{campaign.stats.totalVideos}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Approved</dt>
                                <dd className="text-sm font-semibold text-green-600">{campaign.stats.approvedVideos}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Posted</dt>
                                <dd className="text-sm font-semibold text-blue-600">{campaign.stats.postedVideos}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Rejected</dt>
                                <dd className="text-sm font-semibold text-red-600">{campaign.stats.rejectedVideos}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Activity Log */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {campaign.activityLog.map((log, idx) => (
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
            {(activeModal === 'pause' || activeModal === 'resume') && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">
                            {activeModal === 'pause' ? 'Pause Campaign' : 'Resume Campaign'}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason (required, min 10 chars)
                                </label>
                                <textarea
                                    value={pauseReason}
                                    onChange={(e) => setPauseReason(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Reason for status change..."
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePauseResume(activeModal === 'pause' ? 'PAUSE' : 'RESUME')}
                                    disabled={actionLoading}
                                    className={`flex-1 px-4 py-2 text-white rounded disabled:opacity-50 ${activeModal === 'pause' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                >
                                    {actionLoading ? 'Processing...' : activeModal === 'pause' ? 'Pause' : 'Resume'}
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

            {activeModal === 'cancel' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4 text-red-600">⚠️ Cancel Campaign</h3>
                        <div className="space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded p-3">
                                <p className="text-sm text-red-800">
                                    This action cannot be undone. All pending applications will be rejected.
                                </p>
                            </div>
                            <div>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={refundBudget}
                                        onChange={(e) => setRefundBudget(e.target.checked)}
                                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                    />
                                    <span className="text-sm text-gray-700">Refund remaining budget</span>
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason (required, min 10 chars)
                                </label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Reason for cancellation..."
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCancel}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                >
                                    {actionLoading ? 'Processing...' : 'Confirm Cancel'}
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

            {activeModal === 'settle' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Force Complete</h3>
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                <p className="text-sm text-blue-800">
                                    This will mark the campaign as completed and release any held funds.
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason (required, min 10 chars)
                                </label>
                                <textarea
                                    value={settleReason}
                                    onChange={(e) => setSettleReason(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Reason for forced completion..."
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSettle}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {actionLoading ? 'Processing...' : 'Complete Campaign'}
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
