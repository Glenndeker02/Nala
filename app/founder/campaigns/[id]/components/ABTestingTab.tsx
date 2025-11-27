"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trophy, Copy, Code } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Variant {
    id: string;
    label: string;
    status: string;
    trackingUrl: string;
    creator: {
        id: string;
        fullName: string;
    };
    metrics: {
        views: number;
        clicks: number;
        conversions: number;
        ctr: number;
        conversionRate: number;
        roi: number;
        performanceScore: number;
    }[];
}

interface Creator {
    id: string;
    fullName: string;
}

export default function ABTestingTab({ campaignId }: { campaignId: string }) {
    const [variants, setVariants] = useState<Variant[]>([]);
    const [creators, setCreators] = useState<Creator[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newVariant, setNewVariant] = useState({ label: '', creatorId: '' });

    useEffect(() => {
        fetchVariants();
        fetchCreators();
    }, [campaignId]);

    const fetchVariants = async () => {
        try {
            const res = await fetch(`/api/campaigns/${campaignId}/variants`);
            if (res.ok) {
                const data = await res.json();
                setVariants(data);
            }
        } catch (error) {
            console.error("Failed to fetch variants", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCreators = async () => {
        // In a real app, fetch only creators assigned to this campaign
        // For now, we'll fetch from the campaign details endpoint or a dedicated creators endpoint
        try {
            const res = await fetch(`/api/campaigns/${campaignId}`);
            if (res.ok) {
                const data = await res.json();
                const campaign = data.campaign || data;
                if (campaign.videos) {
                    const uniqueCreators = new Map();
                    campaign.videos.forEach((v: any) => {
                        if (v.creator) {
                            uniqueCreators.set(v.creator.id, v.creator);
                        }
                    });
                    setCreators(Array.from(uniqueCreators.values()));
                }
            }
        } catch (error) {
            console.error("Failed to fetch creators", error);
        }
    };

    const handleCreateVariant = async () => {
        if (!newVariant.label || !newVariant.creatorId) return;

        try {
            const res = await fetch(`/api/campaigns/${campaignId}/variants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newVariant)
            });

            if (res.ok) {
                setIsCreateOpen(false);
                setNewVariant({ label: '', creatorId: '' });
                fetchVariants();
            }
        } catch (error) {
            console.error("Failed to create variant", error);
        }
    };

    const copyTrackingPixel = (trackingUrl: string) => {
        const code = `<img src="${trackingUrl}/pixel.gif" width="1" height="1" style="display:none" />`;
        navigator.clipboard.writeText(code);
        alert("Tracking pixel code copied to clipboard!");
    };

    const copyTrackingLink = (trackingUrl: string) => {
        navigator.clipboard.writeText(trackingUrl);
        alert("Tracking link copied to clipboard!");
    };

    const getBestVariant = () => {
        if (variants.length === 0) return null;
        return variants.reduce((prev, current) => {
            const prevScore = Number(prev.metrics[0]?.performanceScore || 0);
            const currScore = Number(current.metrics[0]?.performanceScore || 0);
            return (prevScore > currScore) ? prev : current;
        });
    };

    const bestVariant = getBestVariant();

    const chartData = variants.map(v => ({
        name: v.label,
        ConversionRate: Number(v.metrics[0]?.conversionRate || 0),
        CTR: Number(v.metrics[0]?.ctr || 0),
        ROI: Number(v.metrics[0]?.roi || 0),
    }));

    if (loading) {
        return <div>Loading A/B test data...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">A/B Testing & Conversion Tracking</h2>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Variant
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New A/B Test Variant</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="label">Variant Label</Label>
                                <Input
                                    id="label"
                                    placeholder="e.g. Hook A - Emotional"
                                    value={newVariant.label}
                                    onChange={(e) => setNewVariant({ ...newVariant, label: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="creator">Assign Creator</Label>
                                <Select
                                    onValueChange={(value) => setNewVariant({ ...newVariant, creatorId: value })}
                                    value={newVariant.creatorId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a creator" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {creators.map(creator => (
                                            <SelectItem key={creator.id} value={creator.id}>{creator.fullName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateVariant}>Create Variant</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {bestVariant && variants.length > 0 && (
                <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-500/20 rounded-full">
                                <Trophy className="h-8 w-8 text-yellow-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                                    Winning Variant: {bestVariant.label}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Highest performance score ({Number(bestVariant.metrics[0]?.performanceScore || 0).toFixed(1)}%) with {Number(bestVariant.metrics[0]?.conversionRate || 0).toFixed(1)}% conversion rate.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {variants.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/10">
                    <h3 className="text-lg font-medium">No variants created yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first A/B test variant to start tracking performance.</p>
                    <Button variant="outline" onClick={() => setIsCreateOpen(true)}>Create Variant</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Comparison</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="ConversionRate" fill="#10b981" name="Conv. Rate %" />
                                    <Bar dataKey="CTR" fill="#3b82f6" name="CTR %" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        {variants.map((variant) => (
                            <Card key={variant.id} className="overflow-hidden">
                                <div className="p-4 flex items-center justify-between bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <Badge variant={variant.id === bestVariant?.id ? "default" : "secondary"}>
                                            {variant.label}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">by {variant.creator.fullName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" title="Copy Tracking Link" onClick={() => copyTrackingLink(variant.trackingUrl)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" title="Copy Pixel Code" onClick={() => copyTrackingPixel(variant.trackingUrl)}>
                                            <Code className="h-4 w-4" />
                                        </Button>
                                        <Badge variant="outline">{variant.status}</Badge>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-4 p-4">
                                    <div className="text-center">
                                        <div className="text-xs text-muted-foreground mb-1">Views</div>
                                        <div className="font-semibold">{variant.metrics[0]?.views || 0}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-muted-foreground mb-1">CTR</div>
                                        <div className="font-semibold text-blue-600">{Number(variant.metrics[0]?.ctr || 0).toFixed(1)}%</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-muted-foreground mb-1">Conv. Rate</div>
                                        <div className="font-semibold text-green-600">{Number(variant.metrics[0]?.conversionRate || 0).toFixed(1)}%</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-muted-foreground mb-1">ROI</div>
                                        <div className="font-semibold text-purple-600">{Number(variant.metrics[0]?.roi || 0).toFixed(0)}%</div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
