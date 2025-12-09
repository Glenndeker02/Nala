'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Application {
    id: string;
    creatorId: string;
    message: string | null;
    portfolioLinks: string[];
    status: string;
    createdAt: string;
    creator: {
        fullName: string;
        email: string;
        creatorProfile: {
            rankingScore: number | null;
            avgRating: number | null;
            categories: string[];
            bio: string | null;
        } | null;
    };
}

interface Campaign {
    id: string;
    name: string;
    videosRequested: number;
}

export default function ApplicantsPage() {
    const params = useParams();
    const router = useRouter();
    const campaignId = params.id as string;

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);

    // Accept form state
    const [overallInstructions, setOverallInstructions] = useState('');
    const [acceptanceDeadline, setAcceptanceDeadline] = useState('');
    const [videoInstructions, setVideoInstructions] = useState<any[]>([]);
    const [rejectReason, setRejectReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, [campaignId]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Fetch campaign details
            const campaignRes = await fetch(`/api/campaigns/${campaignId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!campaignRes.ok) throw new Error('Failed to fetch campaign');
            const campaignData = await campaignRes.json();
            setCampaign(campaignData.campaign);

            // Fetch applications
            const appsRes = await fetch(`/api/campaigns/${campaignId}/applications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!appsRes.ok) throw new Error('Failed to fetch applications');
            const appsData = await appsRes.json();
            setApplications(appsData.applications || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        if (!selectedApplication || !overallInstructions.trim()) {
            alert('Please provide overall instructions');
            return;
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/applications/${selectedApplication.id}/accept`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    overallInstructions,
                    acceptanceDeadline: acceptanceDeadline || undefined,
                    videoInstructions: videoInstructions.length > 0 ? videoInstructions : undefined,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to accept application');
            }

            alert('Application accepted successfully!');
            setShowAcceptModal(false);
            setSelectedApplication(null);
            setOverallInstructions('');
            setAcceptanceDeadline('');
            setVideoInstructions([]);
            fetchApplications();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!selectedApplication) return;

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/applications/${selectedApplication.id}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    reason: rejectReason || undefined,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to reject application');
            }

            alert('Application rejected');
            setShowRejectModal(false);
            setSelectedApplication(null);
            setRejectReason('');
            fetchApplications();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const initializeVideoInstructions = (videosRequested: number) => {
        const instructions = [];
        for (let i = 1; i <= videosRequested; i++) {
            instructions.push({
                videoNumber: i,
                title: `Video ${i}`,
                specificInstructions: '',
                deadline: '',
                requirements: [],
            });
        }
        setVideoInstructions(instructions);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading applications...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">Error: {error}</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const pendingApplications = applications.filter(app => app.status === 'PENDING');
    const acceptedApplications = applications.filter(app => app.status === 'ACCEPTED');
    const rejectedApplications = applications.filter(app => app.status === 'REJECTED');

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
                    >
                        ← Back to Campaign
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {campaign?.name} - Applicants
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Review and manage applications for this campaign
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                        <p className="mt-2 text-3xl font-bold text-yellow-600">{pendingApplications.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-sm font-medium text-gray-500">Accepted</h3>
                        <p className="mt-2 text-3xl font-bold text-green-600">{acceptedApplications.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
                        <p className="mt-2 text-3xl font-bold text-red-600">{rejectedApplications.length}</p>
                    </div>
                </div>

                {/* Pending Applications */}
                {pendingApplications.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Applications</h2>
                        <div className="space-y-4">
                            {pendingApplications.map((application) => (
                                <div key={application.id} className="bg-white rounded-lg shadow p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {application.creator.fullName}
                                            </h3>
                                            <p className="text-sm text-gray-600">{application.creator.email}</p>

                                            {application.creator.creatorProfile && (
                                                <div className="mt-2 flex items-center space-x-4">
                                                    {application.creator.creatorProfile.avgRating && (
                                                        <span className="text-sm text-gray-600">
                                                            ⭐ {application.creator.creatorProfile.avgRating.toFixed(1)}
                                                        </span>
                                                    )}
                                                    {application.creator.creatorProfile.rankingScore && (
                                                        <span className="text-sm text-gray-600">
                                                            Rank: {application.creator.creatorProfile.rankingScore.toFixed(0)}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {application.message && (
                                                <div className="mt-4">
                                                    <p className="text-sm font-medium text-gray-700">Message:</p>
                                                    <p className="mt-1 text-sm text-gray-600">{application.message}</p>
                                                </div>
                                            )}

                                            {application.portfolioLinks.length > 0 && (
                                                <div className="mt-4">
                                                    <p className="text-sm font-medium text-gray-700">Portfolio:</p>
                                                    <div className="mt-1 space-y-1">
                                                        {application.portfolioLinks.map((link, idx) => (
                                                            <a
                                                                key={idx}
                                                                href={link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-blue-600 hover:text-blue-700 block"
                                                            >
                                                                {link}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="ml-4 flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedApplication(application);
                                                    if (campaign) {
                                                        initializeVideoInstructions(campaign.videosRequested);
                                                    }
                                                    setShowAcceptModal(true);
                                                }}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedApplication(application);
                                                    setShowRejectModal(true);
                                                }}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Accepted Applications */}
                {acceptedApplications.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Accepted Creators</h2>
                        <div className="space-y-4">
                            {acceptedApplications.map((application) => (
                                <div key={application.id} className="bg-green-50 border border-green-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {application.creator.fullName}
                                    </h3>
                                    <p className="text-sm text-green-600">Accepted on {new Date(application.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Accept Modal */}
                {showAcceptModal && selectedApplication && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Accept Application - {selectedApplication.creator.fullName}
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Overall Instructions *
                                    </label>
                                    <textarea
                                        value={overallInstructions}
                                        onChange={(e) => setOverallInstructions(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={4}
                                        placeholder="Provide overall instructions for the creator..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Overall Deadline (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={acceptanceDeadline}
                                        onChange={(e) => setAcceptanceDeadline(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        onClick={() => {
                                            setShowAcceptModal(false);
                                            setSelectedApplication(null);
                                            setOverallInstructions('');
                                            setAcceptanceDeadline('');
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAccept}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                        disabled={submitting || !overallInstructions.trim()}
                                    >
                                        {submitting ? 'Accepting...' : 'Accept & Send Instructions'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reject Modal */}
                {showRejectModal && selectedApplication && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Reject Application
                            </h2>

                            <p className="text-gray-600 mb-4">
                                Are you sure you want to reject {selectedApplication.creator.fullName}'s application?
                            </p>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason (Optional)
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Provide a reason for rejection..."
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setSelectedApplication(null);
                                        setRejectReason('');
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Rejecting...' : 'Reject Application'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
