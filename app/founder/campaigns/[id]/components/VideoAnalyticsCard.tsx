import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function VideoAnalyticsCard({ video }) {
    const platform = (() => {
        if (!video.finalPostUrl) return "Unknown";
        const url = video.finalPostUrl.toLowerCase();
        if (url.includes("instagram.com")) return "Instagram";
        if (url.includes("tiktok.com")) return "TikTok";
        if (url.includes("youtube.com")) return "YouTube";
        return "Other";
    })();

    return (
        <Card className="hover:shadow-xl transition-all duration-200 border-2 hover:border-primary-DEFAULT">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{video.title || "Untitled Video"}</span>
                    <span className="text-sm font-medium bg-gray-100 text-gray-800 px-2 py-1 rounded">{platform}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                    <div>Views: {(video.currentViewCount || 0).toLocaleString()}</div>
                    <div>Likes: {(video.likes || 0).toLocaleString()}</div>
                    <div>Comments: {(video.comments || 0).toLocaleString()}</div>
                    <div>Shares: {(video.shares || 0).toLocaleString()}</div>
                </div>
                {video.finalPostUrl && (
                    <a
                        href={video.finalPostUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-DEFAULT hover:text-primary-600 text-sm font-medium"
                    >
                        View on {platform}
                    </a>
                )}
            </CardContent>
        </Card>
    );
}
