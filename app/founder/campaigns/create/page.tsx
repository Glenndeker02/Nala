"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RecommendedFormatsWidget from "@/components/founder/brief-builder/RecommendedFormatsWidget";

type CampaignFormData = {
    name: string;
    description: string;
    productLink: string;
    videosRequested: number;
    platforms: string[];
    tone: string;
    postingFrequency: string;
    startDate: string;
    totalBudget: number;
    baseFeePerVideo: number;
    briefData: {
        productDescription: string;
        targetAudience: string;
        campaignGoal: string;
        talkingPoints: string[];
        hashtags: string;
    };
};

const STEPS = [
    "Basics",
    "Content",
    "Schedule",
    "Budget",
    "Review"
];

export default function CreateCampaignPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CampaignFormData>({
        name: "",
        description: "",
        productLink: "",
        videosRequested: 1,
        platforms: ["TIKTOK"],
        tone: "Casual",
        postingFrequency: "daily",
        startDate: "",
        totalBudget: 1000,
        baseFeePerVideo: 50,
        briefData: {
            productDescription: "",
            targetAudience: "",
            campaignGoal: "Brand Awareness",
            talkingPoints: [""],
            hashtags: "",
        },
    });

    // Calculate budget breakdown
    const baseFeeTotal = formData.videosRequested * formData.baseFeePerVideo;
    const performanceBudget = formData.totalBudget - baseFeeTotal;
    const maxViews = Math.floor(performanceBudget / 0.005); // $5 per 1k views (example rate)

    const handleInputChange = (field: keyof CampaignFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleBriefChange = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            briefData: { ...prev.briefData, [field]: value },
        }));
    };

    const handleFormatSelect = (format: any) => {
        // Pre-fill form based on selected format
        setFormData((prev) => ({
            ...prev,
            tone: format.tone || prev.tone,
            briefData: {
                ...prev.briefData,
                talkingPoints: [...prev.briefData.talkingPoints, `Use format: ${format.name} - ${format.description}`],
            }
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch("/api/campaigns/create", {
                method: "POST",
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
                    startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
                    briefData: {
                        ...formData.briefData,
                        platforms: formData.platforms,
                        talkingPoints: formData.briefData.talkingPoints.filter(tp => tp.trim() !== ""),
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create campaign");
            }

            alert("Campaign created successfully! Redirecting to dashboard...");
            router.push("/founder/dashboard");
        } catch (error) {
            console.error("Error creating campaign:", error);
            alert(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        {STEPS.map((step, index) => (
                            <span
                                key={step}
                                className={`text-sm font-medium ${index <= currentStep ? "text-indigo-600" : "text-gray-400"
                                    }`}
                            >
                                {step}
                            </span>
                        ))}
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                        <div
                            className="h-2 bg-indigo-600 rounded-full transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-8">
                    {/* Step 1: Basics */}
                    {currentStep === 0 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900">Campaign Basics</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    placeholder="e.g. Summer Product Launch"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Product Link</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input
                                        type="url"
                                        value={formData.productLink}
                                        onChange={(e) => handleInputChange("productLink", e.target.value)}
                                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="https://example.com/product"
                                    />
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (!formData.productLink) {
                                                alert("Please enter a product link first.");
                                                return;
                                            }
                                            setLoading(true);
                                            try {
                                                const token = localStorage.getItem("token");
                                                const response = await fetch("/api/ai/generate-brief", {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                        Authorization: `Bearer ${token}`,
                                                    },
                                                    body: JSON.stringify({ url: formData.productLink }),
                                                });
                                                const data = await response.json();
                                                if (response.ok) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        description: data.productDescription,
                                                        tone: data.tone,
                                                        briefData: {
                                                            ...prev.briefData,
                                                            productDescription: data.productDescription,
                                                            targetAudience: data.targetAudience,
                                                            talkingPoints: data.talkingPoints,
                                                            hashtags: data.hashtags,
                                                        }
                                                    }));
                                                    alert("✨ AI Content Generated! Please review the Description and Content steps.");
                                                } else {
                                                    alert("Failed to generate content. Please try again.");
                                                }
                                            } catch (error) {
                                                console.error(error);
                                                alert("An error occurred.");
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-sm font-medium"
                                    >
                                        ✨ Auto-Fill with AI
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    placeholder="Describe your campaign goals and product..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Content */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900">Content Requirements</h2>

                            <RecommendedFormatsWidget
                                category="SAAS" // This should be dynamic based on user/company profile
                                onSelectFormat={handleFormatSelect}
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Number of Videos</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={formData.videosRequested}
                                    onChange={(e) => handleInputChange("videosRequested", parseInt(e.target.value))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Platforms</label>
                                <div className="mt-2 space-x-4">
                                    {["TIKTOK", "INSTAGRAM", "FACEBOOK"].map((platform) => (
                                        <label key={platform} className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.platforms.includes(platform)}
                                                onChange={(e) => {
                                                    const newPlatforms = e.target.checked
                                                        ? [...formData.platforms, platform]
                                                        : formData.platforms.filter((p) => p !== platform);
                                                    handleInputChange("platforms", newPlatforms);
                                                }}
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            />
                                            <span className="ml-2 text-gray-700 capitalize">{platform.toLowerCase()}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tone</label>
                                <select
                                    value={formData.tone}
                                    onChange={(e) => handleInputChange("tone", e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                >
                                    <option>Casual</option>
                                    <option>Professional</option>
                                    <option>Humorous</option>
                                    <option>Educational</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Key Talking Points</label>
                                <div className="space-y-2 mt-1">
                                    {formData.briefData.talkingPoints.map((point, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            value={point}
                                            onChange={(e) => {
                                                const newPoints = [...formData.briefData.talkingPoints];
                                                newPoints[index] = e.target.value;
                                                handleBriefChange("talkingPoints", newPoints);
                                            }}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                            placeholder={`Point ${index + 1}`}
                                        />
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => handleBriefChange("talkingPoints", [...formData.briefData.talkingPoints, ""])}
                                        className="text-sm text-indigo-600 hover:text-indigo-500"
                                    >
                                        + Add another point
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Schedule */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900">Posting Schedule</h2>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={formData.startDate}
                                        onChange={(e) => handleInputChange("startDate", e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Posting Frequency</label>
                                    <select
                                        value={formData.postingFrequency}
                                        onChange={(e) => handleInputChange("postingFrequency", e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    >
                                        <option value="daily">Daily (1 video/day)</option>
                                        <option value="every_other_day">Every Other Day</option>
                                        <option value="weekly">Weekly (1 video/week)</option>
                                    </select>
                                </div>
                            </div>

                            {formData.startDate && (
                                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                                    <h3 className="text-sm font-medium text-blue-900 mb-2">Campaign Timeline Preview</h3>
                                    <div className="flex justify-between items-center text-sm">
                                        <div>
                                            <p className="text-gray-500">Start Date</p>
                                            <p className="font-medium text-gray-900">{new Date(formData.startDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex-1 mx-4 border-t-2 border-blue-200 relative">
                                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-50 px-2 text-xs text-blue-600">
                                                {formData.videosRequested} videos over {
                                                    formData.postingFrequency === 'daily' ? formData.videosRequested :
                                                        formData.postingFrequency === 'every_other_day' ? formData.videosRequested * 2 :
                                                            formData.videosRequested * 7
                                                } days
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Estimated End Date</p>
                                            <p className="font-medium text-gray-900">
                                                {(() => {
                                                    const start = new Date(formData.startDate);
                                                    const days = formData.postingFrequency === 'daily' ? formData.videosRequested :
                                                        formData.postingFrequency === 'every_other_day' ? formData.videosRequested * 2 :
                                                            formData.videosRequested * 7;
                                                    const end = new Date(start);
                                                    end.setDate(start.getDate() + days);
                                                    return end.toLocaleDateString();
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Budget */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900">Budget & Pricing</h2>

                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-lg text-white shadow-lg">
                                <h3 className="text-lg font-medium opacity-90">Estimated Reach</h3>
                                <div className="flex items-baseline mt-2">
                                    <p className="text-4xl font-bold">{maxViews.toLocaleString()}</p>
                                    <p className="ml-2 text-indigo-100">views</p>
                                </div>
                                <p className="text-sm mt-2 opacity-80">Based on your performance budget of ${performanceBudget.toFixed(2)}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Total Campaign Budget ($)</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            min={500}
                                            step={100}
                                            value={formData.totalBudget}
                                            onChange={(e) => handleInputChange("totalBudget", parseFloat(e.target.value))}
                                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">Minimum $500</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Base Fee per Video ($)</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            min={50}
                                            max={500}
                                            step={10}
                                            value={formData.baseFeePerVideo}
                                            onChange={(e) => handleInputChange("baseFeePerVideo", parseFloat(e.target.value))}
                                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">Paid to creators upon approval (Min $50)</p>
                                </div>
                            </div>

                            <div className="border rounded-lg p-4 bg-gray-50">
                                <h4 className="font-medium text-gray-900 mb-4">Budget Allocation</h4>

                                {/* Visual Bar */}
                                <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex mb-4">
                                    <div
                                        className="bg-gray-500 h-full"
                                        style={{ width: `${(baseFeeTotal / formData.totalBudget) * 100}%` }}
                                        title="Fixed Costs"
                                    />
                                    <div
                                        className="bg-green-500 h-full"
                                        style={{ width: `${(performanceBudget / formData.totalBudget) * 100}%` }}
                                        title="Performance Budget"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <div className="flex items-center">
                                            <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
                                            <span className="text-gray-600">Fixed Costs (Guaranteed)</span>
                                        </div>
                                        <span className="font-medium">${baseFeeTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <div className="flex items-center">
                                            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                            <span className="text-gray-600">Performance Pool (Variable)</span>
                                        </div>
                                        <span className="font-medium text-green-600">${performanceBudget.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-bold border-t pt-3 mt-3">
                                        <span>Total Investment</span>
                                        <span>${formData.totalBudget.toFixed(2)}</span>
                                    </div>
                                </div>

                                {performanceBudget < 0 && (
                                    <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-red-700">
                                                    Your fixed costs exceed your total budget. Please increase the budget or reduce the base fee.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 5: Review */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900">Review Campaign</h2>
                            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Campaign Name</h3>
                                    <p className="mt-1 text-lg font-medium text-gray-900">{formData.name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Videos</h3>
                                        <p className="mt-1 text-gray-900">{formData.videosRequested}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Platforms</h3>
                                        <p className="mt-1 text-gray-900">{formData.platforms.join(", ")}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Total Budget</h3>
                                        <p className="mt-1 text-gray-900">${formData.totalBudget}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                                        <p className="mt-1 text-gray-900">{formData.startDate || "Not specified"}</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500">
                                By clicking &quot;Create Campaign&quot;, you agree to the terms of service. Your budget will be held in escrow until the campaign is complete.
                            </p>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-8 flex justify-between">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${currentStep === 0 ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            Back
                        </button>

                        {currentStep === STEPS.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={loading || performanceBudget < 0}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {loading ? "Creating..." : "Create Campaign"}
                            </button>
                        ) : (
                            <button
                                onClick={nextStep}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
