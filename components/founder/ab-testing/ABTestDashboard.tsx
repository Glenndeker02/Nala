"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Users, Target } from "lucide-react";

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

interface Winner {
    variantId: string;
    variantName: string;
    score: number;
}

interface ABTestDashboardProps {
    testName: string;
    status: string;
    metrics: VariantMetric[];
    winner?: Winner;
    confidence?: number;
}

export function ABTestDashboard({ testName, status, metrics, winner, confidence }: ABTestDashboardProps) {
    // Find the winning variant
    const winningVariant = winner ? metrics.find(m => m.variantId === winner.variantId) : null;
    const sortedMetrics = [...metrics].sort((a, b) => (b.score || 0) - (a.score || 0));

    // Calculate improvement if we have a winner
    const improvement = winningVariant && sortedMetrics[1]
        ? ((winningVariant.views - sortedMetrics[1].views) / sortedMetrics[1].views * 100).toFixed(1)
        : null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">{testName}</h2>
                    <Badge variant={status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {status}
                    </Badge>
                </div>
                {winner && (
                    <div className="text-right">
                        <div className="flex items-center gap-2 text-green-600">
                            <Trophy className="w-5 h-5" />
                            <span className="font-semibold">Winner: {winner.variantName}</span>
                        </div>
                        {confidence && (
                            <p className="text-sm text-gray-500">{confidence.toFixed(1)}% confidence</p>
                        )}
                    </div>
                )}
            </div>

            {/* Winner Card */}
            {winningVariant && improvement && (
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-green-100 rounded-full">
                                <Trophy className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-green-900">
                                    🏆 Winning Variant: {winner.variantName}
                                </h3>
                                <p className="text-green-700 mt-1">
                                    Performance increased by <span className="font-bold">+{improvement}%</span> compared to the next best variant
                                </p>
                                <div className="mt-3 flex gap-4 text-sm">
                                    <div>
                                        <span className="text-green-600">Views:</span>
                                        <span className="ml-2 font-semibold">{winningVariant.views.toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-green-600">Engagement:</span>
                                        <span className="ml-2 font-semibold">{winningVariant.engagementRate.toFixed(2)}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Comparison Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Performance Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">Variant</th>
                                    <th className="text-right p-3">Views</th>
                                    <th className="text-right p-3">Likes</th>
                                    <th className="text-right p-3">Comments</th>
                                    <th className="text-right p-3">Shares</th>
                                    <th className="text-right p-3">Engagement Rate</th>
                                    <th className="text-right p-3">Total Engagement</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedMetrics.map((metric) => {
                                    const isWinner = winner && metric.variantId === winner.variantId;
                                    return (
                                        <tr
                                            key={metric.variantId}
                                            className={`border-b ${isWinner ? 'bg-green-50' : ''}`}
                                        >
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    {isWinner && <Trophy className="w-4 h-4 text-green-600" />}
                                                    <span className="font-medium">{metric.variantName}</span>
                                                </div>
                                            </td>
                                            <td className="text-right p-3">{metric.views.toLocaleString()}</td>
                                            <td className="text-right p-3">{metric.likes.toLocaleString()}</td>
                                            <td className="text-right p-3">{metric.comments.toLocaleString()}</td>
                                            <td className="text-right p-3">{metric.shares.toLocaleString()}</td>
                                            <td className="text-right p-3">{metric.engagementRate.toFixed(2)}%</td>
                                            <td className="text-right p-3">{metric.totalEngagement.toLocaleString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded">
                                <Target className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Variants</p>
                                <p className="text-2xl font-bold">{metrics.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded">
                                <Users className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Views</p>
                                <p className="text-2xl font-bold">
                                    {metrics.reduce((sum, m) => sum + m.views, 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Avg Engagement</p>
                                <p className="text-2xl font-bold">
                                    {(metrics.reduce((sum, m) => sum + m.engagementRate, 0) / metrics.length).toFixed(2)}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded">
                                <Trophy className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Best Performer</p>
                                <p className="text-lg font-bold">{sortedMetrics[0]?.variantName || 'N/A'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
