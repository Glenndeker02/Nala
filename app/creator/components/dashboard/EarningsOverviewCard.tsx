"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock, CheckCircle, CreditCard, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EarningsData {
    totalEarnings: number;
    thisMonth: number;
    pendingPayouts: number;
    completedPayouts: number;
    stripeConnected: boolean;
    avgPerCampaign?: number;
    trend?: {
        percentage: number;
        direction: 'up' | 'down' | 'neutral';
    };
}

type FilterType = 'week' | 'month' | 'year';

export default function EarningsOverviewCard() {
    const [data, setData] = useState<EarningsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('month');

    useEffect(() => {
        fetchData(filter);
    }, [filter]);

    const fetchData = async (selectedFilter: FilterType) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetch(`/api/creator/dashboard/earnings?filter=${selectedFilter}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (err) {
            console.error("Error fetching earnings:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card className="h-full border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold text-gray-800">Earnings Overview</CardTitle>
                    <div className="h-6 w-32 bg-gray-200 rounded-full animate-pulse"></div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-20"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data) {
        return (
            <Card className="h-full border-none shadow-sm">
                <CardContent className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No earnings data available</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold text-gray-800">Earnings Overview</CardTitle>
                <div className="flex items-center gap-2">
                    {/* Filter Toggles */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                        {(['week', 'month', 'year'] as FilterType[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${filter === f
                                        ? 'bg-white text-primary-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${data.stripeConnected ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {data.stripeConnected ? 'Stripe Connected' : 'Connect Stripe'}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    {/* Total Earnings */}
                    <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
                        <div className="flex items-center gap-2 mb-2 text-primary-600">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-sm font-medium">Total Earnings</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            ${data.totalEarnings.toLocaleString()}
                        </div>
                    </div>

                    {/* This Period */}
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                        <div className="flex items-center gap-2 mb-2 text-green-600">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-medium">This {filter}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="text-2xl font-bold text-gray-900">
                                ${data.thisMonth.toLocaleString()}
                            </div>
                            {data.trend && data.trend.direction !== 'neutral' && (
                                <div className={`flex items-center gap-1 text-xs font-medium ${data.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {data.trend.direction === 'up' ? (
                                        <TrendingUp className="w-3 h-3" />
                                    ) : (
                                        <TrendingDown className="w-3 h-3" />
                                    )}
                                    {data.trend.percentage}%
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pending Payouts */}
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                        <div className="flex items-center gap-2 mb-2 text-orange-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">Pending</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            ${data.pendingPayouts.toLocaleString()}
                        </div>
                    </div>

                    {/* Completed Payouts */}
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-2 text-blue-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Completed</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            ${data.completedPayouts.toLocaleString()}
                        </div>
                    </div>
                </div>

                {!data.stripeConnected && (
                    <div className="mt-4">
                        <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Connect Stripe to Get Paid
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

