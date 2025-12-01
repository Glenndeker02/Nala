import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface BenchmarkStats {
    avgViews: number;
    avgLikes: number;
    avgComments: number;
    avgShares: number;
}

interface BenchmarkComparisonProps {
    campaignStats: BenchmarkStats;
    competitorStats: BenchmarkStats;
    comparison: {
        viewsRatio: number;
        likesRatio: number;
        commentsRatio: number;
        sharesRatio: number;
    };
}

export function BenchmarkComparison({
    campaignStats,
    competitorStats,
    comparison,
}: BenchmarkComparisonProps) {
    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return Math.round(num).toString();
    };

    const getPerformanceIndicator = (ratio: number) => {
        if (ratio > 1.1) {
            return { icon: TrendingUp, color: 'text-green-600', label: 'Outperforming' };
        } else if (ratio < 0.9) {
            return { icon: TrendingDown, color: 'text-red-600', label: 'Underperforming' };
        } else {
            return { icon: Minus, color: 'text-yellow-600', label: 'On Par' };
        }
    };

    const metrics = [
        {
            name: 'Views',
            campaign: campaignStats.avgViews,
            competitor: competitorStats.avgViews,
            ratio: comparison.viewsRatio,
        },
        {
            name: 'Likes',
            campaign: campaignStats.avgLikes,
            competitor: competitorStats.avgLikes,
            ratio: comparison.likesRatio,
        },
        {
            name: 'Comments',
            campaign: campaignStats.avgComments,
            competitor: competitorStats.avgComments,
            ratio: comparison.commentsRatio,
        },
        {
            name: 'Shares',
            campaign: campaignStats.avgShares,
            competitor: competitorStats.avgShares,
            ratio: comparison.sharesRatio,
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Performance vs Competitors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {metrics.map((metric) => {
                    const indicator = getPerformanceIndicator(metric.ratio);
                    const Icon = indicator.icon;
                    const percentage = ((metric.ratio - 1) * 100).toFixed(0);
                    const progressValue = Math.min(metric.ratio * 100, 200);

                    return (
                        <div key={metric.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{metric.name}</span>
                                <div className={`flex items-center gap-1 ${indicator.color}`}>
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm font-semibold">
                                        {metric.ratio > 1 ? '+' : ''}{percentage}%
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Your Campaign</p>
                                    <p className="font-semibold">{formatNumber(metric.campaign)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Competitors</p>
                                    <p className="font-semibold">{formatNumber(metric.competitor)}</p>
                                </div>
                            </div>

                            <Progress value={progressValue} className="h-2" />

                            <p className="text-xs text-muted-foreground">{indicator.label}</p>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
