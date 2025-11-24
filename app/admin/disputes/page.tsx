"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Dispute {
    id: string;
    category: string;
    status: string;
    priority: string;
    description: string;
    amount: number;
    createdAt: string;
    daysOpen: number;
    initiator: {
        name: string;
        role: string;
    };
    respondent: {
        name: string;
        role: string;
    };
    campaignName: string;
}

export default function DisputeManagementPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [statusCounts, setStatusCounts] = useState({
        open: 0,
        resolved: 0,
        escalated: 0,
    });

    const [filters, setFilters] = useState({
        status: searchParams.get('status') || 'OPEN',
        priority: searchParams.get('priority') || '',
        search: searchParams.get('search') || '',
        sortBy: searchParams.get('sortBy') || 'priority',
    });

    const [currentPage, setCurrentPage] = useState(0);
    const limit = 20;

    const fetchDisputes = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const params = new URLSearchParams({
                ...(filters.status && { status: filters.status }),
                ...(filters.priority && { priority: filters.priority }),
                ...(filters.search && { search: filters.search }),
                sortBy: filters.sortBy,
                limit: limit.toString(),
                offset: (currentPage * limit).toString(),
            });

            const response = await fetch(`/api/admin/disputes?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setDisputes(data.disputes);
                setTotalCount(data.totalCount);
                setStatusCounts(data.statusCounts);
            }
        } catch (error) {
            console.error("Failed to fetch disputes:", error);
        } finally {
            setLoading(false);
        }
    }, [filters, currentPage]);

    useEffect(() => {
        fetchDisputes();
    }, [fetchDisputes]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setCurrentPage(0);

        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/admin/disputes?${params.toString()}`);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getPriorityBadge = (priority: string) => {
        const badges = {
            HIGH: 'bg-red-100 text-red-800',
            MEDIUM: 'bg-yellow-100 text-yellow-800',
            LOW: 'bg-green-100 text-green-800',
        };
        return badges[priority as keyof typeof badges] || 'bg-gray-100 text-gray-800';
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            OPEN: 'bg-blue-100 text-blue-800',
            RESOLVED: 'bg-gray-100 text-gray-800',
            ESCALATED: 'bg-purple-100 text-purple-800',
        };
        return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Dispute Resolution</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage and resolve conflicts between creators and founders
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
                            placeholder="Search by ID, user, or description..."
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
                            <option value="OPEN">Open</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="ESCALATED">Escalated</option>
                        </select>
                    </div>

                    {/* Priority Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Priority
                        </label>
                        <select
                            value={filters.priority}
                            onChange={(e) => handleFilterChange('priority', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                        >
                            <option value="">All Priorities</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>
                    </div>
                </div>

                {/* Status Counts */}
                <div className="mt-4 flex gap-4 text-sm">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
                        Open: {statusCounts.open}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded">
                        Escalated: {statusCounts.escalated}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded">
                        Resolved: {statusCounts.resolved}
                    </span>
                </div>
            </div>

            {/* Dispute List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading disputes...</p>
                    </div>
                ) : disputes.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No disputes found matching your filters.
                    </div>
                ) : (
                    <>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dispute Info
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Parties
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {disputes.map((dispute) => (
                                    <tr key={dispute.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs">
                                                <div className="text-sm font-medium text-gray-900 truncate" title={dispute.category}>
                                                    {dispute.category}
                                                </div>
                                                <div className="text-xs text-gray-500 truncate" title={dispute.description}>
                                                    {dispute.description}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    Ref: {dispute.id.slice(0, 8)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                <span className="font-medium">From:</span> {dispute.initiator.name}
                                            </div>
                                            <div className="text-sm text-gray-900">
                                                <span className="font-medium">To:</span> {dispute.respondent.name}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Campaign: {dispute.campaignName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(dispute.status)}`}>
                                                {dispute.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadge(dispute.priority)}`}>
                                                {dispute.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{formatDate(dispute.createdAt)}</div>
                                            <div className="text-xs text-red-600 font-medium">
                                                {dispute.daysOpen} days open
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <Link
                                                href={`/admin/disputes/${dispute.id}`}
                                                className="text-red-600 hover:text-red-900 font-medium"
                                            >
                                                Review →
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
