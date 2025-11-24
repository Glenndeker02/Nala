"use client";

import { useState } from "react";

interface PortfolioStepProps {
    data: any;
    updateData: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function PortfolioStep({ data, updateData, onNext, onBack }: PortfolioStepProps) {
    const [videos, setVideos] = useState<any[]>(data.portfolioVideos || []);
    const [uploading, setUploading] = useState(false);

    // Mock upload for now since we don't have S3
    // In a real implementation, this would upload to the /api/videos/upload endpoint
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);

        // Simulate upload delay
        setTimeout(() => {
            const newVideos = Array.from(files).map((file) => ({
                url: URL.createObjectURL(file), // Temporary local URL
                title: file.name,
                platform: 'TIKTOK', // Default
                thumbnail: 'https://via.placeholder.com/150', // Placeholder
            }));

            setVideos([...videos, ...newVideos]);
            setUploading(false);
        }, 1500);
    };

    const removeVideo = (index: number) => {
        const newVideos = [...videos];
        newVideos.splice(index, 1);
        setVideos(newVideos);
    };

    const handleNext = () => {
        updateData({ portfolioVideos: videos });
        onNext();
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Build Your Portfolio</h2>
                <p className="text-gray-600 mt-2">Upload 3-10 sample videos to showcase your style</p>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-500 transition-colors">
                <div className="space-y-2">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="video/*" onChange={handleFileUpload} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">MP4, MOV up to 500MB</p>
                </div>
            </div>

            {uploading && (
                <div className="text-center text-sm text-gray-500">Uploading videos...</div>
            )}

            {/* Video List */}
            {videos.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-6">
                    {videos.map((video: any, index: number) => (
                        <div key={index} className="relative group bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded mb-2 overflow-hidden">
                                {/* Thumbnail placeholder */}
                                <div className="flex items-center justify-center h-24 bg-gray-300">
                                    <span className="text-xs text-gray-500">Video Preview</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 truncate w-32">{video.title}</p>
                                    <select
                                        className="mt-1 block w-full pl-2 pr-8 py-1 text-xs border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                        value={video.platform}
                                        onChange={(e) => {
                                            const newVideos = [...videos];
                                            newVideos[index].platform = e.target.value;
                                            setVideos(newVideos);
                                        }}
                                    >
                                        <option value="TIKTOK">TikTok</option>
                                        <option value="INSTAGRAM">Instagram</option>
                                        <option value="FACEBOOK">Facebook</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => removeVideo(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-between pt-6">
                <button
                    onClick={onBack}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Back
                </button>
                <button
                    onClick={handleNext}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {videos.length === 0 ? "Skip for now" : "Continue"}
                </button>
            </div>
        </div>
    );
}
