"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Notification {
    id: string;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
    type: string;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotifications();

        // Poll every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetch("/api/notifications", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const token = localStorage.getItem("token");
            await fetch("/api/notifications", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ notificationId: id }),
            });

            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem("token");
            await fetch("/api/notifications", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ markAll: true }),
            });

            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'PAYMENT': return '💰';
            case 'VIDEO_STATUS': return '🎥';
            case 'APPLICATION_UPDATE': return '📝';
            case 'DISPUTE': return '⚠️';
            default: return '🔔';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 transform -translate-y-1/2 translate-x-1/2 rounded-full ring-2 ring-white bg-red-500 text-xs text-white font-bold flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                        <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-indigo-600 hover:text-indigo-500"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="px-4 py-6 text-center text-sm text-gray-500">
                                    No notifications yet
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`px-4 py-3 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`}
                                        onClick={() => !notification.isRead && markAsRead(notification.id)}
                                    >
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 text-xl mr-3">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {notification.title}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(notification.createdAt).toLocaleDateString()}
                                                </p>
                                                {notification.link && (
                                                    <Link
                                                        href={notification.link}
                                                        className="text-xs text-indigo-600 hover:text-indigo-500 mt-1 block"
                                                    >
                                                        View Details
                                                    </Link>
                                                )}
                                            </div>
                                            {!notification.isRead && (
                                                <div className="flex-shrink-0 ml-2">
                                                    <span className="block h-2 w-2 rounded-full bg-blue-600"></span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
