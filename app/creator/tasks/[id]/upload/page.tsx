"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import InstructionsCard from "../components/InstructionsCard";

type Task = {
    id: string;
    campaignId: string;
    campaignName: string;
    founderName: string;
    status: string;
    deadline: string;
    baseFee: number;
    briefData: {
        description: string;
        talkingPoints: string[];
        mustHaves: string[];
        videoLength: string;
        tone: string;
        platforms: string[];
    };
    revisionFeedback?: string;
};

export default function VideoUploadPage() {
    const router = useRouter();
    const params = useParams();
    const taskId = params.id as string;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (taskId) {
            fetchTaskDetails();
        }
    }, [taskId]);

    const fetchTaskDetails = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`/api/videos/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const result = await response.json();
                const video = result.data.video;
                const campaign = video.campaign;
                const brief = campaign.briefData || {};

                const mappedTask: Task = {
                    id: video.id,
                    campaignId: campaign.id,
                    campaignName: campaign.name,
                    founderName: campaign.founder.companyName || campaign.founder.fullName,
                    status: video.status,
                    deadline: video.revisionDeadline || video.deadline || campaign.deadline,
                    baseFee: Number(video.baseFeeAmount || campaign.baseFeePerVideo || 0),
                    briefData: {
                        description: brief.description || "No description provided.",
                        talkingPoints: brief.talkingPoints || [],
                        mustHaves: brief.mustHaves || [],
                        videoLength: brief.videoLength || "Not specified",
                        tone: brief.tone || "Not specified",
                        platforms: brief.platforms || [campaign.platform || "TIKTOK"]
                    },
                    revisionFeedback: video.founderComments
                };

                setTask(mappedTask);
            } else {
                console.error("Failed to fetch task details");
            }
        } catch (error) {
            console.error("Error fetching task:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('video/')) {
            alert("Please select a valid video file.");
            return;
        }

        const maxSize = 500 * 1024 * 1024;
        if (file.size > maxSize) {
            alert("File size must be less than 500MB.");
            return;
        }

        setVideoFile(file);
        const url = URL.createObjectURL(file);
        setVideoPreviewUrl(url);

        if (!title) {
            const fileName = file.name.replace(/\.[^/.]+$/, "");
            setTitle(fileName);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleSubmit = async () => {
        if (!videoFile) {
            alert("Please select a video file.");
            return;
        }

        if (!title.trim()) {
            alert("Please enter a video title.");
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('taskId', taskId);

        try {
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const response = await fetch(`/api/tasks/${taskId}/upload-draft`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (response.ok) {
                setTimeout(() => {
                    alert("✅ Draft uploaded successfully! The founder will review your video soon.");
                    router.push("/creator/tasks");
                }, 500);
            } else {
                throw new Error("Upload failed");
            }
        } catch (error) {
            console.error("Error uploading:", error);
            alert("Failed to upload video. Please try again.");
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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

    const isRevision = task.revisionFeedback !== undefined;

    return (
        <div className="min-h-screen bg-gray-50">
            <main>
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
                                    {isRevision ? "Upload Revision" : "Upload Draft"}
                                </h1>
                                <p className="mt-2 text-gray-600">
                                    {task.campaignName} • {task.founderName}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Deadline</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {new Date(task.deadline).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {isRevision && task.revisionFeedback && (
                                <Card className="border-2 border-orange-200 bg-orange-50">
                                    <CardHeader>
                                        <CardTitle className="text-orange-900">
                                            📝 Revision Feedback
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-orange-800">{task.revisionFeedback}</p>
                                    </CardContent>
                                </Card>
                            )}

                            <Card>
                                <CardHeader>
                                    <CardTitle>Video File</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="video/*"
                                        onChange={handleFileInputChange}
                                        className="hidden"
                                    />

                                    {!videoFile ? (
                                        <div
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${isDragging
                                                ? 'border-primary-DEFAULT bg-primary-50'
                                                : 'border-gray-300 hover:border-primary-DEFAULT hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8 text-primary-DEFAULT" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                                {isDragging ? "Drop video here" : "Upload Video"}
                                            </h3>
                                            <p className="text-gray-600 mb-4">
                                                Drag and drop or click to browse
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Supported formats: MP4, MOV, AVI • Max size: 500MB
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="relative bg-black rounded-xl overflow-hidden">
                                                <video
                                                    src={videoPreviewUrl}
                                                    controls
                                                    className="w-full"
                                                    style={{ maxHeight: '400px' }}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-primary-DEFAULT" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{videoFile.name}</p>
                                                        <p className="text-sm text-gray-600">{formatFileSize(videoFile.size)}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => {
                                                        setVideoFile(null);
                                                        setVideoPreviewUrl("");
                                                        if (fileInputRef.current) {
                                                            fileInputRef.current.value = "";
                                                        }
                                                    }}
                                                >
                                                    Change Video
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {videoFile && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Video Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Video Title *
                                            </label>
                                            <Input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="Enter a descriptive title for your video"
                                                maxLength={100}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                {title.length}/100 characters
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Description (Optional)
                                            </label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                rows={4}
                                                maxLength={500}
                                                placeholder="Add any notes or context for the founder..."
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                {description.length}/500 characters
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {uploading && (
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-900">
                                                    Uploading video...
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                    {uploadProgress}%
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary-DEFAULT transition-all duration-300"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="flex gap-4">
                                <Button
                                    variant="secondary"
                                    onClick={() => router.push("/creator/tasks")}
                                    disabled={uploading}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!videoFile || !title.trim() || uploading}
                                    className="flex-1"
                                    size="lg"
                                >
                                    {uploading ? "Uploading..." : "Submit for Review"}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="mb-6">
                                <InstructionsCard campaignId={task.campaignId} briefData={task.briefData} />
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Video Specs</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Length</p>
                                        <p className="font-medium text-gray-900">{task.briefData.videoLength}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Tone</p>
                                        <p className="font-medium text-gray-900">{task.briefData.tone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Platforms</p>
                                        <p className="font-medium text-gray-900">
                                            {task.briefData.platforms.join(", ")}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-blue-50 border-blue-200">
                                <CardContent className="p-6">
                                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                        <span>💡</span>
                                        Tips for Success
                                    </h3>
                                    <ul className="space-y-2 text-sm text-blue-800">
                                        <li>• Review all requirements before recording</li>
                                        <li>• Ensure good lighting and clear audio</li>
                                        <li>• Follow the specified video length</li>
                                        <li>• Include all must-have elements</li>
                                        <li>• Be authentic and enthusiastic</li>
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
