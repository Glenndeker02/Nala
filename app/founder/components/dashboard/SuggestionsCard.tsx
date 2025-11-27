"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Sparkles } from "lucide-react";

interface Suggestion {
    id: string;
    title: string;
    description: string;
    type: string;
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

    return (
        <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-white border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-purple-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    Suggestions
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white/60 p-2 rounded border border-purple-100 animate-pulse">
                                <div className="h-4 bg-purple-200 rounded w-3/4 mb-1"></div>
                                <div className="h-3 bg-purple-100 rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                ) : suggestions.length > 0 ? (
                    <div className="space-y-3">
                        {suggestions.map((item) => (
                            <div key={item.id} className="bg-white/60 p-2 rounded border border-purple-100">
                                <h4 className="text-sm font-medium text-purple-900">{item.title}</h4>
                                <p className="text-xs text-purple-700 mt-0.5">{item.description}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-purple-600 text-center py-4">No suggestions available</div>
                )}
            </CardContent>
        </Card>
    );
}
