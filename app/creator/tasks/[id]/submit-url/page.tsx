"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

type Task = {
    id: string;
    campaignId: string;
    campaignName: string;
    founderName: string;
    status: string;
    baseFee: number;
    platforms: string[];
    postingInstructions: string;
    draftUrl: string;
};

export default function SubmitPostingURLPage() {
    const router = useRouter();
    const params = useParams();
    const taskId = params.id as string;

    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [selectedPlatform, setSelectedPlatform] = useState("");
    const [postingUrl, setPostingUrl] = useState("");
    const [urlError, setUrlError] = useState("");

    useEffect(() => {
        if (taskId) {
            fetchTaskDetails();
        }
    }, [taskId]);

    const fetchTaskDetails = async () => {
        const token = localStorage.getItem("token");
        try {
            // Mock data for demonstration
            const mockTask: Task = {
                id: taskId,
                campaignId: "1",
                campaignName: "Acme Product Launch",
                founderName: "Mike Johnson",
                status: "APPROVED",
                baseFee: 50,
                platforms: ["TIKTOK", "INSTAGRAM"],
                postingInstructions: "Post your video on your selected platform and submit the URL here. Make sure the video is public and includes all required hashtags.",
                draftUrl: "https://example.com/draft.mp4"
            };

            setTask(mockTask);
            if (mockTask.platforms.length === 1) {
                setSelectedPlatform(mockTask.platforms[0]);
            }
        } catch (error) {
            console.error("Error fetching task:", error);
        } finally {
            setLoading(false);
        }
    };

    const validateUrl = (url: string, platform: string): boolean => {
        if (!url.trim()) {
            setUrlError("Please enter a URL");
            return false;
        }

        // Platform-specific URL validation
        const patterns: { [key: string]: RegExp } = {
            TIKTOK: /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com)\/.+/i,
            INSTAGRAM: /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/.+/i,
            FACEBOOK: /^https?:\/\/(www\.)?(facebook\.com|fb\.watch)\/.+/i,
        };

        const pattern = patterns[platform];
        if (!pattern) {
            setUrlError("Please select a platform");
            return false;
        }

        if (!pattern.test(url)) {
            const platformNames: { [key: string]: string } = {
                TIKTOK: "TikTok",
                INSTAGRAM: "Instagram",
                FACEBOOK: "Facebook"
            };
            setUrlError(`Please enter a valid ${platformNames[platform]} URL`);
            return false;
        }

        setUrlError("");
        return true;
    };

    const handleUrlChange = (value: string) => {
        setPostingUrl(value);
        if (value && selectedPlatform) {
            validateUrl(value, selectedPlatform);
        } else {
            setUrlError("");
        }
    };

    const handleSubmit = async () => {
        if (!selectedPlatform) {
            alert("Please select a platform");
            return;
        }

        if (!validateUrl(postingUrl, selectedPlatform)) {
            return;
        }

        setSubmitting(true);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`/api/tasks/${taskId}/submit-url`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    platform: selectedPlatform,
                    url: postingUrl,
                }),
            });

            if (response.ok) {
                alert("✅ Posting URL submitted successfully! We'll start tracking your video performance.");
                router.push("/creator/tasks");
            } else {
                throw new Error("Submission failed");
            }
        } catch (error) {
            console.error("Error submitting URL:", error);
            alert("Failed to submit URL. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const getPlatformIcon = (platform: string) => {
        const icons: { [key: string]: string } = {
            TIKTOK: "🎵",
            INSTAGRAM: "📸",
            FACEBOOK: "👥"
        };
        return icons[platform] || "📱";
    };

    const getPlatformExample = (platform: string) => {
        const examples: { [key: string]: string } = {
            TIKTOK: "https://www.tiktok.com/@username/video/1234567890",
            INSTAGRAM: "https://www.instagram.com/p/ABC123xyz/",
            FACEBOOK: "https://www.facebook.com/username/videos/1234567890/"
        };
        return examples[platform] || "";
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

    return (
        <div className="min-h-screen bg-gray-50">
            <main>
                <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/creator/tasks"
                            className="text-primary-DEFAULT hover:text-primary-600 font-medium mb-4 inline-block transition-colors"
                        >
                            ← Back to Tasks
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                Submit Posting URL
                            </h1>
                            <p className="mt-2 text-gray-600">
                                {task.campaignName} • {task.founderName}
                            </p>
                        </div>
                    </div>

                    {/* Success Banner */}
                    <Card className="mb-6 border-2 border-green-200 bg-green-50">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-green-900 mb-1">
                                        🎉 Video Approved!
                                    </h3>
                                    <p className="text-green-800 mb-2">
                                        Your video has been approved and your base fee of <strong>${task.baseFee}</strong> has been paid.
                                    </p>
                                    <p className="text-sm text-green-700">
                                        Now post your video on your platform and submit the URL below to start earning performance bonuses!
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Instructions */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>📋 Posting Instructions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700">{task.postingInstructions}</p>
                        </CardContent>
                    </Card>

                    {/* Platform Selection */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Select Platform</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {task.platforms.map((platform) => (
                                    <button
                                        key={platform}
                                        onClick={() => {
                                            setSelectedPlatform(platform);
                                            if (postingUrl) {
                                                validateUrl(postingUrl, platform);
                                            }
                                        }}
                                        className={`p-6 rounded-xl border-2 transition-all ${selectedPlatform === platform
                                                ? 'border-primary-DEFAULT bg-primary-50'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }`}
                                    >
                                        <div className="text-4xl mb-2">{getPlatformIcon(platform)}</div>
                                        <p className="font-bold text-gray-900">{platform}</p>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* URL Input */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Video URL</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Paste your video URL *
                                </label>
                                <Input
                                    type="url"
                                    value={postingUrl}
                                    onChange={(e) => handleUrlChange(e.target.value)}
                                    placeholder={selectedPlatform ? getPlatformExample(selectedPlatform) : "Select a platform first"}
                                    disabled={!selectedPlatform}
                                    className={urlError ? "border-red-300 focus:ring-red-500" : ""}
                                />
                                {urlError && (
                                    <p className="text-sm text-red-600 mt-2">⚠️ {urlError}</p>
                                )}
                                {selectedPlatform && !urlError && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        Example: {getPlatformExample(selectedPlatform)}
                                    </p>
                                )}
                            </div>

                            {postingUrl && !urlError && (
                                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                                    <div className="flex items-center gap-2 text-green-800">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-medium">Valid URL format</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Performance Tracking Info */}
                    <Card className="mb-6 bg-purple-50 border-purple-200">
                        <CardHeader>
                            <CardTitle className="text-purple-900">📊 What Happens Next?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-purple-800">
                                <div className="flex items-start gap-3">
                                    <span className="text-purple-600 font-bold">1.</span>
                                    <p>We'll start tracking your video's performance immediately</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-purple-600 font-bold">2.</span>
                                    <p>View counts update daily in your task dashboard</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-purple-600 font-bold">3.</span>
                                    <p>Earn <strong>$4.00 per 1,000 views</strong> as performance bonus</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-purple-600 font-bold">4.</span>
                                    <p>After 7 days, metrics lock and your bonus is calculated</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-purple-600 font-bold">5.</span>
                                    <p>Performance bonus paid automatically to your account</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Checklist */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>✓ Pre-Submission Checklist</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input type="checkbox" className="mt-1 w-5 h-5 text-primary-DEFAULT rounded focus:ring-primary-DEFAULT" />
                                    <span className="text-gray-700">Video is posted and publicly visible</span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input type="checkbox" className="mt-1 w-5 h-5 text-primary-DEFAULT rounded focus:ring-primary-DEFAULT" />
                                    <span className="text-gray-700">All required hashtags are included</span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input type="checkbox" className="mt-1 w-5 h-5 text-primary-DEFAULT rounded focus:ring-primary-DEFAULT" />
                                    <span className="text-gray-700">Video matches the approved draft</span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input type="checkbox" className="mt-1 w-5 h-5 text-primary-DEFAULT rounded focus:ring-primary-DEFAULT" />
                                    <span className="text-gray-700">URL is correct and accessible</span>
                                </label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button
                            variant="secondary"
                            onClick={() => router.push("/creator/tasks")}
                            disabled={submitting}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!selectedPlatform || !postingUrl || !!urlError || submitting}
                            className="flex-1"
                            size="lg"
                        >
                            {submitting ? "Submitting..." : "Submit & Start Tracking"}
                        </Button>
                    </div>

                    {/* Help Text */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-sm text-blue-800">
                            <strong>Need help?</strong> Make sure your video is public and the URL is copied correctly from your browser's address bar.
                            If you're having trouble, contact support.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
