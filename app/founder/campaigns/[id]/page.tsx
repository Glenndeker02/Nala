"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoAnalyticsCard from './components/VideoAnalyticsCard';
import PerformanceAnalysisCard from './components/PerformanceAnalysisCard';
import ABTestingTab from './components/ABTestingTab';
import ABTestingSummaryCard from './components/ABTestingSummaryCard';
import { FounderVideosTab } from '@/components/founder/videos/FounderVideosTab';
import { FormatTemplatesManagement } from '@/components/founder/format-templates/FormatTemplatesManagement';
import { CampaignGoalsTab } from '@/components/founder/goals/CampaignGoalsTab';

type Video = {
    id: string;
    status: string;
    currentViewCount: number | null;
    likes: number | null;
    comments: number | null;
    shares: number | null;
    finalPostUrl: string | null;
    thumbnailUrl: string | null;
    title?: string;
    creator: {
        id: string;
        fullName: string;
    } | null;
};

type Campaign = {
    id: string;
    name: string;
    description: string;
    status: string;
    totalBudget: number;
    baseFeePerVideo?: number;
    baseFeeBudget?: number;
    performanceBudget?: number;
    videosRequested: number;
    videosCompleted: number;
    startDate: string | null;
    postingFrequency: string;
    createdAt: string;
    briefData: any;
    videos?: Video[];
    _count?: {
        videos: number;
        applications: number;
    };
};

export default function CampaignDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const campaignId = params.id as string;

    const [activeTab, setActiveTab] = useState("overview");
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalApplications: 0,
        pendingReviews: 0,
        approvedVideos: 0,
        totalViews: 0,
        budgetSpent: 0
    });

    useEffect(() => {
        if (campaignId) {
            fetchCampaignDetails();
        }
    }, [campaignId]);

    const fetchCampaignDetails = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`/api/campaigns/${campaignId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                const campaignData = data.campaign || data.data?.campaign || data;
                setCampaign(campaignData);

                // Calculate stats
                const videosCount = campaignData._count?.videos || 0;
                const applicationsCount = campaignData._count?.applications || 0;
                let totalViews = 0;
                let approvedVideos = campaignData.videosCompleted || 0;

                // Calculate from videos if available
                if (campaignData.videos && campaignData.videos.length > 0) {
                    totalViews = campaignData.videos.reduce((sum: number, v: Video) => sum + (v.currentViewCount || 0), 0);
                    approvedVideos = campaignData.videos.filter((v: Video) => v.status === 'APPROVED' || v.status === 'POSTED').length;
                }

                setStats({
                    totalApplications: applicationsCount,
                    pendingReviews: 0,
                    approvedVideos,
                    totalViews,
                    budgetSpent: (campaignData.videosCompleted || 0) * (campaignData.baseFeePerVideo || ((campaignData.baseFeeBudget || 0) / (campaignData.videosRequested || 1)))
                });
            }
        } catch (error) {
            console.error("Error fetching campaign:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditCampaign = () => {
        router.push(`/founder/campaigns/${campaignId}/edit`);
    };

    const handleDeleteCampaign = async () => {
        if (!confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
            return;
        }

        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`/api/campaigns/${campaignId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                alert("Campaign deleted successfully");
                router.push("/founder/dashboard");
            } else {
                const data = await response.json();
                alert(data.error || "Failed to delete campaign");
            }
        } catch (error) {
            console.error("Error deleting campaign:", error);
            alert("An error occurred while deleting the campaign");
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

    if (!campaign) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Not Found</h2>
                    <p className="text-gray-600 mb-6">The campaign you're looking for doesn't exist.</p>
                    <Link href="/founder/dashboard">
                        <Button>← Back to Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const baseFeeTotal = campaign.baseFeeBudget || (campaign.videosRequested * (campaign.baseFeePerVideo || 0));
    const performanceBudget = Number(campaign.performanceBudget || (campaign.totalBudget - baseFeeTotal)) || 0;
    const budgetRemaining = campaign.totalBudget - stats.budgetSpent;

    return (
        <>
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
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                                    {campaign.name}
                                                </h1>
                                                <span
                                                    className={`text-sm px-3 py-1 rounded-full font-medium ${campaign.status === "ACTIVE"
                                                        ? "bg-green-50 text-green-700 border border-green-200"
                                                        : campaign.status === "COMPLETED"
                                                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                            : campaign.status === "DRAFT"
                                                                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                                                : "bg-gray-50 text-gray-700 border border-gray-200"
                                                        }`}
                                                >
                                                    {campaign.status}
                                                </span>
                                            </div>
                                            <p className="text-gray-600">{campaign.description}</p>
                                            <div>
                                                <p className="text-xs font-semibold text-green-800 uppercase tracking-wider mb-1">Campaign Status</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-bold text-green-900">ACTIVE</span>
                                                    <span className="text-sm font-medium text-green-800">(Day 5 of 7)</span>
                                                </div>
                                            </div>

                                            {/* Metric Lock In */}
                                            <div>
                                                <p className="text-xs font-semibold text-green-800 uppercase tracking-wider mb-1">Metric Lock In</p>
                                                <div className="flex flex-col">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-2xl font-bold text-green-900">2 days</span>
                                                    </div>
                                                    <span className="text-xs font-medium text-green-800">11/28/2025 at 00:00 UTC</span>
                                                </div>
                                            </div>

                                            {/* Progress */}
                                            <div>
                                                <p className="text-xs font-semibold text-green-800 uppercase tracking-wider mb-1">Completion</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-2 bg-green-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-green-600 rounded-full"
                                                            style={{ width: `${(campaign.videosCompleted / campaign.videosRequested) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-bold text-green-900">
                                                        {Math.round((campaign.videosCompleted / campaign.videosRequested) * 100)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                            <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="founder-videos">Founder Videos</TabsTrigger>
                                <TabsTrigger value="format-templates">Format Templates</TabsTrigger>
                                <TabsTrigger value="goals">Goals</TabsTrigger>
                                <TabsTrigger value="videos">Videos & Analytics</TabsTrigger>
                                <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6">
                                {/* Key Metrics Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <Card>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">Applications</p>
                                                    <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
                                                </div>
                                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">Budget Spent</p>
                                                    <p className="text-3xl font-bold text-gray-900">${stats.budgetSpent.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500 mt-1">of ${campaign.totalBudget.toLocaleString()}</p>
                                                </div>
                                                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">Total Views</p>
                                                    <p className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
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
                                </div>

                                {/* Campaign Details */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Main Details */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Campaign Information</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-1">Start Date</p>
                                                        <p className="font-medium text-gray-900">
                                                            {campaign.startDate
                                                                ? new Date(campaign.startDate).toLocaleDateString()
                                                                : "Not set"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-1">Posting Frequency</p>
                                                        <p className="font-medium text-gray-900 capitalize">
                                                            {campaign.postingFrequency?.replace('_', ' ') || "Not set"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-1">Created</p>
                                                        <p className="font-medium text-gray-900">
                                                            {new Date(campaign.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-1">Platforms</p>
                                                        <p className="font-medium text-gray-900">
                                                            {campaign.briefData?.platforms?.join(", ") || "Not specified"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Budget Breakdown</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">Fixed Production Costs:</span>
                                                        <span className="font-bold text-gray-900">${baseFeeTotal.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">Performance Budget:</span>
                                                        <span className="font-bold text-gray-900">${performanceBudget.toFixed(2)}</span>
                                                    </div>
                                                    <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                                                        <span className="font-bold text-gray-900">Total Budget:</span>
                                                        <span className="font-bold text-primary-DEFAULT text-lg">
                                                            ${campaign.totalBudget.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-600">Budget Remaining:</span>
                                                        <span className="font-medium text-green-600">
                                                            ${budgetRemaining.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Budget Progress Bar */}
                                                <div className="mt-6">
                                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                                        <span>Budget Used</span>
                                                        <span>{((stats.budgetSpent / campaign.totalBudget) * 100).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary-DEFAULT rounded-full transition-all duration-300"
                                                            style={{ width: `${(stats.budgetSpent / campaign.totalBudget) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {campaign.briefData && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Content Brief</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        {campaign.briefData.targetAudience && (
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 mb-1">Target Audience</p>
                                                                <p className="text-gray-600">{campaign.briefData.targetAudience}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Quick Actions</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <Link href={`/founder/campaigns/${campaign.id}/applications`}>
                                                    <Button className="w-full justify-start" variant="secondary">
                                                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        View Applications
                                                    </Button>
                                                </Link>
                                                <Link href={`/founder/campaigns/${campaign.id}/review`}>
                                                    <Button className="w-full justify-start" variant="secondary">
                                                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                        Review Videos
                                                    </Button>
                                                </Link>
                                                <Link href={`/founder/campaigns/${campaign.id}/performance`}>
                                                    <Button className="w-full justify-start" variant="secondary">
                                                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                        </svg>
                                                        View Performance
                                                    </Button>
                                                </Link>
                                                <Button
                                                    className="w-full justify-start"
                                                    variant="secondary"
                                                    onClick={handleEditCampaign}
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit Campaign
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        {/* A/B Testing Summary Card */}
                                        <ABTestingSummaryCard
                                            campaignId={campaignId}
                                            onViewAll={() => setActiveTab("ab-testing")}
                                        />

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Campaign Progress</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div>
                                                        <div className="flex justify-between text-sm mb-2">
                                                            <span className="text-gray-600">Videos Completed</span>
                                                            <span className="font-medium text-gray-900">
                                                                {campaign.videosCompleted}/{campaign.videosRequested}
                                                            </span>
                                                        </div>
                                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                                                style={{ width: `${(campaign.videosCompleted / campaign.videosRequested) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {stats.pendingReviews > 0 && (
                                                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                                            <p className="text-sm text-yellow-800">
                                                                <strong>{stats.pendingReviews}</strong> video{stats.pendingReviews !== 1 ? 's' : ''} pending your review
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                            </TabsContent>

                            <TabsContent value="founder-videos">
                                <FounderVideosTab campaignId={campaignId} />
                            </TabsContent>

                            <TabsContent value="format-templates">
                                <FormatTemplatesManagement campaignId={campaignId} />
                            </TabsContent>

                            <TabsContent value="goals">
                                <CampaignGoalsTab campaignId={campaignId} />
                            </TabsContent>

                            <TabsContent value="videos">
                                {/* Videos & Analytics Section */}
                                {campaign.videos && campaign.videos.length > 0 ? (
                                    <div className="mt-8">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6">📹 Videos & Analytics</h2>

                                        {/* Individual Video Analytics */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                            {campaign.videos.map((video) => (
                                                <VideoAnalyticsCard key={video.id} video={video} />
                                            ))}
                                        </div>

                                        {/* Performance Analysis */}
                                        <PerformanceAnalysisCard
                                            analytics={{
                                                videoStats: {
                                                    total: campaign.videosRequested,
                                                    posted: campaign.videosCompleted
                                                },
                                                performanceMetrics: {
                                                    totalViews: stats.totalViews,
                                                    avgViewsPerVideo: campaign.videosCompleted > 0 ? Math.round(stats.totalViews / campaign.videosCompleted) : 0,
                                                    engagementRate: campaign.videos.length > 0
                                                        ? ((campaign.videos.reduce((sum, v) => sum + (v.likes || 0) + (v.comments || 0), 0) / stats.totalViews) * 100).toFixed(2)
                                                        : "0"
                                                },
                                                creatorStats: campaign.videos
                                                    .filter(v => v.creator)
                                                    .map(v => ({
                                                        id: v.creator!.id,
                                                        name: v.creator!.fullName,
                                                        videosCount: 1,
                                                        totalViews: v.currentViewCount || 0
                                                    }))
                                                    .reduce((acc: any[], curr) => {
                                                        const existing = acc.find(c => c.id === curr.id);
                                                        if (existing) {
                                                            existing.videosCount++;
                                                            existing.totalViews += curr.totalViews;
                                                        } else {
                                                            acc.push(curr);
                                                        }
                                                        return acc;
                                                    }, [])
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">No videos available yet.</div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </main >
            </div >
        </>
    );
}
