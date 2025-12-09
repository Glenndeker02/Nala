"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

interface PerformanceData {
    views: number;
    engagementRate: number;
    videosCreated: number;
    completionRate?: number;
    viewsHistory: Array<{ date: string; views: number }>;
    engagementHistory: Array<{ date: string; rate: number }>;
}

type PlatformFilter = 'all' | 'tiktok' | 'instagram' | 'facebook';
type PeriodFilter = 'week' | 'month' | 'year';

export default function PerformanceAnalyticsCard() {
    const [data, setData] = useState<PerformanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [platform, setPlatform] = useState<PlatformFilter>('all');
    const [period, setPeriod] = useState<PeriodFilter>('week');

    useEffect(() => {
        fetchData(platform, period);
    }, [platform, period]);

    const fetchData = async (selectedPlatform: PlatformFilter, selectedPeriod: PeriodFilter) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetch(`/api/creator/dashboard/performance?platform=${selectedPlatform}&period=${selectedPeriod}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (err) {
            console.error("Error fetching performance:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card className="h-full border-none shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-gray-800">Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 bg-gray-100 rounded"></div>
                            ))}
                        </div>
                        <div className="h-48 bg-gray-100 rounded"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data) {
        return (
            <Card className="h-full border-none shadow-sm">
                <CardContent className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No performance data available</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-600" />
                        Performance Analytics
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {/* Period Filter */}
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
                            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                        {/* Platform Filter */}
                        <select
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value as PlatformFilter)}
                            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Platforms</option>
                            <option value="tiktok">TikTok</option>
                            <option value="instagram">Instagram</option>
                            <option value="facebook">Facebook</option>
                        </select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="text-xs text-blue-600 font-medium mb-1">Total Views</div>
                        <div className="text-2xl font-bold text-gray-900">{data.views.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="text-xs text-green-600 font-medium mb-1">Engagement</div>
                        <div className="text-2xl font-bold text-gray-900">{data.engagementRate}%</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="text-xs text-purple-600 font-medium mb-1">Videos</div>
                        <div className="text-2xl font-bold text-gray-900">{data.videosCreated}</div>
                    </div>
                </div>

                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.viewsHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                tickFormatter={(value) => value > 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontSize: '12px' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="views"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                dot={false}
                                name="Views"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

