"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

type Creator = {
    id: string;
    name: string;
    rating: number;
    status: "PENDING" | "APPROVED" | "REVISION" | "POSTED" | "OVERDUE";
    videoUrl?: string;
    submittedAt?: string;
    deadline?: string;
};

type RevisionHistory = {
    version: number;
    submittedAt: string;
    feedback?: string;
    deadline?: string;
    status: string;
};

type VideoSubmission = {
    id: string;
    creatorId: string;
    creatorName: string;
    videoUrl: string;
    duration: number;
    fileSize: number;
    format: string;
    submittedAt: string;
    status: string;
    revisionHistory: RevisionHistory[];
    currentDeadline?: string;
};

export default function ContentReviewPage() {
    const router = useRouter();
    const params = useParams();
    const campaignId = params.id as string;
    const videoRef = useRef<HTMLVideoElement>(null);

    const [campaign, setCampaign] = useState<any>(null);
    const [creators, setCreators] = useState<Creator[]>([]);
    const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
    const [submission, setSubmission] = useState<VideoSubmission | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Video player state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [playbackRate, setPlaybackRate] = useState(1);

    // Feedback form state
    const [feedback, setFeedback] = useState("");
    const [revisionDeadline, setRevisionDeadline] = useState(3);
    const [autoApprove, setAutoApprove] = useState(false);

    useEffect(() => {
        if (campaignId) {
            fetchCampaignAndSubmissions();
        }
    }, [campaignId]);

    const fetchCampaignAndSubmissions = async () => {
        const token = localStorage.getItem("token");
        try {
            // Fetch campaign details which includes videos and creators
            const campaignRes = await fetch(`/api/campaigns/${campaignId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const responseData = await campaignRes.json();

            if (responseData.success) {
                const campaignData = responseData.data.campaign;
                setCampaign(campaignData);

                // Map videos to creators/submissions format
                if (campaignData.videos) {
                    const mappedCreators: Creator[] = campaignData.videos.map((video: any) => ({
                        id: video.creator.id,
                        name: video.creator.fullName,
                        rating: 5.0, // Placeholder as rating is not in video model yet
                        status: video.status,
                        videoUrl: video.draftVideoUrl || video.finalPostUrl,
                        submittedAt: video.updatedAt,
                        deadline: campaignData.deadline,
                        // Store full video object for submission details
                        _video: video
                    }));
                    setCreators(mappedCreators);

                    if (mappedCreators.length > 0) {
                        handleCreatorSelect(mappedCreators[0]);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatorSelect = (creator: Creator) => {
        setSelectedCreator(creator);

        // Use real video data if available (from our mapping above)
        const video = (creator as any)._video;

        if (video) {
            const submissionData: VideoSubmission = {
                id: video.id,
                creatorId: creator.id,
                creatorName: creator.name,
                videoUrl: creator.videoUrl || "",
                duration: 0, // Placeholder
                fileSize: 0, // Placeholder
                format: "MP4", // Placeholder
                submittedAt: video.updatedAt || new Date().toISOString(),
                status: video.status,
                revisionHistory: [], // Would need a separate table/field for this
                currentDeadline: creator.deadline
            };
            setSubmission(submissionData);
        } else {
            // Fallback for safety
            const mockSubmission: VideoSubmission = {
                id: `sub-${creator.id}`,
                creatorId: creator.id,
                creatorName: creator.name,
                videoUrl: creator.videoUrl || "",
                duration: 45,
                fileSize: 125,
                format: "MP4 (H.264)",
                submittedAt: creator.submittedAt || new Date().toISOString(),
                status: creator.status,
                revisionHistory: [],
                currentDeadline: creator.deadline
            };
            setSubmission(mockSubmission);
        }

        setFeedback("");
        setIsPlaying(false);
    };

    // Video player controls
    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = parseFloat(e.target.value);
        setVolume(vol);
        if (videoRef.current) {
            videoRef.current.volume = vol;
        }
    };

    const handlePlaybackRateChange = (rate: number) => {
        setPlaybackRate(rate);
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
        }
    };

    const toggleFullscreen = () => {
        if (videoRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                videoRef.current.requestFullscreen();
            }
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PENDING":
                return "⏳";
            case "APPROVED":
                return "✅";
            case "REVISION":
                return "🔄";
            case "POSTED":
                return "🎉";
            case "OVERDUE":
                return "⚠️";
            default:
                return "📝";
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-50 text-yellow-700 border-yellow-200";
            case "APPROVED":
                return "bg-green-50 text-green-700 border-green-200";
            case "REVISION":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "POSTED":
                return "bg-purple-50 text-purple-700 border-purple-200";
            case "OVERDUE":
                return "bg-red-50 text-red-700 border-red-200";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const formatTime = (seconds: number) => {
        <main>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/founder/campaigns/${campaignId}`}
                        className="text-primary-DEFAULT hover:text-primary-600 font-medium mb-4 inline-block transition-colors"
                    >
                        ← Back to Campaign
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Content Review - {campaign?.name}
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Review and approve creator submissions
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Creator List Sidebar */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Creators ({submittedCount}/{creators.length} submitted)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-100">
                                    {creators.map((creator) => (
                                        <button
                                            key={creator.id}
                                            onClick={() => handleCreatorSelect(creator)}
                                            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedCreator?.id === creator.id ? 'bg-primary-50 border-l-4 border-primary-DEFAULT' : ''
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{getStatusIcon(creator.status)}</span>
                                                        <span className="font-medium text-gray-900">{creator.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-yellow-500">★</span>
                                                        <span className="text-sm text-gray-600">{creator.rating.toFixed(1)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`inline-block text-xs px-2 py-1 rounded-full border font-medium ${getStatusBadge(creator.status)}`}>
                                                {creator.status}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {selectedCreator && submission ? (
                            <>
                                {/* Selected Creator Info */}
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                                    {selectedCreator.name} ({selectedCreator.rating.toFixed(1)}★)
                                                </h2>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span>Status: <strong className="text-gray-900">{submission.status}</strong></span>
                                                    {submission.currentDeadline && (
                                                        <span>
                                                            Deadline: <strong className="text-gray-900">
                                                                {new Date(submission.currentDeadline).toLocaleDateString()}
                                                            </strong>
                                                            {" "}({Math.ceil((new Date(submission.currentDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(submission.status)}`}>
                                                {submission.status}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Video Player */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Video Preview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {submission.videoUrl ? (
                                            <div className="space-y-4">
                                                <div className="relative bg-black rounded-xl overflow-hidden">
                                                    <video
                                                        ref={videoRef}
                                                        src={submission.videoUrl}
                                                        className="w-full"
                                                        onTimeUpdate={handleTimeUpdate}
                                                        onLoadedMetadata={handleLoadedMetadata}
                                                        onEnded={() => setIsPlaying(false)}
                                                    />
                                                </div>

                                                {/* Custom Controls */}
                                                <div className="space-y-3">
                                                    {/* Timeline */}
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max={duration || 0}
                                                        value={currentTime}
                                                        onChange={handleSeek}
                                                        className="w-full"
                                                    />

                                                    {/* Control Buttons */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <Button
                                                                onClick={togglePlay}
                                                                variant="secondary"
                                                                size="sm"
                                                            >
                                                                {isPlaying ? "⏸ Pause" : "▶ Play"}
                                                            </Button>
                                                            <span className="text-sm text-gray-600">
                                                                {formatTime(currentTime)} / {formatTime(duration)}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            {/* Playback Speed */}
                                                            <select
                                                                value={playbackRate}
                                                                onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                                                                className="text-sm px-2 py-1 rounded border border-gray-200"
                                                            >
                                                                <option value="0.5">0.5x</option>
                                                                <option value="1">1x</option>
                                                                <option value="1.5">1.5x</option>
                                                                <option value="2">2x</option>
                                                            </select>

                                                            {/* Volume */}
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm">🔊</span>
                                                                <input
                                                                    type="range"
                                                                    min="0"
                                                                    max="1"
                                                                    step="0.1"
                                                                    value={volume}
                                                                    onChange={handleVolumeChange}
                                                                    className="w-20"
                                                                />
                                                            </div>

                                                            <Button
                                                                onClick={toggleFullscreen}
                                                                variant="secondary"
                                                                size="sm"
                                                            >
                                                                ⬜ Fullscreen
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Video Info */}
                                                <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200 text-sm">
                                                    <div>
                                                        <p className="text-gray-600">Duration</p>
                                                        <p className="font-medium text-gray-900">{submission.duration} seconds</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">File Size</p>
                                                        <p className="font-medium text-gray-900">{submission.fileSize} MB</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">Format</p>
                                                        <p className="font-medium text-gray-900">{submission.format}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">Uploaded</p>
                                                        <p className="font-medium text-gray-900">
                                                            {new Date(submission.submittedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-gray-500">
                                                No video submitted yet
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Revision History */}
                                {submission.revisionHistory.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Revision History</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {submission.revisionHistory.map((revision, index) => (
                                                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <span className="font-bold text-gray-900">
                                                                v{revision.version} - {revision.status}
                                                            </span>
                                                            <span className="text-sm text-gray-600">
                                                                {new Date(revision.submittedAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        {revision.feedback && (
                                                            <div className="mt-2">
                                                                <p className="text-sm text-gray-600 mb-1">Feedback:</p>
                                                                <p className="text-gray-900">{revision.feedback}</p>
                                                            </div>
                                                        )}
                                                        {revision.deadline && (
                                                            <p className="text-sm text-gray-600 mt-2">
                                                                Deadline: {new Date(revision.deadline).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Feedback & Actions */}
                                {submission.status !== "APPROVED" && submission.status !== "POSTED" && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Feedback & Action</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Feedback Textarea */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                                    Revision Feedback (optional for approval, required for revision)
                                                </label>
                                                <textarea
                                                    value={feedback}
                                                    onChange={(e) => setFeedback(e.target.value)}
                                                    maxLength={1000}
                                                    rows={5}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                                                    placeholder="Provide specific feedback for the creator..."
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {feedback.length}/1000 characters
                                                </p>
                                            </div>

                                            {/* Revision Deadline */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                                    Revision Deadline
                                                </label>
                                                <div className="flex gap-4">
                                                    {[1, 3, 5].map((days) => (
                                                        <label key={days} className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="deadline"
                                                                value={days}
                                                                checked={revisionDeadline === days}
                                                                onChange={(e) => setRevisionDeadline(parseInt(e.target.value))}
                                                                className="w-4 h-4 text-primary-DEFAULT border-gray-300 focus:ring-primary-DEFAULT"
                                                            />
                                                            <span className="ml-2 text-gray-700">{days} day{days > 1 ? 's' : ''}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Auto-Approve Toggle */}
                                            <div>
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={autoApprove}
                                                        onChange={(e) => setAutoApprove(e.target.checked)}
                                                        className="w-4 h-4 text-primary-DEFAULT border-gray-300 rounded focus:ring-primary-DEFAULT"
                                                    />
                                                    <span className="ml-2 text-gray-700">
                                                        Auto-approve after deadline if not revised
                                                    </span>
                                                </label>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-4 pt-4 border-t border-gray-200">
                                                <Button
                                                    onClick={handleRequestRevision}
                                                    disabled={processing}
                                                    variant="secondary"
                                                    size="lg"
                                                    className="flex-1"
                                                >
                                                    {processing ? "Processing..." : "📝 Request Revision"}
                                                </Button>
                                                <Button
                                                    onClick={handleApprove}
                                                    disabled={processing}
                                                    size="lg"
                                                    className="flex-1"
                                                >
                                                    {processing ? "Processing..." : "✅ Approve & Pay"}
                                                </Button>
                                            </div>

                                            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                                <p className="text-sm text-yellow-800">
                                                    <strong>⚠️ Important:</strong> Approving will trigger immediate payment of the base fee to the creator. This action cannot be undone.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Approved State */}
                                {(submission.status === "APPROVED" || submission.status === "POSTED") && (
                                    <Card>
                                        <CardContent className="p-6">
                                            <div className="text-center py-8">
                                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                    Video {submission.status === "POSTED" ? "Posted" : "Approved"}
                                                </h3>
                                                <p className="text-gray-600">
                                                    {submission.status === "POSTED"
                                                        ? "This video has been posted and is now live."
                                                        : "Payment has been sent to the creator. Awaiting posting URL submission."}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        ) : (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <p className="text-gray-500">Select a creator to review their submission</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </main>
        </div >
    );
}
