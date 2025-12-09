'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface AttributionSettingsProps {
    campaignId: string;
    initialSettings?: {
        enableCreatorCodes: boolean;
        autoGenerateCodes: boolean;
        conversionCommission: number | null;
        codeDiscountType: string | null;
        codeDiscountValue: number | null;
        attributionWindowDays: number;
    };
    onUpdate?: () => void;
}

export default function AttributionSettings({ campaignId, initialSettings, onUpdate }: AttributionSettingsProps) {
    const [settings, setSettings] = useState({
        enableCreatorCodes: initialSettings?.enableCreatorCodes ?? false,
        autoGenerateCodes: initialSettings?.autoGenerateCodes ?? true,
        conversionCommission: initialSettings?.conversionCommission ?? 5,
        codeDiscountType: initialSettings?.codeDiscountType ?? 'PERCENTAGE',
        codeDiscountValue: initialSettings?.codeDiscountValue ?? 10,
        attributionWindowDays: initialSettings?.attributionWindowDays ?? 30
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/campaigns/${campaignId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    enableCreatorCodes: settings.enableCreatorCodes,
                    autoGenerateCodes: settings.autoGenerateCodes,
                    conversionCommission: settings.conversionCommission,
                    codeDiscountType: settings.codeDiscountType,
                    codeDiscountValue: settings.codeDiscountValue,
                    attributionWindowDays: settings.attributionWindowDays
                })
            });

            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
                onUpdate?.();
            }
        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setSaving(false);
        }
    };

    const discountLabel = settings.codeDiscountType === 'PERCENTAGE'
        ? `${settings.codeDiscountValue}% off`
        : settings.codeDiscountType === 'FIXED_AMOUNT'
            ? `$${settings.codeDiscountValue} off`
            : settings.codeDiscountType === 'FREE_TRIAL'
                ? `${settings.codeDiscountValue} days free trial`
                : 'Free month';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    Creator Attribution
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Toggle Enable */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900">Enable Creator Codes</p>
                        <p className="text-sm text-gray-600">Allow tracking conversions via unique codes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.enableCreatorCodes}
                            onChange={(e) => setSettings({ ...settings, enableCreatorCodes: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                </div>

                {settings.enableCreatorCodes && (
                    <>
                        <hr />

                        {/* Auto-generate */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Auto-generate on Acceptance</p>
                                <p className="text-sm text-gray-600">Generate codes when creators are accepted</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.autoGenerateCodes}
                                    onChange={(e) => setSettings({ ...settings, autoGenerateCodes: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>

                        {/* Discount Settings */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                                <select
                                    value={settings.codeDiscountType}
                                    onChange={(e) => setSettings({ ...settings, codeDiscountType: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="PERCENTAGE">Percentage</option>
                                    <option value="FIXED_AMOUNT">Fixed Amount</option>
                                    <option value="FREE_TRIAL">Free Trial Days</option>
                                    <option value="FREE_MONTH">Free Month</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {settings.codeDiscountType === 'PERCENTAGE' ? 'Discount %' :
                                        settings.codeDiscountType === 'FIXED_AMOUNT' ? 'Amount ($)' :
                                            settings.codeDiscountType === 'FREE_TRIAL' ? 'Trial Days' : 'Months'}
                                </label>
                                <input
                                    type="number"
                                    value={settings.codeDiscountValue}
                                    onChange={(e) => setSettings({ ...settings, codeDiscountValue: parseFloat(e.target.value) || 0 })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    min={0}
                                    disabled={settings.codeDiscountType === 'FREE_MONTH'}
                                />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">
                            Users redeeming codes will get: <strong>{discountLabel}</strong>
                        </p>

                        {/* Commission */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Conversion Commission ($)
                            </label>
                            <input
                                type="number"
                                value={settings.conversionCommission}
                                onChange={(e) => setSettings({ ...settings, conversionCommission: parseFloat(e.target.value) || 0 })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                min={0}
                                step={0.50}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Amount paid to creator per successful conversion
                            </p>
                        </div>

                        {/* Attribution Window */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Attribution Window (days)
                            </label>
                            <input
                                type="number"
                                value={settings.attributionWindowDays}
                                onChange={(e) => setSettings({ ...settings, attributionWindowDays: parseInt(e.target.value) || 30 })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                min={1}
                                max={90}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Time after redemption to attribute conversions
                            </p>
                        </div>
                    </>
                )}

                {/* Save Button */}
                <Button onClick={handleSave} disabled={saving} className="w-full">
                    {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Attribution Settings'}
                </Button>
            </CardContent>
        </Card>
    );
}
