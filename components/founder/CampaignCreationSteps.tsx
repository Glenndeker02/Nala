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

// Step 4: Budget Configuration (Enhanced with Interactive Calculator)
export function Step4Budget({ formData, onChange, baseFeeTotal, performanceBudget, maxViews, creatorEarnings, nalaEarnings }: any) {
    const [guaranteedSpend, setGuaranteedSpend] = React.useState(formData.guaranteedSpend || false);
    const [targetViews, setTargetViews] = React.useState(maxViews);

    // Constants
    const MIN_BUDGET = 100; // Changed from 500 to 100
    const FOUNDER_RATE_PER_1000_VIEWS = 5; // $5 per 1000 views
    const BASE_VIDEO_COST_BULK = 20; // $20 per video for 6+ videos
    const BASE_VIDEO_COST_SMALL = 25; // $25 per video for 1-5 videos

    const getBaseFeePerVideo = (count: number) => count >= 6 ? BASE_VIDEO_COST_BULK : BASE_VIDEO_COST_SMALL;

    // Calculate guaranteed views if guaranteed spend is enabled
    const guaranteedViews = Math.floor((performanceBudget / FOUNDER_RATE_PER_1000_VIEWS) * 1000);

    // Handlers for interactive sliders (decoupled like landing page)
    const handleBudgetChange = (newBudget: number) => {
        const baseFee = getBaseFeePerVideo(formData.videosRequested);
        const minBudget = Math.max(MIN_BUDGET, formData.videosRequested * baseFee);
        const actualBudget = Math.max(newBudget, minBudget);
        onChange("totalBudget", actualBudget);

        // Recalculate target views based on new budget
        const newPerformanceBudget = actualBudget - (formData.videosRequested * baseFee);
        const newViews = Math.floor((newPerformanceBudget / FOUNDER_RATE_PER_1000_VIEWS) * 1000);
        setTargetViews(Math.max(0, newViews));
    };

    const handleVideoChange = (newVideoCount: number) => {
        onChange("videosRequested", newVideoCount);

        const newBaseFee = getBaseFeePerVideo(newVideoCount);
        onChange("baseFeePerVideo", newBaseFee);

        const baseCost = newVideoCount * newBaseFee;
        let currentBudget = formData.totalBudget;
        const requiredMin = Math.max(MIN_BUDGET, baseCost);

        if (currentBudget < requiredMin) {
            currentBudget = requiredMin;
            onChange("totalBudget", currentBudget);
            setTargetViews(0);
        } else {
            const remainingBudget = currentBudget - baseCost;
            const newViews = Math.floor((remainingBudget / FOUNDER_RATE_PER_1000_VIEWS) * 1000);
            setTargetViews(Math.max(0, newViews));
        }
    };

    const handleViewsChange = (newViews: number) => {
        setTargetViews(newViews);
        const baseFee = getBaseFeePerVideo(formData.videosRequested);
        const baseCost = formData.videosRequested * baseFee;
        const perfCost = (newViews / 1000) * FOUNDER_RATE_PER_1000_VIEWS;
        const newBudget = Math.max(MIN_BUDGET, Math.round(baseCost + perfCost));
        onChange("totalBudget", newBudget);
    };

    // Sync targetViews with maxViews when component mounts or maxViews changes
    React.useEffect(() => {
        setTargetViews(maxViews);
    }, [maxViews]);

    const scenarios = [
        { views: Math.floor(targetViews * 0.2), percentage: 20 },
        { views: Math.floor(targetViews * 0.67), percentage: 67 },
        { views: targetViews, percentage: 100 }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Budget Configuration</h2>
                <p className="text-gray-600">Use the interactive calculator to configure your budget and see real-time projections</p>
            </div>

            {/* Interactive Budget Calculator */}
            <div className="p-6 bg-gradient-to-br from-primary-50 to-white rounded-2xl border-2 border-primary-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🎯</span> Interactive Budget Calculator
                </h3>

                <div className="space-y-6">
                    {/* Total Budget Slider */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex justify-between">
                            <span>Total Budget (USD) <span className="text-red-500">*</span></span>
                            <span className="text-primary-600 font-bold text-lg">${formData.totalBudget.toLocaleString()}</span>
                        </label>
                        <input
                            type="range"
                            min="100"
                            max="50000"
                            step="100"
                            value={formData.totalBudget}
                            onChange={(e) => handleBudgetChange(Number(e.target.value))}
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>$100</span>
                            <span>$50,000</span>
                        </div>
                    </div>

                    {/* Number of Videos Slider */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex justify-between">
                            <span>Number of Videos</span>
                            <span className="text-primary-600 font-bold text-lg">{formData.videosRequested}</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            step="1"
                            value={formData.videosRequested}
                            onChange={(e) => handleVideoChange(Number(e.target.value))}
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>1 Video</span>
                            <span>50 Videos</span>
                        </div>
                    </div>

                    {/* Base Fee Info (Fixed) */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">Base Fee per Video</span>
                            <span className="text-primary-600 font-bold">${formData.baseFeePerVideo}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                            {formData.videosRequested >= 6
                                ? "Bulk rate applied ($20/video for 6+ videos)"
                                : "Standard rate ($25/video). Order 6+ videos to save $5/video!"}
                        </p>
                    </div>

                    {/* Target Views Slider */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex justify-between">
                            <span>Target Views</span>
                            <span className="text-primary-600 font-bold text-lg">{targetViews.toLocaleString()}</span>
                        </label>
                        <input
                            type="range"
                            min="1000"
                            max="10000000"
                            step="10000"
                            value={targetViews}
                            onChange={(e) => handleViewsChange(Number(e.target.value))}
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>1K</span>
                            <span>10M</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Guaranteed Spend Toggle */}
            <div className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 transition-colors">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={guaranteedSpend}
                                onChange={(e) => {
                                    const newValue = e.target.checked;
                                    setGuaranteedSpend(newValue);
                                    onChange("guaranteedSpend", newValue);
                                }}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <span className="text-xl">🎯</span> Guaranteed Spend Mode
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                            {guaranteedSpend
                                ? "✅ Get guaranteed bonus views on top of your organic reach! Your entire performance budget will be used to boost your content with paid promotion."
                                : "Auto-refund enabled. Unspent budget will be refunded after 7 days based on actual views achieved."
                            }
                        </p>

                        {guaranteedSpend && performanceBudget > 0 && (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-green-900">Bonus Views (Guaranteed):</span>
                                    <span className="text-2xl font-bold text-green-600">+{guaranteedViews.toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-green-700 mb-2">
                                    These views will be added ON TOP of your organic reach through paid promotion.
                                </p>
                                <div className="p-2 bg-green-100 rounded text-xs text-green-800 mb-3">
                                    💡 <strong>How it works:</strong> Your videos get natural organic views PLUS {guaranteedViews.toLocaleString()} guaranteed promoted views
                                </div>
                                <div className="mt-3 pt-3 border-t border-green-200">
                                    <div className="flex justify-between text-xs text-green-800">
                                        <span>Promotion budget:</span>
                                        <span className="font-semibold">${performanceBudget.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-green-800 mt-1">
                                        <span>Cost per 1K views:</span>
                                        <span className="font-semibold">${FOUNDER_RATE_PER_1000_VIEWS.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-green-800 mt-1">
                                        <span>Total bonus views:</span>
                                        <span className="font-semibold">+{guaranteedViews.toLocaleString()} views</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Budget Breakdown Card */}
            <div className="p-6 bg-gradient-to-br from-primary-50 to-white rounded-2xl border-2 border-primary-100 relative z-10">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">💰</span> Budget Breakdown
                </h3>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Number of Videos:</span>
                        <span className="font-bold text-gray-900">{formData.videosRequested}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Avg Creator Base Fee:</span>
                        <span className="font-bold text-gray-900">${formData.baseFeePerVideo}/video</span>
                    </div>
                    {formData.videosRequested >= 6 && (
                        <div className="text-xs bg-primary-100 text-primary-700 p-2 rounded text-center font-medium">
                            🎉 Bulk discount applied!
                        </div>
                    )}

                    <div className="h-px bg-gray-200 my-3"></div>

                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Fixed Budget (100% locked):</span>
                        <span className="font-bold text-gray-900">${baseFeeTotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Performance Budget:</span>
                        <span className="font-bold text-gray-900">${performanceBudget.toFixed(2)}</span>
                    </div>

                    <div className="h-px bg-gray-200 my-3"></div>

                    <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-gray-900">TOTAL BUDGET:</span>
                        <span className="font-bold text-primary-600">${formData.totalBudget.toFixed(2)}</span>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-100">
                    <p className="text-sm text-gray-700 mb-2">
                        {guaranteedSpend ? "Bonus Views (Guaranteed):" : "Maximum Views Purchasable:"}
                    </p>
                    <p className="text-2xl font-bold text-primary-600">
                        {guaranteedSpend ? `+${guaranteedViews.toLocaleString()}` : maxViews.toLocaleString()} views
                    </p>
                    <p className="text-xs text-gray-600 mt-1">@ $5.00 per 1,000 views</p>
                    {guaranteedSpend && (
                        <p className="text-xs text-green-700 mt-2 bg-green-50 p-2 rounded border border-green-200">
                            ✅ Added on top of organic views
                        </p>
                    )}
                </div>
            </div>

            {/* Performance Budget Explanation */}
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">💡 How Performance Budget Works</h4>
                <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-start">
                        <span className="text-primary-DEFAULT mr-2">•</span>
                        <span>Creator earns <strong>${(creatorEarnings * 1000).toFixed(2)}/1k views</strong> (capped at {maxViews.toLocaleString()} views)</span>
                    </div>
                    <div className="flex items-start">
                        <span className="text-primary-DEFAULT mr-2">•</span>
                        <span>Nala earns <strong>${(nalaEarnings * 1000).toFixed(2)}/1k views</strong> (platform fee)</span>
                    </div>
                    <div className="flex items-start">
                        <span className="text-primary-DEFAULT mr-2">•</span>
                        <span>
                            {guaranteedSpend
                                ? <><strong>Guaranteed Spend Mode:</strong> All performance budget will be spent to deliver views</>
                                : <>Unspent budget is <strong>automatically refunded</strong> after 7 days</>
                            }
                        </span>
                    </div>
                </div>
            </div>

            {!guaranteedSpend && (
                <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-gray-900 mb-4">📊 Potential ROI Scenarios (With Auto-Refund)</h4>
                    <div className="space-y-3">
                        {scenarios.map((scenario, index) => {
                            const cost = baseFeeTotal + (scenario.views * 0.005);
                            const savings = formData.totalBudget - cost;
                            return (
                                <div key={index} className="p-4 bg-white rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-gray-900">{scenario.views.toLocaleString()} views ({scenario.percentage}% of target)</span>
                                        <span className="text-sm text-gray-600">Cost: ${cost.toFixed(2)}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {savings > 0 ? `You save: $${savings.toFixed(2)} (refunded)` : 'Full budget used (excellent performance!)'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {performanceBudget < 0 && (
                <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded">
                    <p className="text-sm text-red-700">
                        ⚠️ Your fixed costs exceed your total budget. Please increase the budget or reduce the base fee.
                    </p>
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
export function Step6Review({ formData, baseFeeTotal, performanceBudget, maxViews }: any) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Confirm</h2>
                <p className="text-gray-600">Review your campaign details before submitting</p>
            </div>

            {/* Campaign Summary Card */}
            <div className="p-6 bg-white border-2 border-primary-DEFAULT rounded-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Campaign Summary</h3>

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
                        <p className="text-sm text-gray-600">Start Date</p>
                        <p className="font-bold text-gray-900">{formData.startDate ? new Date(formData.startDate).toLocaleDateString() : "Not set"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Posting Frequency</p>
                        <p className="font-bold text-gray-900 capitalize">{formData.postingFrequency.replace('_', ' ')}</p>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Base Fee ({formData.videosRequested} videos × ${formData.baseFeePerVideo}):</span>
                        <span className="font-bold text-gray-900">${baseFeeTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Performance Budget:</span>
                        <span className="font-bold text-gray-900">${performanceBudget.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg border-t border-gray-200 pt-2 mt-2">
                        <span className="font-bold text-gray-900">TOTAL BUDGET:</span>
                        <span className="font-bold text-primary-DEFAULT">${formData.totalBudget.toFixed(2)}</span>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Maximum Reach:</p>
                    <p className="text-xl font-bold text-gray-900">{maxViews.toLocaleString()} views</p>
                </div>
            </div>

            {/* Creator Availability */}
            <div className="p-6 bg-primary-50 rounded-xl border border-primary-100">
                <h4 className="font-bold text-gray-900 mb-2">👥 Estimated Creators</h4>
                <p className="text-gray-700">45+ creators match your criteria</p>
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
