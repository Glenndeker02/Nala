"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

import InstructionsCard from "./components/InstructionsCard";
import MyCodesCard from "@/app/creator/components/MyCodesCard";

type TaskDetail = {
    id: string;
    campaignId: string;
    campaignName: string;
    founderName: string;
    status: string;
    assignedAt: string;
    deadline: string;
    baseFee: number;
    baseFeePaymentDate?: string;
    draftUrl?: string;
    postingUrl?: string;
    platform?: string;
    postedAt?: string;
    metricsLockDate?: string;
    daysUntilLock?: number;
    performance?: {
        views: number;
        likes: number;
        comments: number;
        shares: number;
        completedViews: number;
        watchTimeHours: number;
        engagementRate: number;
        completionRate: number;
    };
    earnings: {
        baseFee: number;
        performanceBonus: number;
        total: number;
    };
    timeline: {
        assigned: string;
        draftSubmitted?: string;
        approved?: string;
        posted?: string;
        metricsLocked?: string;
        settled?: string;
    };
    briefData?: any; // Added for InstructionsCard
};

export default function TaskDetailPage() {
    const router = useRouter();
    const params = useParams();
    const taskId = params.id as string;

    const [task, setTask] = useState<TaskDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (taskId) {
            fetchTaskDetail();
        }
    }, [taskId]);

    const fetchTaskDetail = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`/api/videos/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const result = await response.json();
                const video = result.data.video;
                const campaign = video.campaign;

                // Map API data to component state
                const mappedTask: TaskDetail = {
                    id: video.id,
                    campaignId: campaign.id,
                    campaignName: campaign.name,
                    founderName: campaign.founder.companyName || campaign.founder.fullName,
                    status: video.status,
                    assignedAt: video.createdAt,
                    deadline: video.revisionDeadline || video.deadline || campaign.deadline,
                    baseFee: Number(video.baseFeeAmount || campaign.baseFeePerVideo || 0),
                    baseFeePaymentDate: video.baseFeePaid ? video.updatedAt : undefined, // Approximate
                    draftUrl: video.draftVideoUrl,
                    postingUrl: video.finalPostUrl,
                    platform: video.platform || campaign.platform,
                    postedAt: video.postedAt,
                    metricsLockDate: video.lockedAt,
                    daysUntilLock: video.lockedAt ? Math.ceil((new Date(video.lockedAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : undefined,
                    performance: video.performanceMetrics ? {
                        views: video.currentViewCount || 0,
                        likes: video.performanceMetrics.likes || 0,
                        comments: video.performanceMetrics.comments || 0,
                        shares: video.performanceMetrics.shares || 0,
                        completedViews: video.performanceMetrics.completedViews || 0,
                        watchTimeHours: video.performanceMetrics.watchTimeHours || 0,
                        engagementRate: video.performanceMetrics.engagementRate || 0,
                        completionRate: video.performanceMetrics.completionRate || 0
                    } : undefined,
                    earnings: {
                        baseFee: Number(video.baseFeeAmount || campaign.baseFeePerVideo || 0),
                        performanceBonus: Number(video.performanceBonusAmount || 0),
                        total: Number(video.baseFeeAmount || campaign.baseFeePerVideo || 0) + Number(video.performanceBonusAmount || 0)
                    },
                    timeline: {
                        assigned: video.createdAt,
                        draftSubmitted: video.submittedAt,
                        approved: video.approvedAt,
                        posted: video.postedAt,
                        metricsLocked: video.lockedAt,
                        settled: video.performanceBonusPaid ? video.updatedAt : undefined
                    },
                    briefData: campaign.briefData // Pass brief data for instructions
                };

                setTask(mappedTask);
                console.log('[TASK PAGE] Task status:', mappedTask.status);
                console.log('[TASK PAGE] Video status:', video.status);
            } else {
                console.error("Failed to fetch task details");
            }
        } catch (error) {
            console.error("Error fetching task:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchTaskDetail();
        setTimeout(() => setRefreshing(false), 500);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-DEFAULT mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading task details...</p>
                </div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Not Found</h2>
                    <p className="text-gray-600 mb-6">This task may no longer be available.</p>
                    <Link href="/creator/tasks">
                        <Button>← Back to Tasks</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const isTracking = task.status === "POSTED";
    const isCompleted = task.status === "COMPLETED";

    return (
        <div className="min-h-screen bg-gray-50">
            <main>
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/creator/tasks"
                            className="text-primary-DEFAULT hover:text-primary-600 font-medium mb-4 inline-block transition-colors"
                        >
                            ← Back to Tasks
                        </Link>
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                    {task.campaignName}
                                </h1>
                                <p className="mt-2 text-gray-600">
                                    {task.founderName}
                                </p>
                            </div>
                            {isTracking && (
                                <Button
                                    variant="secondary"
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                >
                                    {refreshing ? "Refreshing..." : "🔄 Refresh Data"}
                                </Button>
                            )}
                        </div>
                    </div>



                    {/* Instructions Card */}
                    <div className="mb-6">
                        <InstructionsCard campaignId={task.campaignId} briefData={task.briefData} />
                    </div>

                    {/* My Attribution Codes Card */}
                    <div className="mb-6">
                        <MyCodesCard campaignId={task.campaignId} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Performance Metrics */}
                            {task.performance && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Performance Metrics</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Total Views</p>
                                                <p className="text-3xl font-bold text-gray-900">
                                                    {task.performance.views.toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Likes</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {task.performance.likes.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {((task.performance.likes / task.performance.views) * 100).toFixed(1)}%
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Comments</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {task.performance.comments.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {((task.performance.comments / task.performance.views) * 100).toFixed(1)}%
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Shares</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {task.performance.shares.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {((task.performance.shares / task.performance.views) * 100).toFixed(1)}%
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Completed Views</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {task.performance.completedViews.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {task.performance.completionRate.toFixed(1)}% completion
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Watch Time</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {task.performance.watchTimeHours}h
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-blue-900">Engagement Rate</span>
                                                <span className="text-lg font-bold text-blue-900">
                                                    {task.performance.engagementRate.toFixed(2)}%
                                                </span>
                                            </div>
                                            <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-600 rounded-full"
                                                    style={{ width: `${Math.min(task.performance.engagementRate * 10, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Earnings Breakdown */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>💰 Earnings Breakdown</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-gray-600">Base Fee</p>
                                            {task.baseFeePaymentDate && (
                                                <p className="text-xs text-gray-500">
                                                    Paid {new Date(task.baseFeePaymentDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-xl font-bold text-gray-900">
                                            ${task.earnings.baseFee.toFixed(2)}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-gray-600">Performance Bonus</p>
                                            {task.performance && (
                                                <p className="text-xs text-gray-500">
                                                    {task.performance.views.toLocaleString()} views × $4.00/1k
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-xl font-bold text-primary-DEFAULT">
                                            ${task.earnings.performanceBonus.toFixed(2)}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                                        <p className="font-bold text-gray-900">Total Earnings</p>
                                        <p className="text-3xl font-bold text-primary-DEFAULT">
                                            ${task.earnings.total.toFixed(2)}
                                        </p>
                                    </div>

                                    {isTracking && (
                                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                            <p className="text-sm text-purple-800">
                                                💡 Bonus updates daily. Final amount paid after metrics lock.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Timelines & Progress */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>📅 Timelines & Progress</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-semibold text-gray-900">Campaign Stages</h4>
                                            <span className="text-xs text-gray-500">
                                                {task.status === 'COMPLETED' ? 'All stages completed' : 'In progress'}
                                            </span>
                                        </div>

                                        <div className="relative">
                                            {/* Vertical Line */}
                                            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200 -z-10"></div>

                                            <div className="space-y-8">
                                                {/* Assigned Stage */}
                                                <div className="flex gap-4">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${task.timeline.assigned ? 'bg-green-100 border-green-500 text-green-600' : 'bg-white border-gray-300'}`}>
                                                        {task.timeline.assigned ? '✓' : ''}
                                                    </div>
                                                    <div>
                                                        <p className={`font-medium ${task.timeline.assigned ? 'text-gray-900' : 'text-gray-500'}`}>Task Assigned</p>
                                                        {task.timeline.assigned && (
                                                            <p className="text-xs text-gray-500">{new Date(task.timeline.assigned).toLocaleDateString()}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Draft Stage */}
                                                <div className="flex gap-4">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${task.timeline.draftSubmitted ? 'bg-green-100 border-green-500 text-green-600' : 'bg-white border-gray-300'}`}>
                                                        {task.timeline.draftSubmitted ? '✓' : ''}
                                                    </div>
                                                    <div>
                                                        <p className={`font-medium ${task.timeline.draftSubmitted ? 'text-gray-900' : 'text-gray-500'}`}>Draft Submitted</p>
                                                        {task.timeline.draftSubmitted ? (
                                                            <p className="text-xs text-gray-500">{new Date(task.timeline.draftSubmitted).toLocaleDateString()}</p>
                                                        ) : (
                                                            <p className="text-xs text-orange-600 font-medium">Pending Action</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Approval Stage */}
                                                <div className="flex gap-4">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${task.timeline.approved ? 'bg-green-100 border-green-500 text-green-600' : 'bg-white border-gray-300'}`}>
                                                        {task.timeline.approved ? '✓' : ''}
                                                    </div>
                                                    <div>
                                                        <p className={`font-medium ${task.timeline.approved ? 'text-gray-900' : 'text-gray-500'}`}>Founder Approval</p>
                                                        {task.timeline.approved && (
                                                            <p className="text-xs text-gray-500">{new Date(task.timeline.approved).toLocaleDateString()}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Posting Stage */}
                                                <div className="flex gap-4">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${task.timeline.posted ? 'bg-green-100 border-green-500 text-green-600' : 'bg-white border-gray-300'}`}>
                                                        {task.timeline.posted ? '✓' : ''}
                                                    </div>
                                                    <div>
                                                        <p className={`font-medium ${task.timeline.posted ? 'text-gray-900' : 'text-gray-500'}`}>Video Posted</p>
                                                        {task.timeline.posted && (
                                                            <p className="text-xs text-gray-500">{new Date(task.timeline.posted).toLocaleDateString()}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Completion Stage */}
                                                <div className="flex gap-4">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${task.timeline.metricsLocked ? 'bg-green-100 border-green-500 text-green-600' : 'bg-white border-gray-300'}`}>
                                                        {task.timeline.metricsLocked ? '✓' : ''}
                                                    </div>
                                                    <div>
                                                        <p className={`font-medium ${task.timeline.metricsLocked ? 'text-gray-900' : 'text-gray-500'}`}>Metrics Locked & Completed</p>
                                                        {task.timeline.metricsLocked && (
                                                            <p className="text-xs text-gray-500">{new Date(task.timeline.metricsLocked).toLocaleDateString()}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Task Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Status</p>
                                        <p className="font-medium text-gray-900 capitalize">{task.status}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Platform</p>
                                        <p className="font-medium text-gray-900">{task.platform || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Assigned</p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(task.assignedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {task.postedAt && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Posted</p>
                                            <p className="font-medium text-gray-900">
                                                {new Date(task.postedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quick Actions Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {/* Upload Button */}
                                    {['PENDING', 'ASSIGNED', 'REVISION_REQUESTED'].includes(task.status) ? (
                                        <Link href={`/creator/tasks/${task.id}/upload`}>
                                            <Button className="w-full justify-start" variant="default">
                                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                                {task.status === 'REVISION_REQUESTED' ? 'Upload Revision' : 'Upload Draft'}
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button className="w-full justify-start opacity-50 cursor-not-allowed" variant="secondary" disabled>
                                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                            Upload Draft
                                        </Button>
                                    )}

                                    {/* Post Button */}
                                    {task.status === 'APPROVED' ? (
                                        <Link href={`/creator/tasks/${task.id}/post`}>
                                            <Button className="w-full justify-start" variant="default">
                                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                </svg>
                                                Post Video
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button className="w-full justify-start opacity-50 cursor-not-allowed" variant="secondary" disabled>
                                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                            </svg>
                                            Post Video
                                        </Button>
                                    )}

                                    {/* Submit URL Button */}
                                    {task.status === 'APPROVED' ? (
                                        <Link href={`/creator/tasks/${task.id}/submit-url`}>
                                            <Button className="w-full justify-start" variant="secondary">
                                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                                Submit URL
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button className="w-full justify-start opacity-50 cursor-not-allowed" variant="secondary" disabled>
                                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                            Submit URL
                                        </Button>
                                    )}

                                    {/* View Performance Button */}
                                    {['POSTED', 'LOCKED', 'COMPLETED'].includes(task.status) ? (
                                        <Link href={`/creator/tasks/${task.id}/performance`}>
                                            <Button className="w-full justify-start" variant="secondary">
                                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                                View Performance
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button className="w-full justify-start opacity-50 cursor-not-allowed" variant="secondary" disabled>
                                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            View Performance
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            {task.postingUrl && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Video Link</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <a
                                            href={task.postingUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block"
                                        >
                                            <Button className="w-full" variant="secondary">
                                                🔗 View on {task.platform}
                                            </Button>
                                        </a>
                                    </CardContent>
                                </Card>
                            )}

                            <Card className="bg-green-50 border-green-200">
                                <CardContent className="p-6">
                                    <h3 className="font-bold text-green-900 mb-2">
                                        💡 Performance Tips
                                    </h3>
                                    <ul className="space-y-2 text-sm text-green-800">
                                        <li>• Engage with comments to boost visibility</li>
                                        <li>• Share to your story for extra reach</li>
                                        <li>• Post at peak times for your audience</li>
                                        <li>• Use trending sounds when relevant</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

