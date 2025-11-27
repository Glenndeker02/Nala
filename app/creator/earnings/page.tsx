"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

type EarningsSummary = {
    totalEarnings: number;
    pendingEarnings: number;
    paidEarnings: number;
    baseFeeTotal: number;
    performanceBonusTotal: number;
    campaignsCompleted: number;
    averageEarningsPerCampaign: number;
};

type CampaignEarning = {
    id: string;
    campaignName: string;
    founderName: string;
    status: string;
    baseFee: number;
    performanceBonus: number;
    total: number;
    views: number;
    postedDate: string;
    settledDate?: string;
};

type PaymentHistory = {
    id: string;
    date: string;
    type: "BASE_FEE" | "PERFORMANCE_BONUS";
    campaignName: string;
    amount: number;
    status: "PENDING" | "PAID";
};

export default function CreatorEarningsPage() {
    const router = useRouter();
    const [summary, setSummary] = useState<EarningsSummary | null>(null);
    const [campaigns, setCampaigns] = useState<CampaignEarning[]>([]);
    const [payments, setPayments] = useState<PaymentHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"overview" | "campaigns" | "payments">("overview");

    useEffect(() => {
        fetchEarningsData();
    }, []);

    const fetchEarningsData = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("/api/creator/earnings", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const result = await response.json();
                const data = result.data || result;

                setSummary(data.summary);
                setCampaigns(data.campaigns);
                setPayments(data.payments);
            } else {
                console.error("Failed to fetch earnings");
            }
        } catch (error) {
            console.error("Error fetching earnings:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-DEFAULT mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading earnings data...</p>
                </div>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Earnings Data</h2>
                    <p className="text-gray-600 mb-6">Complete campaigns to start earning.</p>
                    <Link href="/creator/briefs">
                        <Button>Browse Campaigns</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main>
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Earnings
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Track your earnings and payment history
                        </p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="border-2 border-primary-DEFAULT">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600">Total Earnings</p>
                                    <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-primary-DEFAULT" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-4xl font-bold text-primary-DEFAULT">
                                    ${summary.totalEarnings.toFixed(2)}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600">Pending</p>
                                    <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">
                                    ${summary.pendingEarnings.toFixed(2)}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600">Paid</p>
                                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">
                                    ${summary.paidEarnings.toFixed(2)}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600">Avg per Campaign</p>
                                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">
                                    ${summary.averageEarningsPerCampaign.toFixed(2)}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Earnings Breakdown */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Earnings Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Base Fees</span>
                                        <span className="text-xl font-bold text-gray-900">
                                            ${summary.baseFeeTotal.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 rounded-full"
                                            style={{ width: `${(summary.baseFeeTotal / summary.totalEarnings) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {((summary.baseFeeTotal / summary.totalEarnings) * 100).toFixed(1)}% of total
                                    </p>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Performance Bonuses</span>
                                        <span className="text-xl font-bold text-primary-DEFAULT">
                                            ${summary.performanceBonusTotal.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary-DEFAULT rounded-full"
                                            style={{ width: `${(summary.performanceBonusTotal / summary.totalEarnings) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {((summary.performanceBonusTotal / summary.totalEarnings) * 100).toFixed(1)}% of total
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabs */}
                    <div className="mb-6 flex gap-3">
                        <Button
                            variant={activeTab === "overview" ? "primary" : "secondary"}
                            onClick={() => setActiveTab("overview")}
                        >
                            Overview
                        </Button>
                        <Button
                            variant={activeTab === "campaigns" ? "primary" : "secondary"}
                            onClick={() => setActiveTab("campaigns")}
                        >
                            By Campaign
                        </Button>
                        <Button
                            variant={activeTab === "payments" ? "primary" : "secondary"}
                            onClick={() => setActiveTab("payments")}
                        >
                            Payment History
                        </Button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === "campaigns" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Campaign Earnings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {campaigns.map((campaign) => (
                                        <div key={campaign.id} className="p-4 bg-gray-50 rounded-xl">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{campaign.campaignName}</h3>
                                                    <p className="text-sm text-gray-600">{campaign.founderName}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${campaign.status === "COMPLETED"
                                                    ? "bg-green-50 text-green-700 border border-green-200"
                                                    : "bg-purple-50 text-purple-700 border border-purple-200"
                                                    }`}>
                                                    {campaign.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600">Base Fee</p>
                                                    <p className="font-medium text-gray-900">${campaign.baseFee}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Performance</p>
                                                    <p className="font-medium text-primary-DEFAULT">${campaign.performanceBonus.toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Views</p>
                                                    <p className="font-medium text-gray-900">{campaign.views.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Total</p>
                                                    <p className="font-bold text-gray-900">${campaign.total.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "payments" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {payments.map((payment) => (
                                        <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${payment.status === "PAID" ? "bg-green-50" : "bg-yellow-50"
                                                    }`}>
                                                    {payment.status === "PAID" ? (
                                                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{payment.campaignName}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {payment.type === "BASE_FEE" ? "Base Fee" : "Performance Bonus"} • {new Date(payment.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900">${payment.amount.toFixed(2)}</p>
                                                <p className={`text-xs font-medium ${payment.status === "PAID" ? "text-green-600" : "text-yellow-600"
                                                    }`}>
                                                    {payment.status}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "overview" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Earnings</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {campaigns.slice(0, 3).map((campaign) => (
                                            <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{campaign.campaignName}</p>
                                                    <p className="text-sm text-gray-600">{campaign.views.toLocaleString()} views</p>
                                                </div>
                                                <p className="text-lg font-bold text-primary-DEFAULT">
                                                    ${campaign.total.toFixed(2)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-blue-50 border-blue-200">
                                <CardContent className="p-6">
                                    <h3 className="font-bold text-blue-900 mb-4">💡 Maximize Your Earnings</h3>
                                    <ul className="space-y-3 text-sm text-blue-800">
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 mt-0.5">•</span>
                                            <span>Apply to campaigns that match your audience</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 mt-0.5">•</span>
                                            <span>Create high-quality content to boost views</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 mt-0.5">•</span>
                                            <span>Engage with your audience in comments</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 mt-0.5">•</span>
                                            <span>Post at optimal times for your followers</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 mt-0.5">•</span>
                                            <span>Complete campaigns on time for better ratings</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
