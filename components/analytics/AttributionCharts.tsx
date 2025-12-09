"use client";

import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ConversionTrendChartProps {
    data: Array<{
        date: string;
        redemptions: number;
        conversions: number;
    }>;
}

export function ConversionTrendChart({ data }: ConversionTrendChartProps) {
    // Calculate conversion rate for each data point
    const chartData = data.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        conversionRate: item.redemptions > 0 ? ((item.conversions / item.redemptions) * 100).toFixed(1) : 0,
        redemptions: item.redemptions,
        conversions: item.conversions
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Conversion Rate Trend</CardTitle>
                <CardDescription>Last 30 days performance</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis
                            label={{ value: 'Conversion Rate (%)', angle: -90, position: 'insideLeft' }}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                                            <p className="font-medium">{payload[0].payload.date}</p>
                                            <p className="text-sm text-blue-600">
                                                Conversion Rate: {payload[0].value}%
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {payload[0].payload.conversions} / {payload[0].payload.redemptions}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="conversionRate"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

interface PlatformComparisonChartProps {
    data: Array<{
        platform: string;
        redemptions: number;
        conversions: number;
        conversionRate: string;
        revenue: number;
    }>;
}

export function PlatformComparisonChart({ data }: PlatformComparisonChartProps) {
    const chartData = data.map(item => ({
        platform: item.platform,
        conversions: item.conversions,
        redemptions: item.redemptions,
        revenue: item.revenue
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
                <CardDescription>Conversions by platform</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="platform" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                                            <p className="font-medium">{payload[0].payload.platform}</p>
                                            <p className="text-sm text-green-600">
                                                Conversions: {payload[0].value}
                                            </p>
                                            <p className="text-sm text-blue-600">
                                                Redemptions: {payload[0].payload.redemptions}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Revenue: ${payload[0].payload.revenue.toFixed(2)}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="conversions" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

interface CreatorPerformanceChartProps {
    data: Array<{
        creatorId: string;
        creatorName: string;
        redemptions: number;
        conversions: number;
        revenue: number;
        commissionOwed: number;
    }>;
}

export function CreatorPerformanceChart({ data }: CreatorPerformanceChartProps) {
    // Sort by conversions and take top 10
    const topCreators = [...data]
        .sort((a, b) => b.conversions - a.conversions)
        .slice(0, 10)
        .map(item => ({
            name: item.creatorName.split(' ')[0], // First name only for readability
            conversions: item.conversions,
            revenue: item.revenue
        }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Creator Performance</CardTitle>
                <CardDescription>Top 10 creators by conversions</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topCreators} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tick={{ fontSize: 12 }}
                            width={80}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                                            <p className="font-medium">{payload[0].payload.name}</p>
                                            <p className="text-sm text-purple-600">
                                                Conversions: {payload[0].value}
                                            </p>
                                            <p className="text-sm text-green-600">
                                                Revenue: ${payload[0].payload.revenue.toFixed(2)}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="conversions" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

interface RevenueTimelineChartProps {
    data: Array<{
        date: string;
        redemptions: number;
        conversions: number;
    }>;
    revenuePerConversion: number;
}

export function RevenueTimelineChart({ data, revenuePerConversion }: RevenueTimelineChartProps) {
    // Calculate cumulative revenue
    let cumulativeRevenue = 0;
    const chartData = data.map(item => {
        const dailyRevenue = item.conversions * revenuePerConversion;
        cumulativeRevenue += dailyRevenue;
        return {
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: dailyRevenue,
            cumulative: cumulativeRevenue
        };
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Revenue Timeline</CardTitle>
                <CardDescription>Daily and cumulative revenue</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis
                            label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft' }}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                                            <p className="font-medium">{payload[0].payload.date}</p>
                                            <p className="text-sm text-green-600">
                                                Daily: ${payload[0].value?.toFixed(2)}
                                            </p>
                                            <p className="text-sm text-blue-600">
                                                Cumulative: ${payload[0].payload.cumulative.toFixed(2)}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.6}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
