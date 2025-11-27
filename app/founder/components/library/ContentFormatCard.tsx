import React from 'react';
import { ContentFormat } from '@/data/mockContentLibraryData';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Play, Eye, Heart, Share2, TrendingUp } from 'lucide-react';

interface ContentFormatCardProps {
    format: ContentFormat;
}

export default function ContentFormatCard({ format }: ContentFormatCardProps) {
    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const createCampaignUrl = `/founder/campaigns/create?videoUrl=${encodeURIComponent(format.videoUrl)}&formatType=${format.formatType}&hookStyle=${format.hookStyle}&platform=${format.platform}`;

    return (
        <Card className="group flex flex-col rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 h-full">
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gray-100">
                <img
                    src={format.thumbnailUrl}
                    alt={`${format.formatType} by ${format.creator.name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-10 h-10 text-white fill-current" />
                </div>

                {/* Platform Badge */}
                <div className="absolute top-2 left-2 bg-white/90 text-gray-900 text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm">
                    {format.platform}
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                    {formatDuration(format.duration)}
                </div>
            </div>

            <CardContent className="p-3 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{format.formatType}</h4>
                        <p className="text-xs text-gray-500">{format.creator.name}</p>
                    </div>
                    {format.rankingScore && format.rankingScore > 70 && (
                        <TrendingUp className="w-3 h-3 text-green-600 flex-shrink-0" />
                    )}
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{formatNumber(format.metrics.views)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{format.metrics.engagementRate}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Share2 className="w-3 h-3" />
                        <span>{formatNumber(format.metrics.shares)}</span>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                    <span className="text-[10px] bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-100">{format.creator.niche}</span>
                    <span className="text-[10px] bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-100">{format.hookStyle}</span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                    <Link href={createCampaignUrl} className="w-full">
                        <Button size="sm" className="w-full h-8 text-xs bg-gray-900 hover:bg-gray-800 text-white">
                            Create
                        </Button>
                    </Link>
                    <Link href={createCampaignUrl} className="w-full">
                        <Button size="sm" variant="outline" className="w-full h-8 text-xs border-gray-200 hover:bg-gray-50">
                            Preview
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
