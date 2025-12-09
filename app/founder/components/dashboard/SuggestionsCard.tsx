"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Sparkles, ArrowRight, TrendingDown, TrendingUp, AlertCircle, Zap } from "lucide-react";
import Link from "next/link";

interface Suggestion {
    id: string;
    type: string;
    priority: number;
    title: string;
    description: string;
    actionType: string;
    actionData: any;
    actionUrl: string;
}

export default function SuggestionsCard() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetch("/api/founder/dashboard/suggestions", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const result = await response.json();
                if (result.success) {
                    setSuggestions(result.data.suggestions);
                }
            } catch (err) {
                console.error("Error fetching suggestions:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'PERFORMANCE_DECLINE':
                return TrendingDown;
            case 'CREATOR_PERFORMANCE':
            case 'FORMAT_TRENDING':
                return TrendingUp;
            case 'DEADLINE_APPROACHING':
                return AlertCircle;
            default:
                return Zap;
        }
    };

    const getActionLabel = (actionType: string) => {
        switch (actionType) {
            case 'create_campaign':
            case 'create_campaign_with_creator':
                return 'Create Campaign';
            case 'view_campaign':
                return 'View Campaign';
            case 'view_deadlines':
                return 'View Deadlines';
            case 'add_budget':
                return 'Add Budget';
            default:
                return 'View';
        }
    };

    return (
        <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-white border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-purple-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    Smart Suggestions
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white/60 p-3 rounded border border-purple-100 animate-pulse">
                                <div className="h-4 bg-purple-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-purple-100 rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                ) : suggestions.length > 0 ? (
                    <div className="space-y-3">
                        {suggestions.slice(0, 3).map((item) => {
                            const Icon = getIcon(item.type);
                            return (
                                <Link key={item.id} href={item.actionUrl}>
                                    <div className="bg-white/60 p-3 rounded border border-purple-100 hover:bg-white hover:border-purple-200 transition-all cursor-pointer group">
                                        <div className="flex items-start gap-2">
                                            <Icon className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-purple-900 leading-tight">{item.title}</h4>
                                                <p className="text-xs text-purple-700 mt-1">{item.description}</p>
                                                <div className="flex items-center gap-1 mt-2 text-xs text-purple-600 font-medium group-hover:text-purple-700">
                                                    <span>{getActionLabel(item.actionType)}</span>
                                                    <ArrowRight className="w-3 h-3" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-sm text-purple-600 text-center py-4">No suggestions available</div>
                )}
            </CardContent>
        </Card>
    );
}
