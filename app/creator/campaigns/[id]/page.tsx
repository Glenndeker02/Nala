"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

type CampaignBrief = {
    id: string;
    name: string;
    description: string;
    category: string;
    platforms: string[];
    videosRequested: number;
    baseFeePerVideo: number;
    performanceBudget: number;
    maxViews: number;
    tone: string;
    duration: number;
    videoLength: string;
    founderName: string;
    founderCompany: string;
    productLink: string;
    targetAudience: string;
    talkingPoints: string[];
    mustHaves: string[];
    dontWants: string[];
    hashtags: string;
    startDate: string;
    postingFrequency: string;
    deadline: string;
    applicationsCount: number;
    hasApplied: boolean;
    applicationStatus?: "PENDING" | "ACCEPTED" | "REJECTED";
};

export default function CampaignDetailPage() {
    const router = useRouter();
    const params = useParams();
    const campaignId = params.id as string;

    const [campaign, setCampaign] = useState<CampaignBrief | null>(null);
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
            // Mock data for demonstration
            const mockCampaign: CampaignBrief = {
                id: campaignId,
                name: "Acme Product Launch",
                description: "We're launching our revolutionary SaaS product and need talented creators to showcase its key features. This is a professional B2B product, but we want the content to feel approachable and engaging. Show how our product solves real problems for businesses.",
                category: "SaaS & Software",
                platforms: ["TIKTOK", "INSTAGRAM"],
                videosRequested: 5,
                baseFeePerVideo: 50,
                performanceBudget: 750,
                maxViews: 150000,
                tone: "Professional yet casual",
                duration: 7,
                videoLength: "30-60 seconds",
                founderName: "Mike Johnson",
                founderCompany: "Acme Inc.",
                productLink: "https://demo.acme.com/product",
                targetAudience: "Small business owners, entrepreneurs, startup founders aged 25-45",
                talkingPoints: [
                    "Showcase the intuitive dashboard and how easy it is to get started",
                    "Demonstrate the automation features that save time",
                    "Highlight the analytics and reporting capabilities",
                    "Show real results or use cases"
                ],
                mustHaves: [
                    "Clear product demo showing the interface",
                    "Mention the 14-day free trial",
                    "Include our brand name 'Acme' at least twice",
                    "Show enthusiasm and genuine interest in the product"
                ],
                dontWants: [
                    "Don't compare to competitors by name",
                    "Avoid overly technical jargon",
                    "Don't make unrealistic claims",
                    "No negative language or complaints"
                ],
                hashtags: "#AcmeLaunch #SaaS #ProductivityTools #SmallBusiness",
                startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                postingFrequency: "Daily",
                deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                applicationsCount: 12,
                hasApplied: false,
                applicationStatus: undefined
            };

            setCampaign(mockCampaign);
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
                },
            });

            if (response.ok) {
                alert("✅ Application submitted successfully! The founder will review your profile and get back to you soon.");
                setCampaign({ ...campaign, hasApplied: true, applicationStatus: "PENDING" });
            } else {
                throw new Error("Failed to apply");
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

    const potentialEarnings = campaign.baseFeePerVideo + (campaign.maxViews / campaign.videosRequested * 0.004);

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
                                        {campaign.name}
                                    </h1>
                                    {campaign.hasApplied && (
                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium">
                                            {campaign.applicationStatus === "PENDING" ? "Application Pending" :
                                                campaign.applicationStatus === "ACCEPTED" ? "Accepted" :
                                                    campaign.applicationStatus === "REJECTED" ? "Not Selected" : "Applied"}
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600">
                                    {campaign.founderCompany} • {campaign.category}
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
                            <Card>
                                <CardHeader>
                                    <CardTitle>Product Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
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
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 mb-1">Target Audience</p>
                                        <p className="text-gray-700">{campaign.targetAudience}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Content Requirements */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Content Requirements</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Key Talking Points */}
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

                                    {/* Must-Haves */}
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

                                    {/* Don't-Wants */}
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

                                    {/* Hashtags */}
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-2">Required Hashtags</h3>
                                        <p className="text-primary-DEFAULT font-medium">{campaign.hashtags}</p>
                                    </div>
                                </CardContent>
                            </Card>

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
                                            <p className="font-medium text-gray-900">{campaign.platforms.join(", ")}</p>
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
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Start Date</p>
                                            <p className="font-medium text-gray-900">
                                                {new Date(campaign.startDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Posting Frequency</p>
                                            <p className="font-medium text-gray-900">{campaign.postingFrequency}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Campaign Duration</p>
                                            <p className="font-medium text-gray-900">{campaign.duration} days</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Application Deadline</p>
                                            <p className="font-medium text-gray-900">
                                                {new Date(campaign.deadline).toLocaleDateString()}
                                            </p>
                                        </div>
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
                                                    {(campaign.maxViews / campaign.videosRequested).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Max Bonus:</span>
                                                <span className="font-medium text-primary-DEFAULT">
                                                    ${((campaign.maxViews / campaign.videosRequested) * 0.004).toFixed(2)}
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
                                        <p className="font-medium text-gray-900">{campaign.category}</p>
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
