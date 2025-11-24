"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type VideoTask = {
    id: string;
    status: string;
    campaign: {
        id: string;
        name: string;
        description: string;
        briefData: any;
        founder: {
            fullName: string;
            companyName: string | null;
        };
    };
    baseFeeAmount: number | null;
};

export default function UploadDraftPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [video, setVideo] = useState<VideoTask | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [notes, setNotes] = useState("");

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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = ["video/mp4", "video/quicktime", "video/webm"];
            if (!validTypes.includes(file.type)) {
                alert("Please select a valid video file (MP4, MOV, or WebM)");
                return;
            }

            // Validate file size (max 1GB)
            const maxSize = 1024 * 1024 * 1024; // 1GB in bytes
            if (file.size > maxSize) {
                alert("File size must be less than 1GB");
                return;
            }

            setSelectedFile(file);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            alert("Please select a video file");
            return;
        }

        setUploading(true);
        const token = localStorage.getItem("token");

        try {
            const formData = new FormData();
            formData.append("video", selectedFile);
            formData.append("videoId", params.id);
            formData.append("notes", notes);

            // Simulate upload progress (in production, use XMLHttpRequest for real progress)
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 500);

            const response = await fetch("/api/videos/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Upload failed");
            }

            alert("Draft uploaded successfully! The founder will review it soon.");
            router.push("/creator/tasks");
        } catch (error) {
            console.error("Upload error:", error);
            alert(error instanceof Error ? error.message : "Upload failed");
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!video) return <div className="p-8">Video not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link href="/creator/tasks" className="text-indigo-600 hover:text-indigo-800">
                        &larr; Back to Tasks
                    </Link>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {/* Campaign Info Header */}
                    <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
                        <h1 className="text-2xl font-bold text-gray-900">{video.campaign.name}</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            by {video.campaign.founder.companyName || video.campaign.founder.fullName}
                        </p>
                    </div>

                    {/* Brief Details */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Campaign Brief</h2>
                        <div className="prose max-w-none text-gray-600">
                            <p>{video.campaign.description}</p>

                            {video.campaign.briefData && (
                                <div className="mt-4 space-y-2">
                                    {video.campaign.briefData.talkingPoints && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700">Key Talking Points:</h3>
                                            <ul className="list-disc list-inside text-sm">
                                                {video.campaign.briefData.talkingPoints.map((point: string, idx: number) => (
                                                    <li key={idx}>{point}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {video.campaign.briefData.platforms && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700">Platforms:</h3>
                                            <p className="text-sm">{video.campaign.briefData.platforms.join(", ")}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upload Form */}
                    <form onSubmit={handleUpload} className="px-6 py-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Your Draft</h2>

                        {/* File Upload */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Video File
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-400 transition-colors">
                                <div className="space-y-1 text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <div className="flex text-sm text-gray-600">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                                        >
                                            <span>Upload a file</span>
                                            <input
                                                id="file-upload"
                                                name="file-upload"
                                                type="file"
                                                className="sr-only"
                                                accept="video/mp4,video/quicktime,video/webm"
                                                onChange={handleFileSelect}
                                                disabled={uploading}
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">MP4, MOV, or WebM up to 1GB</p>
                                    {selectedFile && (
                                        <p className="text-sm text-green-600 font-medium mt-2">
                                            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes for Founder (Optional)
                            </label>
                            <textarea
                                rows={4}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                placeholder="Any additional context or notes about your video..."
                                disabled={uploading}
                            />
                        </div>

                        {/* Upload Progress */}
                        {uploading && (
                            <div className="mb-6">
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end gap-3">
                            <Link
                                href="/creator/tasks"
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={!selectedFile || uploading}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? "Uploading..." : "Submit Draft"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
