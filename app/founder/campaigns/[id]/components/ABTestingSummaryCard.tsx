"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Trophy, ArrowRight, FlaskConical } from "lucide-react";

interface Variant {
    id: string;
    label: string;
    metrics: {
        conversionRate: number;
        performanceScore: number;
    }[];
}

export default function ABTestingSummaryCard({
    campaignId,
    onViewAll
}: {
    campaignId: string;
    onViewAll: () => void;
}) {
    const [variants, setVariants] = useState<Variant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVariants = async () => {
            try {
                const res = await fetch(`/api/campaigns/${campaignId}/variants`);
                if (res.ok) {
                    const data = await res.json();
                    setVariants(data);
                }
            } catch (error) {
                console.error("Failed to fetch variants", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVariants();
    }, [campaignId]);

    const getBestVariant = () => {
        if (variants.length === 0) return null;
        return variants.reduce((prev, current) => {
            const prevScore = Number(prev.metrics[0]?.performanceScore || 0);
            const currScore = Number(current.metrics[0]?.performanceScore || 0);
            return (prevScore > currScore) ? prev : current;
        });
    };

    const bestVariant = getBestVariant();

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6 flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-DEFAULT"></div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <FlaskConical className="h-5 w-5 text-purple-600" />
                    A/B Testing
                </CardTitle>
            </CardHeader>
            <CardContent>
                {variants.length > 0 && bestVariant ? (
                    <div className="space-y-4">
                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white rounded-full shadow-sm">
                                    <Trophy className="h-4 w-4 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-purple-700 font-medium uppercase tracking-wide">Top Performer</p>
                                    <p className="font-semibold text-gray-900">{bestVariant.label}</p>
                                    <div className="mt-1 flex items-center gap-2 text-sm">
                                        <span className="font-bold text-green-600">
                                            {Number(bestVariant.metrics[0]?.conversionRate || 0).toFixed(1)}%
                                        </span>
                                        <span className="text-gray-500">Conv. Rate</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>Total Variants:</span>
                            <span className="font-medium">{variants.length}</span>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full justify-between"
                            onClick={onViewAll}
                        >
                            View Full Results
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="text-center py-2">
                        <p className="text-sm text-gray-600 mb-4">
                            Optimize your campaign by testing different hooks and creators.
                        </p>
                        <Button
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={onViewAll}
                        >
                            Start A/B Test
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
