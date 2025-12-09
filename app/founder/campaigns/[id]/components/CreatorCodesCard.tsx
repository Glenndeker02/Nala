"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
    Copy,
    Plus,
    Download,
    Tag,
    CheckCircle2,
    XCircle,
    BarChart3
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

interface CreatorCode {
    id: string;
    code: string;
    platform: string;
    active: boolean;
    notes: string | null;
    expirationDate: string | null;
    createdAt: string;
    creator: {
        id: string;
        name: string;
        email: string;
    };
    redemptionCount: number;
}

interface CreatorCodesCardProps {
    campaignId: string;
}

export default function CreatorCodesCard({ campaignId }: CreatorCodesCardProps) {
    const [codes, setCodes] = useState<CreatorCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [creators, setCreators] = useState<{ id: string; name: string }[]>([]);

    // Form state
    const [selectedCreator, setSelectedCreator] = useState("");
    const [selectedPlatform, setSelectedPlatform] = useState("TIKTOK");
    const [customCode, setCustomCode] = useState("");
    const [notes, setNotes] = useState("");
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const fetchCodes = async () => {
        try {
            const token = localStorage.getItem("token");
            console.log('[CreatorCodesCard] Fetching codes for campaign:', campaignId);
            const response = await fetch(`/api/campaigns/${campaignId}/creator-codes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            console.log('[CreatorCodesCard] Response:', data);
            if (data.success) {
                setCodes(data.data);
                console.log('[CreatorCodesCard] Codes loaded:', data.data.length);
            } else {
                console.error('[CreatorCodesCard] Error:', data.error);
            }
        } catch (error) {
            console.error("Error fetching codes:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCreators = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/campaigns/${campaignId}/applications?status=ACCEPTED`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                const creatorList = data.data.map((app: any) => ({
                    id: app.creator.id,
                    name: app.creator.fullName
                }));
                setCreators(creatorList);
            }
        } catch (error) {
            console.error("Error fetching creators:", error);
        }
    };

    const handleCreateCode = async () => {
        if (!selectedCreator || !selectedPlatform) return;

        setCreating(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/campaigns/${campaignId}/creator-codes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    creatorId: selectedCreator,
                    platform: selectedPlatform,
                    code: customCode || undefined,
                    notes: notes || undefined
                })
            });

            const data = await response.json();
            if (data.success) {
                setDialogOpen(false);
                setSelectedCreator("");
                setCustomCode("");
                setNotes("");
                fetchCodes();
            } else {
                alert(data.error || "Failed to create code");
            }
        } catch (error) {
            console.error("Error creating code:", error);
        } finally {
            setCreating(false);
        }
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const exportToCSV = () => {
        const headers = ["Code", "Creator", "Platform", "Redemptions", "Status", "Created"];
        const rows = codes.map(c => [
            c.code,
            c.creator.name,
            c.platform,
            c.redemptionCount,
            c.active ? "Active" : "Inactive",
            new Date(c.createdAt).toLocaleDateString()
        ]);

        const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `creator-codes-${campaignId}.csv`;
        a.click();
    };

    useEffect(() => {
        fetchCodes();
        fetchCreators();
    }, [campaignId]);

    const totalRedemptions = codes.reduce((sum, c) => sum + c.redemptionCount, 0);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        Creator Codes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-3">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        Creator Codes
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        {codes.length} codes • {totalRedemptions} total redemptions
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exportToCSV}>
                        <Download className="w-4 h-4 mr-1" />
                        Export
                    </Button>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="w-4 h-4 mr-1" />
                                Add Code
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Generate Creator Code</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div>
                                    <Label>Creator</Label>
                                    <Select value={selectedCreator} onValueChange={setSelectedCreator}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select creator..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {creators.map(c => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Platform</Label>
                                    <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TIKTOK">TikTok</SelectItem>
                                            <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                                            <SelectItem value="FACEBOOK">Facebook</SelectItem>
                                            <SelectItem value="YOUTUBE">YouTube</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Custom Code (optional)</Label>
                                    <Input
                                        value={customCode}
                                        onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                                        placeholder="Leave empty to auto-generate"
                                    />
                                </div>
                                <div>
                                    <Label>Notes (optional)</Label>
                                    <Input
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Internal notes..."
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleCreateCode}
                                        disabled={!selectedCreator || creating}
                                    >
                                        {creating ? "Creating..." : "Create Code"}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {codes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No creator codes yet</p>
                        <p className="text-sm">Codes are auto-generated when creators are accepted</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-500 border-b">
                                    <th className="pb-3 font-medium">Code</th>
                                    <th className="pb-3 font-medium">Creator</th>
                                    <th className="pb-3 font-medium">Platform</th>
                                    <th className="pb-3 font-medium text-center">Redemptions</th>
                                    <th className="pb-3 font-medium text-center">Status</th>
                                    <th className="pb-3 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {codes.map((code) => (
                                    <tr key={code.id} className="text-sm">
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
                                                    {code.code}
                                                </code>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7 p-0"
                                                    onClick={() => copyToClipboard(code.code)}
                                                >
                                                    {copiedCode === code.code ? (
                                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </td>
                                        <td className="py-3">{code.creator.name}</td>
                                        <td className="py-3">
                                            <span className={`text-xs px-2 py-1 rounded-full ${code.platform === 'TIKTOK' ? 'bg-pink-100 text-pink-700' :
                                                code.platform === 'INSTAGRAM' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {code.platform}
                                            </span>
                                        </td>
                                        <td className="py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <BarChart3 className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium">{code.redemptionCount}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-center">
                                            {code.active ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-1 rounded-full">
                                                    <XCircle className="w-3 h-3" />
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => window.location.href = `/founder/campaigns/${campaignId}/codes/${code.id}`}
                                            >
                                                <BarChart3 className="w-4 h-4 mr-1" />
                                                Stats
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
