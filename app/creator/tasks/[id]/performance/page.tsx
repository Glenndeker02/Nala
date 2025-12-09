"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import InstructionsCard from "../components/InstructionsCard";

type VideoPerformance = {
    id: string;
    status: string;
    finalPostUrl: string | null;
    platform: string | null;
    postedAt: string | null;
    lockedAt: string | null;
    currentViewCount: number;
    lockedViewCount: number | null;
    baseFeeAmount: number | null;
    baseFeePaid: boolean;
    performanceBonusAmount: number | null;
    performanceBonusPaid: boolean;
    campaign: {
        id: string;
        name: string;
        totalBudget: number;
        performanceBudget: number;
        founder: {
            fullName: string;
            companyName: string | null;
        };
        briefData?: any;
    };
};

export default function PerformancePage({ params }: { params: { id: string } }) {
    const [video, setVideo] = useState<VideoPerformance | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchPerformance = useCallback(async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`/api/videos/${params.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setVideo(data.video);
            }
        } catch (error) {
            console.error("Error fetching performance:", error);
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        fetchPerformance();
        // Set up polling for live updates (every 30 seconds)
        const interval = setInterval(fetchPerformance, 30000);
        return () => clearInterval(interval);
    }, [fetchPerformance]);

    if (loading) return <div className="p-8">Loading performance data...</div>;
    if (!video) return <div className="p-8">Video not found</div>;

    // Calculate estimated bonus (simplified - actual calculation is more complex)
    const viewRate = 0.005; // $5 per 1000 views
    const estimatedBonus = video.currentViewCount * viewRate;

    // Calculate days remaining
    const now = new Date();
    const lockDate = video.lockedAt ? new Date(video.lockedAt) : null;
    const daysRemaining = lockDate ? Math.max(0, Math.ceil((lockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
    const isLocked = video.status === 'LOCKED';

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href="/creator/tasks" className="text-indigo-600 hover:text-indigo-800">
                        &larr; Back to Tasks
                    </Link>
                </div>

                {/* Header */}
                <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-8 text-white">
                        <h1 className="text-3xl font-bold mb-2">📊 Performance Tracking</h1>
                        <p className="text-purple-100">{video.campaign.name}</p>
                        <p className="text-sm text-purple-200 mt-1">
                            by {video.campaign.founder.companyName || video.campaign.founder.fullName}
                        </p>
                    </div>

                    {/* Status Banner */}
                    <div className={`px-6 py-4 ${isLocked ? 'bg-green-50' : 'bg-blue-50'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className={`text-lg font-semibold ${isLocked ? 'text-green-900' : 'text-blue-900'}`}>
                                    {isLocked ? '🔒 Metrics Locked' : '📈 Tracking Active'}
                                </h3>
                                <p className={`text-sm ${isLocked ? 'text-green-700' : 'text-blue-700'}`}>
                                    {isLocked
                                        ? 'Final performance bonus will be paid within 24 hours'
                                        : `${daysRemaining} days remaining in tracking window`
                                    }
                                </p>
                            </div>
                            {!isLocked && lockDate && (
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Lock Date</p>
                                    <p className="font-semibold text-gray-900">
                                        {lockDate.toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Instructions Card */}
                <div className="mb-6">
                    <InstructionsCard campaignId={video.campaign.id} briefData={video.campaign.briefData} />
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Views */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
                            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            {(isLocked ? video.lockedViewCount : video.currentViewCount)?.toLocaleString() || 0}
                        </p>
                        {!isLocked && (
                            <p className="text-xs text-gray-500 mt-1">Updates daily at midnight</p>
                        )}
                    </div>

                    {/* Base Fee */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-500">Base Fee</h3>
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            ${video.baseFeeAmount?.toFixed(2) || '0.00'}
                        </p>
                        <p className={`text-xs mt-1 ${video.baseFeePaid ? 'text-green-600' : 'text-yellow-600'}`}>
                            {video.baseFeePaid ? '✓ Paid' : 'Pending'}
                        </p>
                    </div>

                    {/* Performance Bonus */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-500">Performance Bonus</h3>
                            <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            ${isLocked && video.performanceBonusAmount
                                ? video.performanceBonusAmount.toFixed(2)
                                : estimatedBonus.toFixed(2)
                            }
                        </p>
                        <p className={`text-xs mt-1 ${isLocked
                            ? (video.performanceBonusPaid ? 'text-green-600' : 'text-yellow-600')
                            : 'text-gray-500'
                            }`}>
                            {isLocked
                                ? (video.performanceBonusPaid ? '✓ Paid' : 'Processing')
                                : 'Estimated'
                            }
                        </p>
                    </div>
                </div>

                {/* Post Details */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Post Details</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Platform</span>
                            <span className="text-sm font-medium text-gray-900 capitalize">
                                {video.platform?.toLowerCase() || 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Posted On</span>
                            <span className="text-sm font-medium text-gray-900">
                                {video.postedAt ? new Date(video.postedAt).toLocaleString() : 'N/A'}
                            </span>
                        </div>
                        {video.finalPostUrl && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Post URL</span>
                                <a
                                    href={video.finalPostUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-indigo-600 hover:text-indigo-800 truncate max-w-xs"
                                >
                                    View Post →
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Timeline */}
                {video.postedAt && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tracking Timeline</h2>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-900">Post Submitted</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(video.postedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className={`w-8 h-8 ${isLocked ? 'bg-green-100' : 'bg-blue-100'} rounded-full flex items-center justify-center`}>
                                        {isLocked ? (
                                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                                        )}
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-900">
                                        {isLocked ? 'Metrics Locked' : 'Tracking Active'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {lockDate ? lockDate.toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {isLocked && (
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className={`w-8 h-8 ${video.performanceBonusPaid ? 'bg-green-100' : 'bg-yellow-100'} rounded-full flex items-center justify-center`}>
                                            {video.performanceBonusPaid ? (
                                                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <div className="w-3 h-3 bg-yellow-600 rounded-full animate-pulse"></div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-900">
                                            {video.performanceBonusPaid ? 'Bonus Paid' : 'Payment Processing'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {video.performanceBonusPaid ? 'Completed' : 'Within 24 hours'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
