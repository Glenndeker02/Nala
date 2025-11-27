"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Sparkles, Clock, Users, DollarSign } from "lucide-react";

type Campaign = {
    id: string;
    name: string;
    title: string;
    description: string;
    industry: string;
    platforms: string[];
    videosRequested: number;
    videosCompleted: number;
    baseFeePerVideo: number;
    totalBudget: number;
    maxViews: number;
    tone: string;
    founderName: string;
    founderId: string;
    createdAt: string;
    startDate: string | null;
    deadline: string | null;
    applicationsCount: number;
    hasApplied: boolean;
    appliedDate?: string;
    isUrgent: boolean;
    isNew: boolean;
    isLimitedSlots: boolean;
    daysUntilDeadline: number | null;
    daysSinceCreated: number;
    slotsRemaining: number;
    category: string;
};

export default function CreatorBriefsPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedPlatform, setSelectedPlatform] = useState("All");
    const [sortBy, setSortBy] = useState("urgency");

    const categories = ["All", "SaaS & Software", "E-commerce", "Health & Fitness", "B2B Tech", "Beauty & Cosmetics", "Finance & Fintech"];
    const platforms = ["All", "TIKTOK", "INSTAGRAM", "FACEBOOK", "YOUTUBE"];

    useEffect(() => {
        fetchAvailableCampaigns();
    }, []);

    useEffect(() => {
        filterCampaigns();
    }, [searchTerm, selectedCategory, selectedPlatform, sortBy, campaigns]);

    const fetchAvailableCampaigns = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("/api/campaigns/available?role=creator", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const result = await response.json();
                // ApiResponse.success wraps data in { success: true, data: ... }
                const data = result.data || result;
                setCampaigns(data);
                setFilteredCampaigns(data);
            } else {
                console.error("Failed to fetch campaigns");
            }
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    const filterCampaigns = () => {
        let filtered = [...campaigns];

        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory !== "All") {
            filtered = filtered.filter(c => c.category === selectedCategory || c.industry === selectedCategory);
        }

        if (selectedPlatform !== "All") {
            filtered = filtered.filter(c => c.platforms.includes(selectedPlatform));
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "urgency":
                    if (a.isUrgent && !b.isUrgent) return -1;
                    if (!a.isUrgent && b.isUrgent) return 1;
                    if (a.isNew && !b.isNew) return -1;
                    if (!a.isNew && b.isNew) return 1;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "latest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "budget":
                    return b.baseFeePerVideo - a.baseFeePerVideo;
                default:
                    return 0;
            }
        });

        setFilteredCampaigns(filtered);
    };

    const handleApply = async (campaignId: string) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`/api/campaigns/${campaignId}/apply`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({})
            });

            if (response.ok) {
                alert("✅ Application submitted successfully!");
                // Refresh campaigns to update status
                fetchAvailableCampaigns();
            } else {
                const data = await response.json();
                alert(data.error || "Failed to submit application");
            }
        } catch (error) {
            console.error("Error applying:", error);
            alert("Failed to submit application. Please try again.");
        }
    };

    const getCampaignBorderClass = (campaign: Campaign) => {
        if (campaign.isUrgent) return "border-l-4 border-l-red-500 bg-red-50/30";
        if (campaign.hasApplied) return "border-l-4 border-l-green-500 bg-green-50/30";
        if (campaign.isNew) return "border-l-4 border-l-blue-500 bg-blue-50/30";
        return "";
    };

    const getCampaignBadge = (campaign: Campaign) => {
        if (campaign.isUrgent) {
            return (
                <Badge className="bg-red-100 text-red-700 border-red-300">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Urgent
                </Badge>
            );
        }
        if (campaign.hasApplied) {
            return (
                <Badge className="bg-green-100 text-green-700 border-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Applied
                </Badge>
            );
        }
        if (campaign.isNew) {
            return (
                <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                    <Sparkles className="w-3 h-3 mr-1" />
                    New
                </Badge>
            );
        }
        return null;
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
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Sort By
                                    </label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                                    >
                                        <option value="urgency">Urgency</option>
                                        <option value="latest">Latest</option>
                                        <option value="budget">Budget</option>
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
                                        setSortBy("urgency");
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
                                <Card key={campaign.id} className={`hover:shadow-xl transition-shadow ${getCampaignBorderClass(campaign)}`}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        {campaign.title || campaign.name}
                                                    </h3>
                                                    {getCampaignBadge(campaign)}
                                                    {campaign.isLimitedSlots && (
                                                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                                                            {campaign.slotsRemaining} slots left
                                                        </Badge>
                                                    )}
                                                </div>
                                                {campaign.hasApplied && campaign.appliedDate && (
                                                    <p className="text-sm text-green-600 mb-2">
                                                        ✓ You applied on {new Date(campaign.appliedDate).toLocaleDateString()}
                                                    </p>
                                                )}
                                                <p className="text-gray-600 mb-4">{campaign.description}</p>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Category</p>
                                                        <p className="text-sm font-medium text-gray-900">{campaign.category || campaign.industry}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Platforms</p>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {campaign.platforms.join(", ") || "Not specified"}
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
                                                            {campaign.slotsRemaining} of {campaign.videosRequested}
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
                                                    {campaign.deadline && (
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4" />
                                                            <span className={campaign.isUrgent ? "text-red-600 font-semibold" : ""}>
                                                                {campaign.daysUntilDeadline !== null && campaign.daysUntilDeadline > 0
                                                                    ? `${campaign.daysUntilDeadline} days left`
                                                                    : `Deadline: ${new Date(campaign.deadline).toLocaleDateString()}`
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4" />
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
                                                        ${campaign.baseFeePerVideo} - ${campaign.baseFeePerVideo + Math.floor((campaign.maxViews / campaign.videosRequested) * 0.004)}
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
