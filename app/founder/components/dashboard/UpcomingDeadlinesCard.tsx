"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Calendar, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";

interface Deadline {
    id: string;
    type: string;
    title: string;
    dueDate: string;
    urgency: 'urgent' | 'approaching' | 'normal';
    actionUrl: string;
    relatedEntity: {
        type: string;
        id: string;
        name: string;
    };
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

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'urgent':
                return 'bg-red-500 border-red-200 text-red-700';
            case 'approaching':
                return 'bg-amber-500 border-amber-200 text-amber-700';
            default:
                return 'bg-blue-500 border-blue-200 text-blue-700';
        }
    };

    const getTimeUntil = (dueDate: string) => {
        const now = new Date();
        const due = new Date(dueDate);
        const hoursUntil = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursUntil < 24) {
            return `${Math.round(hoursUntil)}h`;
        } else {
            const daysUntil = Math.round(hoursUntil / 24);
            return `${daysUntil}d`;
        }
    };

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
                            <Link key={item.id} href={item.actionUrl}>
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
                                    <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${item.urgency === 'urgent' ? 'bg-red-500' :
                                        item.urgency === 'approaching' ? 'bg-amber-500' : 'bg-blue-500'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 leading-tight">{item.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="w-3 h-3 text-gray-400" />
                                            <p className="text-xs text-gray-500">
                                                {getTimeUntil(item.dueDate)} • {new Date(item.dueDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    {item.urgency === 'urgent' && (
                                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-gray-500 text-center py-8">No upcoming deadlines</div>
                )}
            </CardContent>
        </Card>
    );
}
