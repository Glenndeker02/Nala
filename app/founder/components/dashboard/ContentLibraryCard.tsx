"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Play, Eye, TrendingUp, Star } from "lucide-react";
import Link from "next/link";

interface ContentItem {
    id: string;
    title: string;
    videoUrl: string;
    thumbnailUrl: string;
    platform: string;
    duration: number;
    performanceScore: number;
    views: number;
    engagement: number;
    category: string;
    campaignName: string;
}

export default function ContentLibraryCard() {
    const [content, setContent] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetch("/api/content-library/recommended", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const result = await response.json();
                if (result.success) {
                    setContent(result.data.content);
                }
            } catch (err) {
                console.error("Error fetching content library:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const getPlatformColor = (platform: string) => {
        switch (platform.toUpperCase()) {
            case 'TIKTOK':
                return 'bg-black text-white';
            case 'INSTAGRAM':
                return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
            case 'YOUTUBE':
                return 'bg-red-600 text-white';
            case 'FACEBOOK':
                return 'bg-blue-600 text-white';
            default:
                return 'bg-gray-600 text-white';
        }
    };

    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg font-semibold text-gray-800">Content Library</CardTitle>
                <Link href="/founder/content-library">
                    <Button variant="ghost" size="sm" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        See More →
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex flex-col rounded-lg border border-gray-200 overflow-hidden animate-pulse">
                                <div className="aspect-[9/16] bg-gray-200"></div>
                                <div className="p-3 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-8 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : content.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-sm">No recommended content available</p>
                        <p className="text-xs mt-1">Create campaigns to build your content library</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {content.slice(0, 10).map((item) => {
                            const createUrl = `/founder/campaigns/create?videoId=${item.id}`;

                            return (
                                <div key={item.id} className="group flex flex-col rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:scale-105">
                                    {/* Thumbnail - YouTube-style vertical */}
                                    <div className="relative aspect-[9/16] bg-gray-100">
                                        {item.thumbnailUrl ? (
                                            <img
                                                src={item.thumbnailUrl}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                                                <Play className="w-12 h-12 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Play className="w-10 h-10 text-white fill-current drop-shadow-lg" />
                                        </div>
                                        {/* Platform Badge */}
                                        <div className={`absolute top-2 left-2 ${getPlatformColor(item.platform)} text-[10px] font-bold px-2 py-1 rounded shadow-lg`}>
                                            {item.platform}
                                        </div>
                                        {/* Performance Score */}
                                        {item.performanceScore >= 7 && (
                                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-current" />
                                                {item.performanceScore.toFixed(1)}
                                            </div>
                                        )}
                                        {/* Duration */}
                                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
                                            {item.duration}s
                                        </div>
                                    </div>

                                    {/* Content Info */}
                                    <div className="p-3 flex flex-col flex-1 bg-white">
                                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 truncate mb-2">{item.campaignName}</p>

                                        {/* Metrics */}
                                        <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                                            <div className="flex items-center gap-1">
                                                <Eye className="w-3 h-3" />
                                                <span>{formatNumber(item.views)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3" />
                                                <span>{item.engagement.toFixed(1)}%</span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <Link href={createUrl} className="mt-auto">
                                            <Button
                                                size="sm"
                                                className="w-full h-8 text-xs bg-primary-600 hover:bg-primary-700 text-white"
                                            >
                                                Use Format
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
