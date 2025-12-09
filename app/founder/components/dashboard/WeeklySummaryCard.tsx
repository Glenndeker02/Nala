"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Target } from "lucide-react";

interface WeeklySummaryData {
    totalSpent: number;
    newVideos: number;
    activeCreators: number;
    viewsAchieved: number;
    targetViews: number;
}

export default function WeeklySummaryCard() {
    const [data, setData] = useState<WeeklySummaryData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetch("/api/founder/dashboard/weekly-summary", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const result = await response.json();
                if (result.success) {
                    setData(result.data);
                }
            } catch (err) {
                console.error("Error fetching weekly summary:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const viewsProgress = data && data.targetViews > 0
        ? Math.min((data.viewsAchieved / data.targetViews) * 100, 100)
        : 0;

    return (
        <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-primary-50 to-white">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-primary-900">Weekly Summary</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex justify-between items-center animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                            </div>
                        ))}
                    </div>
                ) : data ? (
                    <div className="space-y-3">
                        {/* Views Achieved vs Target */}
                        <div className="p-3 bg-white rounded-lg border border-primary-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-primary-600" />
                                <span className="text-sm font-medium text-gray-700">Views This Week</span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-2xl font-bold text-primary-600">
                                    {data.viewsAchieved.toLocaleString()}
                                </span>
                                <span className="text-sm text-gray-500">
                                    of {data.targetViews.toLocaleString()}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${viewsProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {viewsProgress.toFixed(1)}% of target achieved
                            </p>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Spent</span>
                            <span className="font-bold text-gray-900">${data.totalSpent.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">New Videos</span>
                            <span className="font-bold text-gray-900">{data.newVideos}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Active Creators</span>
                            <span className="font-bold text-gray-900">{data.activeCreators}</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-gray-500">No data available</div>
                )}
            </CardContent>
        </Card>
    );
}
