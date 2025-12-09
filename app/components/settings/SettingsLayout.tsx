"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    User,
    Shield,
    Bell,
    CreditCard,
    Building2,
    DollarSign,
    Briefcase,
    Wallet,
    Settings as SettingsIcon
} from "lucide-react";

interface SettingsLayoutProps {
    children: React.ReactNode;
    userRole: "FOUNDER" | "CREATOR";
    activeSection: string;
}

export default function SettingsLayout({ children, userRole, activeSection }: SettingsLayoutProps) {
    const router = useRouter();

    const commonSections = [
        { id: "profile", label: "Profile", icon: User, href: `/${userRole.toLowerCase()}/settings/profile` },
        { id: "account", label: "Account", icon: SettingsIcon, href: `/${userRole.toLowerCase()}/settings/account` },
        { id: "security", label: "Security", icon: Shield, href: `/${userRole.toLowerCase()}/settings/security` },
        { id: "notifications", label: "Notifications", icon: Bell, href: `/${userRole.toLowerCase()}/settings/notifications` }
    ];

    const founderSections = [
        { id: "billing", label: "Billing", icon: CreditCard, href: "/founder/settings/billing" },
        { id: "company", label: "Company", icon: Building2, href: "/founder/settings/company" }
    ];

    const creatorSections = [
        { id: "rates", label: "Platform Rates", icon: DollarSign, href: "/creator/settings/rates" },
        { id: "portfolio", label: "Portfolio", icon: Briefcase, href: "/creator/settings/portfolio" },
        { id: "payout", label: "Payouts", icon: Wallet, href: "/creator/settings/payout" }
    ];

    const roleSections = userRole === "FOUNDER" ? founderSections : creatorSections;
    const allSections = [...commonSections, ...roleSections];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <nav className="space-y-1">
                                {allSections.map((section) => {
                                    const Icon = section.icon;
                                    const isActive = activeSection === section.id;

                                    return (
                                        <Link
                                            key={section.id}
                                            href={section.href}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                                    ? 'bg-primary-50 text-primary-700 font-medium'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                                            <span>{section.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
