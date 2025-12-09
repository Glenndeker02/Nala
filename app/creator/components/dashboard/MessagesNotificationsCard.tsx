"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Info, CheckCircle, AlertTriangle } from "lucide-react";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    link?: string;
}

export default function MessagesNotificationsCard() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetch("/api/creator/notifications?limit=5", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const result = await response.json();
                if (result.success) {
                    setNotifications(result.data.notifications);
                }
            } catch (err) {
                console.error("Error fetching notifications:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleNotificationClick = (link?: string) => {
        if (link) {
            router.push(link);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'WARNING': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-gray-500" />
                    Notifications
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-3 py-3 animate-pulse">
                                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No notifications</p>
                    </div>
                ) : (
                    <div className="space-y-0 divide-y divide-gray-100">
                        {notifications.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleNotificationClick(item.link)}
                                className={`flex gap-3 py-3 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors ${item.link ? 'cursor-pointer' : ''}`}
                            >
                                <div className="mt-0.5 flex-shrink-0">
                                    {getIcon(item.type)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-800">{item.message}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

