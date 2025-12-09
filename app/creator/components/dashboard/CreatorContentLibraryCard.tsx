"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function CreatorContentLibraryCard() {
    const [formats, setFormats] = useState<ContentFormat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetch("/api/content-library?limit=6", {
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
                <Link href="/creator/content-library">
                    <Button variant="ghost" size="sm" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        See More →
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex flex-row items-center gap-3 p-2 rounded-md border border-gray-200 overflow-hidden animate-pulse">
                                <div className="w-20 aspect-video bg-gray-200 rounded-md"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : formats.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No content available</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {formats.map((format) => (
                            <div key={format.id} className="group flex flex-row items-center gap-3 rounded-md border border-gray-200 p-2 hover:shadow-md transition-all bg-white">
                                <div className="relative w-20 aspect-video bg-gray-100 rounded-md overflow-hidden flex-shrink-0 group-hover:ring-1 ring-primary-100 transition-all">
                                    <img
                                        src={format.thumbnailUrl}
                                        alt={format.formatType}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Play className="w-4 h-4 text-white fill-current" />
                                    </div>
                                    <div className="absolute top-0.5 right-0.5 bg-white/90 text-gray-900 text-[6px] font-semibold px-0.5 rounded shadow-sm">
                                        {format.platform}
                                    </div>
                                </div>

                                <div className="flex flex-col flex-1 min-w-0">
                                    <div className="mb-1">
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="text-xs font-semibold text-gray-900 line-clamp-1">{format.formatType}</h4>
                                            {format.rankingScore && format.rankingScore > 70 && (
                                                <TrendingUp className="w-2.5 h-2.5 text-green-600 flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-500 truncate">{format.creator.name}</p>
                                    </div>

                                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                        <div className="flex items-center gap-0.5">
                                            <Eye className="w-2.5 h-2.5" />
                                            <span>{formatNumber(format.metrics.views)}</span>
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                            <Heart className="w-2.5 h-2.5" />
                                            <span>{format.metrics.engagementRate}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

