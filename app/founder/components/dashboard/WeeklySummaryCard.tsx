"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface WeeklySummaryData {
    totalSpent: number;
    newVideos: number;
    activeCreators: number;
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

    return (
        <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-primary-50 to-white">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-primary-900">Weekly Summary</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex justify-between items-center animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                            </div>
                        ))}
                    </div>
                ) : data ? (
                    <div className="space-y-3">
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
