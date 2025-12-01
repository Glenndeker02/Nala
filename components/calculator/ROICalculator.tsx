"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { DollarSign, Video, Eye, RefreshCw, TrendingUp, HelpCircle, Save, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectionTable from './ProjectionTable';
import CalculatorCharts from './CalculatorCharts';
import { CalculatorInputs, CalculatorResults } from '@/lib/services/roi-calculator';

interface ROICalculatorProps {
    mode?: 'demo' | 'full';
    initialData?: Partial<CalculatorInputs>;
    campaignId?: string;
}

export default function ROICalculator({ mode = 'demo', initialData, campaignId }: ROICalculatorProps) {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<CalculatorResults | null>(null);

    // Inputs
    const [budget, setBudget] = useState(initialData?.budget || 1000);
    const [videoCount, setVideoCount] = useState(initialData?.videos || 5);
    const [views, setViews] = useState(initialData?.views || 150000);

    // Business Metrics
    const [downloadRate, setDownloadRate] = useState(initialData?.downloadRate || 3);
    const [conversionRate, setConversionRate] = useState(initialData?.conversionRate || 2);
    const [averagePrice, setAveragePrice] = useState(initialData?.averagePrice || 20);
    const [churnRate, setChurnRate] = useState(initialData?.churnRate || 15);

    // Constants
    const MIN_BUDGET = 100;
    const FOUNDER_RATE_PER_1000_VIEWS = 5;
    const BASE_VIDEO_COST_BULK = 20;
    const BASE_VIDEO_COST_SMALL = 25;

    // Dynamic base fee calculation
    const getBaseFeePerVideo = (count: number) => {
        return count >= 5 ? BASE_VIDEO_COST_BULK : BASE_VIDEO_COST_SMALL;
    };

    // Handlers
    const handleBudgetChange = (newBudget: number) => {
        const baseFeePerVideo = getBaseFeePerVideo(videoCount);
        const minBudgetForVideos = videoCount * baseFeePerVideo;
        const actualBudget = Math.max(newBudget, MIN_BUDGET, minBudgetForVideos);

        setBudget(actualBudget);

        const remainingBudget = actualBudget - minBudgetForVideos;
        const newViews = Math.floor((remainingBudget / FOUNDER_RATE_PER_1000_VIEWS) * 1000);
        setViews(Math.max(0, newViews));
    };

    const handleVideoChange = (newVideoCount: number) => {
        setVideoCount(newVideoCount);
        const baseFeePerVideo = getBaseFeePerVideo(newVideoCount);
        const baseCost = newVideoCount * baseFeePerVideo;

        let currentBudget = budget;
        const requiredMinBudget = Math.max(MIN_BUDGET, baseCost);

        if (currentBudget < requiredMinBudget) {
            currentBudget = requiredMinBudget;
            setBudget(currentBudget);
            setViews(0);
        } else {
            const remainingBudget = currentBudget - baseCost;
            const newViews = Math.floor((remainingBudget / FOUNDER_RATE_PER_1000_VIEWS) * 1000);
            setViews(Math.max(0, newViews));
        }
    };

    const calculateProjections = async () => {
        setLoading(true);
        try {
            const inputs: CalculatorInputs = {
                budget,
                videos: videoCount,
                views,
                downloadRate,
                conversionRate,
                averagePrice,
                churnRate
            };

            if (mode === 'full') {
                // Server-side calculation
                const response = await fetch('/api/calculator/run', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(inputs)
                });
                const data = await response.json();
                setResults(data);
            } else {
                // Client-side simulation for demo (mirroring server logic)
                // Note: In production, even demo could use server API if rate limited
                // For now, let's use the API for consistency as requested "Agent must produce identical numbers server-side"
                const response = await fetch('/api/calculator/run', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(inputs)
                });
                const data = await response.json();
                setResults(data);
            }
        } catch (error) {
            console.error('Calculation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-calculate on debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            calculateProjections();
        }, 500);
        return () => clearTimeout(timer);
    }, [budget, videoCount, views, downloadRate, conversionRate, averagePrice, churnRate]);

    return (
        <div className="space-y-8">
            {/* Calculator Inputs Card */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">ROI Calculator</h2>
                            <p className="text-gray-600">Model your business growth based on campaign performance</p>
                        </div>
                        {mode === 'full' && (
                            <Button variant="outline" className="gap-2">
                                <Save className="w-4 h-4" /> Save Scenario
                            </Button>
                        )}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Left: Campaign Inputs */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <Video className="w-4 h-4 text-primary-600" /> Campaign Settings
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                                        Total Budget <span className="text-primary-600 font-bold">${budget.toLocaleString()}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="100"
                                        max="10000"
                                        step="50"
                                        value={budget}
                                        onChange={(e) => handleBudgetChange(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                    />
                                </div>

                                <div>
                                    <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                                        Videos <span className="text-primary-600 font-bold">{videoCount}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="50"
                                        step="1"
                                        value={videoCount}
                                        onChange={(e) => handleVideoChange(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                    />
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-gray-600">Expected Views</span>
                                        <span className="text-xl font-bold text-gray-900">{views.toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">Based on remaining budget after video production costs</p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Business Metrics */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary-600" /> Business Metrics
                            </h3>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Download Rate (%)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={downloadRate}
                                            onChange={(e) => setDownloadRate(Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                        <span className="absolute right-3 top-2 text-gray-400">%</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Conversion Rate (%)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={conversionRate}
                                            onChange={(e) => setConversionRate(Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                        <span className="absolute right-3 top-2 text-gray-400">%</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Avg. Monthly Price
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-400">$</span>
                                        <input
                                            type="number"
                                            value={averagePrice}
                                            onChange={(e) => setAveragePrice(Number(e.target.value))}
                                            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Monthly Churn (%)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={churnRate}
                                            onChange={(e) => setChurnRate(Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                        <span className="absolute right-3 top-2 text-gray-400">%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Bar */}
                {results && (
                    <div className="bg-primary-50 border-t border-primary-100 p-6 md:p-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-xs text-primary-600 font-semibold uppercase tracking-wider">Downloads</p>
                                <p className="text-2xl font-bold text-gray-900">{results.summary.totalDownloads.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-primary-600 font-semibold uppercase tracking-wider">New Customers</p>
                                <p className="text-2xl font-bold text-gray-900">{results.summary.totalPayingCustomers.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-primary-600 font-semibold uppercase tracking-wider">Initial Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">${results.summary.initialRevenue.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-primary-600 font-semibold uppercase tracking-wider">Month 1 MRR</p>
                                <p className="text-2xl font-bold text-primary-700">${results.summary.month1MRR.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Charts & Table */}
            {results && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <CalculatorCharts projections={results.projections} />
                    <ProjectionTable projections={results.projections} />
                </motion.div>
            )}
        </div>
    );
}
