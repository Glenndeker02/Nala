"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

type Video = {
    id: string;
    status: string;
    currentViewCount: number | null;
    likes: number | null;
    comments: number | null;
    shares: number | null;
    finalPostUrl: string | null;
    creator: {
        fullName: string;
    } | null;
};

type Analytics = {
    videoStats: {
        total: number;
        submitted: number;
        inReview: number;
        approved: number;
        posted: number;
        rejected: number;
        pending: number;
    };
    performanceMetrics: {
        totalViews: number;
        totalLikes: number;
        totalComments: number;
        totalShares: number;
        avgViewsPerVideo: number;
        engagementRate: string;
        targetProgress: string;
    };
    financialData: {
        totalBudget: number;
        baseFeesPaid: number;
        bonusesPaid: number;
        totalSpent: number;
        remainingBudget: number;
        refundedAmount: number;
        budgetUsedPercentage: string;
        platformRevenue: number;
    };
    creatorStats: Array<{
        id: string;
        name: string;
        email: string;
        videosCount: number;
        totalViews: number;
        totalEarned: number;
        avgViewsPerVideo: number;
    }>;
    timelineData: {
        startDate: string;
        deadline: string;
        totalDays: number;
        elapsedDays: number;
        remainingDays: number;
        percentComplete: string;
        isOverdue: boolean;
    } | null;
    roiData: {
        totalSpent: number;
        totalViews: number;
        costPerView: string;
        targetAchievement: string;
        videosCompleted: number;
        completionDate: string | null;
    } | null;
};

type Campaign = {
    id: string;
    name: string;
    description: string;
    status: string;
    totalBudget: number;
    videosRequested: number;
    videosCompleted: number;
    targetViews: number | null;
    guaranteedSpend: boolean;
    startDate: string | null;
    deadline: string | null;
    createdAt: string;
    videos: Video[];
};

export default function CampaignDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const campaignId = params.id as string;

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (campaignId) {
            fetchCampaignDetails();
        }
    }, [campaignId]);

    const fetchCampaignDetails = async () => {
        const token = localStorage.getItem("token");
        try {
            console.log('Fetching campaign details for:', campaignId);
            const response = await fetch(`/api/campaigns/${campaignId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Campaign data received:', data);

            if (data.campaign) {
                setCampaign(data.campaign);
                setAnalytics(data.analytics);
            } else {
                throw new Error('Invalid response structure');
            }
        } catch (error) {
            console.error("Error fetching campaign:", error);
            alert(`Failed to load campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-DEFAULT mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading campaign details...</p>
                </div>
            </div>
        );
    }

    if (!campaign || !analytics) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Not Found</h2>
                    <p className="text-gray-600 mb-6">The campaign you're looking for doesn't exist or you don't have access to it.</p>
                    <Link href="/founder/dashboard">
                        <Button>← Back to Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-50 text-green-700 border-green-200';
            case 'COMPLETED': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'PAUSED': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'DRAFT': return 'bg-gray-50 text-gray-700 border-gray-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <main>
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/founder/dashboard"
                            className="text-primary-DEFAULT hover:text-primary-600 font-medium mb-4 inline-block transition-colors"
                        >
                            ← Back to Dashboard
                        </Link>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                        {campaign.name}
                                    </h1>
                                    <span className={`text-sm px-3 py-1 rounded-full font-medium border ${getStatusColor(campaign.status)}`}>
                                        {campaign.status}
                                    </span>
                                    {analytics.timelineData?.isOverdue && (
                                        <span className="text-sm px-3 py-1 rounded-full font-medium bg-red-50 text-red-700 border border-red-200">
                                            OVERDUE
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600">{campaign.description}</p>
                                {analytics.timelineData && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        📅 Due: {new Date(analytics.timelineData.deadline).toLocaleDateString()}
                                        {analytics.timelineData.remainingDays > 0 && (
                                            <span className="ml-2">({analytics.timelineData.remainingDays} days remaining)</span>
                                        )}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-3 ml-6">
                                <Link href={`/founder/campaigns/${campaign.id}/edit`}>
                                    <Button variant="secondary">
                                        ✏️ Edit Campaign
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Views */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total Views</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {analytics.performanceMetrics.totalViews.toLocaleString()}
                                        </p>
                                        {campaign.targetViews && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Target: {campaign.targetViews.toLocaleString()} ({analytics.performanceMetrics.targetProgress}%)
                                            </p>
                                        )}
                                    </div>
                                    <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Videos Progress */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Videos</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {analytics.videoStats.posted}/{analytics.videoStats.total}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {analytics.videoStats.inReview} in review, {analytics.videoStats.pending} pending
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Budget Spent */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Budget Spent</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            ${analytics.financialData.totalSpent.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            of ${analytics.financialData.totalBudget.toLocaleString()} ({analytics.financialData.budgetUsedPercentage}%)
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Engagement Rate */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Engagement Rate</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {analytics.performanceMetrics.engagementRate}%
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {analytics.performanceMetrics.totalLikes.toLocaleString()} likes, {analytics.performanceMetrics.totalComments.toLocaleString()} comments
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Continue in next file... */}
                </div>
            </main>
        </div>
    );
}
