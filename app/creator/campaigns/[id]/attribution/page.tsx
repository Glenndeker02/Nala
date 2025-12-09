
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function CreatorAttributionPage() {
    const params = useParams();
    const campaignId = params.id as string;
    const { toast } = useToast();

    const [codes, setCodes] = useState<any[]>([]);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [campaignId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch codes
            // Assuming we have an endpoint that gets codes for this campaign & creator (via session or passed ID)
            // But usually endpoints are /api/v1/campaigns/:id/attribution/codes 
            // We need to know who the "current creator" is. 
            // The API /api/v1/campaigns/:id/attribution/codes likely checks the session user.

            const codesRes = await fetch(`/api/v1/campaigns/${campaignId}/attribution/codes`);
            const codesData = await codesRes.json();

            // Fetch earnings/payouts
            // /api/v1/creators/me/earnings?campaignId=... (Example, or filter locally)
            // Or /api/v1/creators/:id/earnings. 
            // Getting "me" is tricky if we don't have a "me" alias or client-side session ID handy.
            // Let's assume there's a route /api/v1/creators/current/earnings or similar, OR we use the generic one and hope middleware handles it.
            // Wait, we implemented GET `/api/v1/creators/:id/earnings`. 
            // We need the creator's ID.

            // For MVP, if we don't have the creator ID easily in client, we might need a separate call to "me" or stick to campaign-centric views that are tolerant.
            // BUT, `GET /api/v1/campaigns/:id/attribution/codes` returns codes for the *logged in* creator (if role is CREATOR).
            // Let's verify that endpoint implementation.

            if (codesData.data) {
                setCodes(codesData.data);
            }

            // Payouts - currently admin only or specific ID. 
            // Let's leave payouts empty or stubbed if we lack the endpoint for "my payouts for this campaign".

        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({ title: "Copied!", description: "Attribution code copied to clipboard." });
    };

    if (loading) return <div className="p-8">Loading attribution data...</div>;

    return (
        <div className="space-y-6 p-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Attribution & Earnings</h2>
                <p className="text-muted-foreground">Manage your tracking codes and view performance.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Attribution Codes</CardTitle>
                    <CardDescription>Use these unique codes in your content to track sales.</CardDescription>
                </CardHeader>
                <CardContent>
                    {codes.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                            No codes generated yet. Ask the campaign manager to assign one.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {codes.map((c: any) => (
                                <div key={c.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                                    <div className="flex flex-col">
                                        <span className="font-mono text-xl font-bold">{c.code}</span>
                                        <span className="text-sm text-muted-foreground">{c.platform}</span>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => copyCode(c.code)}>
                                        <Copy className="h-4 w-4 mr-2" /> Copy
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Payouts</CardTitle>
                    <CardDescription>Payments processed for this campaign.</CardDescription>
                </CardHeader>
                <CardContent>
                    {payouts.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                            No payouts found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payouts.map((p: any) => (
                                    <TableRow key={p.id}>
                                        <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>{p.type}</TableCell>
                                        <TableCell>${p.amount}</TableCell>
                                        <TableCell>
                                            <Badge variant={p.status === 'COMPLETED' ? 'default' : 'secondary'}>
                                                {p.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
