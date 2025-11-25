"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import {
    Step2Content,
    Step3Schedule,
    Step4Budget,
    Step5Filters,
    Step6Review
} from "@/components/founder/CampaignCreationSteps";

// Types
type CampaignFormData = {
    // Step 1: Basics
    name: string;
    description: string;
    productLink: string;
    productCategory: string;
    campaignDuration: number;
    primaryGoal: string;

    // Step 2: Content
    videosRequested: number;
    platforms: string[];
    tone: string;
    videoLength: string;
    talkingPoints: string[];
    mustHaves: string[];
    dontWants: string[];
    hashtags: string;

    // Step 3: Schedule
    startDate: string;
    postingFrequency: string;
    preferredPostingTime: string;

    // Step 4: Budget
    totalBudget: number;
    baseFeePerVideo: number;

    // Step 5: Creator Filters
    minRating: number;
    minExperience: number;
    requiredPlatforms: string[];
    location: string;
    industryExperience: string[];
    language: string;

    // Metadata
    targetAudience: string;
    productDescription: string;

    // Budget Calculator Options
    guaranteedSpend: boolean;
    targetViews?: number;
};

const STEPS = [
    { id: 1, name: "Campaign Basics", description: "Title, description, and goals" },
    { id: 2, name: "Content Requirements", description: "Videos, platforms, and style" },
    { id: 3, name: "Posting Schedule", description: "Timeline and frequency" },
    { id: 4, name: "Budget Configuration", description: "Fixed and performance budget" },
    { id: 5, name: "Creator Filters", description: "Find the right creators" },
    { id: 6, name: "Review & Confirm", description: "Final review and payment" }
];

const PRODUCT_CATEGORIES = [
    "SaaS & Software",
    "E-commerce",
    "Health & Fitness",
    "B2B Tech",
    "Beauty & Cosmetics",
    "Food & Beverage",
    "Finance & Fintech",
    "Fashion & Apparel",
    "Gaming & Entertainment",
    "Education & E-learning"
];

const CAMPAIGN_GOALS = [
    "Brand Awareness",
    "Website Traffic",
    "Trial Signups",
    "Product Sales",
    "App Downloads",
    "Lead Generation"
];

export default function EnhancedCampaignCreation() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [autoSaving, setAutoSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const [formData, setFormData] = useState<CampaignFormData>({
        // Step 1
        name: "",
        description: "",
        productLink: "",
        productCategory: "",
        campaignDuration: 30,
        primaryGoal: "Brand Awareness",

        // Step 2
        videosRequested: 5,
        platforms: ["TIKTOK"],
        tone: "Casual",
        videoLength: "30s",
        talkingPoints: [""],
        mustHaves: [""],
        dontWants: [""],
        hashtags: "",

        // Step 3
        startDate: "",
        postingFrequency: "daily",
        preferredPostingTime: "09:00",

        // Step 4
        totalBudget: 1000,
        baseFeePerVideo: 50,

        // Step 5
        minRating: 4.0,
        minExperience: 0,
        requiredPlatforms: [],
        location: "",
        industryExperience: [],
        language: "English",

        // Metadata
        targetAudience: "",
        productDescription: "",

        // Budget Calculator Options
        guaranteedSpend: false,
        targetViews: undefined
    });

    // Prefill from format library if formatId provided
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const formatId = params.get('formatId');
        if (formatId) {
            const token = localStorage.getItem('token');
            fetch(`/api/formats/${formatId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => {
                    if (data.format) {
                        const fmt = data.format;
                        setFormData(prev => ({
                            ...prev,
                            name: fmt.name || prev.name,
                            description: fmt.description || prev.description,
                            productDescription: fmt.description || prev.productDescription,
                            targetAudience: fmt.tone || prev.targetAudience,
                            talkingPoints: fmt.talkingPoints || prev.talkingPoints,
                            hashtags: fmt.hashtags || prev.hashtags,
                            tone: fmt.tone || prev.tone,
                        }));
                    }
                })
                .catch(err => console.error('Failed to load format', err));
        }
    }, []);


    // Budget calculations
    const baseFeeTotal = formData.videosRequested * formData.baseFeePerVideo;
    const performanceBudget = formData.totalBudget - baseFeeTotal;
    const maxViews = Math.floor(performanceBudget / 0.005); // $5 per 1k views
    const creatorEarningsPerView = 0.004; // $4 per 1k views
    const nalaEarningsPerView = 0.001; // $1 per 1k views

    // Auto-save functionality
    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            handleAutoSave();
        }, 30000); // Every 30 seconds

        return () => clearInterval(autoSaveInterval);
    }, [formData]);

    const handleAutoSave = async () => {
        setAutoSaving(true);
        try {
            const token = localStorage.getItem("token");
            await fetch("/api/campaigns/draft/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    currentStep,
                    isDraft: true
                }),
            });
            setLastSaved(new Date());
        } catch (error) {
            console.error("Auto-save failed:", error);
        } finally {
            setAutoSaving(false);
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

    const handleAIAutoFill = async () => {
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
                    description: data.productDescription || prev.description,
                    productDescription: data.productDescription || prev.productDescription,
                    targetAudience: data.targetAudience || prev.targetAudience,
                    talkingPoints: data.talkingPoints || prev.talkingPoints,
                    hashtags: data.hashtags || prev.hashtags,
                    tone: data.tone || prev.tone,
                }));
                alert("✨ AI Content Generated! Please review the populated fields.");
            } else {
                alert("Failed to generate content. Please try again.");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 0:
                return !!(formData.name && formData.description && formData.productCategory && formData.primaryGoal);
            case 1:
                return formData.videosRequested > 0 && formData.platforms.length > 0 && formData.talkingPoints.some(tp => tp.trim());
            case 2:
                return !!(formData.startDate && formData.postingFrequency);
            case 3:
                return formData.totalBudget >= 500 && performanceBudget >= 0;
            case 4:
                return true; // Filters are optional
            case 5:
                return true; // Review step
            default:
                return false;
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
        } else {
            alert("Please complete all required fields before continuing.");
        }
    };

    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

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
                    guaranteedSpend: formData.guaranteedSpend,
                    targetViews: formData.targetViews,
                    briefData: {
                        productDescription: formData.productDescription,
                        targetAudience: formData.targetAudience,
                        campaignGoal: formData.primaryGoal,
                        platforms: formData.platforms,
                        talkingPoints: formData.talkingPoints.filter(tp => tp.trim() !== ""),
                        hashtags: formData.hashtags,
                        mustHaves: formData.mustHaves.filter(m => m.trim() !== ""),
                        dontWants: formData.dontWants.filter(d => d.trim() !== ""),
                        videoLength: formData.videoLength,
                        tone: formData.tone,
                        productCategory: formData.productCategory,
                        campaignDuration: formData.campaignDuration,
                        creatorFilters: {
                            minRating: formData.minRating,
                            minExperience: formData.minExperience,
                            requiredPlatforms: formData.requiredPlatforms,
                            location: formData.location,
                            industryExperience: formData.industryExperience,
                            language: formData.language
                        }
                    },
                }),
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("Server returned non-JSON response:", text.substring(0, 500));
                throw new Error("Server error: Expected JSON response but got HTML. Please check server logs.");
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || "Failed to create campaign");
            }

            console.log("Campaign created successfully:", data);
            router.push("/founder/dashboard");
            router.refresh();
        } catch (error) {
            console.error("Error creating campaign:", error);
            alert(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create New Campaign</h1>
                        <p className="mt-2 text-gray-600">Follow the steps to launch your campaign</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {autoSaving && (
                            <span className="text-sm text-gray-500">Saving...</span>
                        )}
                        {lastSaved && !autoSaving && (
                            <span className="text-sm text-gray-500">
                                Saved {lastSaved.toLocaleTimeString()}
                            </span>
                        )}
                        <Button variant="secondary" onClick={() => router.push("/founder/dashboard")}>
                            Exit
                        </Button>
                    </div>
                </div>

                {/* Progress Stepper */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        {STEPS.map((step, index) => (
                            <div key={step.id} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                                        ${index <= currentStep
                                            ? 'bg-primary-DEFAULT text-white'
                                            : 'bg-gray-200 text-gray-500'}
                                        transition-all duration-200
                                    `}>
                                        {index < currentStep ? '✓' : index + 1}
                                    </div>
                                    <div className="mt-2 text-center">
                                        <p className={`text-xs font-medium ${index <= currentStep ? 'text-primary-DEFAULT' : 'text-gray-500'}`}>
                                            {step.name}
                                        </p>
                                    </div>
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div className={`h-1 flex-1 mx-2 ${index < currentStep ? 'bg-primary-DEFAULT' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <Card>
                    <CardContent className="p-8">
                        {/* Step Content will go here */}
                        <div className="min-h-[500px]">
                            {currentStep === 0 && <Step1Basics formData={formData} onChange={handleInputChange} onAIAutoFill={handleAIAutoFill} loading={loading} />}
                            {currentStep === 1 && <Step2Content formData={formData} onChange={handleInputChange} onArrayChange={handleArrayChange} onAddItem={addArrayItem} onRemoveItem={removeArrayItem} />}
                            {currentStep === 2 && <Step3Schedule formData={formData} onChange={handleInputChange} />}
                            {currentStep === 3 && <Step4Budget formData={formData} onChange={handleInputChange} baseFeeTotal={baseFeeTotal} performanceBudget={performanceBudget} maxViews={maxViews} creatorEarnings={creatorEarningsPerView} nalaEarnings={nalaEarningsPerView} />}
                            {currentStep === 4 && <Step5Filters formData={formData} onChange={handleInputChange} />}
                            {currentStep === 5 && <Step6Review formData={formData} baseFeeTotal={baseFeeTotal} performanceBudget={performanceBudget} maxViews={maxViews} />}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="mt-8 flex justify-between pt-6 border-t border-gray-100">
                            <Button
                                onClick={prevStep}
                                disabled={currentStep === 0}
                                variant="secondary"
                                size="lg"
                            >
                                ← Back
                            </Button>

                            {currentStep === STEPS.length - 1 ? (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading || performanceBudget < 0}
                                    size="lg"
                                >
                                    {loading ? "Creating Campaign..." : "Confirm & Create Campaign"}
                                </Button>
                            ) : (
                                <Button
                                    onClick={nextStep}
                                    size="lg"
                                >
                                    Continue →
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Step Components (to be defined in separate sections)
function Step1Basics({ formData, onChange, onAIAutoFill, loading }: any) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Basics</h2>
                <p className="text-gray-600">Let's start with the fundamentals of your campaign</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    Campaign Title <span className="text-red-500">*</span>
                </label>
                <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => onChange("name", e.target.value)}
                    placeholder="e.g., Q4 Product Launch Campaign"
                    maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.name.length}/200 characters</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    Product Link <span className="text-gray-500">(Optional)</span>
                </label>
                <div className="flex gap-2">
                    <Input
                        type="url"
                        value={formData.productLink}
                        onChange={(e) => onChange("productLink", e.target.value)}
                        placeholder="https://yourproduct.com"
                        className="flex-1"
                    />
                    <Button
                        onClick={onAIAutoFill}
                        disabled={!formData.productLink || loading}
                        variant="secondary"
                    >
                        ✨ AI Auto-Fill
                    </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Our AI will analyze your product and suggest content</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    Campaign Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => onChange("description", e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2 focus:border-transparent"
                    placeholder="Describe your campaign goals, target audience, and what you're promoting..."
                    maxLength={2000}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.description.length}/2000 characters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Product Category <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.productCategory}
                        onChange={(e) => onChange("productCategory", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                    >
                        <option value="">Select a category</option>
                        {PRODUCT_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Primary Goal <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.primaryGoal}
                        onChange={(e) => onChange("primaryGoal", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                    >
                        {CAMPAIGN_GOALS.map(goal => (
                            <option key={goal} value={goal}>{goal}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    Campaign Duration (days)
                </label>
                <input
                    type="number"
                    min={7}
                    max={60}
                    value={formData.campaignDuration}
                    onChange={(e) => onChange("campaignDuration", parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                />
                <p className="text-xs text-gray-500 mt-1">Between 7 and 60 days</p>
            </div>
        </div>
    );
}
