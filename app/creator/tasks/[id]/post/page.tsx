"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import InstructionsCard from "../components/InstructionsCard";

type VideoTask = {
    id: string;
    status: string;
    platform: string | null;
    campaign: {
        id: string;
        name: string;
        briefData: any;
        founder: {
            fullName: string;
            companyName: string | null;
        };
    };
};

export default function SubmitPostURLPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [video, setVideo] = useState<VideoTask | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        postUrl: "",
        platform: "TIKTOK",
        postedAt: "",
        postedTime: "",
    });

    const fetchVideoDetails = useCallback(async () => {
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
                // Pre-select platform if available from campaign brief
                if (data.video.campaign.briefData?.platforms?.[0]) {
                    setFormData(prev => ({
                        ...prev,
                        platform: data.video.campaign.briefData.platforms[0]
                    }));
                }
            }
        } catch (error) {
            console.error("Error fetching video:", error);
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        fetchVideoDetails();
    }, [fetchVideoDetails]);

    const validateURL = (url: string, platform: string): boolean => {
        const patterns: Record<string, RegExp> = {
            TIKTOK: /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com)\/@[\w.-]+\/video\/\d+/i,
            INSTAGRAM: /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[\w-]+/i,
            FACEBOOK: /^https?:\/\/(www\.)?facebook\.com\/[\w.-]+\/(videos|posts)\/\d+/i,
        };

        return patterns[platform]?.test(url) || false;
    };

    const extractVideoId = (url: string, platform: string): string | null => {
        try {
            if (platform === "TIKTOK") {
                const match = url.match(/video\/(\d+)/);
                return match ? match[1] : null;
            } else if (platform === "INSTAGRAM") {
                const match = url.match(/\/(p|reel)\/([\w-]+)/);
                return match ? match[2] : null;
            } else if (platform === "FACEBOOK") {
                const match = url.match(/\/(videos|posts)\/(\d+)/);
                return match ? match[2] : null;
            }
        } catch (error) {
            console.error("Error extracting video ID:", error);
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.postUrl.trim()) {
            alert("Please enter the post URL");
            return;
        }

        if (!validateURL(formData.postUrl, formData.platform)) {
            alert(`Invalid ${formData.platform} URL format. Please check and try again.`);
            return;
        }

        if (!formData.postedAt) {
            alert("Please select the posting date");
            return;
        }

        if (!formData.postedTime) {
            alert("Please select the posting time");
            return;
        }

        const videoId = extractVideoId(formData.postUrl, formData.platform);
        if (!videoId) {
            alert("Could not extract video ID from URL. Please check the URL format.");
            return;
        }

        setSubmitting(true);
        const token = localStorage.getItem("token");

        try {
            // Combine date and time
            const postedDateTime = new Date(`${formData.postedAt}T${formData.postedTime}`);

            const response = await fetch(`/api/videos/${params.id}/submit-url`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    postUrl: formData.postUrl,
                    platform: formData.platform,
                    platformVideoId: videoId,
                    postedAt: postedDateTime.toISOString(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to submit URL");
            }

            alert("Post URL submitted successfully! View tracking has started.");
            router.push("/creator/tasks");
        } catch (error) {
            console.error("Submit error:", error);
            alert(error instanceof Error ? error.message : "Failed to submit URL");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!video) return <div className="p-8">Video not found</div>;

    const platformExamples: Record<string, string> = {
        TIKTOK: "https://tiktok.com/@username/video/1234567890",
        INSTAGRAM: "https://instagram.com/p/ABC123xyz/",
        FACEBOOK: "https://facebook.com/username/videos/1234567890",
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link href="/creator/tasks" className="text-indigo-600 hover:text-indigo-800">
                        &larr; Back to Tasks
                    </Link>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-green-50 px-6 py-4 border-b border-green-100">
                        <h1 className="text-2xl font-bold text-gray-900">🔗 Submit Post URL</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {video.campaign.name} - by {video.campaign.founder.companyName || video.campaign.founder.fullName}
                        </p>
                    </div>

                    {/* Instructions Card */}
                    <div className="mb-6">
                        <InstructionsCard campaignId={video.campaign.id} briefData={video.campaign.briefData} />
                    </div>

                    {/* Info Box */}
                    <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-blue-900">What happens after submission?</h3>
                                <ul className="mt-2 text-sm text-blue-800 space-y-1">
                                    <li>• Views are tracked daily starting immediately</li>
                                    <li>• 7-day performance window begins from posting date</li>
                                    <li>• Performance bonus accumulates based on views</li>
                                    <li>• Final payment processed after 7-day lock</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                        {/* Platform Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Platform *
                            </label>
                            <select
                                value={formData.platform}
                                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                disabled={submitting}
                            >
                                <option value="TIKTOK">TikTok</option>
                                <option value="INSTAGRAM">Instagram</option>
                                <option value="FACEBOOK">Facebook</option>
                            </select>
                        </div>

                        {/* Post URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Live Post URL *
                            </label>
                            <input
                                type="url"
                                value={formData.postUrl}
                                onChange={(e) => setFormData({ ...formData, postUrl: e.target.value })}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                placeholder={platformExamples[formData.platform]}
                                disabled={submitting}
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Example: {platformExamples[formData.platform]}
                            </p>
                        </div>

                        {/* Posting Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Posting Date *
                                </label>
                                <input
                                    type="date"
                                    value={formData.postedAt}
                                    onChange={(e) => setFormData({ ...formData, postedAt: e.target.value })}
                                    max={new Date().toISOString().split('T')[0]}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    disabled={submitting}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Posting Time *
                                </label>
                                <input
                                    type="time"
                                    value={formData.postedTime}
                                    onChange={(e) => setFormData({ ...formData, postedTime: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    disabled={submitting}
                                    required
                                />
                            </div>
                        </div>

                        {/* Important Notes */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                            <h4 className="text-sm font-medium text-yellow-900 mb-2">⚠️ Important</h4>
                            <ul className="text-sm text-yellow-800 space-y-1">
                                <li>• Make sure your post is publicly visible</li>
                                <li>• Do not delete or make the post private during the 7-day window</li>
                                <li>• The URL must match the platform you selected</li>
                                <li>• Posting date cannot be in the future</li>
                            </ul>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Link
                                href="/creator/tasks"
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? "Submitting..." : "Submit & Start Tracking"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
