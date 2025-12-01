"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Upload, FileVideo, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UploadDraftPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [campaign, setCampaign] = useState<any>(null);
    const [file, setFile] = useState<File | null>(null);
    const [notes, setNotes] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchCampaignDetails();
    }, []);

    const fetchCampaignDetails = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/campaigns/${params.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setCampaign(data.data);
            }
        } catch (err) {
            console.error("Error fetching campaign:", err);
            setError("Failed to load campaign details");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type.startsWith('video/')) {
                setFile(selectedFile);
                setError(null);
            } else {
                setError("Please select a valid video file");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a video file to upload");
            return;
        }

        setLoading(true);
        setUploadProgress(10);

        try {
            // Simulate upload delay
            const interval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 500);

            // In a real app, we would upload to S3/Cloudinary here
            // For now, we'll simulate it and send a mock URL to the API

            // Wait for simulation
            await new Promise(resolve => setTimeout(resolve, 3000));
            clearInterval(interval);
            setUploadProgress(100);

            const token = localStorage.getItem("token");
            const response = await fetch(`/api/campaigns/${params.id}/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    videoUrl: `https://example.com/videos/${file.name}`, // Mock URL
                    notes
                })
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/creator/dashboard");
                }, 2000);
            } else {
                const data = await response.json();
                setError(data.error || "Failed to submit draft");
            }
        } catch (err) {
            console.error("Error uploading draft:", err);
            setError("An error occurred while uploading. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!campaign && !error) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Link href="/creator/dashboard" className="flex items-center text-gray-500 hover:text-gray-700 mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Upload Draft Video</h1>
                    <p className="mt-2 text-gray-600">
                        Submit your content for {campaign?.name || "Campaign"}
                    </p>
                </div>

                {success ? (
                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-8 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Successful!</h2>
                            <p className="text-gray-600">
                                Your draft has been submitted to the founder for review.
                                Redirecting to dashboard...
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Submission Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="video-upload">Video File</Label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer relative">
                                        <Input
                                            id="video-upload"
                                            type="file"
                                            accept="video/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            disabled={loading}
                                        />
                                        {file ? (
                                            <div className="flex flex-col items-center">
                                                <FileVideo className="w-12 h-12 text-primary-600 mb-2" />
                                                <p className="font-medium text-gray-900">{file.name}</p>
                                                <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                                                <p className="font-medium text-gray-900">Click to upload or drag and drop</p>
                                                <p className="text-sm text-gray-500">MP4, MOV up to 500MB</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes for Founder (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Add any context or questions about this draft..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={4}
                                        disabled={loading}
                                    />
                                </div>

                                {loading && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Uploading...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary-600 transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading || !file}
                                        className="min-w-[120px]"
                                    >
                                        {loading ? "Uploading..." : "Submit Draft"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
