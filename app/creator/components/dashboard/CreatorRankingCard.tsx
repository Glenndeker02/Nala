"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Award } from "lucide-react";

interface RankingData {
    rankingScore: number;
    categoryAverage: number;
    scoreChange: number;
}

export default function CreatorRankingCard() {
    const [data, setData] = useState<RankingData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetch("/api/creator/dashboard/ranking", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const result = await response.json();
                if (result.success) {
                    setData(result.data);
                }
            } catch (err) {
                console.error("Error fetching ranking:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Card className="h-full border-none shadow-sm bg-gradient-to-br from-purple-50 to-white border-l-4 border-l-purple-500">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-purple-900 flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-500" />
                        Creator Ranking
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-24 bg-purple-100 rounded-xl"></div>
                        <div className="h-4 bg-purple-100 rounded w-3/4"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data) {
        return (
            <Card className="h-full border-none shadow-sm bg-gradient-to-br from-purple-50 to-white border-l-4 border-l-purple-500">
                <CardContent className="flex items-center justify-center h-full">
                    <p className="text-purple-600">No ranking data available</p>
                </CardContent>
            </Card>
        );
    }

    const isImproving = data.scoreChange >= 0;

    return (
        <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-white border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-purple-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-500" />
                    Creator Ranking
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center mb-4">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-white">{data.rankingScore}</div>
                                <div className="text-xs text-purple-100 font-medium">Score</div>
                            </div>
                        </div>
                        <div className={`absolute -bottom-2 -right-2 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${isImproving ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                            }`}>
                            {isImproving ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(data.scoreChange)}
                        </div>
                    </div>
                </div>

                <div className="bg-white/60 p-3 rounded-lg border border-purple-100">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-purple-700 font-medium">Your Score</span>
                        <span className="text-lg font-bold text-purple-900">{data.rankingScore}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-purple-700 font-medium">Category Average</span>
                        <span className="text-lg font-bold text-purple-900">{data.categoryAverage}</span>
                    </div>
                </div>

                <p className="text-xs text-purple-600 mt-3 text-center">
                    {data.rankingScore > data.categoryAverage
                        ? `You're performing ${data.rankingScore - data.categoryAverage} points above average!`
                        : `${data.categoryAverage - data.rankingScore} points to reach average`
                    }
                </p>
            </CardContent>
        </Card>
    );
}

