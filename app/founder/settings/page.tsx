"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function FounderSettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        companyName: "",
        website: "",
    });

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setFormData({
                fullName: parsedUser.fullName || "",
                email: parsedUser.email || "",
                companyName: parsedUser.companyName || "",
                website: parsedUser.website || "",
            });
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const token = localStorage.getItem("token");
        try {
            const response = await fetch("/api/user/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                // Update local storage
                localStorage.setItem("user", JSON.stringify({ ...user, ...formData }));
                setMessage({ type: 'success', text: 'Settings updated successfully!' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update settings' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main>
                <div className="max-w-4xl mx-auto py-8 sm:px-6 lg:px-8">
                    <div className="px-4 sm:px-0">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
                            <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
                        </div>

                        {/* Message Banner */}
                        {message && (
                            <div className={`mb-6 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        {message.type === 'success' ? (
                                            <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                                            {message.text}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setMessage(null)}
                                        className="ml-auto text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Account Settings Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                                Full Name
                                            </label>
                                            <Input
                                                id="fullName"
                                                type="text"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                Email Address
                                            </label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                                                Company Name
                                            </label>
                                            <Input
                                                id="companyName"
                                                type="text"
                                                value={formData.companyName}
                                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                                                Website
                                            </label>
                                            <Input
                                                id="website"
                                                type="url"
                                                value={formData.website}
                                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-gray-100">
                                        <Button type="submit" disabled={loading} size="lg">
                                            {loading ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Additional Settings Cards */}
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Account Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Account Type</p>
                                        <p className="text-sm text-gray-600 mt-1">Founder Account</p>
                                    </div>
                                    <div className="px-3 py-1 bg-primary-50 text-primary-DEFAULT rounded-full text-sm font-medium border border-primary-200">
                                        Active
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
