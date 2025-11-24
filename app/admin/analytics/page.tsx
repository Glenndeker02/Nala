"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface AnalyticsData {
    totalRevenue: number;
    totalGMV: number;
    revenueByType: Record<string, number>;
    timeline: Array<{
        date: string;
        revenue: number;
        gmv: number;
    }>;
    period: string;
}

interface TopPerformers {
    topCreators: Array<{
        id: string;
        name: string;
        email: string;
        totalEarnings: number;
    }>;
    topFounders: Array<{
        id: string;
        name: string;
        company: string;
        totalCommitted: number;
    }>;
}

export default function FinancialAnalyticsPage() {
    const [period, setPeriod] = useState('30d');
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [performers, setPerformers] = useState<TopPerformers | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");

            const [analyticsRes, performersRes] = await Promise.all([
                fetch(`/api/admin/analytics/revenue?period=${period}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`/api/admin/analytics/top-performers`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if (analyticsRes.ok && performersRes.ok) {
                const analyticsData = await analyticsRes.json();
                const performersData = await performersRes.json();
                setData(analyticsData);
                setPerformers(performersData);
            }
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Simple bar chart component
    const BarChart = ({ data, dataKey, color }: { data: any[], dataKey: string, color: string }) => {
        const maxValue = Math.max(...data.map(d => d[dataKey]), 1);

        return (
            <div className="h-64 flex items-end gap-1 pt-6">
                {data.map((item, idx) => {
                    const height = (item[dataKey] / maxValue) * 100;
                    return (
                        <div key={idx} className="flex-1 flex flex-col items-center group relative">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                                {item.date}: {formatCurrency(item[dataKey])}
                            </div>

                            <div
                                className={`w-full rounded-t ${color} opacity-80 hover:opacity-100 transition-all`}
                                style={{ height: `${height}%` }}
                            ></div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Financial Analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Track revenue, GMV, and top performers
                    </p>
                </div>

                <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                    {['7d', '30d', '90d', '12m'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${period === p
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {p.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
            ) : data && performers ? (
                <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {formatCurrency(data.totalRevenue)}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                                Platform earnings
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-sm font-medium text-gray-500">Gross Merchandise Value (GMV)</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {formatCurrency(data.totalGMV)}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                Total volume processed
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-sm font-medium text-gray-500">Take Rate</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {data.totalGMV > 0
                                    ? ((data.totalRevenue / data.totalGMV) * 100).toFixed(1)
                                    : '0.0'}%
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Revenue / GMV
                            </p>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                            <BarChart data={data.timeline} dataKey="revenue" color="bg-green-500" />
                            <div className="flex justify-between text-xs text-gray-400 mt-2">
                                <span>{data.timeline[0]?.date}</span>
                                <span>{data.timeline[data.timeline.length - 1]?.date}</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">GMV Trend</h3>
                            <BarChart data={data.timeline} dataKey="gmv" color="bg-blue-500" />
                            <div className="flex justify-between text-xs text-gray-400 mt-2">
                                <span>{data.timeline[0]?.date}</span>
                                <span>{data.timeline[data.timeline.length - 1]?.date}</span>
                            </div>
                        </div>
                    </div>

                    {/* Top Performers */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Top Earning Creators</h3>
                            </div>
                            <ul className="divide-y divide-gray-200">
                                {performers.topCreators.map((creator, idx) => (
                                    <li key={creator.id} className="px-6 py-4 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="text-gray-400 font-medium w-6">{idx + 1}</span>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{creator.name}</p>
                                                <p className="text-xs text-gray-500">{creator.email}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-green-600">
                                            {formatCurrency(creator.totalEarnings)}
                                        </span>
                                    </li>
                                ))}
                                {performers.topCreators.length === 0 && (
                                    <li className="px-6 py-4 text-sm text-gray-500 text-center">No data available</li>
                                )}
                            </ul>
                        </div>

                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Top Spending Founders</h3>
                            </div>
                            <ul className="divide-y divide-gray-200">
                                {performers.topFounders.map((founder, idx) => (
                                    <li key={founder.id} className="px-6 py-4 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="text-gray-400 font-medium w-6">{idx + 1}</span>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{founder.name}</p>
                                                <p className="text-xs text-gray-500">{founder.company}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-blue-600">
                                            {formatCurrency(founder.totalCommitted)}
                                        </span>
                                    </li>
                                ))}
                                {performers.topFounders.length === 0 && (
                                    <li className="px-6 py-4 text-sm text-gray-500 text-center">No data available</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    Failed to load data.
                </div>
            )}
        </div>
    );
}
