"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TrendingUp, CheckCircle, Clock, DollarSign } from "lucide-react";

interface CampaignOverviewData {
    activeCampaigns: number;
    completedCampaigns: number;
    totalBudget: number;
    budgetSpent: number;
    avgEngagementRate: number;
}

export default function CampaignOverviewCard() {
    const [data, setData] = useState<CampaignOverviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Not authenticated");
                    setLoading(false);
                    return;
                }

                const response = await fetch("/api/founder/dashboard/campaign-overview", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const result = await response.json();

                if (result.success) {
                    setData(result.data);
                } else {
                    setError(result.error || "Failed to fetch data");
                }
            } catch (err) {
                console.error("Error fetching campaign overview:", err);
                setError("Failed to load campaign overview");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const items = data ? [
        {
            label: "Active Campaigns",
            value: data.activeCampaigns,
            icon: TrendingUp,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            label: "Completed",
            value: data.completedCampaigns,
            icon: CheckCircle,
            color: "text-green-600",
            bg: "bg-green-50",
        },
        {
            label: "Total Budget",
            value: `$${data.totalBudget.toLocaleString()}`,
            icon: DollarSign,
            color: "text-purple-600",
            bg: "bg-purple-50",
        },
        {
            label: "Avg. Engagement",
            value: `${data.avgEngagementRate}%`,
            icon: Clock,
            color: "text-orange-600",
            bg: "bg-orange-50",
        },
    ] : [];

    return (
        <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-800">Campaign Overview</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex flex-col p-3 rounded-xl border border-gray-100 bg-gray-50 animate-pulse">
                                <div className="w-8 h-8 rounded-lg bg-gray-200 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded mb-1"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-red-600">
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {items.map((item, index) => (
                            <div key={index} className="flex flex-col p-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors">
                                <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center mb-2`}>
                                    <item.icon className={`w-4 h-4 ${item.color}`} />
                                </div>
                                <span className="text-2xl font-bold text-gray-900">{item.value}</span>
                                <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
