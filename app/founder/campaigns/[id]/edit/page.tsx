"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";

type CampaignFormData = {
    name: string;
    description: string;
    productLink: string;
    videosRequested: number;
    platforms: string[];
    tone: string;
    videoLength: string;
    talkingPoints: string[];
    mustHaves: string[];
    dontWants: string[];
    hashtags: string;
    startDate: string;
    postingFrequency: string;
    totalBudget: number;
    baseFeePerVideo: number;
    targetAudience: string;
    productDescription: string;
};

const PLATFORMS = ["TIKTOK", "INSTAGRAM", "FACEBOOK"];
const TONES = ["Professional", "Casual", "Humorous", "Educational", "Inspirational"];
const VIDEO_LENGTHS = ["15s", "30s", "60s", "Creator's Choice"];
const FREQUENCIES = [
    { value: "daily", label: "Daily" },
    { value: "every_other_day", label: "Every Other Day" },
    { value: "weekly", label: "Weekly" }
];

export default function EditCampaignPage() {
    const router = useRouter();
    const params = useParams();
    const campaignId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<CampaignFormData>({
        name: "",
        description: "",
        productLink: "",
        videosRequested: 1,
        platforms: ["TIKTOK"],
        tone: "Casual",
        videoLength: "30s",
        talkingPoints: [""],
        mustHaves: [""],
        dontWants: [""],
        hashtags: "",
        startDate: "",
        postingFrequency: "daily",
        totalBudget: 1000,
        baseFeePerVideo: 50,
        targetAudience: "",
        productDescription: ""
    });

    useEffect(() => {
        if (campaignId) {
            fetchCampaign();
        }
    }, [campaignId]);

    const fetchCampaign = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`/api/campaigns/${campaignId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                const campaign = data.campaign || data;
                setFormData({
                    name: campaign.name || "",
                    description: campaign.description || "",
                    productLink: campaign.briefData?.productLink || "",
                    videosRequested: campaign.videosRequested || 1,
                    platforms: campaign.briefData?.platforms || ["TIKTOK"],
                    tone: campaign.briefData?.tone || "Casual",
                    videoLength: campaign.briefData?.videoLength || "30s",
                    talkingPoints: campaign.briefData?.talkingPoints || [""],
                    mustHaves: campaign.briefData?.mustHaves || [""],
                    dontWants: campaign.briefData?.dontWants || [""],
                    hashtags: campaign.briefData?.hashtags || "",
                    startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : "",
                    postingFrequency: campaign.postingFrequency || "daily",
                    totalBudget: campaign.totalBudget || 1000,
                    baseFeePerVideo: campaign.baseFeePerVideo || 50,
                    targetAudience: campaign.briefData?.targetAudience || "",
                    productDescription: campaign.briefData?.productDescription || ""
                });
            }
        } catch (error) {
            console.error("Error fetching campaign:", error);
            alert("Failed to load campaign details");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof CampaignFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleArrayChange = (field: keyof CampaignFormData, index: number, value: string) => {
        setFormData((prev) => {
            const array = [...(prev[field] as string[])];
            array[index] = value;
            return { ...prev, [field]: array };
        });
    };

    const addArrayItem = (field: keyof CampaignFormData) => {
        setFormData((prev) => ({
            ...prev,
            [field]: [...(prev[field] as string[]), ""]
        }));
    };

    const removeArrayItem = (field: keyof CampaignFormData, index: number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: (prev[field] as string[]).filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`/api/campaigns/${campaignId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    videosRequested: formData.videosRequested,
                    totalBudget: formData.totalBudget,
                    baseFeePerVideo: formData.baseFeePerVideo,
                    postingFrequency: formData.postingFrequency,
                    startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                    briefData: {
                        productLink: formData.productLink,
                        productDescription: formData.productDescription,
                        targetAudience: formData.targetAudience,
                        platforms: formData.platforms,
                        talkingPoints: formData.talkingPoints.filter(tp => tp.trim() !== ""),
                        hashtags: formData.hashtags,
                        mustHaves: formData.mustHaves.filter(m => m.trim() !== ""),
                        dontWants: formData.dontWants.filter(d => d.trim() !== ""),
                        videoLength: formData.videoLength,
                        tone: formData.tone,
                    },
                }),
            });

            if (response.ok) {
                alert("Campaign updated successfully!");
                router.push(`/founder/campaigns/${campaignId}`);
            } else {
                const data = await response.json();
                throw new Error(data.error || "Failed to update campaign");
            }
        } catch (error) {
            console.error("Error updating campaign:", error);
            alert(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    const baseFeeTotal = formData.videosRequested * formData.baseFeePerVideo;
    const performanceBudget = formData.totalBudget - baseFeeTotal;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-DEFAULT mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading campaign...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/founder/campaigns/${campaignId}`}
                        className="text-primary-DEFAULT hover:text-primary-600 font-medium mb-4 inline-block transition-colors"
                    >
                        ← Back to Campaign
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Campaign</h1>
                    <p className="mt-2 text-gray-600">Update your campaign details</p>
                </div>

                <Card>
                    <CardContent className="p-8 space-y-8">
                        {/* Basic Information */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">
                                Basic Information
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Campaign Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    placeholder="e.g., Q4 Product Launch Campaign"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                                    placeholder="Describe your campaign..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Number of Videos
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={formData.videosRequested}
                                        onChange={(e) => handleInputChange("videosRequested", parseInt(e.target.value))}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Video Length
                                    </label>
                                    <select
                                        value={formData.videoLength}
                                        onChange={(e) => handleInputChange("videoLength", e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                                    >
                                        {VIDEO_LENGTHS.map(length => (
                                            <option key={length} value={length}>{length}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Content Requirements */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">
                                Content Requirements
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Platforms
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {PLATFORMS.map(platform => (
                                        <label key={platform} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.platforms.includes(platform)}
                                                onChange={(e) => {
                                                    const newPlatforms = e.target.checked
                                                        ? [...formData.platforms, platform]
                                                        : formData.platforms.filter((p: string) => p !== platform);
                                                    handleInputChange("platforms", newPlatforms);
                                                }}
                                                className="w-4 h-4 text-primary-DEFAULT border-gray-300 rounded focus:ring-primary-DEFAULT"
                                            />
                                            <span className="ml-2 text-gray-700 capitalize">{platform.toLowerCase()}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Content Tone
                                </label>
                                <select
                                    value={formData.tone}
                                    onChange={(e) => handleInputChange("tone", e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                                >
                                    {TONES.map(tone => (
                                        <option key={tone} value={tone}>{tone}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Key Talking Points
                                </label>
                                <div className="space-y-3">
                                    {formData.talkingPoints.map((point: string, index: number) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                type="text"
                                                value={point}
                                                onChange={(e) => handleArrayChange("talkingPoints", index, e.target.value)}
                                                placeholder={`Point ${index + 1}`}
                                                className="flex-1"
                                            />
                                            {formData.talkingPoints.length > 1 && (
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => removeArrayItem("talkingPoints", index)}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button
                                        variant="secondary"
                                        onClick={() => addArrayItem("talkingPoints")}
                                        className="w-full"
                                    >
                                        + Add Talking Point
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Hashtags
                                </label>
                                <Input
                                    type="text"
                                    value={formData.hashtags}
                                    onChange={(e) => handleInputChange("hashtags", e.target.value)}
                                    placeholder="#YourBrand @youraccount"
                                />
                            </div>
                        </div>

                        {/* Schedule */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">
                                Schedule
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => handleInputChange("startDate", e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Posting Frequency
                                    </label>
                                    <select
                                        value={formData.postingFrequency}
                                        onChange={(e) => handleInputChange("postingFrequency", e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                                    >
                                        {FREQUENCIES.map(freq => (
                                            <option key={freq.value} value={freq.value}>{freq.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Budget */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">
                                Budget
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Total Budget
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            min={500}
                                            step={100}
                                            value={formData.totalBudget}
                                            onChange={(e) => handleInputChange("totalBudget", parseFloat(e.target.value))}
                                            className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Base Fee per Video
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            min={50}
                                            max={500}
                                            step={10}
                                            value={formData.baseFeePerVideo}
                                            onChange={(e) => handleInputChange("baseFeePerVideo", parseFloat(e.target.value))}
                                            className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Budget Breakdown */}
                            <div className="p-6 bg-primary-50 rounded-xl border border-primary-100">
                                <h3 className="font-bold text-gray-900 mb-3">Budget Breakdown</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Fixed Production Costs:</span>
                                        <span className="font-bold text-gray-900">${baseFeeTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Performance Budget:</span>
                                        <span className="font-bold text-gray-900">${performanceBudget.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-primary-200 pt-2 flex justify-between">
                                        <span className="font-bold text-gray-900">Total:</span>
                                        <span className="font-bold text-primary-DEFAULT">${formData.totalBudget.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {performanceBudget < 0 && (
                                <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded">
                                    <p className="text-sm text-red-700">
                                        ⚠️ Your fixed costs exceed your total budget. Please increase the budget or reduce the base fee.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between pt-6 border-t border-gray-200">
                            <Link href={`/founder/campaigns/${campaignId}`}>
                                <Button variant="secondary" size="lg">
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                onClick={handleSave}
                                disabled={saving || performanceBudget < 0}
                                size="lg"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
