"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users, Video, DollarSign, FileText } from "lucide-react";
import Link from "next/link";

interface Activity {
    id: string;
    activityType: string;
    title: string;
    description: string;
    actionUrl: string;
    timestamp: string;
    creator: {
        id: string;
        name: string;
    };
}

export default function CreatorActivityCard() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetch("/api/founder/dashboard/creator-activity", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const result = await response.json();
                if (result.success) {
                    setActivities(result.data.activities);
                }
            } catch (err) {
                console.error("Error fetching creator activity:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'DRAFT_UPLOADED':
            case 'REVISION_UPLOADED':
            case 'VIDEO_POSTED':
                return Video;
            case 'PAYMENT_RECEIVED':
            case 'BONUS_TRIGGERED':
                return DollarSign;
            case 'APPLICATION_SUBMITTED':
                return FileText;
            default:
                return Users;
        }
    };

    const getTimeAgo = (timestamp: string) => {
        const now = new Date();
        const past = new Date(timestamp);
        const minutesAgo = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));

        if (minutesAgo < 60) {
            return `${minutesAgo}m ago`;
        } else if (minutesAgo < 1440) {
            return `${Math.floor(minutesAgo / 60)}h ago`;
        } else {
            return `${Math.floor(minutesAgo / 1440)}d ago`;
        }
    };

    return (
        <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-500" />
                    Creator Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3 animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activities.length > 0 ? (
                    <div className="space-y-4">
                        {activities.map((item) => {
                            const Icon = getActivityIcon(item.activityType);
                            return (
                                <Link key={item.id} href={item.actionUrl}>
                                    <div className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer -mx-2">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                            <Icon className="w-4 h-4 text-primary-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900 font-medium truncate">
                                                {item.title}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">{item.description}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{getTimeAgo(item.timestamp)}</p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-sm text-gray-500 text-center py-8">No recent activity</div>
                )}
            </CardContent>
        </Card>
    );
}
