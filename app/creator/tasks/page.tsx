"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AssignedVideo = {
    id: string;
    status: string;
    campaign: {
        id: string;
        name: string;
        description: string;
        founder: {
            fullName: string;
            companyName: string | null;
        };
    };
    baseFeeAmount: number | null;
    createdAt: string;
};

export default function CreatorTasksPage() {
    const [videos, setVideos] = useState<AssignedVideo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignedVideos();
    }, []);

    const fetchAssignedVideos = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("/api/creator/tasks", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setVideos(data.videos || []);
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading your tasks...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <Link href="/creator/dashboard" className="text-indigo-600 hover:text-indigo-800">
                        &larr; Back to Dashboard
                    </Link>
                </div>

                <div className="bg-white shadow rounded-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">My Tasks</h1>

                    {videos.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No active tasks yet.</p>
                            <p className="text-gray-400 text-sm mt-2">
                                Apply to campaigns to get assigned video projects.
                            </p>
                            <Link
                                href="/creator/briefs"
                                className="mt-4 inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors font-medium"
                            >
                                Browse Available Briefs
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {videos.map((video) => (
                                <div
                                    key={video.id}
                                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                {video.campaign.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                by {video.campaign.founder.companyName || video.campaign.founder.fullName}
                                            </p>
                                        </div>
                                        <span
                                            className={`text-xs px-3 py-1 rounded-full font-medium ${video.status === "PENDING"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : video.status === "DRAFT_SUBMITTED"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : video.status === "APPROVED"
                                                            ? "bg-green-100 text-green-800"
                                                            : video.status === "POSTED"
                                                                ? "bg-purple-100 text-purple-800"
                                                                : "bg-gray-100 text-gray-800"
                                                }`}
                                        >
                                            {video.status.replace(/_/g, " ")}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {video.campaign.description}
                                    </p>

                                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                        <div className="text-sm">
                                            {video.baseFeeAmount && (
                                                <span className="text-gray-600">
                                                    Base Fee: <span className="font-semibold text-green-600">${video.baseFeeAmount}</span>
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-3">
                                            {video.status === "PENDING" && (
                                                <Link
                                                    href={`/creator/tasks/${video.id}/upload`}
                                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                                                >
                                                    Upload Draft
                                                </Link>
                                            )}
                                            {video.status === "DRAFT_SUBMITTED" && (
                                                <span className="text-sm text-gray-500">Awaiting review...</span>
                                            )}
                                            {video.status === "APPROVED" && (
                                                <Link
                                                    href={`/creator/tasks/${video.id}/post`}
                                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                                                >
                                                    Submit Posting URL
                                                </Link>
                                            )}
                                            {video.status === "POSTED" && (
                                                <Link
                                                    href={`/creator/tasks/${video.id}/performance`}
                                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                                >
                                                    View Performance →
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
