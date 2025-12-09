'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/Button";

interface Submission {
    submissionId: string;
    videoId: string;
    title?: string;
    creator: {
        id: string;
        fullName: string;
        profilePictureUrl: string | null;
    } | null;
    platform: string;
    status: string;
    assetUrl: string | null;
    thumbnailUrl: string | null;
    uploadedAt: string;
    deadline: string | null;
    revisionCount: number;
    lastReviewedAt: string | null;
}

interface Campaign {
    id: string;
    name: string;
}

export default function DraftReviewPage() {
    const params = useParams();
    const router = useRouter();
    const campaignId = params.id as string;

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRevisionModal, setShowRevisionModal] = useState(false);
    const [revisionComments, setRevisionComments] = useState('');
    const [revisionDeadline, setRevisionDeadline] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (campaignId) {
            fetchData();
        }
    }, [campaignId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Fetch campaign details
            const campaignRes = await fetch(`/api/campaigns/${campaignId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!campaignRes.ok) throw new Error('Failed to fetch campaign');
            const campaignData = await campaignRes.json();
            setCampaign(campaignData.campaign || campaignData.data?.campaign || campaignData);

            // Fetch submissions
            const submissionsRes = await fetch(`/api/campaigns/${campaignId}/submissions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!submissionsRes.ok) throw new Error('Failed to fetch submissions');
            const submissionsData = await submissionsRes.json();
            setSubmissions(submissionsData.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedSubmission) return;

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/campaigns/${campaignId}/submissions/${selectedSubmission.submissionId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to approve draft');
            }

            alert('Draft approved successfully!');
            setShowApproveModal(false);
            setSelectedSubmission(null);
            fetchData();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRequestRevision = async () => {
        if (!selectedSubmission || !revisionComments.trim()) {
            alert('Please provide revision comments');
            return;
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/campaigns/${campaignId}/submissions/${selectedSubmission.submissionId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    comments: revisionComments,
                    revisionDeadline: revisionDeadline || undefined,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to request revision');
            }

            alert('Revision requested successfully');
            setShowRevisionModal(false);
            setSelectedSubmission(null);
            setRevisionComments('');
            setRevisionDeadline('');
            fetchData();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT_SUBMITTED':
            case 'IN_REVIEW':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'REVISION_REQUESTED':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'APPROVED':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-DEFAULT mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading submissions...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">Error: {error}</p>
                    <Button onClick={() => router.back()} className="mt-4">
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const pendingReview = submissions.filter(s => s.status === 'DRAFT_SUBMITTED' || s.status === 'IN_REVIEW');
    const approved = submissions.filter(s => s.status === 'APPROVED');
    const needsRevision = submissions.filter(s => s.status === 'REVISION_REQUESTED');

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="text-primary-DEFAULT hover:text-primary-600 mb-4 flex items-center transition-colors"
                    >
                        ← Back to Campaign
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {campaign?.name} - Draft Review
                    </h1>
                    <p className="mt-2 text-gray-600">Review and approve video drafts</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                        <h3 className="text-sm font-medium text-gray-500">Pending Review</h3>
                        <p className="mt-2 text-3xl font-bold text-blue-600">{pendingReview.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                        <h3 className="text-sm font-medium text-gray-500">Approved</h3>
                        <p className="mt-2 text-3xl font-bold text-green-600">{approved.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
                        <h3 className="text-sm font-medium text-gray-500">Needs Revision</h3>
                        <p className="mt-2 text-3xl font-bold text-orange-600">{needsRevision.length}</p>
                    </div>
                </div>

                {/* Pending Review */}
                {pendingReview.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Review</h2>
                        <div className="space-y-4">
                            {pendingReview.map((submission) => (
                                <div key={submission.submissionId} className="bg-white rounded-lg shadow p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {submission.title || `Video Submission`}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                                                    {getStatusLabel(submission.status)}
                                                </span>
                                            </div>

                                            {submission.creator && (
                                                <p className="text-sm text-gray-600 mt-1">Creator: {submission.creator.fullName}</p>
                                            )}

                                            <p className="text-sm text-gray-600 mt-1">
                                                Submitted: {new Date(submission.uploadedAt).toLocaleString()}
                                            </p>

                                            {submission.revisionCount > 0 && (
                                                <p className="text-sm text-orange-600 mt-1">Revision #{submission.revisionCount}</p>
                                            )}

                                            {submission.assetUrl && (
                                                <a
                                                    href={submission.assetUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-3 inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                                >
                                                    View Draft Video →
                                                </a>
                                            )}
                                        </div>

                                        <div className="ml-4 flex space-x-2">
                                            <Button
                                                onClick={() => {
                                                    setSelectedSubmission(submission);
                                                    setShowApproveModal(true);
                                                }}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setSelectedSubmission(submission);
                                                    setShowRevisionModal(true);
                                                }}
                                                className="bg-orange-600 hover:bg-orange-700"
                                            >
                                                Request Revision
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Approved */}
                {approved.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Approved</h2>
                        <div className="space-y-4">
                            {approved.map((submission) => (
                                <div key={submission.submissionId} className="bg-green-50 border border-green-200 rounded-lg p-6">
                                    <div className="flex items-center space-x-3">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {submission.title || `Video Submission`}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                                            {getStatusLabel(submission.status)}
                                        </span>
                                    </div>
                                    {submission.assetUrl && (
                                        <a
                                            href={submission.assetUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 text-sm text-blue-600 hover:text-blue-700 inline-block"
                                        >
                                            View Approved Video →
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Approve Modal */}
                {showApproveModal && selectedSubmission && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Approve Draft</h2>

                            <p className="text-gray-600 mb-4">
                                Are you sure you want to approve this draft? The creator will be notified and payment will be processed.
                            </p>

                            <div className="flex justify-end space-x-3">
                                <Button
                                    onClick={() => {
                                        setShowApproveModal(false);
                                        setSelectedSubmission(null);
                                    }}
                                    variant="secondary"
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleApprove}
                                    className="bg-green-600 hover:bg-green-700"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Approving...' : 'Approve Draft'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Revision Modal */}
                {showRevisionModal && selectedSubmission && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Revision</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Revision Comments *
                                    </label>
                                    <textarea
                                        value={revisionComments}
                                        onChange={(e) => setRevisionComments(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        rows={4}
                                        placeholder="Explain what needs to be changed..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Revision Deadline (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={revisionDeadline}
                                        onChange={(e) => setRevisionDeadline(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <Button
                                    onClick={() => {
                                        setShowRevisionModal(false);
                                        setSelectedSubmission(null);
                                        setRevisionComments('');
                                        setRevisionDeadline('');
                                    }}
                                    variant="secondary"
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleRequestRevision}
                                    className="bg-orange-600 hover:bg-orange-700"
                                    disabled={submitting || !revisionComments.trim()}
                                >
                                    {submitting ? 'Requesting...' : 'Request Revision'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
