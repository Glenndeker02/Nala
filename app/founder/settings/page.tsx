"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

// Icons (using simple SVG if lucide not guaranteed, but usually is. I'll use SVGs to be safe)
const Icons = {
    User: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Building: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    CreditCard: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    Shield: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Settings: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Star: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
};

export default function FounderSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        // User fields
        fullName: "",
        email: "",
        companyName: "",

        // Profile fields
        businessType: "",
        website: "",
        industry: "",
        address: { street: "", city: "", state: "", zip: "", country: "" },
        socialLinks: { linkedin: "", twitter: "", instagram: "" },

        // Settings
        settings: {
            darkMode: false,
            emailNotifications: true,
            marketingEmails: false,
        },

        // Product Specific
        campaignDefaults: {
            defaultPlatform: "TIKTOK",
            defaultDuration: "30",
        },

        // Password (only for update)
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [founderScore, setFounderScore] = useState(50);
    const [stripeConnected, setStripeConnected] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("/api/founder/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                const profile = data.founderProfile || {};

                setFormData({
                    ...formData,
                    fullName: data.fullName || "",
                    email: data.email || "",
                    companyName: data.companyName || "",
                    businessType: profile.businessType || "",
                    website: profile.website || "",
                    industry: profile.industry || "",
                    address: { ...formData.address, ...(profile.address || {}) },
                    socialLinks: { ...formData.socialLinks, ...(profile.socialLinks || {}) },
                    settings: { ...formData.settings, ...(profile.settings || {}) },
                    campaignDefaults: { ...formData.campaignDefaults, ...(profile.campaignDefaults || {}) },
                });

                setFounderScore(profile.founderScore || 50);
                setStripeConnected(!!data.stripeCustomerId); // Assuming customer ID means connected for billing
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            setMessage({ type: 'error', text: 'Failed to load profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            setSaving(false);
            return;
        }

        const token = localStorage.getItem("token");
        try {
            const response = await fetch("/api/founder/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    address: JSON.stringify(formData.address),
                    socialLinks: JSON.stringify(formData.socialLinks),
                    settings: JSON.stringify(formData.settings),
                    campaignDefaults: JSON.stringify(formData.campaignDefaults),
                }),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Settings updated successfully!' });
                // Clear password fields
                setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
            } else {
                const data = await response.json();
                setMessage({ type: 'error', text: data.error || 'Failed to update settings' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const handleConnectStripe = () => {
        // Placeholder for Stripe Connect flow
        alert("Redirecting to Stripe...");
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
        if (score >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-200";
        return "bg-red-100 text-red-800 border-red-200";
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
                    <p className="mt-2 text-gray-600">Manage your account, business details, and preferences.</p>
                </div>

                {/* Message Banner */}
                {message && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center justify-between ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                        <span className="font-medium">{message.text}</span>
                        <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600">×</button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Founder Score Card */}
                    <Card className="border-l-4 border-l-primary-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-2">
                                <Icons.Star />
                                <CardTitle className="text-lg">Founder Ranking Score</CardTitle>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getScoreColor(founderScore)}`}>
                                Score: {founderScore}/100
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">
                                Your Nala Score reflects your reputation based on payment history, communication, and campaign success rates.
                                Higher scores unlock premium creator tiers and lower platform fees.
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Main Info */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Business Details Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Icons.Building />
                                        <CardTitle>Business Details</CardTitle>
                                    </div>
                                    <CardDescription>Your company information used for campaigns and billing.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                            <Input
                                                value={formData.companyName}
                                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                            <Input
                                                value={formData.website}
                                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                placeholder="https://"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                                            <Input
                                                value={formData.industry}
                                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                                placeholder="e.g. SaaS, E-commerce"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                                            <Input
                                                value={formData.businessType}
                                                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                                                placeholder="e.g. B2B, B2C"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Address</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <Input
                                                    placeholder="Street Address"
                                                    value={formData.address.street}
                                                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                                                />
                                            </div>
                                            <Input
                                                placeholder="City"
                                                value={formData.address.city}
                                                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                                            />
                                            <Input
                                                placeholder="State/Province"
                                                value={formData.address.state}
                                                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                                            />
                                            <Input
                                                placeholder="ZIP/Postal Code"
                                                value={formData.address.zip}
                                                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zip: e.target.value } })}
                                            />
                                            <Input
                                                placeholder="Country"
                                                value={formData.address.country}
                                                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Social Links</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Input
                                                placeholder="LinkedIn URL"
                                                value={formData.socialLinks.linkedin}
                                                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value } })}
                                            />
                                            <Input
                                                placeholder="Twitter/X URL"
                                                value={formData.socialLinks.twitter}
                                                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })}
                                            />
                                            <Input
                                                placeholder="Instagram URL"
                                                value={formData.socialLinks.instagram}
                                                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Login & Security Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Icons.Shield />
                                        <CardTitle>Login & Security</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <Input
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Change Password</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Input
                                                type="password"
                                                placeholder="Current Password"
                                                value={formData.currentPassword}
                                                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                            />
                                            <Input
                                                type="password"
                                                placeholder="New Password"
                                                value={formData.newPassword}
                                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                            />
                                            <Input
                                                type="password"
                                                placeholder="Confirm New Password"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Settings & Billing */}
                        <div className="space-y-6">

                            {/* Stripe Connection Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Icons.CreditCard />
                                        <CardTitle>Billing & Payouts</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm text-gray-600">Connection Status</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${stripeConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {stripeConnected ? 'Connected' : 'Not Connected'}
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant={stripeConnected ? "outline" : "default"}
                                        className="w-full"
                                        onClick={handleConnectStripe}
                                    >
                                        {stripeConnected ? 'Manage Billing Settings' : 'Connect Stripe'}
                                    </Button>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Securely processed by Stripe. Used for campaign payments and refunds.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Customization Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Icons.Settings />
                                        <CardTitle>Preferences</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">Dark Mode</span>
                                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                            <input
                                                type="checkbox"
                                                name="toggle"
                                                id="darkMode"
                                                checked={formData.settings.darkMode}
                                                onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, darkMode: e.target.checked } })}
                                                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                                style={{ right: formData.settings.darkMode ? '0' : 'auto', left: formData.settings.darkMode ? 'auto' : '0' }}
                                            />
                                            <label htmlFor="darkMode" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${formData.settings.darkMode ? 'bg-primary-600' : 'bg-gray-300'}`}></label>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">Email Notifications</span>
                                        <input
                                            type="checkbox"
                                            checked={formData.settings.emailNotifications}
                                            onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, emailNotifications: e.target.checked } })}
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">Marketing Emails</span>
                                        <input
                                            type="checkbox"
                                            checked={formData.settings.marketingEmails}
                                            onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, marketingEmails: e.target.checked } })}
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Product Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Campaign Defaults</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Platform</label>
                                        <select
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                                            value={formData.campaignDefaults.defaultPlatform}
                                            onChange={(e) => setFormData({ ...formData, campaignDefaults: { ...formData.campaignDefaults, defaultPlatform: e.target.value } })}
                                        >
                                            <option value="TIKTOK">TikTok</option>
                                            <option value="INSTAGRAM">Instagram</option>
                                            <option value="FACEBOOK">Facebook</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Duration (Days)</label>
                                        <Input
                                            type="number"
                                            value={formData.campaignDefaults.defaultDuration}
                                            onChange={(e) => setFormData({ ...formData, campaignDefaults: { ...formData.campaignDefaults, defaultDuration: e.target.value } })}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Save Button (Sticky or just at bottom) */}
                            <div className="pt-4">
                                <Button type="submit" className="w-full" size="lg" disabled={saving}>
                                    {saving ? 'Saving Changes...' : 'Save All Changes'}
                                </Button>
                            </div>

                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}
