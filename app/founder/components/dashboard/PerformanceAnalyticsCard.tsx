"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface PerformanceData {
    name: string;
    views: number;
    engagement: number;
}

export default function PerformanceAnalyticsCard() {
    const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
    const [data, setData] = useState<PerformanceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Not authenticated");
                    setLoading(false);
                    return;
                }

                const response = await fetch(`/api/founder/dashboard/performance-analytics?timeframe=${timeframe}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const result = await response.json();

                if (result.success) {
                    setData(result.data.data);
                    setError(null);
                } else {
                    setError(result.error || "Failed to fetch data");
                }
            } catch (err) {
                console.error("Error fetching performance analytics:", err);
                setError("Failed to load performance data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [timeframe]);

    return (
        <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2 flex-shrink-0">
                <CardTitle className="text-lg font-semibold text-gray-800">Performance Analytics</CardTitle>
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setTimeframe('weekly')}
                        className={`text-xs font-medium px-3 py-1 rounded-md transition-all ${timeframe === 'weekly'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => setTimeframe('monthly')}
                        className={`text-xs font-medium px-3 py-1 rounded-md transition-all ${timeframe === 'monthly'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Monthly
                    </button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
                {loading ? (
                    <div className="h-full w-full flex items-center justify-center">
                        <div className="animate-pulse text-gray-400">Loading chart data...</div>
                    </div>
                ) : error ? (
                    <div className="h-full w-full flex items-center justify-center">
                        <div className="text-red-600 text-sm">{error}</div>
                    </div>
                ) : (
                    <div className="h-full w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    tickFormatter={(value) => value > 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorViews)"
                                    name="Views"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="engagement"
                                    stroke="#ec4899"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorEng)"
                                    name="Engagement"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
