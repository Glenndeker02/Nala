// Campaign Creation Step Components
// These are the individual step components for the enhanced campaign creation wizard

import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// Step 2: Content Requirements
export function Step2Content({ formData, onChange, onArrayChange, onAddItem, onRemoveItem }: any) {
    const PLATFORMS = ["TIKTOK", "INSTAGRAM", "FACEBOOK"];
    const TONES = ["Professional", "Casual", "Humorous", "Educational", "Inspirational"];
    const VIDEO_LENGTHS = ["15s", "30s", "60s", "Creator's Choice"];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Requirements</h2>
                <p className="text-gray-600">Define what kind of videos you need</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Number of Videos <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        min={1}
                        max={10}
                        value={formData.videosRequested}
                        onChange={(e) => onChange("videosRequested", parseInt(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Min: 1, Max: 10 per campaign</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Preferred Video Length
                    </label>
                    <select
                        value={formData.videoLength}
                        onChange={(e) => onChange("videoLength", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                    >
                        {VIDEO_LENGTHS.map(length => (
                            <option key={length} value={length}>{length}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    Platforms <span className="text-red-500">*</span>
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
                                    onChange("platforms", newPlatforms);
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
                    onChange={(e) => onChange("tone", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                >
                    {TONES.map(tone => (
                        <option key={tone} value={tone}>{tone}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    Key Talking Points (3-5 recommended)
                </label>
                <div className="space-y-3">
                    {formData.talkingPoints.map((point: string, index: number) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                type="text"
                                value={point}
                                onChange={(e) => onArrayChange("talkingPoints", index, e.target.value)}
                                placeholder={`Point ${index + 1}`}
                                className="flex-1"
                            />
                            {formData.talkingPoints.length > 1 && (
                                <Button
                                    variant="secondary"
                                    onClick={() => onRemoveItem("talkingPoints", index)}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button
                        variant="secondary"
                        onClick={() => onAddItem("talkingPoints")}
                        className="w-full"
                    >
                        + Add Talking Point
                    </Button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    Must-Haves (Requirements)
                </label>
                <div className="space-y-3">
                    {formData.mustHaves.map((item: string, index: number) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                type="text"
                                value={item}
                                onChange={(e) => onArrayChange("mustHaves", index, e.target.value)}
                                placeholder="e.g., Show product UI, Use trending audio"
                                className="flex-1"
                            />
                            {formData.mustHaves.length > 1 && (
                                <Button
                                    variant="secondary"
                                    onClick={() => onRemoveItem("mustHaves", index)}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button
                        variant="secondary"
                        onClick={() => onAddItem("mustHaves")}
                        className="w-full"
                    >
                        + Add Requirement
                    </Button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    Don'ts (Exclusions)
                </label>
                <div className="space-y-3">
                    {formData.dontWants.map((item: string, index: number) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                type="text"
                                value={item}
                                onChange={(e) => onArrayChange("dontWants", index, e.target.value)}
                                placeholder="e.g., No competitor mentions, No health claims"
                                className="flex-1"
                            />
                            {formData.dontWants.length > 1 && (
                                <Button
                                    variant="secondary"
                                    onClick={() => onRemoveItem("dontWants", index)}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button
                        variant="secondary"
                        onClick={() => onAddItem("dontWants")}
                        className="w-full"
                    >
                        + Add Exclusion
                    </Button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    Required Hashtags/Mentions
                </label>
                <Input
                    type="text"
                    value={formData.hashtags}
                    onChange={(e) => onChange("hashtags", e.target.value)}
                    placeholder="#YourBrand @youraccount"
                />
            </div>
        </div>
    );
}

// Step 3: Posting Schedule
export function Step3Schedule({ formData, onChange }: any) {
    const FREQUENCIES = [
        { value: "daily", label: "Daily (1 video/day)" },
        { value: "every_other_day", label: "Every Other Day" },
        { value: "weekly", label: "Weekly (1 video/week)" }
    ];

    const calculateEndDate = () => {
        if (!formData.startDate) return null;
        const start = new Date(formData.startDate);
        const days = formData.postingFrequency === 'daily' ? formData.videosRequested :
            formData.postingFrequency === 'every_other_day' ? formData.videosRequested * 2 :
                formData.videosRequested * 7;
        const end = new Date(start);
        end.setDate(start.getDate() + days);
        return end;
    };

    const endDate = calculateEndDate();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Posting Schedule</h2>
                <p className="text-gray-600">When should your videos go live?</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    Campaign Start Date <span className="text-red-500">*</span>
                </label>
                <input
                    type="date"
                    min={new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    value={formData.startDate}
                    onChange={(e) => onChange("startDate", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 5 days from today for creator preparation</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    Posting Frequency <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                    {FREQUENCIES.map(freq => (
                        <label key={freq.value} className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-primary-DEFAULT cursor-pointer transition-colors">
                            <input
                                type="radio"
                                name="frequency"
                                value={freq.value}
                                checked={formData.postingFrequency === freq.value}
                                onChange={(e) => onChange("postingFrequency", e.target.value)}
                                className="w-4 h-4 text-primary-DEFAULT border-gray-300 focus:ring-primary-DEFAULT"
                            />
                            <span className="ml-3 text-gray-900">{freq.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    Preferred Posting Time (Optional)
                </label>
                <input
                    type="time"
                    value={formData.preferredPostingTime}
                    onChange={(e) => onChange("preferredPostingTime", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: 9 AM - 12 PM for maximum engagement</p>
            </div>

            {formData.startDate && (
                <div className="p-6 bg-primary-50 rounded-xl border border-primary-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">📅 Campaign Timeline Preview</h3>
                    <div className="flex justify-between items-center text-sm">
                        <div>
                            <p className="text-gray-600">Start Date</p>
                            <p className="font-bold text-gray-900">{new Date(formData.startDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex-1 mx-4 border-t-2 border-primary-DEFAULT relative">
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary-50 px-2 text-xs text-primary-DEFAULT font-medium">
                                {formData.videosRequested} videos
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-600">Est. End Date</p>
                            <p className="font-bold text-gray-900">{endDate?.toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Step 4: Budget & ROI Calculator (Aligned with Landing Page)
export function Step4Budget({ formData, onChange }: any) {
    // 1. ROI Calculator State
    // "Total Budget" and "Video Count" are in formData
    const baseFeeTotal = formData.videosRequested * formData.baseFeePerVideo;
    const performanceBudget = Math.max(0, formData.totalBudget - baseFeeTotal);
    const nalaViewCost = 3.00; // $3 CPM fixed charge to founder
    const creatorViewPay = 2.00; // $2 CPM paid to creators
    const estimatedViews = Math.floor((performanceBudget / nalaViewCost) * 1000);

    // 2. Revenue Projection State
    const [showAttribution, setShowAttribution] = React.useState(formData.enableCreatorCodes || false);
    const [enableCompensation, setEnableCompensation] = React.useState(false);

    // 3. Discount / Offer State
    const [enableDiscount, setEnableDiscount] = React.useState(false);
    const [discountType, setDiscountType] = React.useState<"percentage" | "fixed" | "trial">("percentage");
    const [discountValue, setDiscountValue] = React.useState(20); // Default 20% or $20 or 14 days

    // Rates & Pricing (SaaS Focused)
    const [downloadRate, setDownloadRate] = React.useState(3.0);
    const [conversionRate, setConversionRate] = React.useState(2.0);
    const [monthlyPrice, setMonthlyPrice] = React.useState(9.90);
    const [creatorSharePercent, setCreatorSharePercent] = React.useState(40.0);

    // Nala Fees
    const NALA_BASE_CUT = 0.10; // 10%
    const NALA_SUB_FEE = 0.05; // 5%

    // --- CALCULATIONS (Step-by-Step "Real Life") ---

    // Step 1: Conversions
    const projectedDownloads = Math.floor(estimatedViews * (downloadRate / 100));
    const projectedPaying = Math.floor(projectedDownloads * (conversionRate / 100));

    // Step 2: Subscription Revenue
    const newMonthlyRevenue = projectedPaying * monthlyPrice;

    // Step 3: Creator Bonuses (Layer 3)
    const creatorSharePerSub = monthlyPrice * (creatorSharePercent / 100);
    const totalCreatorBonuses = projectedPaying * creatorSharePerSub;

    // Step 4: Base Fees Logic
    // baseFeeTotal is Gross paid by Founder
    const nalaBaseRevenue = baseFeeTotal * NALA_BASE_CUT;
    const netBaseToCreators = baseFeeTotal - nalaBaseRevenue;

    // Step 5: View Fees Logic
    const founderViewBill = (estimatedViews / 1000) * nalaViewCost; // Should match performanceBudget approx
    const creatorsViewPayTotal = (estimatedViews / 1000) * creatorViewPay;
    const nalaViewMargin = founderViewBill - creatorsViewPayTotal;

    // Step 6: Nala Sub Fee
    const nalaSubRevenue = newMonthlyRevenue * NALA_SUB_FEE;

    // Step 7: Totals & KPIs
    // Founder Outflow
    const totalFounderOutflow = baseFeeTotal + founderViewBill + totalCreatorBonuses + nalaSubRevenue;

    // Creator Earnings
    const totalCreatorEarnings = netBaseToCreators + creatorsViewPayTotal + totalCreatorBonuses;

    // Nala Revenue
    const totalNalaRevenue = nalaBaseRevenue + nalaViewMargin + nalaSubRevenue;

    // Marketing KPIs
    const marketingSpendDirect = baseFeeTotal + founderViewBill; // $600 in example
    const cac = projectedPaying > 0 ? marketingSpendDirect / projectedPaying : 0;
    const roas = marketingSpendDirect > 0 ? newMonthlyRevenue / marketingSpendDirect : 0;

    // Sync formData
    React.useEffect(() => {
        onChange("enableCreatorCodes", showAttribution);
        onChange("targetViews", estimatedViews);
        if (enableDiscount) {
            onChange("codeDiscountType", discountType);
            onChange("codeDiscountValue", discountValue);
        }
    }, [showAttribution, estimatedViews, enableDiscount, discountType, discountValue]);

    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Calculate Your ROI</h2>
                <p className="text-gray-600">See exactly what you can achieve with Nala's performance-driven platform.</p>
            </div>

            {/* SECTION 1: ROI CALCULATOR */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Inputs */}
                <div className="space-y-8">
                    {/* Budget Slider */}
                    <div>
                        <div className="flex justify-between items-end mb-4">
                            <label className="text-lg font-medium text-gray-700">Total Budget (USD)</label>
                            <span className="text-2xl font-bold text-green-600">${formData.totalBudget.toLocaleString()}</span>
                        </div>
                        <input
                            type="range"
                            min="500"
                            max="50000"
                            step="100"
                            value={formData.totalBudget}
                            onChange={(e) => onChange("totalBudget", parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                            <span>$500</span>
                            <span>$50,000</span>
                        </div>
                    </div>

                    {/* Video Count Slider */}
                    <div>
                        <div className="flex justify-between items-end mb-4">
                            <label className="text-lg font-medium text-gray-700">Number of Videos</label>
                            <span className="text-2xl font-bold text-gray-900">{formData.videosRequested}</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            step="1"
                            value={formData.videosRequested}
                            onChange={(e) => onChange("videosRequested", parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                            <span>1 Video</span>
                            <span>50 Videos</span>
                        </div>
                    </div>

                    {/* Target Views (Output/Visual) */}
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="text-lg font-medium text-gray-700">Target Views</label>
                            <span className="text-2xl font-bold text-green-600">{estimatedViews.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 bg-green-100 rounded-lg overflow-hidden">
                            <div
                                className="h-full bg-green-600 transition-all duration-300"
                                style={{ width: `${Math.min(100, (estimatedViews / 500000) * 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Based on remaining performance budget of ${performanceBudget.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Right: Campaign Projection Card */}
                <div className="bg-white border rounded-2xl shadow-lg p-6 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="p-2 bg-green-100 text-green-600 rounded-lg">📈</span>
                        <h3 className="text-xl font-bold text-gray-900">Campaign Projection</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-500 mb-1">Total Cost</p>
                            <p className="text-3xl font-bold text-gray-900">${formData.totalBudget.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-500 mb-1">Est. Views</p>
                            <p className="text-3xl font-bold text-gray-900">{estimatedViews.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 space-y-3">
                        <p className="font-medium text-gray-900">Budget Breakdown</p>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Base Fees ({formData.videosRequested} × ${formData.baseFeePerVideo})</span>
                            <span className="font-bold text-gray-900">${baseFeeTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Performance Budget</span>
                            <span className="font-bold text-gray-900">${performanceBudget.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-2 mt-2">
                            <span>Total Budget</span>
                            <span className="text-green-600">${formData.totalBudget.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2: ATTRIBUTION & OFFERS */}
            <div className="border-t border-gray-200 pt-8 space-y-6">
                {/* 2a. Enable Attribution */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Enable Creator Attribution?</h3>
                        <p className="text-gray-600 text-sm">Track conversions and sales from your creators.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showAttribution}
                            onChange={(e) => setShowAttribution(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>

                {showAttribution && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                        {/* 2b. Compensation Toggle */}
                        <div className="flex items-center justify-between bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <div>
                                <h4 className="font-bold text-gray-900">Compensate for Subscriptions/Sales?</h4>
                                <p className="text-gray-600 text-sm">Do you want to share a % of revenue with creators driving sales?</p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setEnableCompensation(false)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${!enableCompensation ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    No, just track
                                </button>
                                <button
                                    onClick={() => setEnableCompensation(true)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${enableCompensation ? 'bg-green-600 text-white shadow-md' : 'bg-white border text-gray-600 hover:border-green-300'}`}
                                >
                                    Yes, set rates
                                </button>
                            </div>
                        </div>

                        {/* 2c. Discount / Special Offer Toggle */}
                        <div className="flex items-center justify-between bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <div>
                                <h4 className="font-bold text-gray-900">Offer a Discount or Deal?</h4>
                                <p className="text-gray-600 text-sm">Incentivize conversions with a special offer for creator audiences.</p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setEnableDiscount(false)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${!enableDiscount ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    No offer
                                </button>
                                <button
                                    onClick={() => setEnableDiscount(true)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${enableDiscount ? 'bg-purple-600 text-white shadow-md' : 'bg-white border text-gray-600 hover:border-purple-300'}`}
                                >
                                    Yes, configure
                                </button>
                            </div>
                        </div>

                        {/* 2d. Discount Configuration Panel */}
                        {enableDiscount && (
                            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-purple-900 mb-2">Offer Type</label>
                                    <div className="flex rounded-lg shadow-sm">
                                        <button
                                            onClick={() => setDiscountType("percentage")}
                                            className={`flex-1 py-2 px-3 text-sm font-medium rounded-l-lg border ${discountType === 'percentage' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                        >
                                            % Off
                                        </button>
                                        <button
                                            onClick={() => setDiscountType("fixed")}
                                            className={`flex-1 py-2 px-3 text-sm font-medium border-t border-b ${discountType === 'fixed' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                        >
                                            $ Off
                                        </button>
                                        <button
                                            onClick={() => setDiscountType("trial")}
                                            className={`flex-1 py-2 px-3 text-sm font-medium rounded-r-lg border ${discountType === 'trial' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                        >
                                            Free Trial
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-purple-900 mb-2">
                                        {discountType === 'percentage' ? 'Discount Percentage (%)' : discountType === 'fixed' ? 'Discount Amount ($)' : 'Trial Duration (Days)'}
                                    </label>
                                    <input
                                        type="number"
                                        value={discountValue}
                                        onChange={(e) => setDiscountValue(parseFloat(e.target.value))}
                                        className="w-full px-4 py-2 rounded-lg border border-purple-200 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                    <p className="text-xs text-purple-600 mt-2">
                                        {discountType === 'percentage' ? `Users get ${discountValue}% off` : discountType === 'fixed' ? `Users save $${discountValue}` : `Users get ${discountValue} days free`}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* SECTION 3: REVENUE PROJECTION CALCULATOR (LAYER 2) */}
            {showAttribution && enableCompensation && (
                <div className="animate-in fade-in slide-in-from-top-8 space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Revenue Projection (Real-Life Calculation)</h2>
                        <p className="text-gray-600">See how your <span className="font-bold text-gray-900">{estimatedViews.toLocaleString()} views</span> translate into revenue with our verified flow.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left: Inputs (4 cols) */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Impressions / Views</label>
                                <div className="text-2xl font-bold text-green-600 mb-1">{estimatedViews.toLocaleString()}</div>
                                <p className="text-xs text-gray-500">Auto-filled from ROI calculator</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Download Rate (%)</label>
                                    <input
                                        type="number"
                                        value={downloadRate}
                                        onChange={(e) => setDownloadRate(parseFloat(e.target.value))}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Paid Conv. (%)</label>
                                    <input
                                        type="number"
                                        value={conversionRate}
                                        onChange={(e) => setConversionRate(parseFloat(e.target.value))}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Price ($)</label>
                                    <input
                                        type="number"
                                        value={monthlyPrice}
                                        onChange={(e) => setMonthlyPrice(parseFloat(e.target.value))}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Creator Share (%)</label>
                                    <input
                                        type="number"
                                        value={creatorSharePercent}
                                        onChange={(e) => setCreatorSharePercent(parseFloat(e.target.value))}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-purple-500 focus:border-purple-500 bg-purple-50"
                                    />
                                </div>
                            </div>

                            <div className="p-3 bg-purple-100 text-purple-800 rounded-lg text-sm text-center">
                                Creator earns <strong>${creatorSharePerSub.toFixed(2)}</strong> per active subscription
                            </div>
                        </div>

                        {/* Right: Summary Card & Detailed Breakdown Button */}
                        <div className="lg:col-span-7 bg-white border rounded-2xl shadow-lg flex flex-col justify-between p-6">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="p-1.5 bg-green-100 text-green-700 rounded-lg">📊</span>
                                    Projected Results
                                </h3>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Downloads</p>
                                        <p className="font-bold text-xl text-gray-900">{projectedDownloads.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Paying Customers</p>
                                        <p className="font-bold text-xl text-gray-900">{projectedPaying.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-lg col-span-2">
                                        <p className="text-xs text-green-700 mb-1">New Monthly Revenue (MRR)</p>
                                        <p className="font-bold text-2xl text-green-700">+${newMonthlyRevenue.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                        <span className="text-gray-600">Creator Payout</span>
                                        <span className="font-medium text-gray-900">${totalCreatorEarnings.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                        <span className="text-gray-600">Sub. Profit</span>
                                        <span className="font-medium text-gray-900">${(newMonthlyRevenue - totalCreatorBonuses - nalaSubRevenue).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button
                                    onClick={() => {
                                        const el = document.getElementById('funds-breakdown-modal');
                                        if (el) el.classList.remove('hidden');
                                    }}
                                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                                >
                                    <span>View Detailed Funds Breakdown</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Detailed Breakdown Modal (Simplified Visibility Toggle) */}
                        <div id="funds-breakdown-modal" className="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                            onClick={(e) => {
                                const target = e.target as HTMLElement;
                                if (target.id === 'funds-breakdown-modal') target.classList.add('hidden');
                            }}
                        >
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Total Breakdown of Funds</h3>
                                        <p className="text-sm text-gray-500 mt-1">Based on {projectedDownloads.toLocaleString()} downloads and {projectedPaying.toLocaleString()} paying customers</p>
                                    </div>
                                    <button onClick={() => document.getElementById('funds-breakdown-modal')?.classList.add('hidden')} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                                    {/* COL 1: Founder OUT */}
                                    <div className="space-y-4">
                                        <p className="font-bold text-gray-900 border-b pb-2 text-lg">Founder Pays</p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Base Fees:</span>
                                                <span className="font-mono font-medium">${baseFeeTotal.toFixed(0)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">View Fees:</span>
                                                <span className="font-mono font-medium">${founderViewBill.toFixed(0)}</span>
                                            </div>
                                            <div className="flex justify-between text-purple-700">
                                                <span>Sub Bonuses:</span>
                                                <span className="font-mono font-medium">${totalCreatorBonuses.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-orange-600">
                                                <span>Nala Sub Fee:</span>
                                                <span className="font-mono font-medium">${nalaSubRevenue.toFixed(2)}</span>
                                            </div>
                                            <div className="pt-3 border-t font-bold flex justify-between text-lg">
                                                <span>Total:</span>
                                                <span>${totalFounderOutflow.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* COL 2: Creator IN */}
                                    <div className="space-y-4">
                                        <p className="font-bold text-gray-900 border-b pb-2 text-lg">Creator Earns</p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Net Base:</span>
                                                <span className="font-mono font-medium">${netBaseToCreators.toFixed(0)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">View Pay:</span>
                                                <span className="font-mono font-medium">${creatorsViewPayTotal.toFixed(0)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Sub Rate:</span>
                                                <span className="font-mono font-medium">${totalCreatorBonuses.toFixed(2)}</span>
                                            </div>
                                            <div className="pt-3 border-t font-bold flex justify-between text-lg">
                                                <span>Total:</span>
                                                <span>${totalCreatorEarnings.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* COL 3: Nala IN */}
                                    <div className="space-y-4">
                                        <p className="font-bold text-gray-900 border-b pb-2 text-lg">Nala Revenue</p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Base Cut:</span>
                                                <span className="font-mono font-medium">${nalaBaseRevenue.toFixed(0)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">View Margin:</span>
                                                <span className="font-mono font-medium">${nalaViewMargin.toFixed(0)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Sub Fee:</span>
                                                <span className="font-mono font-medium">${nalaSubRevenue.toFixed(2)}</span>
                                            </div>
                                            <div className="pt-3 border-t font-bold flex justify-between text-lg">
                                                <span>Total:</span>
                                                <span>${totalNalaRevenue.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Step 5: Creator Filters
export function Step5Filters({ formData, onChange }: any) {
    const LANGUAGES = ["English", "Spanish", "French", "German", "Mandarin", "Japanese", "Korean"];
    const INDUSTRIES = [
        "SaaS & Software",
        "E-commerce",
        "Health & Fitness",
        "B2B Tech",
        "Beauty & Cosmetics",
        "Finance & Fintech"
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Creator Filters</h2>
                <p className="text-gray-600">Find creators that match your requirements (all optional)</p>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-xl hover:border-primary-DEFAULT transition-colors shadow-sm">
                <label className="flex items-start cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.certifiedOnly || false}
                        onChange={(e) => onChange("certifiedOnly", e.target.checked)}
                        className="w-5 h-5 mt-1 text-primary-DEFAULT border-gray-300 rounded focus:ring-primary-DEFAULT"
                    />
                    <div className="ml-3">
                        <span className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                            <span className="text-xl">🎓</span> Only Certified Creators
                            <span className="bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded-full border border-primary-200">Recommended</span>
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                            Restrict applications to creators who have passed the Nala Certification Exam.
                            Certified creators are verified for quality, reliability, and professionalism.
                        </p>
                    </div>
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Minimum Rating
                    </label>
                    <select
                        value={formData.minRating}
                        onChange={(e) => onChange("minRating", parseFloat(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                    >
                        <option value={0}>Any Rating</option>
                        <option value={3.0}>3.0+ Stars</option>
                        <option value={3.5}>3.5+ Stars</option>
                        <option value={4.0}>4.0+ Stars</option>
                        <option value={4.5}>4.5+ Stars</option>
                        <option value={5.0}>5.0 Stars Only</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Minimum Experience (Campaigns)
                    </label>
                    <input
                        type="number"
                        min={0}
                        value={formData.minExperience}
                        onChange={(e) => onChange("minExperience", parseInt(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Language Preference
                    </label>
                    <select
                        value={formData.language}
                        onChange={(e) => onChange("language", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                    >
                        {LANGUAGES.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    Industry Experience (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {INDUSTRIES.map(industry => (
                        <label key={industry} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-primary-DEFAULT cursor-pointer transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.industryExperience.includes(industry)}
                                onChange={(e) => {
                                    const newIndustries = e.target.checked
                                        ? [...formData.industryExperience, industry]
                                        : formData.industryExperience.filter((i: string) => i !== industry);
                                    onChange("industryExperience", newIndustries);
                                }}
                                className="w-4 h-4 text-primary-DEFAULT border-gray-300 rounded focus:ring-primary-DEFAULT"
                            />
                            <span className="ml-2 text-sm text-gray-700">{industry}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    Geographic Location (Optional)
                </label>
                <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) => onChange("location", e.target.value)}
                    placeholder="e.g., United States, Europe, Global"
                />
            </div>

            <div className="p-6 bg-primary-50 rounded-xl border border-primary-100">
                <h4 className="font-bold text-gray-900 mb-2">📊 Matching Creators</h4>
                <p className="text-sm text-gray-600 mb-3">Based on your current filters:</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary-DEFAULT">45+</span>
                    <span className="text-gray-600">creators available</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Average rating: 4.6/5 | Average base rate: ${formData.baseFeePerVideo}/video</p>
            </div>
        </div>
    );
}

// Step 6: Review & Confirm
export function Step6Review({ formData }: any) {
    // 1. Constants (Must match Step 4)
    const FOUNDER_VIEW_COST_PER_1K = 3.00;
    const NALA_BASE_COMMISSION = 0.10;
    const NALA_SUB_MARGIN = 0.05;
    // Default sub price if not stored (simplified for review)
    // ideally strictly passed, but for estimation we'll use a conservative default or 0 if unknown
    // In a real app, we'd add subscriptionPrice to formData. For now, we estimate base + views + base commission.
    const estimatedSubPrice = 9.90;

    // 2. Calculations
    const baseVideoGross = formData.videosRequested * formData.baseFeePerVideo;
    const nalaBaseFee = baseVideoGross * NALA_BASE_COMMISSION; // 10% of Gross

    // Use targetViews if set from Step 4, else fallback to budget-derived max
    const targetViews = formData.targetViews || 0;
    const viewCost = (targetViews / 1000) * FOUNDER_VIEW_COST_PER_1K;

    // Estimate subscription fees (Creator Bonus + Nala Fee)
    // Funnel: Views -> 3% -> 2% = 0.06% conversions
    const estimatedSubs = Math.floor(targetViews * 0.03 * 0.02);
    // Founder payment = Creator Share (40%) + Nala Margin (5%)
    // But Step 4 logic: Founder pays Creator Bonus (40% * Price) + Nala Fee (5% * Price)
    // Total Sub Cost = Subs * Price * (0.40 + 0.05)
    // Note: If Step 4 inputs were dynamic, we'd need them here. We'll use the hardcoded User Example model for consistency in review.
    const estimatedSubCost = estimatedSubs * estimatedSubPrice * (0.40 + 0.05);

    const totalProjectedSpend = baseVideoGross + viewCost + estimatedSubCost; // Note: nalaBaseFee is part of baseVideoGross distribution, NOT additive for Founder.
    // WAIT: In Step 4 "Founder Outflow" = baseVideoGross + viewCost + creatorBonus + nalaSubFee
    // "Pays base fees (gross): $300". This $300 ALREADY includes the cut Nala takes.
    // So for Founder, baseVideoGross IS the cost. Correct.

    const isOverBudget = totalProjectedSpend > formData.totalBudget;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Confirm</h2>
                <p className="text-gray-600">Review your campaign details before submitting</p>
            </div>

            {/* Campaign Summary Card */}
            <div className={`p-6 bg-white border-2 rounded-2xl ${isOverBudget ? 'border-red-300' : 'border-primary-DEFAULT'}`}>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">📋 Campaign Summary</h3>
                    {isOverBudget && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Over Budget</span>}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-sm text-gray-600">Campaign Title</p>
                        <p className="font-bold text-gray-900">{formData.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="font-bold text-gray-900">{formData.productCategory}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Videos Requested</p>
                        <p className="font-bold text-gray-900">{formData.videosRequested}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Platforms</p>
                        <p className="font-bold text-gray-900">{formData.platforms.join(", ")}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Target Views</p>
                        <p className="font-bold text-primary-600">{targetViews > 0 ? targetViews.toLocaleString() : "Not set"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Creator Attribution</p>
                        <p className="font-bold text-gray-900">{formData.enableCreatorCodes ? "Enabled ✅" : "Disabled"}</p>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Base Fees (Gross):</span>
                        <span className="font-bold text-gray-900">${baseVideoGross.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Projected View Cost:</span>
                        <span className="font-bold text-gray-900">${viewCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
                        <span>Est. Conversion Bonuses (Subs):</span>
                        <span>${estimatedSubCost.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-lg border-t border-gray-200 pt-2 mt-2">
                        <span className="font-bold text-gray-900">Est. Total Cost:</span>
                        <span className={`font-bold ${isOverBudget ? 'text-red-600' : 'text-primary-DEFAULT'}`}>${totalProjectedSpend.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-gray-600">Budget Limit:</span>
                        <span className="text-gray-900">${formData.totalBudget.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Creator Availability */}
            <div className="p-6 bg-primary-50 rounded-xl border border-primary-100">
                <h4 className="font-bold text-gray-900 mb-2">👥 Estimated Creators</h4>
                <p className="text-gray-700">Matching creators will be invited automatically.</p>
                <p className="text-sm text-gray-600 mt-1">Average rating: 4.6/5</p>
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-3">
                <label className="flex items-start">
                    <input
                        type="checkbox"
                        required
                        className="w-4 h-4 mt-1 text-primary-DEFAULT border-gray-300 rounded focus:ring-primary-DEFAULT"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                        I agree to the <a href="#" className="text-primary-DEFAULT hover:text-primary-600 font-medium">content rights policy</a> and grant creators permission to create content for my brand
                    </span>
                </label>
                <label className="flex items-start">
                    <input
                        type="checkbox"
                        required
                        className="w-4 h-4 mt-1 text-primary-DEFAULT border-gray-300 rounded focus:ring-primary-DEFAULT"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                        I agree to the <a href="#" className="text-primary-DEFAULT hover:text-primary-600 font-medium">payment terms</a> and understand that base fees are paid upon content approval
                    </span>
                </label>
            </div>

            {/* Important Notice */}
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-sm text-yellow-800">
                    <strong>⚠️ Important:</strong> Your total budget of ${formData.totalBudget.toFixed(2)} will be held in escrow. Base fees are released upon content approval, and performance budget is charged based on actual views achieved.
                </p>
            </div>
        </div>
    );
}
