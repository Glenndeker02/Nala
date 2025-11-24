"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Campaign = {
    id: string;
    name: string;
    description: string;
    totalBudget: number;
    baseFeeeBudget: number;
    videosRequested: number;
    founder: {
        fullName: string;
        companyName: string | null;
    };
    createdAt: string;
};

export default function CreatorBriefsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampaigns = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch("/api/campaigns", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    setCampaigns(data.campaigns);
                }
            } catch (error) {
                console.error("Error fetching briefs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, []);

    if (loading) return <div className="p-8">Loading briefs...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Available Briefs</h1>
                    <Link href="/creator/dashboard" className="text-indigo-600 hover:text-indigo-800">
                        Back to Dashboard
                    </Link>
                </div>

                {campaigns.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500 text-lg">No active briefs found at the moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {campaigns.map((campaign) => (
                            <div key={campaign.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
                                <div className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">{campaign.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                by {campaign.founder.companyName || campaign.founder.fullName}
                                            </p>
                                        </div>
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                            Active
                                        </span>
                                    </div>

                                    <p className="mt-4 text-gray-600 text-sm line-clamp-3">
                                        {campaign.description}
                                    </p>

                                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-gray-500">Total Budget</p>
                                            <p className="text-lg font-bold text-indigo-600">${campaign.totalBudget}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">Videos</p>
                                            <p className="font-medium text-gray-900">{campaign.videosRequested}</p>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/creator/briefs/${campaign.id}`}
                                        className="mt-6 block w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium text-center"
                                    >
                                        View Details & Apply
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
