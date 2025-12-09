'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';

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

interface CodesSummary {
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

interface MyCodesData {
    codes: CreatorCode[];
    summary: CodesSummary;
}

export default function MyCodesCard() {
    const [data, setData] = useState<MyCodesData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyCodes();
    }, []);

    const fetchMyCodes = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/creator/my-codes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching codes:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        alert(`Code "${code}" copied to clipboard!`);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-20 bg-gray-100 rounded"></div>
                </div>
            </div>
        );
    }

    if (!data || data.codes.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">My Attribution Codes</h3>
                <p className="text-gray-600 text-sm">
                    You don&apos;t have any attribution codes yet. Codes will appear here when founders assign them to you for campaigns.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Attribution Codes</h3>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                    <p className="text-2xl font-bold text-blue-600">{data.summary.totalRedemptions}</p>
                    <p className="text-xs text-blue-700">Redemptions</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                    <p className="text-2xl font-bold text-green-600">{data.summary.totalConversions}</p>
                    <p className="text-xs text-green-700">Conversions</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                    <p className="text-2xl font-bold text-purple-600">${data.summary.earnings.total}</p>
                    <p className="text-xs text-purple-700">Total Earned</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
                    <p className="text-2xl font-bold text-orange-600">${data.summary.earnings.pending}</p>
                    <p className="text-xs text-orange-700">Pending</p>
                </div>
            </div>

            {/* Codes List */}
            <div className="space-y-3">
                {data.codes.map(code => (
                    <div key={code.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <code className="bg-gray-900 text-white px-3 py-1.5 rounded font-mono text-sm">
                                    {code.code}
                                </code>
                                <Badge variant="outline">{code.platform}</Badge>
                                {!code.active && <Badge variant="secondary">Inactive</Badge>}
                            </div>
                            <button
                                onClick={() => copyToClipboard(code.code)}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                📋 Copy
                            </button>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div>
                                <span className="text-gray-600">Campaign: </span>
                                <span className="font-medium">{code.campaign.name}</span>
                            </div>
                            <div className="flex items-center gap-4 text-gray-600">
                                <span>{code.stats.redemptions} redemptions</span>
                                <span className="text-green-600 font-medium">{code.stats.conversions} conversions</span>
                                {code.campaign.commissionPerConversion && (
                                    <span className="text-purple-600">${code.campaign.commissionPerConversion}/conversion</span>
                                )}
                            </div>
                        </div>
                        {code.notes && (
                            <div className="mt-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                                💡 {code.notes}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
