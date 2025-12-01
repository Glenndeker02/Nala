"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

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
};

export default function CreatorTasksPage() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

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
                const data = result.data || result;
                setTasks(data);
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

    const getStatusIcon = (status: TaskStatus) => {
        const icons = {
            ASSIGNED: "📝",
            DRAFT_UPLOADED: "⏳",
            REVISION_REQUESTED: "🔄",
            APPROVED: "✅",
            POSTED: "📊",
            COMPLETED: "🎉"
        };
        return icons[status];
    };

    const getActionButton = (task: Task) => {
        switch (task.status) {
            case "ASSIGNED":
                return (
                    <Link href={`/creator/tasks/${task.id}/upload`}>
                        <Button>Upload Draft</Button>
                    </Link>
                );
            case "REVISION_REQUESTED":
                return (
                    <Link href={`/creator/tasks/${task.id}/upload`}>
                        <Button>Upload Revision</Button>
                    </Link>
                );
            case "APPROVED":
                return (
                    <Link href={`/creator/tasks/${task.id}/submit-url`}>
                        <Button>Submit Posting URL</Button>
                    </Link>
                );
            case "POSTED":
                return (
                    <Link href={`/creator/tasks/${task.id}`}>
                        <Button variant="secondary">View Performance</Button>
                    </Link>
                );
            case "COMPLETED":
                return (
                    <Link href={`/creator/tasks/${task.id}`}>
                        <Button variant="secondary">View Details</Button>
                    </Link>
                );
            default:
                return null;
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === "all") return true;
        if (filter === "active") return task.status !== "COMPLETED";
        if (filter === "completed") return task.status === "COMPLETED";
        return true;
    });

    const activeTasks = tasks.filter(t => t.status !== "COMPLETED").length;
    const completedTasks = tasks.filter(t => t.status === "COMPLETED").length;
    const totalEarnings = tasks.reduce((sum, t) => sum + (t.totalEarnings || t.baseFee), 0);

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

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Active Tasks</p>
                                        <p className="text-3xl font-bold text-gray-900">{activeTasks}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-primary-DEFAULT" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Completed</p>
                                        <p className="text-3xl font-bold text-gray-900">{completedTasks}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                                        <p className="text-3xl font-bold text-primary-DEFAULT">
                                            ${totalEarnings.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 flex gap-3">
                        <Button
                            variant={filter === "all" ? "primary" : "secondary"}
                            onClick={() => setFilter("all")}
                        >
                            All Tasks ({tasks.length})
                        </Button>
                        <Button
                            variant={filter === "active" ? "primary" : "secondary"}
                            onClick={() => setFilter("active")}
                        >
                            Active ({activeTasks})
                        </Button>
                        <Button
                            variant={filter === "completed" ? "primary" : "secondary"}
                            onClick={() => setFilter("completed")}
                        >
                            Completed ({completedTasks})
                        </Button>
                    </div>

                    {/* Task List */}
                    {filteredTasks.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No tasks found</h3>
                                <p className="text-gray-600 mb-6">
                                    {filter === "all"
                                        ? "You don't have any assigned tasks yet. Browse available campaigns to get started!"
                                        : `You don't have any ${filter} tasks.`}
                                </p>
                                {filter === "all" && (
                                    <Link href="/creator/briefs">
                                        <Button>Browse Campaigns</Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredTasks.map((task) => {
                                const badge = getStatusBadge(task.status);
                                const icon = getStatusIcon(task.status);
                                const isOverdue = new Date(task.deadline) < new Date() && task.status !== "COMPLETED" && task.status !== "POSTED";

                                return (
                                    <Card key={task.id} className="hover:shadow-xl transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="text-2xl">{icon}</span>
                                                        <div>
                                                            <h3 className="text-xl font-bold text-gray-900">
                                                                {task.campaignName}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                {task.founderName}
                                                            </p>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
                                                            {badge.label}
                                                        </span>
                                                        {isOverdue && (
                                                            <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-medium">
                                                                ⚠️ Overdue
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Assigned</p>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {new Date(task.assignedAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Deadline</p>
                                                            <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                                                                {new Date(task.deadline).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Base Fee</p>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                ${task.baseFee}
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

                                                    {task.status === "REVISION_REQUESTED" && task.revisionFeedback && (
                                                        <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                                                            <p className="text-sm font-medium text-orange-900 mb-1">
                                                                📝 Revision Feedback:
                                                            </p>
                                                            <p className="text-sm text-orange-800">{task.revisionFeedback}</p>
                                                            {task.revisionDeadline && (
                                                                <p className="text-xs text-orange-600 mt-2">
                                                                    Revision due: {new Date(task.revisionDeadline).toLocaleDateString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {task.status === "POSTED" && (
                                                        <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-sm font-medium text-purple-900 mb-1">
                                                                        📊 Performance Tracking Active
                                                                    </p>
                                                                    <p className="text-sm text-purple-800">
                                                                        Current Bonus: ${task.performanceBonus?.toFixed(2)} • {task.daysUntilLock} days until lock
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-xs text-purple-600">Total Earnings</p>
                                                                    <p className="text-lg font-bold text-purple-900">
                                                                        ${task.totalEarnings?.toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {task.status === "COMPLETED" && (
                                                        <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-sm font-medium text-green-900 mb-1">
                                                                        🎉 Campaign Completed
                                                                    </p>
                                                                    <p className="text-sm text-green-800">
                                                                        Final Views: {task.views?.toLocaleString()} • Payment Processed
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-xs text-green-600">Total Earned</p>
                                                                    <p className="text-lg font-bold text-green-900">
                                                                        ${task.totalEarnings?.toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="ml-6">
                                                    {getActionButton(task)}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
