"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type VideoReview = {
    id: string;
    status: string;
    draftVideoUrl: string | null;
    submittedAt: string | null;
    creator: {
        id: string;
        fullName: string;
        email: string;
    };
};

export default function ReviewVideosPage({ params }: { params: { id: string } }) {
    const [videos, setVideos] = useState<VideoReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<VideoReview | null>(null);
    const [feedback, setFeedback] = useState("");
    const [processing, setProcessing] = useState(false);

    const fetchVideos = useCallback(async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`/api/campaigns/${params.id}/videos`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setVideos(data.videos || []);
            }
        } catch (error) {
            console.error("Error fetching videos:", error);
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    const handleApprove = async (videoId: string) => {
        if (!confirm("Are you sure you want to approve this video? The creator will receive their base fee.")) {
            return;
        }

        setProcessing(true);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`/api/videos/${videoId}/approve`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to approve video");
            }

            alert("Video approved! Base fee payment initiated.");
            fetchVideos();
            setSelectedVideo(null);
        } catch (error) {
            console.error("Error approving video:", error);
            alert(error instanceof Error ? error.message : "Failed to approve video");
        } finally {
            setProcessing(false);
        }
    };

    const handleRequestRevision = async (videoId: string) => {
        if (!feedback.trim()) {
            alert("Please provide feedback for the revision");
            return;
        }

        setProcessing(true);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`/api/videos/${videoId}/request-revision`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ feedback }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to request revision");
            }

            alert("Revision requested. Creator will be notified.");
            fetchVideos();
            setSelectedVideo(null);
            setFeedback("");
        } catch (error) {
            console.error("Error requesting revision:", error);
            alert(error instanceof Error ? error.message : "Failed to request revision");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-8">Loading videos...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <Link href="/founder/dashboard" className="text-indigo-600 hover:text-indigo-800">
                        &larr; Back to Dashboard
                    </Link>
                </div>

                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900">Review Video Drafts</h1>
                    </div>

                    {videos.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-500 text-lg">No videos submitted yet</p>
                            <p className="text-gray-400 text-sm mt-2">
                                Creators will upload their drafts here for your review
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {videos.map((video) => (
                                <div key={video.id} className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {video.creator.fullName}
                                            </h3>
                                            <p className="text-sm text-gray-500">{video.creator.email}</p>
                                            {video.submittedAt && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Submitted {new Date(video.submittedAt).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                        <span
                                            className={`text-xs px-3 py-1 rounded-full font-medium ${video.status === "DRAFT_SUBMITTED"
                                                ? "bg-blue-100 text-blue-800"
                                                : video.status === "APPROVED"
                                                    ? "bg-green-100 text-green-800"
                                                    : video.status === "REVISION_REQUESTED"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}
                                        >
                                            {video.status.replace(/_/g, " ")}
                                        </span>
                                    </div>

                                    {video.draftVideoUrl && video.status === "DRAFT_SUBMITTED" && (
                                        <div className="mt-4">
                                            <div className="bg-gray-900 rounded-lg overflow-hidden mb-4">
                                                <video
                                                    controls
                                                    className="w-full max-h-96"
                                                    src={video.draftVideoUrl}
                                                >
                                                    Your browser does not support the video tag.
                                                </video>
                                            </div>

                                            {selectedVideo?.id === video.id ? (
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                                                        Provide Feedback
                                                    </h4>
                                                    <textarea
                                                        rows={4}
                                                        value={feedback}
                                                        onChange={(e) => setFeedback(e.target.value)}
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border mb-3"
                                                        placeholder="Explain what changes are needed..."
                                                    />
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedVideo(null);
                                                                setFeedback("");
                                                            }}
                                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleRequestRevision(video.id)}
                                                            disabled={processing}
                                                            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
                                                        >
                                                            {processing ? "Sending..." : "Send Revision Request"}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleApprove(video.id)}
                                                        disabled={processing}
                                                        className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                                                    >
                                                        {processing ? "Processing..." : "Approve & Pay Base Fee"}
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedVideo(video)}
                                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                                    >
                                                        Request Revision
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {video.status === "APPROVED" && (
                                        <div className="mt-4 bg-green-50 p-4 rounded-lg">
                                            <p className="text-sm text-green-800">
                                                ✓ Video approved. Waiting for creator to post and submit URL.
                                            </p>
                                        </div>
                                    )}

                                    {video.status === "REVISION_REQUESTED" && (
                                        <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
                                            <p className="text-sm text-yellow-800">
                                                Revision requested. Waiting for creator to resubmit.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
