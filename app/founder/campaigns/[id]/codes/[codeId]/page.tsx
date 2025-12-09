"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Copy, CheckCircle2, TrendingUp, Users, DollarSign, BarChart3 } from "lucide-react";

interface CodeStats {
    code: {
        id: string;
        code: string;
        platform: string;
        active: boolean;
        createdAt: string;
        creator: {
            id: string;
            name: string;
            email: string;
        };
    };
    redemptions: {
        id: string;
        redeemedAt: string;
        userEmail: string | null;
        convertedToPaid: boolean;
        amountPaidByUser: number | null;
    }[];
    stats: {
        totalRedemptions: number;
        totalConversions: number;
        conversionRate: number;
        totalRevenue: number;
        commissionOwed: number;
    };
}

export default function CodeStatsPage() {
    const params = useParams();
    const router = useRouter();
    const campaignId = params.id as string;
    const codeId = params.codeId as string;

    const [data, setData] = useState<CodeStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState(false);

    useEffect(() => {
        fetchCodeStats();
    }, [codeId]);

    const fetchCodeStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/creator-codes/${codeId}/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error("Error fetching code stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (data) {
            navigator.clipboard.writeText(data.code.code);
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-32 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Code Not Found</h2>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/founder/campaigns/${campaignId}`)}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Campaign
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Code Analytics</h1>
                            <p className="text-gray-600 mt-1">
                                {data.code.creator.name} • {data.code.platform}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <code className="bg-primary-100 text-primary-800 px-4 py-2 rounded-lg font-mono text-xl font-bold">
                            {data.code.code}
                        </code>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={copyToClipboard}
                        >
                            {copiedCode ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy Code
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Redemptions</p>
                                    <p className="text-3xl font-bold text-gray-900">{data.stats.totalRedemptions}</p>
                                </div>
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Conversions</p>
                                    <p className="text-3xl font-bold text-gray-900">{data.stats.totalConversions}</p>
                                </div>
                                <div className="bg-green-100 p-3 rounded-full">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
                                    <p className="text-3xl font-bold text-gray-900">{data.stats.conversionRate.toFixed(1)}%</p>
                                </div>
                                <div className="bg-purple-100 p-3 rounded-full">
                                    <BarChart3 className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                                    <p className="text-3xl font-bold text-gray-900">${data.stats.totalRevenue.toFixed(2)}</p>
                                    <p className="text-xs text-gray-500 mt-1">Commission: ${data.stats.commissionOwed.toFixed(2)}</p>
                                </div>
                                <div className="bg-amber-100 p-3 rounded-full">
                                    <DollarSign className="w-6 h-6 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Redemptions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Redemption History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.redemptions.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No redemptions yet</p>
                                <p className="text-sm mt-1">Redemptions will appear here when users use this code</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-sm text-gray-500 border-b">
                                            <th className="pb-3 font-medium">Date</th>
                                            <th className="pb-3 font-medium">User</th>
                                            <th className="pb-3 font-medium">Amount</th>
                                            <th className="pb-3 font-medium">Status</th>
                                            <th className="pb-3 font-medium">Commission</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {data.redemptions.map((redemption) => (
                                            <tr key={redemption.id} className="text-sm">
                                                <td className="py-3">
                                                    {new Date(redemption.redeemedAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-3">
                                                    {redemption.userEmail || "Anonymous"}
                                                </td>
                                                <td className="py-3">
                                                    ${redemption.amountPaidByUser?.toFixed(2) || "0.00"}
                                                </td>
                                                <td className="py-3">
                                                    {redemption.convertedToPaid ? (
                                                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                                            Converted
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                                            Redeemed
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 font-medium">
                                                    {redemption.convertedToPaid ? `$${data.stats.commissionOwed / data.stats.totalConversions}` : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
