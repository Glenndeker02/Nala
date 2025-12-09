"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CampaignRequirement {
    id: string;
    name: string;
    status: string;
    unacknowledgedCount: number;
    lastUpdated: Date;
    instructions: any[];
}

export default function AllRequirementsPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<CampaignRequirement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequirements();
    }, []);

    const fetchRequirements = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetch("/api/creator/campaign-requirements", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const result = await response.json();
            if (result.success) {
                setCampaigns(result.data.campaigns || []);
            }
        } catch (err) {
            console.error("Error fetching campaign requirements:", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (unacknowledgedCount: number) => {
        if (unacknowledgedCount > 0) {
            return (
                <Badge className="bg-orange-500 text-white">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    ACTION REQUIRED
                </Badge>
            );
        }
        return (
            <Badge className="bg-green-500 text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                UP TO DATE
            </Badge>
        );
    };

    const getTimeAgo = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return "Just now";
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <main className="max-w-[1200px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Campaign Requirements</h1>
                    <p className="text-gray-500 mt-2">
                        View and acknowledge instructions from all your active campaigns
                    </p>
                </div>

                {loading ? (
                    <div className="grid gap-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader>
                                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : campaigns.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium mb-2">No Active Campaigns</h3>
                            <p className="text-gray-500">
                                Requirements will appear here when you join campaigns
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {campaigns.map((campaign) => (
                            <Card
                                key={campaign.id}
                                className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => router.push(`/creator/requirements/${campaign.id}`)}
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-xl">{campaign.name}</CardTitle>
                                        {getStatusBadge(campaign.unacknowledgedCount)}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span>
                                            {campaign.unacknowledgedCount > 0
                                                ? `${campaign.unacknowledgedCount} instructions pending acknowledgment`
                                                : `All ${campaign.instructions.length} instructions acknowledged`}
                                        </span>
                                        <span>Last updated: {getTimeAgo(campaign.lastUpdated)}</span>
                                    </div>
                                    <Button
                                        className="mt-4"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/creator/requirements/${campaign.id}`);
                                        }}
                                    >
                                        View Requirements
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

