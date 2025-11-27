"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Calendar, AlertCircle } from "lucide-react";

interface Deadline {
    id: string;
    task: string;
    date: string;
    priority: 'high' | 'medium' | 'low';
    link?: string;
}

export default function UpcomingDeadlinesCard() {
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetch("/api/founder/dashboard/deadlines", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const result = await response.json();
                if (result.success) {
                    setDeadlines(result.data.deadlines);
                }
            } catch (err) {
                console.error("Error fetching deadlines:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    Upcoming Deadlines
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-100 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        ))}
                    </div>
                ) : deadlines.length > 0 ? (
                    <div className="space-y-3">
                        {deadlines.map((item) => (
                            <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${item.priority === 'high' ? 'bg-red-500' :
                                        item.priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
                                    }`} />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 leading-tight">{item.task}</p>
                                    <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                                </div>
                                {item.priority === 'high' && (
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-gray-500 text-center py-8">No upcoming deadlines</div>
                )}
            </CardContent>
        </Card>
    );
}
