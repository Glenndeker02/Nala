"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RevenueCalculatorProps {
    targetViews: number;
}

export default function RevenueCalculator({ targetViews }: RevenueCalculatorProps) {
    const [appType, setAppType] = useState<'saas' | 'mobile'>('mobile');
    const [downloadRate, setDownloadRate] = useState(3);
    const [paidConversionRate, setPaidConversionRate] = useState(2);
    const [monthlyPrice, setMonthlyPrice] = useState(20);
    const [monthlyChurnRate, setMonthlyChurnRate] = useState(15);
    const [showMonthlyTable, setShowMonthlyTable] = useState(false);
    const [revenueProjection, setRevenueProjection] = useState<any>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        if (targetViews > 0) {
            calculateRevenueProjection();
        }
    }, [targetViews, downloadRate, paidConversionRate, monthlyPrice, monthlyChurnRate]);

    const calculateRevenueProjection = async () => {
        if (targetViews === 0) return;

        setIsCalculating(true);
        try {
            const response = await fetch('/api/revenue-projection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    impressions: targetViews,
                    downloadRate,
                    paidConversionRate,
                    monthlyPrice,
                    monthlyChurnRate,
                    months: 12
                })
            });

            if (response.ok) {
                const data = await response.json();
                setRevenueProjection(data);
            }
        } catch (error) {
            console.error('Failed to calculate revenue projection:', error);
        } finally {
            setIsCalculating(false);
        }
    };

    const handleNumberInput = (value: string, setter: (val: number) => void) => {
        if (value === '' || value === null || value === undefined) {
            setter(0);
            return;
        }
        const num = parseFloat(value);
        if (!isNaN(num)) {
            setter(num);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-gradient-to-br from-primary-50 to-white rounded-2xl p-4 md:p-5 border border-primary-100 shadow-lg"
        >
            <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Revenue Projection Calculator</h3>
                <p className="text-xs text-gray-600">See how your {targetViews.toLocaleString()} views translate into revenue</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
                <div className="space-y-3">
                    <div className="bg-gray-100 p-1 rounded-xl inline-flex border border-gray-200 w-full">
                        <button
                            onClick={() => setAppType('mobile')}
                            className={`flex-1 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${appType === 'mobile' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
                                }`}
                        >
                            Mobile App
                        </button>
                        <button
                            onClick={() => setAppType('saas')}
                            className={`flex-1 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${appType === 'saas' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
                                }`}
                        >
                            SaaS
                        </button>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-900">Impressions / Views</label>
                        <div className="p-2 bg-gray-100 rounded-lg border border-gray-200">
                            <p className="text-lg font-bold text-primary-600">{targetViews.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Auto-filled from ROI calculator</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-900">
                            {appType === 'saas' ? 'Signup Rate' : 'App Download Rate'} (%)
                        </label>
                        <input
                            type="number"
                            min="0.1"
                            max="100"
                            step="0.1"
                            value={downloadRate || ''}
                            onChange={(e) => handleNumberInput(e.target.value, setDownloadRate)}
                            placeholder="3"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-base font-medium text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-900">Paid Conversion Rate (%)</label>
                        <input
                            type="number"
                            min="0.1"
                            max="100"
                            step="0.1"
                            value={paidConversionRate || ''}
                            onChange={(e) => handleNumberInput(e.target.value, setPaidConversionRate)}
                            placeholder="2"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-base font-medium text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-900">Average Monthly Price ($)</label>
                        <input
                            type="number"
                            min="1"
                            max="1000"
                            step="1"
                            value={monthlyPrice || ''}
                            onChange={(e) => handleNumberInput(e.target.value, setMonthlyPrice)}
                            placeholder="20"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-base font-medium text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-900">Monthly Churn Rate (%)</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={monthlyChurnRate || ''}
                            onChange={(e) => handleNumberInput(e.target.value, setMonthlyChurnRate)}
                            placeholder="15"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-base font-medium text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 relative">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-500"></div>
                    <h4 className="text-base font-bold text-gray-900 mb-3 mt-1">Summary</h4>

                    {revenueProjection ? (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                                <span className="text-xs text-gray-600">Impressions:</span>
                                <span className="text-sm font-bold text-gray-900">
                                    {revenueProjection.summary.impressions.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                                <span className="text-xs text-gray-600">
                                    {appType === 'saas' ? 'Signups:' : 'Downloads:'}
                                </span>
                                <span className="text-sm font-bold text-gray-900">
                                    {revenueProjection.summary.downloads.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                                <span className="text-xs text-gray-600">Paying Customers:</span>
                                <span className="text-sm font-bold text-gray-900">
                                    {revenueProjection.summary.payingCustomers}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 bg-primary-50 rounded-lg px-2 mt-2">
                                <span className="text-xs font-semibold text-primary-900">New Revenue:</span>
                                <span className="text-lg font-bold text-primary-600">
                                    ${revenueProjection.summary.newRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            <button
                                onClick={() => setShowMonthlyTable(!showMonthlyTable)}
                                className="w-full mt-3 py-2 px-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2"
                            >
                                {showMonthlyTable ? (
                                    <>
                                        <ChevronUp className="w-3.5 h-3.5" />
                                        Hide 12 Months Income
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-3.5 h-3.5" />
                                        Show 12 Months Income
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-500 text-sm">
                            {isCalculating ? 'Calculating...' : 'Adjust parameters to see projection'}
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showMonthlyTable && revenueProjection && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 overflow-hidden"
                    >
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Month</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Total Impressions</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                            Total {appType === 'saas' ? 'Signups' : 'Downloads'}
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">New Customers</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Lost Customers</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Total Customers</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">MRR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {revenueProjection.monthlyData.map((month: any) => (
                                        <tr key={month.month} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{month.month}</td>
                                            <td className="px-4 py-3 text-gray-700">{month.totalImpressions.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-gray-700">{month.totalDownloads.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-gray-700">{month.newCustomers}</td>
                                            <td className="px-4 py-3 text-gray-700">{month.lostCustomers}</td>
                                            <td className="px-4 py-3 font-semibold text-gray-900">{month.totalCustomers}</td>
                                            <td className="px-4 py-3 font-semibold text-primary-600">
                                                ${month.mrr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
