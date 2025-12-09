"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";

type SocialConnection = {
    id: string;
    platform: string;
    platformUserId: string | null;
    isActive: boolean;
    connectedAt: Date;
    expiresAt: Date;
};

export default function ConnectAccountsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [connections, setConnections] = useState<SocialConnection[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        // Check for callback messages
        const success = searchParams.get('success');
        const error = searchParams.get('error');

        if (success === 'tiktok_connected') {
            setMessage({ type: 'success', text: 'TikTok account connected successfully!' });
        } else if (success === 'meta_connected') {
            setMessage({ type: 'success', text: 'Instagram/Facebook connected successfully!' });
        } else if (error) {
            const errorMessages: Record<string, string> = {
                tiktok_denied: 'TikTok authorization was denied',
                meta_denied: 'Instagram/Facebook authorization was denied',
                invalid_callback: 'Invalid OAuth callback',
                connection_failed: 'Failed to connect account. Please try again.',
                session_expired: 'Your session expired. Please log in again.',
            };
            setMessage({ type: 'error', text: errorMessages[error] || 'An error occurred' });
        }

        fetchConnections();
    }, [searchParams]);

    const fetchConnections = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("/api/creator/connections", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setConnections(data.connections || []);
            }
        } catch (error) {
            console.error("Error fetching connections:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (platform: 'tiktok' | 'meta') => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`/api/creator/connect/${platform}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (response.ok && data.authUrl) {
                // Redirect to OAuth authorization URL
                window.location.href = data.authUrl;
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to initiate connection' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to connect. Please try again.' });
        }
    };

    const handleDisconnect = async (platform: string) => {
        if (!confirm(`Are you sure you want to disconnect your ${platform} account?`)) {
            return;
        }

        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`/api/creator/disconnect/${platform.toLowerCase()}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setMessage({ type: 'success', text: `${platform} disconnected successfully` });
                fetchConnections();
            } else {
                setMessage({ type: 'error', text: 'Failed to disconnect account' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to disconnect. Please try again.' });
        }
    };

    const getConnection = (platform: string) => {
        return connections.find(c => c.platform === platform && c.isActive);
    };

    const isExpiringSoon = (expiresAt: Date) => {
        const daysUntilExpiry = Math.floor((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry < 7;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <main>
                <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <Link href="/creator/dashboard" className="text-primary-DEFAULT hover:text-primary-600 font-medium transition-colors">
                            ← Back to Dashboard
                        </Link>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Connect Social Accounts</CardTitle>
                            <p className="text-sm text-gray-600 mt-2">
                                Connect your social media accounts to enable automatic view tracking
                            </p>
                        </CardHeader>

                        {/* Message Banner */}
                        {message && (
                            <div className={`mx-6 mb-4 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
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
                                    <div className="ml-3 flex-1">
                                        <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                                            {message.text}
                                        </p>
                                    </div>
                                    <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        <CardContent className="p-0">
                            {loading ? (
                                <div className="p-12 text-center text-gray-500">Loading connections...</div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {/* TikTok */}
                                    <div className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 w-12 bg-black rounded-xl flex items-center justify-center">
                                                    <span className="text-white font-bold text-xl">TT</span>
                                                </div>
                                                <div className="ml-4">
                                                    <h3 className="text-lg font-bold text-gray-900">TikTok</h3>
                                                    {getConnection('TIKTOK') ? (
                                                        <div>
                                                            <p className="text-sm text-green-600 font-medium">✓ Connected</p>
                                                            <p className="text-xs text-gray-500">
                                                                Expires: {new Date(getConnection('TIKTOK')!.expiresAt).toLocaleDateString()}
                                                                {isExpiringSoon(getConnection('TIKTOK')!.expiresAt) && (
                                                                    <span className="text-yellow-600 ml-2">⚠️ Expiring soon</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-500">Not connected</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                {getConnection('TIKTOK') ? (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => handleConnect('tiktok')}
                                                            variant="secondary"
                                                        >
                                                            Reconnect
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDisconnect('TIKTOK')}
                                                            variant="danger"
                                                        >
                                                            Disconnect
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        onClick={() => handleConnect('tiktok')}
                                                        className="bg-black hover:bg-gray-800"
                                                    >
                                                        Connect TikTok
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Instagram/Facebook */}
                                    <div className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                                                    <span className="text-white font-bold text-xl">IG</span>
                                                </div>
                                                <div className="ml-4">
                                                    <h3 className="text-lg font-bold text-gray-900">Instagram & Facebook</h3>
                                                    {getConnection('INSTAGRAM') || getConnection('FACEBOOK') ? (
                                                        <div>
                                                            <p className="text-sm text-green-600 font-medium">✓ Connected</p>
                                                            <p className="text-xs text-gray-500">
                                                                Expires: {new Date((getConnection('INSTAGRAM') || getConnection('FACEBOOK'))!.expiresAt).toLocaleDateString()}
                                                                {isExpiringSoon((getConnection('INSTAGRAM') || getConnection('FACEBOOK'))!.expiresAt) && (
                                                                    <span className="text-yellow-600 ml-2">⚠️ Expiring soon</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-500">Not connected</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                {getConnection('INSTAGRAM') || getConnection('FACEBOOK') ? (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => handleConnect('meta')}
                                                            variant="secondary"
                                                        >
                                                            Reconnect
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDisconnect('INSTAGRAM')}
                                                            variant="danger"
                                                        >
                                                            Disconnect
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        onClick={() => handleConnect('meta')}
                                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                                    >
                                                        Connect Instagram
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Info Section */}
                            <div className="p-6 bg-primary-50 border-t border-primary-100">
                                <h4 className="text-sm font-bold text-gray-900 mb-3">Why connect your accounts?</h4>
                                <ul className="text-sm text-gray-700 space-y-2">
                                    <li className="flex items-start">
                                        <span className="text-primary-DEFAULT mr-2">•</span>
                                        <span>Automatic view count tracking for your posted videos</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-primary-DEFAULT mr-2">•</span>
                                        <span>Real-time performance updates and bonus calculations</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-primary-DEFAULT mr-2">•</span>
                                        <span>No manual data entry required</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-primary-DEFAULT mr-2">•</span>
                                        <span>Secure OAuth 2.0 authentication</span>
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

