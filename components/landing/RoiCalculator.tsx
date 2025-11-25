"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DollarSign, Video, Eye, RefreshCw, TrendingUp, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RoiCalculator() {
    const [userType, setUserType] = useState<'founder' | 'creator'>('founder');
    const [showRefundInfo, setShowRefundInfo] = useState(false);

    // Founder State
    const [founderBudget, setFounderBudget] = useState(100);
    const [founderVideoCount, setFounderVideoCount] = useState(1);
    const [targetViews, setTargetViews] = useState(0);

    // Creator State
    const [creatorVideoCount, setCreatorVideoCount] = useState(5);
    const [viewsPerVideo, setViewsPerVideo] = useState(5000);

    // Constants
    const MIN_BUDGET = 100; // Minimum budget $100
    const FOUNDER_RATE_PER_1000_VIEWS = 5; // $5 per 1000 views
    const BASE_VIDEO_COST_BULK = 20; // $20 per video for 5+ videos
    const BASE_VIDEO_COST_SMALL = 25; // $25 per video for <5 videos
    const CREATOR_RATE_PER_1000_VIEWS = 15; // Fixed $15 CPM for creators
    const AVG_VIEWS_PER_VIDEO = 2500;

    // Dynamic base fee calculation
    const getBaseFeePerVideo = (videoCount: number) => {
        return videoCount >= 5 ? BASE_VIDEO_COST_BULK : BASE_VIDEO_COST_SMALL;
    };

    // Handlers for decoupled inputs
    const handleBudgetChange = (newBudget: number) => {
        // Constraint: Budget cannot be less than MIN_BUDGET or Base Cost of current videos
        const baseFeePerVideo = getBaseFeePerVideo(founderVideoCount);
        const minBudgetForVideos = founderVideoCount * baseFeePerVideo;
        const actualBudget = Math.max(newBudget, MIN_BUDGET, minBudgetForVideos);

        setFounderBudget(actualBudget);

        // Calculate Views based on remaining budget (Videos constant)
        const remainingBudget = actualBudget - minBudgetForVideos;
        const newViews = Math.floor((remainingBudget / FOUNDER_RATE_PER_1000_VIEWS) * 1000);
        setTargetViews(Math.max(0, newViews));
    };

    const handleVideoChange = (newVideoCount: number) => {
        setFounderVideoCount(newVideoCount);

        // Budget is fixed (unless too low)
        const baseFeePerVideo = getBaseFeePerVideo(newVideoCount);
        const baseCost = newVideoCount * baseFeePerVideo;
        let currentBudget = founderBudget;

        // Ensure budget meets minimum requirements
        const requiredMinBudget = Math.max(MIN_BUDGET, baseCost);
        if (currentBudget < requiredMinBudget) {
            currentBudget = requiredMinBudget;
            setFounderBudget(currentBudget);
            setTargetViews(0); // No money left for views
        } else {
            // Recalculate Views with fixed budget
            const remainingBudget = currentBudget - baseCost;
            const newViews = Math.floor((remainingBudget / FOUNDER_RATE_PER_1000_VIEWS) * 1000);
            setTargetViews(Math.max(0, newViews));
        }
    };

    const handleViewsChange = (newViews: number) => {
        setTargetViews(newViews);
        // Videos constant, recalculate Budget
        const newBudget = calculateCost(founderVideoCount, newViews);
        setFounderBudget(newBudget);
    };

    const calculateCost = (videos: number, views: number) => {
        const baseFeePerVideo = getBaseFeePerVideo(videos);
        const baseCost = videos * baseFeePerVideo;
        const perfCost = (views / 1000) * FOUNDER_RATE_PER_1000_VIEWS;
        return Math.max(MIN_BUDGET, Math.round(baseCost + perfCost));
    };

    // Creator Calculations
    const creatorEarnings = Math.floor((creatorVideoCount * viewsPerVideo * CREATOR_RATE_PER_1000_VIEWS) / 1000);

    const organicViews = founderVideoCount * AVG_VIEWS_PER_VIDEO;
    // Refund if Target > Organic (Paid performance not met)
    const refundAmount = targetViews > organicViews
        ? Math.floor(((targetViews - organicViews) / targetViews) * founderBudget)
        : 0;

    return (
        <section id="calculator" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-br from-primary-50 to-white rounded-3xl p-8 md:p-12 lg:p-16 border border-primary-100 shadow-lg">
                    <div className="grid lg:grid-cols-2 gap-12 items-start">

                        {/* Left Side: Controls */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                    Calculate Your ROI
                                </h2>
                                <p className="text-lg text-gray-600">
                                    See exactly what you can achieve with Nala's performance-driven platform.
                                </p>
                            </div>

                            {/* Toggle */}
                            <div className="bg-gray-100 p-1.5 rounded-xl inline-flex border border-gray-200">
                                <button
                                    onClick={() => setUserType('founder')}
                                    className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${userType === 'founder'
                                        ? 'bg-white text-primary-600 shadow-sm ring-1 ring-black/5'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Founder Mode
                                </button>
                                <button
                                    onClick={() => setUserType('creator')}
                                    className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${userType === 'creator'
                                        ? 'bg-white text-primary-600 shadow-sm ring-1 ring-black/5'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Creator Mode
                                </button>
                            </div>

                            <AnimatePresence mode='wait'>
                                {userType === 'founder' ? (
                                    <motion.div
                                        key="founder-inputs"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 flex justify-between">
                                                <span>Total Budget (USD)</span>
                                                <span className="text-primary-600 font-bold">${founderBudget.toLocaleString()}</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="100"
                                                max="5000"
                                                step="50"
                                                value={founderBudget}
                                                onChange={(e) => handleBudgetChange(Number(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 flex justify-between">
                                                <span>Number of Videos</span>
                                                <span className="text-primary-600 font-bold">{founderVideoCount}</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="1"
                                                max="50"
                                                step="1"
                                                value={founderVideoCount}
                                                onChange={(e) => handleVideoChange(Number(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                            />
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>1 Video</span>
                                                <span>50 Videos</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 flex justify-between">
                                                <span>Target Views</span>
                                                <span className="text-primary-600 font-bold">{targetViews.toLocaleString()}</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="1000"
                                                max="200000"
                                                step="1000"
                                                value={targetViews}
                                                onChange={(e) => handleViewsChange(Number(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                            />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="creator-inputs"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 flex justify-between">
                                                <span>Number of Videos</span>
                                                <span className="text-primary-600 font-bold">{creatorVideoCount}</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="1"
                                                max="50"
                                                step="1"
                                                value={creatorVideoCount}
                                                onChange={(e) => setCreatorVideoCount(Number(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 flex justify-between">
                                                <span>Avg. Views per Video</span>
                                                <span className="text-primary-600 font-bold">{viewsPerVideo.toLocaleString()}</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="1000"
                                                max="100000"
                                                step="1000"
                                                value={viewsPerVideo}
                                                onChange={(e) => setViewsPerVideo(Number(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Right Side: Results Card */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-primary-500"></div>

                            <div className="space-y-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                                        {userType === 'founder' ? <TrendingUp className="h-6 w-6" /> : <DollarSign className="h-6 w-6" />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {userType === 'founder' ? 'Campaign Projection' : 'Estimated Earnings'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {userType === 'founder' ? 'Based on your targets' : 'Based on your performance'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    {userType === 'founder' ? (
                                        <>
                                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4" /> Est. Cost
                                                </div>
                                                <div className="text-3xl font-bold text-gray-900">
                                                    ${founderBudget.toLocaleString()}
                                                </div>
                                            </div>

                                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                                                    <Eye className="w-4 h-4" /> Est. Views
                                                </div>
                                                <div className="text-3xl font-bold text-gray-900">
                                                    {targetViews.toLocaleString()}
                                                </div>

                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 col-span-2">
                                                <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4" /> Total Payout
                                                </div>
                                                <div className="text-4xl font-bold text-primary-600">
                                                    ${creatorEarnings.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    ${((creatorVideoCount * viewsPerVideo * CREATOR_RATE_PER_1000_VIEWS) / 1000 / creatorVideoCount).toFixed(2)} per video avg.
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Budget Breakdown - Visible for Founders */}
                                {userType === 'founder' && (
                                    <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                                        <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" />
                                            Budget Breakdown
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Base Fee ({founderVideoCount} × ${getBaseFeePerVideo(founderVideoCount)})</span>
                                                <span className="font-semibold text-gray-900">${(founderVideoCount * getBaseFeePerVideo(founderVideoCount)).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Performance Budget</span>
                                                <span className="font-semibold text-gray-900">${(founderBudget - (founderVideoCount * getBaseFeePerVideo(founderVideoCount))).toLocaleString()}</span>
                                            </div>
                                            <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                                                <span className="font-semibold text-gray-700">Total Budget</span>
                                                <span className="font-bold text-primary-600 text-lg">${founderBudget.toLocaleString()}</span>
                                            </div>
                                            {founderVideoCount >= 5 && (
                                                <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                                                    <p className="text-xs text-green-700 flex items-center gap-1">
                                                        <TrendingUp className="w-3 h-3" />
                                                        <span className="font-medium">Bulk discount applied!</span> $20/video for 5+ videos
                                                    </p>
                                                </div>
                                            )}
                                            {founderVideoCount < 5 && (
                                                <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                                    <p className="text-xs text-blue-700">
                                                        💡 Order 5+ videos to get $20/video (save $5 per video!)
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {userType === 'founder' && refundAmount > 0 && (
                                    <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-start gap-3 relative">
                                        <RefreshCw className="w-5 h-5 text-green-600 mt-0.5" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <div className="font-semibold text-green-900">Refund Guarantee</div>
                                                <button
                                                    onClick={() => setShowRefundInfo(!showRefundInfo)}
                                                    className="text-green-600 hover:text-green-800 transition-colors"
                                                >
                                                    <HelpCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-sm text-green-700 mt-1">
                                                If target views aren't met, you'd be refunded approximately <span className="font-bold">${refundAmount.toLocaleString()}</span>.
                                            </p>
                                        </div>

                                        {/* Refund Info Overlay */}
                                        <AnimatePresence>
                                            {showRefundInfo && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute bottom-full left-0 right-0 mb-2 p-4 bg-white rounded-xl shadow-xl border border-gray-200 z-10 text-sm text-gray-600"
                                                >
                                                    <p className="mb-2">
                                                        The refund amount is subject to the number of views achieved. The number of views achieved during the campaign will be deducted from the amount.
                                                    </p>
                                                    <div className="bg-gray-50 p-3 rounded-lg text-xs">
                                                        <span className="font-semibold block mb-1">Example:</span>
                                                        With a $100 budget and 1 video, if you achieved 8,000 views (out of 15,000 target), your refund would be approximately <span className="font-bold text-gray-900">$47</span>.
                                                    </div>
                                                    <button
                                                        onClick={() => setShowRefundInfo(false)}
                                                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        ×
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                <div className="pt-6 border-t border-gray-100">
                                    <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-lg h-12 text-lg shadow-lg hover:shadow-xl transition-all">
                                        {userType === 'founder' ? 'Start Campaign Risk-Free' : 'Start Earning Today'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
