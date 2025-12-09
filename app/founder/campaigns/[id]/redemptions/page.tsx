'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Redemption {
    id: string;
    code: string;
    platform: string;
    redeemedAt: string;
    creator: {
        id: string;
        name: string;
    };
    user: {
        id: string;
        email: string;
    } | null;
    orderId: string | null;
    amountPaid: number | null;
    discountApplied: number | null;
    convertedToPaid: boolean;
    conversionDate: string | null;
    flaggedForReview: boolean;
    deviceInfo: string | null;
}

interface RedemptionData {
    redemptions: Redemption[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export default function RedemptionsPage({ params }: { params: { id: string } }) {
    const campaignId = params.id;

    const [data, setData] = useState<RedemptionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        converted: '',
        flagged: '',
        platform: ''
    });

    useEffect(() => {
        fetchRedemptions();
    }, [campaignId, page, filters]);

    const fetchRedemptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({ page: page.toString(), limit: '25' });
            if (filters.converted) params.append('converted', filters.converted);
            if (filters.flagged) params.append('flagged', filters.flagged);
            if (filters.platform) params.append('platform', filters.platform);

            const res = await fetch(`/api/campaigns/${campaignId}/redemptions?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await res.json();

            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary-DEFAULT border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link href={`/founder/campaigns/${campaignId}/attribution`} className="text-gray-600 hover:text-gray-900 text-sm mb-2 inline-block">
                            ← Back to Attribution Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">All Redemptions</h1>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border p-4 mb-6">
                    <div className="flex flex-wrap gap-4">
                        <select
                            value={filters.converted}
                            onChange={(e) => setFilters({ ...filters, converted: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-2"
                        >
                            <option value="">All Status</option>
                            <option value="true">Converted</option>
                            <option value="false">Not Converted</option>
                        </select>
                        <select
                            value={filters.flagged}
                            onChange={(e) => setFilters({ ...filters, flagged: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-2"
                        >
                            <option value="">All</option>
                            <option value="true">Flagged for Review</option>
                        </select>
                        <select
                            value={filters.platform}
                            onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-2"
                        >
                            <option value="">All Platforms</option>
                            <option value="TIKTOK">TikTok</option>
                            <option value="INSTAGRAM">Instagram</option>
                            <option value="FACEBOOK">Facebook</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Code</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Creator</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Platform</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">User</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Amount</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Status</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Flags</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data?.redemptions.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {formatDate(r.redeemedAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">{r.code}</code>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{r.creator.name}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline" size="sm">{r.platform}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {r.user?.email || r.orderId || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-medium">
                                            {r.amountPaid ? `$${r.amountPaid.toFixed(2)}` : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge variant={r.convertedToPaid ? 'success' : 'secondary'} size="sm">
                                                {r.convertedToPaid ? 'Converted' : 'Pending'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {r.flaggedForReview && (
                                                <Badge variant="destructive" size="sm">⚠️ Review</Badge>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {(!data || data.redemptions.length === 0) && (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                            No redemptions found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {data && data.pagination.totalPages > 1 && (
                        <div className="px-4 py-3 border-t flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing {(page - 1) * 25 + 1} - {Math.min(page * 25, data.pagination.total)} of {data.pagination.total}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page >= data.pagination.totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
