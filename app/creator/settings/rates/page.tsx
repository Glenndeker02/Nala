"use client";

import React, { useEffect, useState } from "react";
import SettingsLayout from "@/app/components/settings/SettingsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Save, DollarSign } from "lucide-react";

export default function CreatorRatesPage() {
    const [rates, setRates] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchRates();
    }, []);

    const fetchRates = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/settings/creator/rates", {
                headers: { Authorization: `Bearer ${token}` }
            });

            const result = await response.json();
            if (result.success) {
                setRates(result.data);
            }
        } catch (error) {
            console.error("Error fetching rates:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/settings/creator/rates", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(rates)
            });

            const result = await response.json();
            if (result.success) {
                setMessage({ type: 'success', text: 'Platform rates updated successfully!' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to update rates' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred while saving' });
        } finally {
            setSaving(false);
        }
    };

    if (loading || !rates) {
        return (
            <SettingsLayout userRole="CREATOR" activeSection="rates">
                <Card>
                    <CardContent className="p-8">
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                        </div>
                    </CardContent>
                </Card>
            </SettingsLayout>
        );
    }

    return (
        <SettingsLayout userRole="CREATOR" activeSection="rates">
            <Card>
                <CardHeader>
                    <CardTitle>Platform Rates</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                        Set your base fee for each platform. These are the minimum amounts you'll earn per video.
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {message && (
                        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    {/* TikTok Rate */}
                    <div className="p-6 border border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center">
                                <span className="text-white font-bold text-xl">T</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">TikTok</h3>
                                <p className="text-sm text-gray-500">Base fee per video</p>
                            </div>
                        </div>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="number"
                                value={rates.baseFeeTiktok}
                                onChange={(e) => setRates({ ...rates, baseFeeTiktok: parseFloat(e.target.value) })}
                                min="0"
                                step="5"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg font-semibold"
                            />
                        </div>
                    </div>

                    {/* Instagram Rate */}
                    <div className="p-6 border border-gray-200 rounded-lg bg-gradient-to-r from-pink-50 to-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <span className="text-white font-bold text-xl">I</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Instagram</h3>
                                <p className="text-sm text-gray-500">Base fee per video</p>
                            </div>
                        </div>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="number"
                                value={rates.baseFeeInstagram}
                                onChange={(e) => setRates({ ...rates, baseFeeInstagram: parseFloat(e.target.value) })}
                                min="0"
                                step="5"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg font-semibold"
                            />
                        </div>
                    </div>

                    {/* Facebook Rate */}
                    <div className="p-6 border border-gray-200 rounded-lg bg-gradient-to-r from-blue-50 to-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                                <span className="text-white font-bold text-xl">F</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Facebook</h3>
                                <p className="text-sm text-gray-500">Base fee per video</p>
                            </div>
                        </div>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="number"
                                value={rates.baseFeeFacebook}
                                onChange={(e) => setRates({ ...rates, baseFeeFacebook: parseFloat(e.target.value) })}
                                min="0"
                                step="5"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg font-semibold"
                            />
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> These are your base fees. You'll also earn performance bonuses based on video views and engagement. Higher base fees may reduce your chances of being selected for campaigns.
                        </p>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSave} disabled={saving}>
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Rates'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </SettingsLayout>
    );
}

