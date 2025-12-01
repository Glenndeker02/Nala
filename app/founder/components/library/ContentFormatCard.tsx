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
        <div className="group cursor-pointer">
            {/* Thumbnail - YouTube style with rounded corners */}
            <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden mb-3">
                <img
                    src={format.thumbnailUrl}
                    alt={`${format.formatType} by ${format.creator.name}`}
                    className="w-full h-full object-cover"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />

                {/* Duration Badge - bottom right like YouTube */}
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[11px] font-medium px-1 py-0.5 rounded">
                    {formatDuration(format.duration)}
                </div>

                {/* Platform Badge - top left */}
                <div className="absolute top-1.5 left-1.5 bg-white/95 text-gray-900 text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-sm">
                    {format.platform}
                </div>

                {/* Trending indicator */}
                {format.rankingScore && format.rankingScore > 70 && (
                    <div className="absolute top-1.5 right-1.5 bg-green-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5" />
                        Trending
                    </div>
                )}
            </div>

            {/* Content below thumbnail - YouTube style */}
            <div className="flex gap-2">
                {/* Creator avatar placeholder - YouTube has this */}
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-semibold">
                    {format.creator.name.charAt(0)}
                </div>

                {/* Video details */}
                <div className="flex-1 min-w-0">
                    {/* Title - YouTube style, 2 lines max */}
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 leading-tight">
                        {format.formatType}
                    </h3>

                    {/* Creator name */}
                    <p className="text-xs text-gray-600 mb-0.5">
                        {format.creator.name}
                    </p>

                    {/* Metrics - YouTube style (views • date) */}
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                        <span>{formatNumber(format.metrics.views)} views</span>
                        <span>•</span>
                        <span>{format.metrics.engagementRate}% engagement</span>
                    </div>

                    {/* Tags - subtle */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                        <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            {format.hookStyle}
                        </span>
                        <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            {format.creator.niche}
                        </span>
                    </div>

                    {/* Action button - appears on hover */}
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Link href={createCampaignUrl} className="w-full">
                            <Button
                                size="sm"
                                className="w-full h-7 text-xs bg-gray-900 hover:bg-gray-800 text-white rounded-full"
                            >
                                Use Template
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
