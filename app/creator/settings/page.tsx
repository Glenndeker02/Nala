"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

// Icons
const Icons = {
    User: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Video: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    CreditCard: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    Shield: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Settings: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Star: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    Link: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
};

export default function CreatorSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        // User fields
        fullName: "",
        email: "",

        // Creator Profile fields
        bio: "",
        categories: [] as string[],
        location: "",
        timezone: "",

        // Social Links
        socialLinks: {
            tiktok: "",
            instagram: "",
            youtube: "",
            twitter: ""
        },

        // Portfolio
        portfolioLinks: [] as string[],

        // Preferences
        preferredPlatforms: [] as string[],
        preferredIndustries: [] as string[],
        minBaseFee: "",

        // Settings
        settings: {
            darkMode: false,
            emailNotifications: true,
            smsNotifications: false,
            marketingEmails: false,
        },

        // Password (only for update)
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [creatorScore, setCreatorScore] = useState(50);
    const [stripeConnected, setStripeConnected] = useState(false);
    const [socialConnections, setSocialConnections] = useState({
        tiktok: false,
        instagram: false,
        youtube: false
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("/api/creator/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const result = await response.json();
                const data = result.data || result;
                const profile = data.creatorProfile || {};

                setFormData({
                    ...formData,
                    fullName: data.fullName || "",
                    email: data.email || "",
                    bio: profile.bio || "",
                    categories: profile.categories || [],
                    location: profile.location || "",
                    timezone: profile.timezone || "",
                    socialLinks: { ...formData.socialLinks, ...(profile.socialLinks || {}) },
                    portfolioLinks: profile.portfolioLinks || [],
                    preferredPlatforms: profile.preferredPlatforms || [],
                    preferredIndustries: profile.preferredIndustries || [],
                    minBaseFee: profile.minBaseFee?.toString() || "",
                    settings: { ...formData.settings, ...(profile.settings || {}) },
                });

                setCreatorScore(profile.creatorScore || 50);
                setStripeConnected(!!data.stripeAccountId);

                // Check social connections
                const connectionsResponse = await fetch("/api/creator/connections", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (connectionsResponse.ok) {
                    const connectionsData = await connectionsResponse.json();
                    setSocialConnections({
                        tiktok: connectionsData.some((c: any) => c.platform === 'TIKTOK'),
                        instagram: connectionsData.some((c: any) => c.platform === 'INSTAGRAM'),
                        youtube: connectionsData.some((c: any) => c.platform === 'YOUTUBE')
                    });
                }
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
            const response = await fetch("/api/creator/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
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

    const handleConnectStripe = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("/api/stripe/connect/onboard", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                window.location.href = data.url;
            }
        } catch (error) {
            console.error("Error connecting Stripe:", error);
            alert("Failed to connect Stripe. Please try again.");
        }
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
                    <p className="mt-2 text-gray-600">Manage your profile, preferences, and account settings.</p>
                </div>

                {/* Message Banner */}
                {message && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center justify-between ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                        <span className="font-medium">{message.text}</span>
                        <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600">×</button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Creator Score Card */}
                    <Card className="border-l-4 border-l-primary-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-2">
                                <Icons.Star />
                                <CardTitle className="text-lg">Creator Ranking Score</CardTitle>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getScoreColor(creatorScore)}`}>
                                Score: {creatorScore}/100
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">
                                Your Creator Score reflects your performance, reliability, and content quality.
                                Higher scores unlock premium campaigns and better earnings opportunities.
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Main Info */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Profile Details Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Icons.User />
                                        <CardTitle>Profile Details</CardTitle>
                                    </div>
                                    <CardDescription>Your public creator profile information.</CardDescription>
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

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                        <textarea
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-offset-2"
                                            rows={4}
                                            placeholder="Tell founders about yourself and your content style..."
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                            <Input
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                placeholder="City, Country"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                                            <Input
                                                value={formData.timezone}
                                                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                                placeholder="e.g. America/New_York"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Social Media Profiles</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                                placeholder="TikTok Username"
                                                value={formData.socialLinks.tiktok}
                                                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, tiktok: e.target.value } })}
                                            />
                                            <Input
                                                placeholder="Instagram Username"
                                                value={formData.socialLinks.instagram}
                                                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value } })}
                                            />
                                            <Input
                                                placeholder="YouTube Channel"
                                                value={formData.socialLinks.youtube}
                                                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, youtube: e.target.value } })}
                                            />
                                            <Input
                                                placeholder="Twitter/X Handle"
                                                value={formData.socialLinks.twitter}
                                                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Content Preferences Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Icons.Video />
                                        <CardTitle>Content Preferences</CardTitle>
                                    </div>
                                    <CardDescription>Set your preferred platforms, industries, and minimum rates.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Base Fee</label>
                                        <Input
                                            type="number"
                                            value={formData.minBaseFee}
                                            onChange={(e) => setFormData({ ...formData, minBaseFee: e.target.value })}
                                            placeholder="e.g. 50"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Only see campaigns above this amount</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Categories</label>
                                        <p className="text-xs text-gray-500 mb-2">Select industries you specialize in</p>
                                        <div className="flex flex-wrap gap-2">
                                            {["SaaS & Software", "E-commerce", "Health & Fitness", "Beauty & Cosmetics", "Finance & Fintech", "B2B Tech"].map(cat => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => {
                                                        const newCats = formData.categories.includes(cat)
                                                            ? formData.categories.filter(c => c !== cat)
                                                            : [...formData.categories, cat];
                                                        setFormData({ ...formData, categories: newCats });
                                                    }}
                                                    className={`px-3 py-1 rounded-full text-sm border ${formData.categories.includes(cat)
                                                            ? 'bg-primary-DEFAULT text-white border-primary-DEFAULT'
                                                            : 'bg-white text-gray-700 border-gray-300'
                                                        }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
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

                        {/* Right Column - Settings & Connections */}
                        <div className="space-y-6">

                            {/* Social Connections Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Icons.Link />
                                        <CardTitle>Social Connections</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">TikTok</span>
                                            <Badge variant={socialConnections.tiktok ? "default" : "secondary"}>
                                                {socialConnections.tiktok ? "Connected" : "Not Connected"}
                                            </Badge>
                                        </div>
                                        <Link href="/creator/settings/connect">
                                            <Button type="button" variant="outline" size="sm">
                                                {socialConnections.tiktok ? "Manage" : "Connect"}
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">Instagram</span>
                                            <Badge variant={socialConnections.instagram ? "default" : "secondary"}>
                                                {socialConnections.instagram ? "Connected" : "Not Connected"}
                                            </Badge>
                                        </div>
                                        <Link href="/creator/settings/connect">
                                            <Button type="button" variant="outline" size="sm">
                                                {socialConnections.instagram ? "Manage" : "Connect"}
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">YouTube</span>
                                            <Badge variant={socialConnections.youtube ? "default" : "secondary"}>
                                                {socialConnections.youtube ? "Connected" : "Not Connected"}
                                            </Badge>
                                        </div>
                                        <Link href="/creator/settings/connect">
                                            <Button type="button" variant="outline" size="sm">
                                                {socialConnections.youtube ? "Manage" : "Connect"}
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Stripe Connection Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Icons.CreditCard />
                                        <CardTitle>Payouts</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm text-gray-600">Stripe Status</span>
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
                                        {stripeConnected ? 'Manage Payouts' : 'Connect Stripe'}
                                    </Button>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Securely receive your earnings via Stripe.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Preferences Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Icons.Settings />
                                        <CardTitle>Preferences</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
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
                                        <span className="text-sm text-gray-700">SMS Notifications</span>
                                        <input
                                            type="checkbox"
                                            checked={formData.settings.smsNotifications}
                                            onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, smsNotifications: e.target.checked } })}
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

                            {/* Save Button */}
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
