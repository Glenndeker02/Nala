"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Play, Eye, Heart, TrendingUp } from "lucide-react";
import Link from "next/link";

interface ContentFormat {
    id: string;
    thumbnailUrl: string;
    videoUrl: string;
    platform: string;
    formatType: string;
    hookStyle: string;
    creator: {
        name: string;
    };
    metrics: {
        views: number;
        engagementRate: number;
    };
    rankingScore?: number;
}

export default function ContentLibraryCard() {
    const [formats, setFormats] = useState<ContentFormat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetch("/api/content-library?limit=8", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const result = await response.json();
                if (result.success) {
                    setFormats(result.data.formats);
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="flex flex-col rounded-md border border-gray-200 overflow-hidden animate-pulse">
                                <div className="aspect-video bg-gray-200"></div>
                                <div className="p-2 space-y-2">
                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-6 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : formats.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No recommended formats available</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {formats.map((format) => {
                            const createCampaignUrl = `/founder/campaigns/create?videoUrl=${encodeURIComponent(format.videoUrl)}&formatType=${format.formatType}&hookStyle=${format.hookStyle}&platform=${format.platform}`;

                            return (
                                <div key={format.id} className="group flex flex-col rounded-md border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                                    {/* Thumbnail */}
                                    <div className="relative aspect-video bg-gray-100">
                                        <img
                                            src={format.thumbnailUrl}
                                            alt={format.formatType}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Play className="w-6 h-6 text-white fill-current" />
                                        </div>
                                        <div className="absolute top-1.5 left-1.5 bg-white/90 text-gray-900 text-[8px] font-semibold px-1 py-0.5 rounded shadow-sm">
                                            {format.platform}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-2 flex flex-col flex-1">
                                        <div className="flex items-start justify-between mb-1.5">
                                            <div className="min-w-0">
                                                <h4 className="text-xs font-semibold text-gray-900 line-clamp-1">{format.formatType}</h4>
                                                <p className="text-[10px] text-gray-500 truncate">{format.creator.name}</p>
                                            </div>
                                            {format.rankingScore && format.rankingScore > 70 && (
                                                <TrendingUp className="w-3 h-3 text-green-600 flex-shrink-0 ml-1" />
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-2">
                                            <div className="flex items-center gap-0.5">
                                                <Eye className="w-2.5 h-2.5" />
                                                <span>{formatNumber(format.metrics.views)}</span>
                                            </div>
                                            <div className="flex items-center gap-0.5">
                                                <Heart className="w-2.5 h-2.5" />
                                                <span>{format.metrics.engagementRate}%</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-1.5 mt-auto">
                                            <Link href={createCampaignUrl} className="w-full">
                                                <Button size="sm" className="w-full h-6 text-[10px] px-0.5 bg-gray-900 hover:bg-gray-800 text-white">
                                                    Create
                                                </Button>
                                            </Link>
                                            <Link href={createCampaignUrl} className="w-full">
                                                <Button size="sm" variant="outline" className="w-full h-6 text-[10px] px-0.5 border-gray-200 hover:bg-gray-50">
                                                    Preview
                                                </Button>
                                            </Link>
                                        </div>
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
