"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, TrendingUp, DollarSign, Target } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CreatorCode {
    id: string;
    code: string;
    platform: string;
    campaignId: string;
}

interface AttributionStats {
    totalRedemptions: number;
    totalConversions: number;
    conversionRate: number;
    totalCommission: number;
    pendingCommission: number;
    paidCommission: number;
    byPlatform: Record<string, {
        redemptions: number;
        conversions: number;
        revenue: number;
    }>;
}

interface AttributionPanelProps {
    creatorId: string;
    campaignId?: string; // Optional - if provided, shows only codes for this campaign
}

export default function CreatorAttributionPanel({ creatorId, campaignId }: AttributionPanelProps) {
    const { toast } = useToast();
    const [codes, setCodes] = useState<CreatorCode[]>([]);
    const [stats, setStats] = useState<AttributionStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [creatorId]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");

            // Fetch codes
            const codesRes = await fetch("/api/creator/my-codes", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (codesRes.ok) {
                const data = await codesRes.json();
                let allCodes = data.success ? data.data : data;

                // Filter by campaign if specified
                if (campaignId) {
                    allCodes = allCodes.filter((c: CreatorCode) => c.campaignId === campaignId);
                }

                setCodes(allCodes);
            }

            // Fetch stats
            const statsRes = await fetch(`/api/creators/${creatorId}/attribution/stats`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data.success ? data.data : data);
            }
        } catch (error) {
            console.error("Failed to fetch attribution data:", error);
        } finally {
            setLoading(false);
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
        toast({
            title: "Copied!",
            description: `Code ${code} copied to clipboard`,
        });
    };

    const getPlatformIcon = (platform: string) => {
        const icons: Record<string, string> = {
            TIKTOK: "🎵",
            INSTAGRAM: "📸",
            YOUTUBE: "▶️",
            FACEBOOK: "👥",
        };
        return icons[platform] || "📱";
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (codes.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Attribution Codes</CardTitle>
                    <CardDescription>No attribution codes assigned yet</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Attribution codes will be automatically assigned when you're accepted to campaigns with attribution enabled.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalRedemptions}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.conversionRate.toFixed(1)}% conversion rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalConversions}</div>
                            <p className="text-xs text-muted-foreground">Verified sales</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Commission</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stats.pendingCommission.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">
                                ${stats.totalCommission.toFixed(2)} total earned
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Attribution Codes */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Attribution Codes</CardTitle>
                    <CardDescription>Share these codes with your audience to earn commission</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {codes.map((code) => (
                        <div
                            key={code.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{getPlatformIcon(code.platform)}</span>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <code className="text-lg font-mono font-bold">{code.code}</code>
                                        <Badge variant="outline">{code.platform}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {code.platform === "TIKTOK" && "Use in TikTok video captions or pinned comments"}
                                        {code.platform === "INSTAGRAM" && "Add to Instagram bio or story links"}
                                        {code.platform === "YOUTUBE" && "Include in video description"}
                                        {code.platform === "FACEBOOK" && "Share in posts and comments"}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyCode(code.code)}
                            >
                                {copiedCode === code.code ? (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Usage Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle>How to Use Your Codes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium">1. Share Your Code</h4>
                        <p className="text-sm text-muted-foreground">
                            Include your attribution code in your content (video captions, descriptions, bio links, etc.)
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-medium">2. Viewers Redeem</h4>
                        <p className="text-sm text-muted-foreground">
                            When viewers use your code, they get a discount and you get credit for the referral
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-medium">3. Earn Commission</h4>
                        <p className="text-sm text-muted-foreground">
                            You earn commission for each verified conversion (typically when the customer completes payment)
                        </p>
                    </div>

                    <div className="bg-accent/50 rounded-lg p-4">
                        <h4 className="font-medium mb-2">💡 Pro Tips</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Mention the discount in your content to encourage redemptions</li>
                            <li>• Pin a comment with your code for easy access</li>
                            <li>• Create urgency by mentioning limited-time offers</li>
                            <li>• Track your performance to see which platforms convert best</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
