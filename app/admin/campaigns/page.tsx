"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Campaign {
    id: string;
    name: string;
    brandName: string;
    founder: {
        name: string;
        company: string;
        email: string;
    };
    status: string;
    platform: string[];
    budget: number;
    deadline: string;
    stats: {
        applications: number;
        videos: number;
        disputes: number;
    };
    alerts: Array<{
        type: string;
        severity: string;
        message: string;
    }>;
    createdAt: string;
}

export default function CampaignManagementPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [statusCounts, setStatusCounts] = useState({
        active: 0,
        completed: 0,
        withDisputes: 0,
    });

    const [filters, setFilters] = useState({
        status: searchParams.get('status') || '',
        search: searchParams.get('search') || '',
        sortBy: searchParams.get('sortBy') || 'created_at',
        order: searchParams.get('order') || 'desc',
        hasAlerts: searchParams.get('hasAlerts') === 'true',
    });

    const [currentPage, setCurrentPage] = useState(0);
    const limit = 20;

    const fetchCampaigns = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const params = new URLSearchParams({
                ...(filters.status && { status: filters.status }),
                ...(filters.search && { search: filters.search }),
                ...(filters.hasAlerts && { hasAlerts: 'true' }),
                sortBy: filters.sortBy,
                order: filters.order,
                limit: limit.toString(),
                offset: (currentPage * limit).toString(),
            });

            const response = await fetch(`/api/admin/campaigns?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCampaigns(data.campaigns);
                setTotalCount(data.totalCount);
                setStatusCounts(data.statusCounts);
            }
        } catch (error) {
            console.error("Failed to fetch campaigns:", error);
        } finally {
            setLoading(false);
        }
    }, [filters, currentPage, limit]);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const handleFilterChange = (key: string, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setCurrentPage(0);

        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value.toString());
        } else {
            params.delete(key);
        }
        router.push(`/admin/campaigns?${params.toString()}`);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            ACTIVE: 'bg-green-100 text-green-800',
            IN_PROGRESS: 'bg-blue-100 text-blue-800',
            COMPLETED: 'bg-gray-100 text-gray-800',
            PAUSED: 'bg-yellow-100 text-yellow-800',
            CANCELLED: 'bg-red-100 text-red-800',
        };
        return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Campaign Oversight</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Monitor active campaigns, track progress, and handle interventions
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search by name, brand, or ID..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                        >
                            <option value="">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="PAUSED">Paused</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    {/* Sort By */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sort By
                        </label>
                        <select
                            value={filters.sortBy}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                        >
                            <option value="created_at">Created Date</option>
                            <option value="budget">Budget</option>
                            <option value="deadline">Deadline</option>
                            <option value="applications">Applications</option>
                        </select>
                    </div>
                </div>

                {/* Status Counts & Toggles */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-4 text-sm">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded">
                            Total: {totalCount}
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded">
                            Active: {statusCounts.active}
                        </span>
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded">
                            Disputes: {statusCounts.withDisputes}
                        </span>
                    </div>

                    <label className="flex items-center space-x-2 text-sm cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.hasAlerts}
                            onChange={(e) => handleFilterChange('hasAlerts', e.target.checked)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="font-medium text-gray-700">Show Alerts Only</span>
                    </label>
                </div>
            </div>

            {/* Campaign List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading campaigns...</p>
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No campaigns found matching your filters.
                    </div>
                ) : (
                    <>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Campaign
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Founder
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Budget
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stats
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Alerts
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {campaigns.map((campaign) => (
                                    <tr key={campaign.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {campaign.name}
                                                </div>
                                                <div className="text-sm text-gray-500">{campaign.brandName}</div>
                                                <div className="text-xs text-gray-400">
                                                    Deadline: {formatDate(campaign.deadline)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{campaign.founder.name}</div>
                                            <div className="text-xs text-gray-500">{campaign.founder.company}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(campaign.status)}`}>
                                                {campaign.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(campaign.budget)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-500 space-y-1">
                                                <div>{campaign.stats.applications} apps</div>
                                                <div>{campaign.stats.videos} videos</div>
                                                {campaign.stats.disputes > 0 && (
                                                    <div className="text-red-600 font-medium">{campaign.stats.disputes} disputes</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {campaign.alerts.length > 0 ? (
                                                <div className="space-y-1">
                                                    {campaign.alerts.map((alert, idx) => (
                                                        <span
                                                            key={idx}
                                                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${alert.severity === 'HIGH' ? 'bg-red-100 text-red-800' :
                                                                alert.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                                }`}
                                                            title={alert.message}
                                                        >
                                                            {alert.type}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <Link
                                                href={`/admin/campaigns/${campaign.id}`}
                                                className="text-red-600 hover:text-red-900 font-medium"
                                            >
                                                Manage →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                                    disabled={currentPage === 0}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    disabled={(currentPage + 1) * limit >= totalCount}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing{' '}
                                        <span className="font-medium">{currentPage * limit + 1}</span> to{' '}
                                        <span className="font-medium">
                                            {Math.min((currentPage + 1) * limit, totalCount)}
                                        </span>{' '}
                                        of <span className="font-medium">{totalCount}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                                            disabled={currentPage === 0}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage((p) => p + 1)}
                                            disabled={(currentPage + 1) * limit >= totalCount}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
