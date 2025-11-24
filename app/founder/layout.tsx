"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import NotificationBell from "@/components/ui/NotificationBell";

export default function FounderLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
            router.push("/auth/login");
            return;
        }

        setUser(JSON.parse(userData));
    }, [router]);

    if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    const navigation = [
        { name: 'Dashboard', href: '/founder/dashboard' },
        { name: 'Create Campaign', href: '/founder/campaigns/create' },
        { name: 'Settings', href: '/founder/settings' },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-xl font-bold text-indigo-600">Nala</span>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === item.href
                                                ? 'border-indigo-500 text-gray-900'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationBell />
                            <div className="flex items-center">
                                <span className="text-sm text-gray-700 mr-4">{user.fullName}</span>
                                <button
                                    onClick={() => {
                                        localStorage.removeItem("token");
                                        localStorage.removeItem("user");
                                        router.push("/auth/login");
                                    }}
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            <main>
                {children}
            </main>
        </div>
    );
}
