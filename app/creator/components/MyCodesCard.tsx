"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Copy, Tag, CheckCircle2, TrendingUp } from "lucide-react";

interface CreatorCode {
    id: string;
    code: string;
    platform: string;
    active: boolean;
    notes: string | null;
    expirationDate: string | null;
    campaign: {
        id: string;
        name: string;
        status: string;
        commissionPerConversion: number | null;
    };
    stats: {
        redemptions: number;
        conversions: number;
    };
}

interface Summary {
    totalCodes: number;
    activeCodes: number;
    totalRedemptions: number;
    totalConversions: number;
    attributedRevenue: string;
    earnings: {
        total: string;
        pending: string;
        paid: string;
    };
}

interface MyCodesCardProps {
    campaignId?: string; // Optional - if provided, filter to specific campaign
}

export default function MyCodesCard({ campaignId }: MyCodesCardProps) {
    const [codes, setCodes] = useState<CreatorCode[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const fetchCodes = async () => {
        try {
            const token = localStorage.getItem("token");
            let url = "/api/creator/my-codes";
            if (campaignId) {
                url += `?campaignId=${campaignId}`;
            }
            console.log('[MyCodesCard] Fetching from:', url);
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            console.log('[MyCodesCard] API Response:', data);
            if (data.success) {
                setCodes(data.data.codes);
                setSummary(data.data.summary);
                console.log('[MyCodesCard] Codes found:', data.data.codes.length);
            } else {
                console.error('[MyCodesCard] API returned success: false', data.error);
            }
        } catch (error) {
            console.error("Error fetching codes:", error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    useEffect(() => {
        fetchCodes();
    }, [campaignId]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        My Attribution Codes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-3">
                        <div className="h-20 bg-gray-200 rounded"></div>
                        <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (codes.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        My Attribution Codes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No attribution codes assigned yet</p>
                        <p className="text-sm mt-1">Codes will appear here once you're accepted to a campaign</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    My Attribution Codes
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Summary Stats */}
                {summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-sm text-blue-600 font-medium">Active Codes</p>
                            <p className="text-2xl font-bold text-blue-900">{summary.activeCodes}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <p className="text-sm text-green-600 font-medium">Total Redemptions</p>
                            <p className="text-2xl font-bold text-green-900">{summary.totalRedemptions}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                            <p className="text-sm text-purple-600 font-medium">Conversions</p>
                            <p className="text-2xl font-bold text-purple-900">{summary.totalConversions}</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-4">
                            <p className="text-sm text-amber-600 font-medium">Conversion Earnings</p>
                            <p className="text-2xl font-bold text-amber-900">${summary.earnings.total}</p>
                            {parseFloat(summary.earnings.pending) > 0 && (
                                <p className="text-xs text-amber-600">${summary.earnings.pending} pending</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Codes List */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900">Your Codes</h3>
                    {codes.map((code) => (
                        <div
                            key={code.id}
                            className="border rounded-lg p-4 hover:border-primary-300 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <code className="bg-primary-100 text-primary-800 px-3 py-2 rounded-lg font-mono text-lg font-bold">
                                        {code.code}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(code.code)}
                                        className="h-9"
                                    >
                                        {copiedCode === code.code ? (
                                            <>
                                                <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4 mr-1" />
                                                Copy
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <TrendingUp className="w-4 h-4" />
                                            <span>{code.stats.redemptions} uses</span>
                                        </div>
                                        {code.stats.conversions > 0 && (
                                            <p className="text-xs text-green-600">
                                                {code.stats.conversions} conversions
                                            </p>
                                        )}
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${code.platform === 'TIKTOK' ? 'bg-pink-100 text-pink-700' :
                                        code.platform === 'INSTAGRAM' ? 'bg-purple-100 text-purple-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {code.platform}
                                    </span>
                                </div>
                            </div>

                            {/* Usage Instructions */}
                            <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                                <p className="font-medium text-gray-900 mb-1">📋 How to use:</p>
                                <ul className="list-disc list-inside space-y-1 text-gray-500">
                                    <li>Include this code in your video caption</li>
                                    <li>Tell viewers to use the code when signing up</li>
                                    <li>Pin a comment with the code for visibility</li>
                                </ul>
                            </div>

                            {/* Campaign Info */}
                            {!campaignId && (
                                <div className="mt-2 text-xs text-gray-500">
                                    Campaign: {code.campaign.name}
                                    {code.campaign.commissionPerConversion && (
                                        <span className="ml-2 text-green-600">
                                            ${code.campaign.commissionPerConversion} per conversion
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

