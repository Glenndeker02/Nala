"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, DollarSign, Target, Users, BarChart3 } from "lucide-react";

interface PerformanceData {
    name: string;
    views: number;
    engagement: number;
}

interface PerformanceSummary {
    totalViews: number;
    totalCost: number;
    costPerView: number;
    roi: number;
    conversionRate: number;
    mrrImpact: number;
    avgEngagement: number;
}

type PlatformType = 'all' | 'tiktok' | 'instagram' | 'facebook' | 'youtube';
type PeriodType = 'weekly' | 'monthly' | 'yearly';

export default function PerformanceAnalyticsCard() {
    const [period, setPeriod] = useState<PeriodType>('weekly');
    const [platform, setPlatform] = useState<PlatformType>('all');
    const [chartData, setChartData] = useState<PerformanceData[]>([]);
    const [summary, setSummary] = useState<PerformanceSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [period, platform]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Not authenticated");
                setLoading(false);
                return;
            }

            const response = await fetch(`/api/founder/dashboard/performance-analytics?period=${period}&platform=${platform}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (result.success) {
                setChartData(result.data.chartData);
                setSummary(result.data.summary);
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

    const metrics = summary ? [
        {
            label: "ROI",
            value: `${summary.roi}%`,
            icon: TrendingUp,
            color: summary.roi >= 0 ? "text-green-600" : "text-red-600",
            bg: summary.roi >= 0 ? "bg-green-50" : "bg-red-50"
        },
        {
            label: "Cost/View",
            value: `$${summary.costPerView.toFixed(4)}`,
            icon: DollarSign,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            label: "Conversion Rate",
            value: `${summary.conversionRate.toFixed(2)}%`,
            icon: Target,
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            label: "MRR Impact",
            value: `$${summary.mrrImpact.toLocaleString()}`,
            icon: BarChart3,
            color: "text-orange-600",
            bg: "bg-orange-50"
        }
    ] : [];

    return (
        <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2 flex-shrink-0">
                <CardTitle className="text-lg font-semibold text-gray-800">Performance Analytics</CardTitle>
                <div className="flex items-center gap-2">
                    {/* Period Filter */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {(['weekly', 'monthly', 'yearly'] as PeriodType[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`text-xs font-medium px-3 py-1 rounded-md transition-all ${period === p
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                    {/* Platform Filter */}
                    <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value as PlatformType)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">All Platforms</option>
                        <option value="tiktok">TikTok</option>
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="youtube">YouTube</option>
                    </select>
                </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 space-y-4">
                {/* Metrics Bullets */}
                {!loading && summary && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {metrics.map((metric, index) => (
                            <div key={index} className={`flex items-center gap-2 p-2 rounded-lg ${metric.bg}`}>
                                <metric.icon className={`w-4 h-4 ${metric.color}`} />
                                <div>
                                    <p className="text-xs text-gray-600">{metric.label}</p>
                                    <p className={`text-sm font-bold ${metric.color}`}>{metric.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Chart */}
                {loading ? (
                    <div className="h-48 w-full flex items-center justify-center">
                        <div className="animate-pulse text-gray-400">Loading chart data...</div>
                    </div>
                ) : error ? (
                    <div className="h-48 w-full flex items-center justify-center">
                        <div className="text-red-600 text-sm">{error}</div>
                    </div>
                ) : (
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
