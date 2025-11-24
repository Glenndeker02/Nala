"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Creator {
    id: string;
    name: string;
    email: string;
    joinedDate: string;
    kycStatus: string;
    totalEarnings: number;
    campaignsCompleted: number;
    completionRate: number;
    avgRating: number;
    socialAccounts: Array<{
        platform: string;
        followers: number;
        isActive: boolean;
    }>;
    status: string;
}

export default function CreatorManagementPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [creators, setCreators] = useState<Creator[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [statusCounts, setStatusCounts] = useState({
        pending: 0,
        verified: 0,
        rejected: 0,
        banned: 0,
    });

    const [filters, setFilters] = useState({
        kycStatus: searchParams.get('kycStatus') || '',
        search: searchParams.get('search') || '',
        sortBy: searchParams.get('sortBy') || 'joined_date',
        order: searchParams.get('order') || 'desc',
    });

    const [currentPage, setCurrentPage] = useState(0);
    const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
    const limit = 20;

    const fetchCreators = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const params = new URLSearchParams({
                ...(filters.kycStatus && { kycStatus: filters.kycStatus }),
                ...(filters.search && { search: filters.search }),
                sortBy: filters.sortBy,
                order: filters.order,
                limit: limit.toString(),
                offset: (currentPage * limit).toString(),
            });

            const response = await fetch(`/api/admin/creators?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCreators(data.creators);
                setTotalCount(data.totalCount);
                setStatusCounts(data.statusCounts);
            }
        } catch (error) {
            console.error("Failed to fetch creators:", error);
        } finally {
            setLoading(false);
        }
    }, [filters, currentPage]);

    useEffect(() => {
        fetchCreators();
    }, [fetchCreators]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setCurrentPage(0);

        // Update URL
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/admin/creators?${params.toString()}`);
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

    const getKYCBadge = (status: string) => {
        const badges = {
            VERIFIED: 'bg-green-100 text-green-800',
            PENDING: 'bg-yellow-100 text-yellow-800',
            REJECTED: 'bg-red-100 text-red-800',
        };
        return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
    };

    const toggleSelectCreator = (id: string) => {
        setSelectedCreators((prev) =>
            prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedCreators.length === creators.length) {
            setSelectedCreators([]);
        } else {
            setSelectedCreators(creators.map((c) => c.id));
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Creator Management</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage creator accounts, KYC verification, and permissions
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
                            placeholder="Search by name, email, or ID..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                        />
                    </div>

                    {/* KYC Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            KYC Status
                        </label>
                        <select
                            value={filters.kycStatus}
                            onChange={(e) => handleFilterChange('kycStatus', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                        >
                            <option value="">All Status</option>
                            <option value="PENDING">Pending ({statusCounts.pending})</option>
                            <option value="VERIFIED">Verified ({statusCounts.verified})</option>
                            <option value="REJECTED">Rejected ({statusCounts.rejected})</option>
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
                            <option value="name">Name</option>
                            <option value="earnings">Earnings</option>
                            <option value="rating">Rating</option>
                        </select>
                    </div>
                </div>

                {/* Status Counts */}
                <div className="mt-4 flex gap-4 text-sm">
                    <button
                        onClick={() => handleFilterChange('kycStatus', '')}
                        className={`px-3 py-1 rounded ${!filters.kycStatus ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}
                    >
                        All: {totalCount}
                    </button>
                    <button
                        onClick={() => handleFilterChange('kycStatus', 'PENDING')}
                        className={`px-3 py-1 rounded ${filters.kycStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Pending: {statusCounts.pending}
                    </button>
                    <button
                        onClick={() => handleFilterChange('kycStatus', 'VERIFIED')}
                        className={`px-3 py-1 rounded ${filters.kycStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Verified: {statusCounts.verified}
                    </button>
                    <button
                        onClick={() => handleFilterChange('kycStatus', 'REJECTED')}
                        className={`px-3 py-1 rounded ${filters.kycStatus === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Rejected: {statusCounts.rejected}
                    </button>
                </div>
            </div>

            {/* Batch Actions */}
            {selectedCreators.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-blue-800">
                            {selectedCreators.length} creator(s) selected
                        </p>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm">
                                Approve KYC
                            </button>
                            <button className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm">
                                Reject KYC
                            </button>
                            <button className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm">
                                Email All
                            </button>
                            <button className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm">
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Creator List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading creators...</p>
                    </div>
                ) : creators.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No creators found matching your filters.
                    </div>
                ) : (
                    <>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedCreators.length === creators.length}
                                            onChange={toggleSelectAll}
                                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Creator
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        KYC Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Social
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Campaigns
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Earnings
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
                                {creators.map((creator) => (
                                    <tr key={creator.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedCreators.includes(creator.id)}
                                                onChange={() => toggleSelectCreator(creator.id)}
                                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {creator.name}
                                                </div>
                                                <div className="text-sm text-gray-500">{creator.email}</div>
                                                <div className="text-xs text-gray-400">
                                                    Joined: {formatDate(creator.joinedDate)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getKYCBadge(creator.kycStatus)}`}>
                                                {creator.kycStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs space-y-1">
                                                {creator.socialAccounts.map((sa, idx) => (
                                                    <div key={idx} className="flex items-center gap-1">
                                                        <span className="font-medium">{sa.platform}:</span>
                                                        <span>{(sa.followers / 1000).toFixed(1)}K</span>
                                                        {sa.isActive && <span className="text-green-600">✓</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div>{creator.campaignsCompleted} completed</div>
                                                <div className="text-xs text-gray-500">
                                                    {creator.completionRate}% rate
                                                </div>
                                                <div className="text-xs text-yellow-600">
                                                    ⭐ {creator.avgRating.toFixed(1)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(creator.totalEarnings)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(creator.status)}`}>
                                                {creator.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <Link
                                                href={`/admin/creators/${creator.id}`}
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
