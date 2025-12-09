"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, Upload, Share2, Link as LinkIcon, BarChart2, MoreHorizontal } from "lucide-react";

type TaskStatus = "ASSIGNED" | "DRAFT_UPLOADED" | "REVISION_REQUESTED" | "APPROVED" | "POSTED" | "COMPLETED";

type Task = {
    id: string;
    campaignId: string;
    campaignName: string;
    founderName: string;
    status: TaskStatus;
    assignedAt: string;
    deadline: string;
    baseFee: number;
    draftUrl?: string;
    postingUrl?: string;
    revisionFeedback?: string;
    revisionDeadline?: string;
    views?: number;
    performanceBonus?: number;
    totalEarnings?: number;
    daysUntilLock?: number;
    unacknowledgedRequirements?: number;
};

type TaskStats = {
    active: number;
    actionRequired: number;
    inReview: number;
    completed: number;
};

type GroupedTasks = {
    actionRequired: Task[];
    active: Task[];
    inReview: Task[];
    completed: Task[];
};

export default function CreatorTasksPage() {
    const router = useRouter();
    const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({
        actionRequired: [],
        active: [],
        inReview: [],
        completed: []
    });
    const [stats, setStats] = useState<TaskStats>({
        active: 0,
        actionRequired: 0,
        inReview: 0,
        completed: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("/api/creator/tasks", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const result = await response.json();
                if (result.data) {
                    setGroupedTasks(result.data.tasks);
                    setStats(result.data.stats);
                }
            } else {
                console.error("Failed to fetch tasks");
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: TaskStatus) => {
        const badges = {
            ASSIGNED: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", label: "Draft Needed" },
            DRAFT_UPLOADED: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Under Review" },
            REVISION_REQUESTED: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", label: "Revision Needed" },
            APPROVED: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", label: "Approved - Ready to Post" },
            POSTED: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", label: "Posted - Tracking" },
            COMPLETED: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", label: "Completed" }
        };
        return badges[status] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", label: status };
    };

    const TaskCard = ({ task }: { task: Task }) => {
        const badge = getStatusBadge(task.status);
        const isOverdue = new Date(task.deadline) < new Date() && task.status !== "COMPLETED" && task.status !== "POSTED";

        return (
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary-DEFAULT">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {task.campaignName}
                                </h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
                                    {badge.label}
                                </span>
                                {isOverdue && (
                                    <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-medium">
                                        ⚠️ Overdue
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                {task.founderName}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Deadline</p>
                                    <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                                        {new Date(task.deadline).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Expected Earnings</p>
                                    <p className="text-sm font-medium text-green-600">
                                        ${(task.totalEarnings || task.baseFee).toFixed(2)}
                                    </p>
                                </div>
                                {task.views !== undefined && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Views</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {task.views.toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {task.unacknowledgedRequirements && task.unacknowledgedRequirements > 0 && (
                                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                    <p className="text-sm font-medium text-orange-800 mb-1">
                                        ⚠️ {task.unacknowledgedRequirements} requirement(s) pending acknowledgment
                                    </p>
                                    <Link href={`/creator/requirements/${task.campaignId}`}>
                                        <Button size="sm" variant="outline" className="mt-2 text-xs">
                                            View Requirements →
                                        </Button>
                                    </Link>
                                </div>
                            )}

                        </div>

                        <div className="ml-6 flex flex-col items-end gap-2">
                            <Link href={`/creator/tasks/${task.id}`}>
                                <Button size="sm">View Details →</Button>
                            </Link>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-full">
                                        Take Action <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-80 p-0">
                                    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
                                        <div className="p-4 bg-gray-50 border-b border-gray-100">
                                            <h4 className="font-semibold text-gray-900">Campaign Actions</h4>
                                            <p className="text-xs text-gray-500">Manage your campaign tasks</p>
                                        </div>
                                        <div className="p-2 grid grid-cols-2 gap-2">
                                            <Link href={`/creator/tasks/${task.id}/upload`} className="block">
                                                <div className="flex flex-col items-center justify-center p-3 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition-all cursor-pointer group h-full">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                        <Upload className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700">Upload Draft</span>
                                                </div>
                                            </Link>

                                            <Link href={`/creator/tasks/${task.id}/post`} className="block">
                                                <div className="flex flex-col items-center justify-center p-3 hover:bg-purple-50 rounded-lg border border-transparent hover:border-purple-100 transition-all cursor-pointer group h-full">
                                                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                        <Share2 className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-700 group-hover:text-purple-700">Post Video</span>
                                                </div>
                                            </Link>

                                            <Link href={`/creator/tasks/${task.id}/submit-url`} className="block">
                                                <div className="flex flex-col items-center justify-center p-3 hover:bg-green-50 rounded-lg border border-transparent hover:border-green-100 transition-all cursor-pointer group h-full">
                                                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                        <LinkIcon className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-700 group-hover:text-green-700">Submit URL</span>
                                                </div>
                                            </Link>

                                            <Link href={`/creator/tasks/${task.id}/performance`} className="block">
                                                <div className="flex flex-col items-center justify-center p-3 hover:bg-orange-50 rounded-lg border border-transparent hover:border-orange-100 transition-all cursor-pointer group h-full">
                                                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                        <BarChart2 className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-700 group-hover:text-orange-700">Performance</span>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-DEFAULT mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main>
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            My Tasks
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Manage your assigned campaigns and track your progress
                        </p>
                    </div>

                    {/* Summary Counters */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <Card className="bg-blue-50 border-blue-100">
                            <CardContent className="p-4 text-center">
                                <p className="text-3xl font-bold text-blue-600">{stats.active}</p>
                                <p className="text-sm font-medium text-blue-800">Active Campaigns</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-red-50 border-red-100">
                            <CardContent className="p-4 text-center">
                                <p className="text-3xl font-bold text-red-600">{stats.actionRequired}</p>
                                <p className="text-sm font-medium text-red-800">Action Required</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-yellow-50 border-yellow-100">
                            <CardContent className="p-4 text-center">
                                <p className="text-3xl font-bold text-yellow-600">{stats.inReview}</p>
                                <p className="text-sm font-medium text-yellow-800">In Review</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-green-50 border-green-100">
                            <CardContent className="p-4 text-center">
                                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                                <p className="text-sm font-medium text-green-800">Completed</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        {/* Action Required Section */}
                        {groupedTasks.actionRequired.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                                    ⚠️ Action Required
                                </h2>
                                <div className="space-y-4">
                                    {groupedTasks.actionRequired.map(task => (
                                        <TaskCard key={task.id} task={task} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Active Campaigns Section */}
                        {groupedTasks.active.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    Active Campaigns
                                </h2>
                                <div className="space-y-4">
                                    {groupedTasks.active.map(task => (
                                        <TaskCard key={task.id} task={task} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* In Review Section */}
                        {groupedTasks.inReview.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    In Review
                                </h2>
                                <div className="space-y-4">
                                    {groupedTasks.inReview.map(task => (
                                        <TaskCard key={task.id} task={task} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Completed Section */}
                        {groupedTasks.completed.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    Completed
                                </h2>
                                <div className="space-y-4">
                                    {groupedTasks.completed.map(task => (
                                        <TaskCard key={task.id} task={task} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {Object.values(groupedTasks).every(arr => arr.length === 0) && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No tasks found. Apply to campaigns to get started!</p>
                                <Link href="/creator/briefs" className="mt-4 inline-block">
                                    <Button>Browse Campaigns</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

