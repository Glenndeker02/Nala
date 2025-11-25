"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

type Campaign = {
    id: string;
    name: string;
    description: string;
    category: string;
    platforms: string[];
    videosRequested: number;
    baseFeePerVideo: number;
    maxViews: number;
    tone: string;
    duration: number;
    founderName: string;
    createdAt: string;
    deadline: string;
    applicationsCount: number;
    hasApplied: boolean;
};

export default function CreatorBriefsPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedPlatform, setSelectedPlatform] = useState("All");

    const categories = ["All", "SaaS & Software", "E-commerce", "Health & Fitness", "B2B Tech", "Beauty & Cosmetics", "Finance & Fintech"];
    const platforms = ["All", "TIKTOK", "INSTAGRAM", "FACEBOOK"];

    useEffect(() => {
        fetchAvailableCampaigns();
    }, []);

    useEffect(() => {
        filterCampaigns();
    }, [searchTerm, selectedCategory, selectedPlatform, campaigns]);

    const fetchAvailableCampaigns = async () => {
        const token = localStorage.getItem("token");
        try {
            // Mock data for demonstration
            const mockCampaigns: Campaign[] = [
                {
                    id: "1",
                    name: "Acme Product Launch",
                    description: "Looking for creators to showcase our new SaaS product. Professional yet casual tone. Must demonstrate key features in an engaging way.",
                    category: "SaaS & Software",
                    platforms: ["TIKTOK", "INSTAGRAM"],
                    videosRequested: 5,
                    baseFeePerVideo: 50,
                    maxViews: 150000,
                    tone: "Professional yet casual",
                    duration: 7,
                    founderName: "Mike Johnson",
                    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                    applicationsCount: 12,
                    hasApplied: false
                },
                {
                    id: "2",
                    name: "Fitness App Promotion",
                    description: "Seeking energetic creators to promote our fitness tracking app. Show workout routines and app features.",
                    category: "Health & Fitness",
                    platforms: ["TIKTOK"],
                    videosRequested: 3,
                    baseFeePerVideo: 75,
                    maxViews: 100000,
                    tone: "Energetic and motivational",
                    duration: 7,
                    founderName: "Sarah Williams",
                    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                    applicationsCount: 8,
                    hasApplied: false
                },
                {
                    id: "3",
                    name: "E-commerce Store Launch",
                    description: "Need creators to showcase our new online store. Focus on product quality and shopping experience.",
                    category: "E-commerce",
                    platforms: ["INSTAGRAM", "FACEBOOK"],
                    videosRequested: 4,
                    baseFeePerVideo: 60,
                    maxViews: 120000,
                    tone: "Casual and friendly",
                    duration: 7,
                    founderName: "David Chen",
                    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                    applicationsCount: 15,
                    hasApplied: true
                }
            ];

            setCampaigns(mockCampaigns);
            setFilteredCampaigns(mockCampaigns);
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    const filterCampaigns = () => {
        let filtered = campaigns;

        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory !== "All") {
            filtered = filtered.filter(c => c.category === selectedCategory);
        }

        if (selectedPlatform !== "All") {
            filtered = filtered.filter(c => c.platforms.includes(selectedPlatform));
        }

        setFilteredCampaigns(filtered);
    };

    const handleApply = async (campaignId: string) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`/api/campaigns/${campaignId}/apply`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                alert("✅ Application submitted successfully!");
                setCampaigns(campaigns.map(c =>
                    c.id === campaignId ? { ...c, hasApplied: true, applicationsCount: c.applicationsCount + 1 } : c
                ));
            } else {
                throw new Error("Failed to apply");
            }
        } catch (error) {
            console.error("Error applying:", error);
            alert("Failed to submit application. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-DEFAULT mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading available campaigns...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main>
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Available Campaigns
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Browse and apply to campaigns that match your expertise
                        </p>
                    </div>

                    {/* Filters */}
                    <Card className="mb-8">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Search
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Search campaigns..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Platform
                                    </label>
                                    <select
                                        value={selectedPlatform}
                                        onChange={(e) => setSelectedPlatform(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                                    >
                                        {platforms.map(platform => (
                                            <option key={platform} value={platform}>{platform}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Showing {filteredCampaigns.length} of {campaigns.length} campaigns
                                </p>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSelectedCategory("All");
                                        setSelectedPlatform("All");
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Campaign List */}
                    {filteredCampaigns.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No campaigns found</h3>
                                <p className="text-gray-600">Try adjusting your filters or check back later for new opportunities.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {filteredCampaigns.map((campaign) => (
                                <Card key={campaign.id} className="hover:shadow-xl transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        {campaign.name}
                                                    </h3>
                                                    {campaign.hasApplied && (
                                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
                                                            Applied
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 mb-4">{campaign.description}</p>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Category</p>
                                                        <p className="text-sm font-medium text-gray-900">{campaign.category}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Platforms</p>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {campaign.platforms.join(", ")}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Base Fee</p>
                                                        <p className="text-sm font-bold text-primary-DEFAULT">
                                                            ${campaign.baseFeePerVideo}/video
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Videos Needed</p>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {campaign.videosRequested}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        <span>{campaign.founderName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>Deadline: {new Date(campaign.deadline).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        <span>{campaign.applicationsCount} applications</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="ml-6 flex flex-col gap-3">
                                                <Link href={`/creator/campaigns/${campaign.id}`}>
                                                    <Button variant="secondary">
                                                        View Details
                                                    </Button>
                                                </Link>
                                                {!campaign.hasApplied && (
                                                    <Button onClick={() => handleApply(campaign.id)}>
                                                        Quick Apply
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                                        💰 Performance Bonus Potential
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        Earn $4.00 per 1,000 views • Max {campaign.maxViews.toLocaleString()} views
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600">Potential Earnings</p>
                                                    <p className="text-lg font-bold text-primary-DEFAULT">
                                                        ${campaign.baseFeePerVideo} - ${campaign.baseFeePerVideo + (campaign.maxViews / campaign.videosRequested * 0.004).toFixed(0)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
