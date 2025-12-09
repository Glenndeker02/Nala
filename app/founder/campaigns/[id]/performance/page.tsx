"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

type VideoPerformance = {
    id: string;
    title: string;
    creatorName: string;
    creatorRating: number;
    platform: string;
    postedAt: string;
    videoUrl: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    completedViews: number;
    watchTimeHours: number;
    baseFee: number;
    performanceBonus: number;
    totalEarnings: number;
    nalaRevenue: number;
};

type CampaignPerformance = {
    campaignId: string;
    campaignName: string;
    status: string;
    startDate: string;
    lockDate: string;
    daysRemaining: number;
    totalBudget: number;
    baseFeeTotal: number;
    performanceBudget: number;
    maxViews: number;
    totalViews: number;
    achievementPercent: number;
    performanceCost: number;
    refundAmount: number;
    videosPosted: number;
    videosTotal: number;
    lastUpdated: string;
    videos: VideoPerformance[];
};

export default function PerformanceDashboardPage() {
    const router = useRouter();
    const params = useParams();
    const campaignId = params.id as string;

    const [performance, setPerformance] = useState<CampaignPerformance | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<VideoPerformance | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (campaignId) {
            fetchPerformanceData();
        }
    }, [campaignId]);

    const fetchPerformanceData = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`/api/campaigns/${campaignId}/performance`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setPerformance(data.data);
            } else {
                setError(data.error || "Failed to fetch performance data");
            }
        } catch (error) {
            console.error("Error fetching performance:", error);
            setError("An error occurred while fetching performance data");
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchPerformanceData();
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleExportPDF = () => {
        alert("PDF export functionality would be implemented here. This would generate a comprehensive performance report.");
    };

    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString();
    };

    const formatTimeAgo = (date: string) => {
        const hours = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60));
        if (hours < 1) return "Less than an hour ago";
        if (hours === 1) return "1 hour ago";
        if (hours < 24) return `${hours} hours ago`;
        const days = Math.floor(hours / 24);
        if (days === 1) return "1 day ago";
        return `${days} days ago`;
    };

    const getProgressColor = (percent: number) => {
        if (percent >= 80) return "bg-green-600";
        if (percent >= 50) return "bg-blue-600";
        if (percent >= 30) return "bg-yellow-600";
        return "bg-red-600";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-DEFAULT mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading performance data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Link href={`/founder/campaigns/${campaignId}`}>
                        <Button>← Back to Campaign</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (!performance) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Performance Data</h2>
                    <p className="text-gray-600 mb-6">Performance tracking will begin once videos are posted.</p>
                    <Link href={`/founder/campaigns/${campaignId}`}>
                        <Button>← Back to Campaign</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const creatorRankings = performance.videos
        .map(v => ({
            name: v.creatorName,
            views: v.views,
            percentage: performance.totalViews > 0 ? (v.views / performance.totalViews) * 100 : 0
        }))
        .sort((a, b) => b.views - a.views);

    return (
        <div className="min-h-screen bg-gray-50">
            <main>
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={`/founder/campaigns/${campaignId}`}
                            className="text-primary-DEFAULT hover:text-primary-600 font-medium mb-4 inline-block transition-colors"
                        >
                            ← Back to Campaign
                        </Link>
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                    Campaign Performance - {performance.campaignName}
                                </h1>
                                <p className="mt-2 text-gray-600">
                                    Real-time metrics and ROI tracking
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    variant="secondary"
                                >
                                    {refreshing ? "Refreshing..." : "🔄 Refresh Data"}
                                </Button>
                                <Button onClick={handleExportPDF}>
                                    📄 Export PDF
                                </Button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Last updated: {formatTimeAgo(performance.lastUpdated)}
                        </p>
                    </div>

                    {/* Status Banner */}
                    <div className="mb-8 p-6 bg-gradient-to-r from-primary-DEFAULT to-primary-600 rounded-2xl text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90 mb-1">Campaign Status</p>
                                <p className="text-2xl font-bold">
                                    {performance.status} (Day {7 - performance.daysRemaining} of 7)
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm opacity-90 mb-1">Metric Lock In</p>
                                <p className="text-2xl font-bold">{performance.daysRemaining} days</p>
                                <p className="text-sm opacity-75">
                                    {new Date(performance.lockDate).toLocaleDateString()} at 00:00 UTC
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span>Progress to lock</span>
                                <span>{Math.round(((7 - performance.daysRemaining) / 7) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white rounded-full transition-all duration-300"
                                    style={{ width: `${((7 - performance.daysRemaining) / 7) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Aggregate Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm text-gray-600">Total Views</p>
                                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-2">
                                    {formatNumber(performance.totalViews)}
                                </p>
                                <p className="text-sm text-gray-600">
                                    of {formatNumber(performance.maxViews)} max
                                </p>
                                <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${getProgressColor(performance.achievementPercent)} transition-all duration-300`}
                                        style={{ width: `${Math.min(performance.achievementPercent, 100)}%` }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm text-gray-600">Achievement</p>
                                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-2">
                                    {performance.achievementPercent.toFixed(1)}%
                                </p>
                                <p className="text-sm text-gray-600">
                                    of maximum possible
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm text-gray-600">Performance Cost</p>
                                    <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-2">
                                    {formatCurrency(performance.performanceCost)}
                                </p>
                                <p className="text-sm text-gray-600">
                                    of {formatCurrency(performance.performanceBudget)} budget
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm text-gray-600">Projected Refund</p>
                                    <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-green-600 mb-2">
                                    {formatCurrency(performance.refundAmount)}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Unspent performance budget
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Financial Breakdown */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Financial Breakdown</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                            <span className="text-gray-600">Total Budget:</span>
                                            <span className="text-xl font-bold text-gray-900">
                                                {formatCurrency(performance.totalBudget)}
                                            </span>
                                        </div>

                                        <div className="pl-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Fixed (Base Fees):</span>
                                                <span className="font-medium text-gray-900">
                                                    {formatCurrency(performance.baseFeeTotal)}
                                                </span>
                                            </div>

                                            <div className="pl-4 space-y-2">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-500">Variable (Performance):</span>
                                                    <span className="text-gray-700">
                                                        {formatCurrency(performance.performanceBudget)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm pl-4">
                                                    <span className="text-gray-500">Spent ({formatNumber(performance.totalViews)} views):</span>
                                                    <span className="text-gray-700">
                                                        {formatCurrency(performance.performanceCost)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm pl-4">
                                                    <span className="text-gray-500">Remaining:</span>
                                                    <span className="text-green-600 font-medium">
                                                        {formatCurrency(performance.refundAmount)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-900">Your Refund (projected):</span>
                                                <span className="text-2xl font-bold text-green-600">
                                                    {formatCurrency(performance.refundAmount)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mt-4">
                                            <p className="text-sm text-blue-800">
                                                <strong>💡 Note:</strong> After the 7-day tracking period ends, payment will auto-settle:
                                                creators receive performance bonuses, and you'll be refunded the unspent budget.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Video Performance Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Video Performance</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Video
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Platform
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Views
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Engagement
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Creator Earnings
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {performance.videos.map((video) => {
                                                    const engagementRate = video.views > 0 ? ((video.likes + video.comments + video.shares) / video.views * 100).toFixed(1) : "0.0";
                                                    return (
                                                        <tr key={video.id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4">
                                                                <div>
                                                                    <p className="font-medium text-gray-900">{video.title}</p>
                                                                    <p className="text-sm text-gray-500">
                                                                        {video.creatorName} ({video.creatorRating}★)
                                                                    </p>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-sm text-gray-900">{video.platform}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <span className="font-medium text-gray-900">
                                                                    {formatNumber(video.views)}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <span className="text-sm text-gray-600">{engagementRate}%</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <span className="font-medium text-gray-900">
                                                                    {formatCurrency(video.totalEarnings)}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <button
                                                                    onClick={() => setSelectedVideo(video)}
                                                                    className="text-primary-DEFAULT hover:text-primary-600 font-medium text-sm"
                                                                >
                                                                    View Details →
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Creator Rankings Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Creator Rankings</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {creatorRankings.map((creator, index) => (
                                            <div key={index}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl font-bold text-gray-400">
                                                            {index + 1}
                                                        </span>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{creator.name}</p>
                                                            <p className="text-sm text-gray-600">
                                                                {formatNumber(creator.views)} views
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {creator.percentage.toFixed(0)}%
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary-DEFAULT transition-all duration-300"
                                                        style={{ width: `${creator.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Videos Posted</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center">
                                        <p className="text-5xl font-bold text-gray-900 mb-2">
                                            {performance.videosPosted}/{performance.videosTotal}
                                        </p>
                                        <p className="text-gray-600">All videos posted</p>
                                        <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-600 transition-all duration-300"
                                                style={{ width: `${performance.videosTotal > 0 ? (performance.videosPosted / performance.videosTotal) * 100 : 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            {/* Video Detail Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle>{selectedVideo.title}</CardTitle>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {selectedVideo.creatorName} ({selectedVideo.creatorRating}★) • {selectedVideo.platform}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedVideo(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Performance Metrics */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-3">Performance Metrics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Views</p>
                                        <p className="text-2xl font-bold text-gray-900">{formatNumber(selectedVideo.views)}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Likes</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {formatNumber(selectedVideo.likes)}
                                            <span className="text-sm text-gray-600 ml-2">
                                                ({selectedVideo.views > 0 ? ((selectedVideo.likes / selectedVideo.views) * 100).toFixed(1) : "0.0"}%)
                                            </span>
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Comments</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {formatNumber(selectedVideo.comments)}
                                            <span className="text-sm text-gray-600 ml-2">
                                                ({selectedVideo.views > 0 ? ((selectedVideo.comments / selectedVideo.views) * 100).toFixed(1) : "0.0"}%)
                                            </span>
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Shares</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {formatNumber(selectedVideo.shares)}
                                            <span className="text-sm text-gray-600 ml-2">
                                                ({selectedVideo.views > 0 ? ((selectedVideo.shares / selectedVideo.views) * 100).toFixed(1) : "0.0"}%)
                                            </span>
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Completed Views</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {formatNumber(selectedVideo.completedViews)}
                                            <span className="text-sm text-gray-600 ml-2">
                                                ({selectedVideo.views > 0 ? ((selectedVideo.completedViews / selectedVideo.views) * 100).toFixed(1) : "0.0"}%)
                                            </span>
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Watch Time</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {formatNumber(selectedVideo.watchTimeHours)}h
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Calculation */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-3">Payment Calculation</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Base Fee (Paid {new Date(selectedVideo.postedAt).toLocaleDateString()}):</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(selectedVideo.baseFee)}</span>
                                    </div>
                                    <div className="pl-4 space-y-2 border-l-2 border-gray-200">
                                        <p className="text-sm text-gray-600">Performance Bonus:</p>
                                        <p className="text-sm text-gray-700">
                                            Views: {formatNumber(selectedVideo.views)}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            Rate: $4.00 per 1k views
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            Bonus: {formatNumber(selectedVideo.views)} × 4/1000 = {formatCurrency(selectedVideo.performanceBonus)}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                        <span className="font-bold text-gray-900">Total Creator Earnings:</span>
                                        <span className="text-xl font-bold text-primary-DEFAULT">
                                            {formatCurrency(selectedVideo.totalEarnings)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Tupstory Revenue ({formatNumber(selectedVideo.views)} × 1/1000):</span>
                                        <span className="text-gray-700">{formatCurrency(selectedVideo.nalaRevenue)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-3">Timeline</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Posted:</span>
                                        <span className="text-gray-900">{new Date(selectedVideo.postedAt).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Performance Locked:</span>
                                        <span className="text-gray-900">{new Date(performance.lockDate).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Video URL:</span>
                                        <a href={selectedVideo.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary-DEFAULT hover:text-primary-600">
                                            View on {selectedVideo.platform} →
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <Button onClick={() => setSelectedVideo(null)} variant="secondary" className="flex-1">
                                    Close
                                </Button>
                                <Button onClick={handleExportPDF} className="flex-1">
                                    Export Video Report
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
