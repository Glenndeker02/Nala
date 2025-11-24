"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Sparkles, Plus, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VideoFormat {
    id: string;
    name: string;
    description: string;
    avgViews: number;
    adoptionTrend: string;
    successRate50k: number;
}

interface RecommendedFormatsWidgetProps {
    category: string;
    onSelectFormat: (format: VideoFormat) => void;
}

export default function RecommendedFormatsWidget({ category, onSelectFormat }: RecommendedFormatsWidgetProps) {
    const [recommendations, setRecommendations] = useState<VideoFormat[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchRecommendations = useCallback(async () => {
        setLoading(true);
        try {
            // In a real scenario, we'd pass the category to get relevant recommendations
            // For now, we'll fetch trending formats as a proxy
            const res = await fetch(`/api/formats/trending?category=${category}&limit=3`);
            const data = await res.json();
            if (data.formats) {
                setRecommendations(data.formats);
            }
        } catch (error) {
            console.error("Failed to fetch recommendations", error);
        } finally {
            setLoading(false);
        }
    }, [category]);

    useEffect(() => {
        if (category) {
            fetchRecommendations();
        }
    }, [category, fetchRecommendations]);

    if (!category || recommendations.length === 0) return null;

    return (
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    <CardTitle className="text-lg text-indigo-900">Recommended Formats for {category}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {recommendations.map((format) => (
                        <div key={format.id} className="bg-white p-3 rounded-md border border-indigo-100 shadow-sm flex justify-between items-center group hover:border-indigo-300 transition-colors">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-sm">{format.name}</h4>
                                    {format.adoptionTrend === 'VIRAL' && (
                                        <Badge variant="destructive" className="text-[10px] h-5 px-1">Viral</Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">{format.description}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                    <span>{format.avgViews.toLocaleString()} avg views</span>
                                    <span className="text-green-600 font-medium">{Number(format.successRate50k) * 100}% success rate</span>
                                </div>
                            </div>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onSelectFormat(format)}>
                                <Plus className="h-5 w-5 text-indigo-600" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
