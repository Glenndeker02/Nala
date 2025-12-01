"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Trash2, ArrowLeft, Loader2 } from "lucide-react";

type Notification = {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    metadata?: any;
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const router = useRouter();

    useEffect(() => {
        fetchNotifications();
    }, [filter]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/auth/login");
                return;
            }

            const query = filter === 'unread' ? '?unreadOnly=true' : '';
            const response = await fetch(`/api/notifications${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setNotifications(data.data.notifications);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const token = localStorage.getItem("token");
            await fetch(`/api/notifications/${id}/read`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        // Implement bulk mark as read if API supports it, or loop through
        // For now, we'll just refresh
        fetchNotifications();
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }

        // Navigate based on metadata
        if (notification.metadata?.campaignId) {
            if (notification.type === 'APPLICATION_RECEIVED') {
                router.push('/founder/dashboard');
            } else if (notification.type === 'APPLICATION_UPDATE') {
                router.push('/creator/dashboard');
            } else if (notification.type === 'VIDEO_SUBMITTED') {
                router.push(`/founder/campaigns/${notification.metadata.campaignId}`);
            } else {
                router.push(`/creator/campaigns/${notification.metadata.campaignId}`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={filter === 'all' ? 'default' : 'outline'}
                            onClick={() => setFilter('all')}
                            size="sm"
                        >
                            All
                        </Button>
                        <Button
                            variant={filter === 'unread' ? 'default' : 'outline'}
                            onClick={() => setFilter('unread')}
                            size="sm"
                        >
                            Unread
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-12 text-center">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-DEFAULT" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
                                <p>You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer flex gap-4 ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className={`mt-1.5 w-3 h-3 rounded-full flex-shrink-0 ${!notification.isRead ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className={`text-base ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                    {notification.title}
                                                </h3>
                                                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                                                    {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mb-2">{notification.message}</p>
                                            {notification.metadata?.campaignId && (
                                                <Badge variant="outline" className="text-xs">
                                                    Campaign Update
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
