"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Founder {
    id: string;
    name: string;
    email: string;
    companyName: string;
    joinedDate: string;
    tier: string;
    totalSpending: number;
    activeCampaigns: number;
    totalCampaigns: number;
    status: string;
}

export default function FounderManagementPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [founders, setFounders] = useState<Founder[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [statusCounts, setStatusCounts] = useState({
        active: 0,
        suspended: 0,
        banned: 0,
    });

    const [filters, setFilters] = useState({
        tier: searchParams.get('tier') || '',
        search: searchParams.get('search') || '',
        sortBy: searchParams.get('sortBy') || 'joined_date',
        order: searchParams.get('order') || 'desc',
    });

    const [currentPage, setCurrentPage] = useState(0);
    const limit = 20;

    const fetchFounders = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const params = new URLSearchParams({
                ...(filters.tier && { tier: filters.tier }),
                ...(filters.search && { search: filters.search }),
                sortBy: filters.sortBy,
                order: filters.order,
                limit: limit.toString(),
                offset: (currentPage * limit).toString(),
            });

            const response = await fetch(`/api/admin/founders?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setFounders(data.founders);
                setTotalCount(data.totalCount);
                setStatusCounts(data.statusCounts);
            }
        } catch (error) {
            console.error("Failed to fetch founders:", error);
        } finally {
            setLoading(false);
        }
    }, [filters, currentPage]);

    useEffect(() => {
        fetchFounders();
    }, [fetchFounders]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setCurrentPage(0);

        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/admin/founders?${params.toString()}`);
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
            SUSPENDED: 'bg-yellow-100 text-yellow-800',
            BANNED: 'bg-red-100 text-red-800',
        };
        return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
    };

    const getTierBadge = (tier: string) => {
        const badges = {
            PLATINUM: 'bg-purple-100 text-purple-800',
            GOLD: 'bg-yellow-100 text-yellow-800',
            SILVER: 'bg-gray-100 text-gray-800',
        };
        return badges[tier as keyof typeof badges] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Founder Management</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage brand accounts, track spending, and oversee campaigns
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
                            placeholder="Search by name, email, company..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                        />
                    </div>

                    {/* Tier Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tier
                        </label>
                        <select
                            value={filters.tier}
                            onChange={(e) => handleFilterChange('tier', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                        >
                            <option value="">All Tiers</option>
                            <option value="PLATINUM">Platinum</option>
                            <option value="GOLD">Gold</option>
                            <option value="SILVER">Silver</option>
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
                            <option value="joined_date">Joined Date</option>
                            <option value="spending">Total Spending</option>
                            <option value="campaigns">Campaign Count</option>
                            <option value="name">Name</option>
                        </select>
                    </div>
                </div>

                {/* Status Counts */}
                <div className="mt-4 flex gap-4 text-sm">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded">
                        Total: {totalCount}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded">
                        Active: {statusCounts.active}
                    </span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded">
                        Suspended: {statusCounts.suspended}
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded">
                        Banned: {statusCounts.banned}
                    </span>
                </div>
            </div>

            {/* Founder List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading founders...</p>
                    </div>
                ) : founders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No founders found matching your filters.
                    </div>
                ) : (
                    <>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Founder / Company
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tier
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Spending
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Campaigns
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {founders.map((founder) => (
                                    <tr key={founder.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {founder.companyName || founder.name}
                                                </div>
                                                <div className="text-sm text-gray-500">{founder.email}</div>
                                                <div className="text-xs text-gray-400">
                                                    Joined: {formatDate(founder.joinedDate)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTierBadge(founder.tier)}`}>
                                                {founder.tier}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(founder.totalSpending)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div>{founder.totalCampaigns} total</div>
                                                <div className="text-xs text-green-600">
                                                    {founder.activeCampaigns} active
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(founder.status)}`}>
                                                {founder.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <Link
                                                href={`/admin/founders/${founder.id}`}
                                                className="text-red-600 hover:text-red-900 font-medium"
                                            >
                                                View Details →
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
