"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

type CampaignDetail = {
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
    tone: string;
    videoLength: string;
    founderName: string;
    founderCompany: string;
    productLink: string;
    targetAudience: string;
    talkingPoints: string[];
    mustHaves: string[];
    dontWants: string[];
    hashtags: string;
    startDate: string | null;
    postingFrequency: string;
    deadline: string | null;
    applicationsCount: number;
    hasApplied: boolean;
    applicationStatus?: "PENDING" | "ACCEPTED" | "REJECTED";
    briefData: any;
};

export default function CampaignDetailPage() {
    const router = useRouter();
    const params = useParams();
    const campaignId = params.id as string;

    const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        if (campaignId) {
            fetchCampaignDetails();
        }
    }, [campaignId]);

    const fetchCampaignDetails = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`/api/campaigns/${campaignId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const campaignData = data.campaign || data;

                // Check if user has applied
                const applicationsResponse = await fetch(`/api/campaigns/${campaignId}/applications`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                let hasApplied = false;
                let applicationStatus = undefined;

                if (applicationsResponse.ok) {
                    const applicationsData = await applicationsResponse.json();
                    const userApplication = applicationsData.find((app: any) => app.creatorId === localStorage.getItem("userId"));
                    if (userApplication) {
                        hasApplied = true;
                        applicationStatus = userApplication.status;
                    }
                }

                // Parse briefData
                const briefData = typeof campaignData.briefData === 'string'
                    ? JSON.parse(campaignData.briefData)
                    : campaignData.briefData || {};

                const enrichedCampaign: CampaignDetail = {
                    id: campaignData.id,
                    name: campaignData.name || campaignData.title,
                    title: campaignData.title || campaignData.name,
                    description: campaignData.description || "No description provided",
                    industry: campaignData.industry || "General",
                    platforms: briefData.platforms || [],
                    videosRequested: campaignData.videosRequested || 1,
                    videosCompleted: campaignData.videosCompleted || 0,
                    baseFeePerVideo: Number(campaignData.baseFeePerVideo) || 0,
                    totalBudget: Number(campaignData.totalBudget) || 0,
                    tone: briefData.tone || "Professional",
                    videoLength: briefData.videoLength || "30-60 seconds",
                    founderName: campaignData.founder?.fullName || "Unknown",
                    founderCompany: campaignData.founder?.companyName || "Company",
                    productLink: briefData.productLink || "#",
                    targetAudience: briefData.targetAudience || "General audience",
                    talkingPoints: briefData.talkingPoints || [],
                    mustHaves: briefData.mustHaves || [],
                    dontWants: briefData.dontWants || [],
                    hashtags: briefData.hashtags || "",
                    startDate: campaignData.startDate,
                    postingFrequency: campaignData.postingFrequency || "Not specified",
                    deadline: campaignData.startDate,
                    applicationsCount: campaignData._count?.applications || 0,
                    hasApplied,
                    applicationStatus,
                    briefData
                };

                setCampaign(enrichedCampaign);
            } else {
                console.error("Failed to fetch campaign");
            }
        } catch (error) {
            console.error("Error fetching campaign:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (!campaign) return;

        setApplying(true);
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
                alert("✅ Application submitted successfully! The founder will review your profile and get back to you soon.");
                setCampaign({ ...campaign, hasApplied: true, applicationStatus: "PENDING" });
            } else {
                const data = await response.json();
                alert(data.error || "Failed to submit application");
            }
        } catch (error) {
            console.error("Error applying:", error);
            alert("Failed to submit application. Please try again.");
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-DEFAULT mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading campaign details...</p>
                </div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Not Found</h2>
                    <p className="text-gray-600 mb-6">This campaign may no longer be available.</p>
                    <Link href="/creator/briefs">
                        <Button>← Back to Campaigns</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const maxViews = 150000; // Default
    const potentialEarnings = campaign.baseFeePerVideo + (maxViews / campaign.videosRequested * 0.004);

    const getStatusBadge = () => {
        if (!campaign.hasApplied) return null;

        switch (campaign.applicationStatus) {
            case "PENDING":
                return (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                        <Clock className="w-3 h-3 mr-1" />
                        Application Pending
                    </Badge>
                );
            case "ACCEPTED":
                return (
                    <Badge className="bg-green-100 text-green-700 border-green-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Accepted
                    </Badge>
                );
            case "REJECTED":
                return (
                    <Badge className="bg-red-100 text-red-700 border-red-300">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Not Selected
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                        Applied
                    </Badge>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <main>
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/creator/briefs"
                            className="text-primary-DEFAULT hover:text-primary-600 font-medium mb-4 inline-block transition-colors"
                        >
                            ← Back to Campaigns
                        </Link>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                        {campaign.title}
                                    </h1>
                                    {getStatusBadge()}
                                </div>
                                <p className="text-gray-600">
                                    {campaign.founderCompany} • {campaign.industry}
                                </p>
                            </div>
                            {!campaign.hasApplied && (
                                <Button
                                    onClick={handleApply}
                                    disabled={applying}
                                    size="lg"
                                    className="ml-6"
                                >
                                    {applying ? "Submitting..." : "Apply for This Campaign"}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Overview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Campaign Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 leading-relaxed">{campaign.description}</p>
                                </CardContent>
                            </Card>

                            {/* Product Information */}
                            {(campaign.productLink || campaign.targetAudience) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Product Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {campaign.productLink && campaign.productLink !== "#" && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 mb-1">Product Demo Link</p>
                                                <a
                                                    href={campaign.productLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary-DEFAULT hover:text-primary-600 underline"
                                                >
                                                    {campaign.productLink}
                                                </a>
                                            </div>
                                        )}
                                        {campaign.targetAudience && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 mb-1">Target Audience</p>
                                                <p className="text-gray-700">{campaign.targetAudience}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Content Requirements */}
                            {(campaign.talkingPoints.length > 0 || campaign.mustHaves.length > 0 || campaign.dontWants.length > 0) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Content Requirements</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Key Talking Points */}
                                        {campaign.talkingPoints.length > 0 && (
                                            <div>
                                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                    <span className="text-primary-DEFAULT">💬</span>
                                                    Key Talking Points
                                                </h3>
                                                <ul className="space-y-2">
                                                    {campaign.talkingPoints.map((point, index) => (
                                                        <li key={index} className="flex items-start gap-3">
                                                            <span className="text-primary-DEFAULT mt-1">•</span>
                                                            <span className="text-gray-700">{point}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Must-Haves */}
                                        {campaign.mustHaves.length > 0 && (
                                            <div>
                                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                    <span className="text-green-600">✓</span>
                                                    Must-Haves
                                                </h3>
                                                <ul className="space-y-2">
                                                    {campaign.mustHaves.map((item, index) => (
                                                        <li key={index} className="flex items-start gap-3">
                                                            <span className="text-green-600 mt-1">✓</span>
                                                            <span className="text-gray-700">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Don't-Wants */}
                                        {campaign.dontWants.length > 0 && (
                                            <div>
                                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                    <span className="text-red-600">✗</span>
                                                    Don't-Wants
                                                </h3>
                                                <ul className="space-y-2">
                                                    {campaign.dontWants.map((item, index) => (
                                                        <li key={index} className="flex items-start gap-3">
                                                            <span className="text-red-600 mt-1">✗</span>
                                                            <span className="text-gray-700">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Hashtags */}
                                        {campaign.hashtags && (
                                            <div>
                                                <h3 className="font-bold text-gray-900 mb-2">Required Hashtags</h3>
                                                <p className="text-primary-DEFAULT font-medium">{campaign.hashtags}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Video Specifications */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Video Specifications</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Video Length</p>
                                            <p className="font-medium text-gray-900">{campaign.videoLength}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Content Tone</p>
                                            <p className="font-medium text-gray-900">{campaign.tone}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Platforms</p>
                                            <p className="font-medium text-gray-900">
                                                {campaign.platforms.length > 0 ? campaign.platforms.join(", ") : "Not specified"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Videos Needed</p>
                                            <p className="font-medium text-gray-900">{campaign.videosRequested}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Posting Schedule */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Posting Schedule</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-6">
                                        {campaign.startDate && (
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Start Date</p>
                                                <p className="font-medium text-gray-900">
                                                    {new Date(campaign.startDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Posting Frequency</p>
                                            <p className="font-medium text-gray-900">{campaign.postingFrequency}</p>
                                        </div>
                                        {campaign.deadline && (
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Application Deadline</p>
                                                <p className="font-medium text-gray-900">
                                                    {new Date(campaign.deadline).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Compensation */}
                            <Card className="border-2 border-primary-DEFAULT">
                                <CardHeader>
                                    <CardTitle>💰 Compensation</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Base Fee (Guaranteed)</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            ${campaign.baseFeePerVideo}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Paid upon approval</p>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-600 mb-2">Performance Bonus</p>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Rate:</span>
                                                <span className="font-medium text-gray-900">$4.00 per 1k views</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Max Views:</span>
                                                <span className="font-medium text-gray-900">
                                                    {(maxViews / campaign.videosRequested).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Max Bonus:</span>
                                                <span className="font-medium text-primary-DEFAULT">
                                                    ${((maxViews / campaign.videosRequested) * 0.004).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-gray-900">Potential Total:</span>
                                            <span className="text-2xl font-bold text-primary-DEFAULT">
                                                ${potentialEarnings.toFixed(0)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Base fee + maximum performance bonus
                                        </p>
                                    </div>

                                    {!campaign.hasApplied && (
                                        <Button
                                            onClick={handleApply}
                                            disabled={applying}
                                            className="w-full mt-4"
                                            size="lg"
                                        >
                                            {applying ? "Submitting..." : "Apply Now"}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Campaign Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Campaign Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Posted By</p>
                                        <p className="font-medium text-gray-900">{campaign.founderName}</p>
                                        <p className="text-sm text-gray-600">{campaign.founderCompany}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Applications</p>
                                        <p className="font-medium text-gray-900">{campaign.applicationsCount} creators applied</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Category</p>
                                        <p className="font-medium text-gray-900">{campaign.industry}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Important Notes */}
                            <Card className="bg-yellow-50 border-yellow-200">
                                <CardContent className="p-6">
                                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <span>⚠️</span>
                                        Important Notes
                                    </h3>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li>• Review all requirements carefully before applying</li>
                                        <li>• Base fee paid upon video approval</li>
                                        <li>• Performance bonus paid after 7-day tracking period</li>
                                        <li>• You'll have 3 days to submit your draft after assignment</li>
                                        <li>• Revisions may be requested by the founder</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
