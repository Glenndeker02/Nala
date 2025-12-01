import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Eye, ThumbsUp } from 'lucide-react';

interface FormatPerformance {
    templateId: string;
    templateName: string;
    adoptions: number;
    totalViews: number;
    totalLikes: number;
    avgViewsPerAdoption: number;
}

interface FormatPerformanceGridProps {
    formats: FormatPerformance[];
}

export function FormatPerformanceGrid({ formats }: FormatPerformanceGridProps) {
    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const sortedFormats = [...formats].sort((a, b) => b.totalViews - a.totalViews);

    if (formats.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Format Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No format templates with performance data yet.</p>
                        <p className="text-sm mt-2">Create templates and assign them to creators to see performance metrics.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Format Performance
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedFormats.map((format, index) => (
                        <Card key={format.templateId} className="overflow-hidden">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold truncate">{format.templateName}</h4>
                                        {index === 0 && (
                                            <Badge variant="default" className="mt-1">
                                                Top Performer
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {/* Adoptions */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Users className="w-4 h-4" />
                                            <span>Adoptions</span>
                                        </div>
                                        <span className="font-semibold">{format.adoptions}</span>
                                    </div>

                                    {/* Total Views */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Eye className="w-4 h-4" />
                                            <span>Total Views</span>
                                        </div>
                                        <span className="font-semibold">{formatNumber(format.totalViews)}</span>
                                    </div>

                                    {/* Total Likes */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <ThumbsUp className="w-4 h-4" />
                                            <span>Total Likes</span>
                                        </div>
                                        <span className="font-semibold">{formatNumber(format.totalLikes)}</span>
                                    </div>

                                    {/* Average Views per Adoption */}
                                    <div className="pt-3 border-t">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Avg Views/Adoption</span>
                                            <span className="font-bold text-primary">
                                                {formatNumber(Math.round(format.avgViewsPerAdoption))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
