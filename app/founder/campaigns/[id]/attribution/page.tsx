
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Copy, Eye, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function FounderAttributionPage() {
    const params = useParams();
    const campaignId = params.id as string;
    const { toast } = useToast();

    const [stats, setStats] = useState<any>(null);
    const [codes, setCodes] = useState<any[]>([]);
    const [webhookSecret, setWebhookSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showSecret, setShowSecret] = useState(false);

    useEffect(() => {
        fetchData();
        fetchSecret();
    }, [campaignId]);

    const fetchData = async () => {
        try {
            // Fetch Report
            const reportRes = await fetch(`/api/v1/campaigns/${campaignId}/attribution/report`);
            const reportData = await reportRes.json();
            if (reportData.success) {
                setStats(reportData.data); // { clicks, conversions, totalSpent, ... }
            }

            // Fetch Codes (All active codes for campaign)
            const codesRes = await fetch(`/api/v1/campaigns/${campaignId}/attribution/codes`);
            const codesData = await codesRes.json();
            if (codesData.success) {
                setCodes(codesData.data);
            }
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSecret = async () => {
        try {
            const res = await fetch(`/api/v1/campaigns/${campaignId}/settings/webhook-secret`);
            const data = await res.json();
            if (data.success && data.data?.webhookSecret) {
                setWebhookSecret(data.data.webhookSecret);
            }
        } catch (e) {
            console.error("Failed to fetch secret", e);
        }
    };

    const rotateSecret = async () => {
        if (!confirm("Are you sure? This will verify invalidate the old secret immediately.")) return;

        try {
            const res = await fetch(`/api/v1/campaigns/${campaignId}/settings/webhook-secret`, {
                method: 'POST'
            });
            const data = await res.json();
            if (data.success) {
                setWebhookSecret(data.data.webhookSecret);
                toast({ title: "Secret Rotated", description: "New webhook secret generated." });
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to rotate secret", variant: "destructive" });
        }
    };

    const copyText = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied", description: "Copied to clipboard" });
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6 p-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Attribution & Integration</h2>
                <p className="text-muted-foreground">Monitor performance and manage technical settings.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.conversions || 0}</div>
                        <p className="text-xs text-muted-foreground">Redemptions processed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unique Clicks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.clicks || 0}</div>
                        <p className="text-xs text-muted-foreground">Start parameters tracked</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spend (Attr)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats?.totalSpent || "0.00"}</div>
                        <p className="text-xs text-muted-foreground">Paid via attribution</p>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
                {/* Active Codes */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Active Creator Codes</CardTitle>
                        <CardDescription>Codes currently assigned to creators.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Creator</TableHead>
                                    <TableHead className="text-right">Redemptions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {codes.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-mono">{c.code}</TableCell>
                                        <TableCell>{c.creator?.fullName || "Unknown"}</TableCell>
                                        <TableCell className="text-right">{c._count?.redemptions || 0}</TableCell>
                                    </TableRow>
                                ))}
                                {codes.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">No codes found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Webhook Settings */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Webhook Configuration</CardTitle>
                        <CardDescription>Manage your webhook secret for event verification.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Security Warning</AlertTitle>
                            <AlertDescription>
                                This secret is used to sign webhooks sent to our API. Keep it secure.
                            </AlertDescription>
                        </Alert>

                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium">Webhook Secret</label>
                            <div className="flex space-x-2">
                                <Input
                                    type={showSecret ? "text" : "password"}
                                    value={webhookSecret || ""}
                                    readOnly
                                    className="font-mono"
                                />
                                <Button variant="ghost" size="icon" onClick={() => setShowSecret(!showSecret)}>
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => copyText(webhookSecret || "")}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button variant="destructive" onClick={rotateSecret} className="w-full">
                                <RefreshCw className="mr-2 h-4 w-4" /> Rotate Secret
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
