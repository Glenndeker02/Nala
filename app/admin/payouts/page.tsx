
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, AlertOctagon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AdminPayoutsPage() {
    const { toast } = useToast();
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/v1/payouts'); // Admin endpoint
            const data = await res.json();
            if (data.success) {
                setPayouts(data.data);
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to load payouts", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const markAsPaid = async (id: string) => {
        if (!confirm("Confirm marking this payout as PAID?")) return;
        try {
            const res = await fetch(`/api/v1/payouts/${id}/mark-paid`, { method: 'POST' });
            if (res.ok) {
                toast({ title: "Success", description: "Payout marked as paid." });
                fetchPayouts();
            } else {
                toast({ title: "Error", description: "Action failed", variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error", description: "Network error", variant: "destructive" });
        }
    };

    if (loading) return <div className="p-8">Loading payouts...</div>;

    return (
        <div className="space-y-6 p-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Payout Management</h2>
                <p className="text-muted-foreground">Review and process creator payouts.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Payouts</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Campaign</TableHead>
                                <TableHead>Creator</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payouts.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>{p.campaign?.name || 'N/A'}</TableCell>
                                    <TableCell>{p.creator?.fullName || p.creator?.email}</TableCell>
                                    <TableCell>${p.amount}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            p.status === 'COMPLETED' ? 'default' :
                                                p.status === 'PENDING' ? 'secondary' :
                                                    p.status === 'DISPUTED' ? 'destructive' : 'outline'
                                        }>
                                            {p.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {p.status === 'PENDING' && (
                                            <Button size="sm" onClick={() => markAsPaid(p.id)}>
                                                Mark Paid
                                            </Button>
                                        )}
                                        {p.status === 'DISPUTED' && (
                                            <Button size="sm" variant="destructive" asChild>
                                                <a href={`/admin/disputes`}>View Dispute</a>
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
