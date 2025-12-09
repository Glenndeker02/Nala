"use client";

import React, { useEffect, useState } from "react";
import SettingsLayout from "@/app/components/settings/SettingsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Save } from "lucide-react";

export default function NotificationSettingsPage() {
    const [preferences, setPreferences] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [userRole, setUserRole] = useState<"FOUNDER" | "CREATOR">("CREATOR");

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const token = localStorage.getItem("token");

            // Get user role
            const profileResponse = await fetch("/api/settings/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const profileResult = await profileResponse.json();
            if (profileResult.success) {
                setUserRole(profileResult.data.role);
            }

            // Get notification preferences
            const response = await fetch("/api/settings/notifications", {
                headers: { Authorization: `Bearer ${token}` }
            });

            const result = await response.json();
            if (result.success) {
                setPreferences(result.data);
            }
        } catch (error) {
            console.error("Error fetching preferences:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/settings/notifications", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(preferences)
            });

            const result = await response.json();
            if (result.success) {
                setMessage({ type: 'success', text: 'Notification preferences updated!' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to update preferences' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred while saving' });
        } finally {
            setSaving(false);
        }
    };

    if (loading || !preferences) {
        return (
            <SettingsLayout userRole={userRole} activeSection="notifications">
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
        <SettingsLayout userRole={userRole} activeSection="notifications">
            <Card>
                <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {message && (
                        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Email Notifications */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <div>
                                    <p className="font-medium text-gray-900">Campaign Updates</p>
                                    <p className="text-sm text-gray-500">Get notified about campaign status changes</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={preferences.emailCampaignUpdates}
                                    onChange={(e) => setPreferences({ ...preferences, emailCampaignUpdates: e.target.checked })}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                />
                            </label>

                            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <div>
                                    <p className="font-medium text-gray-900">Payment Notifications</p>
                                    <p className="text-sm text-gray-500">Receive updates about payments and earnings</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={preferences.emailPayments}
                                    onChange={(e) => setPreferences({ ...preferences, emailPayments: e.target.checked })}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                />
                            </label>

                            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <div>
                                    <p className="font-medium text-gray-900">Deadline Reminders</p>
                                    <p className="text-sm text-gray-500">Get reminded about upcoming deadlines</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={preferences.emailDeadlines}
                                    onChange={(e) => setPreferences({ ...preferences, emailDeadlines: e.target.checked })}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                />
                            </label>

                            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <div>
                                    <p className="font-medium text-gray-900">New Messages</p>
                                    <p className="text-sm text-gray-500">Notifications for new messages</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={preferences.emailNewMessages}
                                    onChange={(e) => setPreferences({ ...preferences, emailNewMessages: e.target.checked })}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                />
                            </label>

                            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <div>
                                    <p className="font-medium text-gray-900">Application Updates</p>
                                    <p className="text-sm text-gray-500">Updates about campaign applications</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={preferences.emailApplications}
                                    onChange={(e) => setPreferences({ ...preferences, emailApplications: e.target.checked })}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Push Notifications */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Push Notifications</h3>
                        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div>
                                <p className="font-medium text-gray-900">Enable Push Notifications</p>
                                <p className="text-sm text-gray-500">Receive push notifications on your device</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={preferences.pushNotifications}
                                onChange={(e) => setPreferences({ ...preferences, pushNotifications: e.target.checked })}
                                className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                            />
                        </label>
                    </div>

                    {/* SMS Notifications */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">SMS Notifications</h3>
                        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div>
                                <p className="font-medium text-gray-900">Enable SMS Notifications</p>
                                <p className="text-sm text-gray-500">Receive text messages for important updates</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={preferences.smsNotifications}
                                onChange={(e) => setPreferences({ ...preferences, smsNotifications: e.target.checked })}
                                className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                            />
                        </label>
                    </div>

                    {/* Notification Frequency */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Frequency</h3>
                        <select
                            value={preferences.notificationFrequency}
                            onChange={(e) => setPreferences({ ...preferences, notificationFrequency: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="realtime">Real-time (as they happen)</option>
                            <option value="daily">Daily Digest</option>
                            <option value="weekly">Weekly Summary</option>
                        </select>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSave} disabled={saving}>
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Preferences'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </SettingsLayout>
    );
}
