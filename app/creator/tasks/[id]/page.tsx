"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

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
            // Mock data for demonstration
            const mockTask: TaskDetail = {
                id: taskId,
                campaignId: "1",
                campaignName: "Acme Product Launch",
                founderName: "Mike Johnson",
                status: "POSTED",
                assignedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                baseFee: 50,
                baseFeePaymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                draftUrl: "https://example.com/draft.mp4",
                postingUrl: "https://www.tiktok.com/@user/video/1234567890",
                platform: "TIKTOK",
                postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                metricsLockDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
                daysUntilLock: 4,
                performance: {
                    views: 12500,
                    likes: 587,
                    comments: 43,
                    shares: 89,
                    completedViews: 8600,
                    watchTimeHours: 312,
                    engagementRate: 5.75,
                    completionRate: 68.8
                },
                earnings: {
                    baseFee: 50,
                    performanceBonus: 50,
                    total: 100
                },
                timeline: {
                    assigned: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                    draftSubmitted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    approved: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    posted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                }
            };

            setTask(mockTask);
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

                    {/* Tracking Banner */}
                    {isTracking && task.daysUntilLock !== undefined && (
                        <Card className="mb-6 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-purple-900 mb-1">
                                            📊 Performance Tracking Active
                                        </h3>
                                        <p className="text-purple-800">
                                            Views update daily • {task.daysUntilLock} days until metrics lock
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-purple-600">Lock Date</p>
                                        <p className="text-lg font-bold text-purple-900">
                                            {task.metricsLockDate && new Date(task.metricsLockDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

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

                            {/* Timeline */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>📅 Timeline</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {task.timeline.assigned && (
                                            <div className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-3 h-3 bg-primary-DEFAULT rounded-full"></div>
                                                    <div className="w-0.5 h-full bg-gray-200"></div>
                                                </div>
                                                <div className="pb-4">
                                                    <p className="font-medium text-gray-900">Assigned</p>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(task.timeline.assigned).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {task.timeline.draftSubmitted && (
                                            <div className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-3 h-3 bg-primary-DEFAULT rounded-full"></div>
                                                    <div className="w-0.5 h-full bg-gray-200"></div>
                                                </div>
                                                <div className="pb-4">
                                                    <p className="font-medium text-gray-900">Draft Submitted</p>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(task.timeline.draftSubmitted).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {task.timeline.approved && (
                                            <div className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                                    <div className="w-0.5 h-full bg-gray-200"></div>
                                                </div>
                                                <div className="pb-4">
                                                    <p className="font-medium text-gray-900">Approved & Paid</p>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(task.timeline.approved).toLocaleString()}
                                                    </p>
                                                    <p className="text-sm text-green-600 font-medium">
                                                        Base fee: ${task.baseFee}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {task.timeline.posted && (
                                            <div className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                                                    {!isCompleted && <div className="w-0.5 h-full bg-gray-200"></div>}
                                                </div>
                                                <div className="pb-4">
                                                    <p className="font-medium text-gray-900">Posted</p>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(task.timeline.posted).toLocaleString()}
                                                    </p>
                                                    {task.postingUrl && (
                                                        <a
                                                            href={task.postingUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-primary-DEFAULT hover:underline"
                                                        >
                                                            View on {task.platform}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {task.timeline.metricsLocked && (
                                            <div className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                                    <div className="w-0.5 h-full bg-gray-200"></div>
                                                </div>
                                                <div className="pb-4">
                                                    <p className="font-medium text-gray-900">Metrics Locked</p>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(task.timeline.metricsLocked).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {task.timeline.settled && (
                                            <div className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Settlement Complete</p>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(task.timeline.settled).toLocaleString()}
                                                    </p>
                                                    <p className="text-sm text-green-600 font-medium">
                                                        Bonus paid: ${task.earnings.performanceBonus}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
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
