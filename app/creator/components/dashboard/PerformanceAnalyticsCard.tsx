"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

interface PerformanceData {
    views: number;
    engagementRate: number;
    videosCreated: number;
    viewsHistory: Array<{ date: string; views: number }>;
    engagementHistory: Array<{ date: string; rate: number }>;
}

export default function PerformanceAnalyticsCard() {
    const [data, setData] = useState<PerformanceData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetch("/api/creator/dashboard/performance", {
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

        fetchData();
    }, []);

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
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-600" />
                    Performance Analytics
                </CardTitle>
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
