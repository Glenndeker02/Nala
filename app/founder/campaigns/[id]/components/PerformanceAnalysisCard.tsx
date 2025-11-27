import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

type Analytics = {
    videoStats: {
        total: number;
        posted: number;
    };
    performanceMetrics: {
        totalViews: number;
        avgViewsPerVideo: number;
        engagementRate: string;
    };
    creatorStats: Array<{
        id: string;
        name: string;
        videosCount: number;
        totalViews: number;
    }>;
};

export default function PerformanceAnalysisCard({ analytics }: { analytics: Analytics }) {
    const topVideos = analytics.creatorStats
        .sort((a, b) => b.totalViews - a.totalViews)
        .slice(0, 3);

    const avgViews = analytics.performanceMetrics.avgViewsPerVideo;
    const engagementRate = parseFloat(analytics.performanceMetrics.engagementRate);

    const insights = [];

    if (engagementRate > 5) {
        insights.push("🎯 Excellent engagement rate - audience is highly interactive");
    } else if (engagementRate > 3) {
        insights.push("👍 Good engagement - content resonates with viewers");
    } else {
        insights.push("📊 Consider optimizing content for better engagement");
    }

    if (analytics.videoStats.posted > 0) {
        const completionRate = (analytics.videoStats.posted / analytics.videoStats.total) * 100;
        if (completionRate >= 80) {
            insights.push("✅ Campaign on track - strong completion rate");
        } else if (completionRate >= 50) {
            insights.push("⏳ Campaign progressing - monitor creator delivery");
        } else {
            insights.push("⚠️ Low completion rate - follow up with creators");
        }
    }

    if (topVideos.length > 0 && topVideos[0].totalViews > avgViews * 2) {
        insights.push(`🌟 Top video outperforming average by ${Math.round((topVideos[0].totalViews / avgViews - 1) * 100)}%`);
    }

    return (
        <Card className="border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span>📈 Performance Analysis</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 text-sm">Key Insights</h4>
                    {insights.map((insight, idx) => (
                        <div key={idx} className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">
                            {insight}
                        </div>
                    ))}
                </div>

                {topVideos.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 text-sm">Top Performing Creators</h4>
                        {topVideos.map((creator, idx) => (
                            <div key={creator.id} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                                    <span className="text-sm font-medium text-gray-900">{creator.name}</span>
                                </div>
                                <span className="text-sm text-gray-600">{creator.totalViews.toLocaleString()} views</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-white p-3 rounded border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-900">Campaign Health</span>
                        <span className="text-sm font-bold text-primary-600">
                            {engagementRate > 4 ? 'Excellent' : engagementRate > 2 ? 'Good' : 'Needs Attention'}
                        </span>
                    </div>
                    <div className="text-xs text-gray-600">
                        Based on engagement rate, completion status, and view distribution
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
