"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Play, Eye, Heart, Share2, TrendingUp, Bookmark } from "lucide-react";
import { ContentFormat } from "@/data/mockContentLibraryData";

interface CreatorFormatCardProps {
    format: ContentFormat;
    recommendationScore?: number;
}

export default function CreatorFormatCard({ format, recommendationScore }: CreatorFormatCardProps) {
    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    return (
        <Card className="group h-full border-none shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
            {/* Thumbnail Section */}
            <div className="relative aspect-[9/16] bg-gray-200 overflow-hidden">
                <img
                    src={format.thumbnailUrl}
                    alt={format.formatType}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/50">
                        <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                    </div>
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-full border border-white/10">
                        {format.platform}
                    </span>
                    {recommendationScore && recommendationScore > 80 && (
                        <span className="bg-green-500/90 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-full border border-white/10 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Recommended
                        </span>
                    )}
                </div>

                <div className="absolute top-3 right-3">
                    <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-full border border-white/10 flex items-center gap-1">
                        <ClockIcon duration={format.duration} />
                        {format.duration}
                    </span>
                </div>

                {/* Bottom Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">
                            {format.formatType}
                        </span>
                        <span className="text-xs text-white/80">
                            {format.hookStyle}
                        </span>
                    </div>
                </div>
            </div>

            <CardContent className="p-4 flex-1 flex flex-col">
                {/* Creator Info */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                        <img src={format.creator.avatarUrl} alt={format.creator.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{format.creator.name}</h4>
                        <p className="text-xs text-gray-500 truncate">
                            {formatNumber(format.creator.followers)} followers • {format.creator.niche}
                        </p>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-t border-b border-gray-50">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                            <Eye className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{formatNumber(format.metrics.views)}</span>
                    </div>
                    <div className="text-center border-l border-gray-50">
                        <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                            <Heart className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{format.metrics.engagementRate}%</span>
                    </div>
                    <div className="text-center border-l border-gray-50">
                        <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                            <Share2 className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{formatNumber(format.metrics.shares)}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-auto flex gap-2">
                    <Button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-xs h-9">
                        Use This Format
                    </Button>
                    <Button variant="outline" className="flex-1 text-xs h-9 hover:text-primary-600 hover:border-primary-200">
                        <Bookmark className="w-3 h-3 mr-1.5" />
                        Save
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function ClockIcon({ duration }: { duration: string }) {
    return (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}
