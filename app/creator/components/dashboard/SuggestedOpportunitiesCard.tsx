"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sparkles, DollarSign, TrendingUp } from "lucide-react";
import Link from "next/link";

interface Opportunity {
    id: string;
    campaignName: string;
    brandName: string;
    matchScore: number;
    estimatedEarnings: number;
    videosNeeded: number;
    category: string;
}

export default function SuggestedOpportunitiesCard() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetch("/api/creator/dashboard/opportunities", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const result = await response.json();
                if (result.success) {
                    setOpportunities(result.data.opportunities.slice(0, 3));
                }
            } catch (err) {
                console.error("Error fetching opportunities:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-green-50 to-white border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-green-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-500" />
                    Suggested Opportunities
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white/60 p-3 rounded-lg border border-green-100 animate-pulse">
                                <div className="h-4 bg-green-100 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-green-100 rounded w-1/2 mb-2"></div>
                                <div className="h-8 bg-green-100 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : opportunities.length === 0 ? (
                    <div className="text-center py-8 text-green-600">
                        <p className="text-sm">No opportunities available</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {opportunities.map((opp) => (
                            <div key={opp.id} className="bg-white/60 p-3 rounded-lg border border-green-100 hover:bg-white transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-green-900">{opp.campaignName}</h4>
                                        <p className="text-xs text-green-700">{opp.brandName}</p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                                        <TrendingUp className="w-3 h-3 text-green-600" />
                                        <span className="text-xs font-bold text-green-600">{opp.matchScore}%</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-xs text-green-700">
                                        <DollarSign className="w-3 h-3" />
                                        <span className="font-medium">${opp.estimatedEarnings}</span>
                                    </div>
                                    <Link href={`/creator/campaigns/${opp.id}`}>
                                        <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white">
                                            Apply
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
