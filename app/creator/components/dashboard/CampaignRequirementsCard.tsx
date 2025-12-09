"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { FileText, AlertCircle, CheckCircle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CampaignRequirement {
    id: string;
    name: string;
    status: string;
    unacknowledgedCount: number;
    lastUpdated: Date;
    instructions: any[];
}

export default function CampaignRequirementsCard() {
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

    const displayedCampaigns = campaigns.slice(0, 5);
    const hasMore = campaigns.length > 5;

    return (
        <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    Campaign Requirements
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-3 border rounded-lg animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No active campaigns</p>
                        <p className="text-xs mt-1">Requirements will appear here when you join campaigns</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {displayedCampaigns.map((campaign) => (
                            <div
                                key={campaign.id}
                                className="p-3 border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition-all cursor-pointer"
                                onClick={() => router.push(`/creator/requirements/${campaign.id}`)}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-medium text-sm text-gray-900 flex-1">
                                        {campaign.name}
                                    </h4>
                                    {getStatusBadge(campaign.unacknowledgedCount)}
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>
                                        Instructions:{" "}
                                        {campaign.unacknowledgedCount > 0
                                            ? `${campaign.unacknowledgedCount} pending`
                                            : `${campaign.instructions.length} total`}
                                    </span>
                                    <span>{getTimeAgo(campaign.lastUpdated)}</span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="w-full mt-2 text-xs"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/creator/requirements/${campaign.id}`);
                                    }}
                                >
                                    View Requirements
                                    <ChevronRight className="w-3 h-3 ml-1" />
                                </Button>
                            </div>
                        ))}

                        {hasMore && (
                            <Button
                                variant="outline"
                                className="w-full mt-2"
                                onClick={() => router.push("/creator/requirements")}
                            >
                                See All ({campaigns.length} campaigns)
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

