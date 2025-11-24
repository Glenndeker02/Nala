"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CampaignDetails = {
    id: string;
    name: string;
    description: string;
    totalBudget: number;
    baseFeeeBudget: number;
    videosRequested: number;
    platforms: string[]; // This might need to be parsed from briefData if not on root
    postingFrequency: string;
    startDate: string;
    founder: {
        fullName: string;
        companyName: string | null;
    };
    briefData: any;
};

export default function CampaignDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [applicationData, setApplicationData] = useState({
        message: "",
        portfolioLinks: [""],
    });

    useEffect(() => {
        const fetchCampaign = async () => {
            const token = localStorage.getItem("token");
            try {
                // We can reuse the list endpoint with ID or create a specific one.
                // For now, let's assume we fetch the list and find it, or better, create a GET /api/campaigns/[id]
                // But since I haven't created GET /api/campaigns/[id], I'll use the list endpoint and filter (inefficient but works for now)
                // OR I can quickly add GET to the [id] route.

                // Actually, let's try to fetch from the list endpoint for now.
                const response = await fetch(`/api/campaigns?status=ACTIVE`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (response.ok) {
                    const found = data.campaigns.find((c: any) => c.id === params.id);
                    if (found) setCampaign(found);
                }
            } catch (error) {
                console.error("Error fetching campaign:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaign();
    }, [params.id]);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        setApplying(true);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`/api/campaigns/${params.id}/apply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: applicationData.message,
                    portfolioLinks: applicationData.portfolioLinks.filter(l => l.trim() !== ""),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to apply");
            }

            alert("Application submitted successfully!");
            router.push("/creator/briefs");
        } catch (error) {
            console.error("Application error:", error);
            alert(error instanceof Error ? error.message : "Failed to apply");
        } finally {
            setApplying(false);
        }
    };

    if (loading) return <div className="p-8">Loading details...</div>;
    if (!campaign) return <div className="p-8">Campaign not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/creator/briefs" className="text-indigo-600 hover:text-indigo-800 mb-6 inline-block">
                    &larr; Back to Briefs
                </Link>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
                                <p className="text-lg text-gray-600 mt-2">
                                    {campaign.founder.companyName || campaign.founder.fullName}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Total Budget</p>
                                <p className="text-2xl font-bold text-indigo-600">${campaign.totalBudget}</p>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-50 p-4 rounded-md">
                                <h3 className="text-sm font-medium text-gray-500">Videos Needed</h3>
                                <p className="mt-1 text-lg font-semibold">{campaign.videosRequested}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-md">
                                <h3 className="text-sm font-medium text-gray-500">Frequency</h3>
                                <p className="mt-1 text-lg font-semibold capitalize">{campaign.postingFrequency || "Daily"}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-md">
                                <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                                <p className="mt-1 text-lg font-semibold">
                                    {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : "ASAP"}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Campaign Description</h2>
                            <div className="prose max-w-none text-gray-600">
                                <p>{campaign.description}</p>
                            </div>
                        </div>

                        {/* Application Form */}
                        <div className="mt-12 border-t pt-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Apply for this Campaign</h2>
                            <form onSubmit={handleApply} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Why are you a good fit?</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={applicationData.message}
                                        onChange={(e) => setApplicationData({ ...applicationData, message: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                        placeholder="Tell the founder about your experience and ideas..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Portfolio Links (Optional)</label>
                                    <div className="space-y-2 mt-1">
                                        {applicationData.portfolioLinks.map((link, index) => (
                                            <input
                                                key={index}
                                                type="url"
                                                value={link}
                                                onChange={(e) => {
                                                    const newLinks = [...applicationData.portfolioLinks];
                                                    newLinks[index] = e.target.value;
                                                    setApplicationData({ ...applicationData, portfolioLinks: newLinks });
                                                }}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                                placeholder="https://tiktok.com/@yourusername/video/..."
                                            />
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setApplicationData({ ...applicationData, portfolioLinks: [...applicationData.portfolioLinks, ""] })}
                                            className="text-sm text-indigo-600 hover:text-indigo-500"
                                        >
                                            + Add another link
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={applying}
                                        className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                                    >
                                        {applying ? "Submitting..." : "Submit Application"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
