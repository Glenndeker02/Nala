import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function VideoAnalyticsCard({ video, platform }: { video: any, platform: string }) {
    return (
        <Card className="hover:shadow-xl transition-all duration-200 border-2 hover:border-primary-DEFAULT">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{video.title || "Untitled Video"}</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${video.status === 'DRAFT_SUBMITTED' ? 'bg-yellow-100 text-yellow-800' :
                            video.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                        }`}>
                        {video.status === 'DRAFT_SUBMITTED' ? 'Draft' : platform}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                    <div>Views: {(video.currentViewCount || 0).toLocaleString()}</div>
                    <div>Likes: {(video.likes || 0).toLocaleString()}</div>
                    <div>Comments: {(video.comments || 0).toLocaleString()}</div>
                    <div>Shares: {(video.shares || 0).toLocaleString()}</div>
                </div>
                {video.finalPostUrl ? (
                    <a
                        href={video.finalPostUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-DEFAULT hover:text-primary-600 text-sm font-medium"
                    >
                        View on {platform}
                    </a>
                ) : video.status === 'DRAFT_SUBMITTED' ? (
                    <a
                        href={`/founder/campaigns/${video.campaignId}/review`}
                        className="text-primary-DEFAULT hover:text-primary-600 text-sm font-medium"
                    >
                        Review Draft
                    </a>
                ) : null}
            </CardContent>
        </Card>
    );
}
