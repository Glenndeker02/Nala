import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, Eye, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface VariantMetric {
    variantId: string;
    variantName: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
    totalEngagement: number;
    score?: number;
}

interface ABTestResultsProps {
    testName: string;
    status: string;
    startDate: string;
    endDate?: string;
    winner?: {
        variantId: string;
        variantName: string;
        score: number;
    };
    confidence?: number;
    metrics: VariantMetric[];
    onComplete?: () => void;
}

export function ABTestResults({
    testName,
    status,
    startDate,
    endDate,
    winner,
    confidence,
    metrics,
    onComplete,
}: ABTestResultsProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-500/10 text-green-500';
            case 'COMPLETED':
                return 'bg-blue-500/10 text-blue-500';
            case 'PAUSED':
                return 'bg-yellow-500/10 text-yellow-500';
            case 'CANCELLED':
                return 'bg-gray-500/10 text-gray-500';
            default:
                return 'bg-gray-500/10 text-gray-500';
        }
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const sortedMetrics = [...metrics].sort((a, b) => (b.score || 0) - (a.score || 0));
    const maxScore = sortedMetrics[0]?.score || 1;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            {testName}
                            <Badge className={getStatusColor(status)}>{status}</Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Started {new Date(startDate).toLocaleDateString()}
                            {endDate && ` • Ends ${new Date(endDate).toLocaleDateString()}`}
                        </p>
                    </div>
                    {status === 'ACTIVE' && onComplete && (
                        <Button onClick={onComplete} size="sm">
                            Complete Test
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Winner Section */}
                {winner && confidence !== undefined && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Trophy className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold">Winner: {winner.variantName}</h3>
                        </div>
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Confidence</p>
                                <p className="text-2xl font-bold text-primary">{confidence.toFixed(1)}%</p>
                            </div>
                            <Progress value={confidence} className="flex-1" />
                        </div>
                    </div>
                )}

                {/* Variant Comparison */}
                <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Variant Performance
                    </h3>

                    {sortedMetrics.map((metric, index) => {
                        const isWinner = winner?.variantId === metric.variantId;
                        const scorePercentage = ((metric.score || 0) / maxScore) * 100;

                        return (
                            <div
                                key={metric.variantId}
                                className={`p-4 rounded-lg border ${isWinner ? 'border-primary bg-primary/5' : 'border-border'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{metric.variantName}</span>
                                        {isWinner && (
                                            <Badge variant="default" className="gap-1">
                                                <Trophy className="w-3 h-3" /> Winner
                                            </Badge>
                                        )}
                                        {!isWinner && index === 0 && status !== 'COMPLETED' && (
                                            <Badge variant="secondary">Leading</Badge>
                                        )}
                                    </div>
                                    {metric.score !== undefined && (
                                        <span className="text-sm font-medium text-muted-foreground">
                                            Score: {metric.score.toFixed(0)}
                                        </span>
                                    )}
                                </div>

                                {/* Score Progress Bar */}
                                {metric.score !== undefined && (
                                    <Progress value={scorePercentage} className="mb-3 h-2" />
                                )}

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-4 gap-3">
                                    <div className="text-center">
                                        <Eye className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground">Views</p>
                                        <p className="font-semibold">{formatNumber(metric.views)}</p>
                                    </div>
                                    <div className="text-center">
                                        <Heart className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground">Likes</p>
                                        <p className="font-semibold">{formatNumber(metric.likes)}</p>
                                    </div>
                                    <div className="text-center">
                                        <MessageCircle className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground">Comments</p>
                                        <p className="font-semibold">{formatNumber(metric.comments)}</p>
                                    </div>
                                    <div className="text-center">
                                        <Share2 className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground">Shares</p>
                                        <p className="font-semibold">{formatNumber(metric.shares)}</p>
                                    </div>
                                </div>

                                {/* Engagement Rate */}
                                <div className="mt-3 pt-3 border-t">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Engagement Rate</span>
                                        <span className="font-semibold">{metric.engagementRate.toFixed(2)}%</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
