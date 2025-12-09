"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, AlertCircle, FileText } from "lucide-react";

interface Instruction {
    id: string;
    text: string;
    attachedLibraryItemId: string | null;
    authorId: string;
    author: {
        fullName: string;
        profilePictureUrl: string | null;
    };
    createdAt: string;
    appliesTo: string;
    videoNumber: number | null;
    requiresAcknowledgment: boolean;
    acknowledgedBy: string[];
    status: string;
}

interface InstructionsCardProps {
    campaignId: string;
    briefData: any;
    videoNumber?: number; // Optional: filter by specific video
}

export default function InstructionsCard({ campaignId, briefData, videoNumber }: InstructionsCardProps) {
    const [instructions, setInstructions] = useState<Instruction[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [acknowledging, setAcknowledging] = useState<string | null>(null);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            const user = JSON.parse(userData);
            setUserId(user.id);
        }
    }, []);

    const fetchInstructions = async () => {
        try {
            const token = localStorage.getItem("token");
            let url = `/api/campaigns/${campaignId}/instructions`;
            if (videoNumber) {
                url += `?videoNumber=${videoNumber}`;
            }
            console.log('[InstructionsCard] Fetching from:', url);
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            console.log('[InstructionsCard] Response status:', response.status, 'Data:', data);
            if (data.success) {
                setInstructions(data.data);
            } else {
                console.error('[InstructionsCard] Error:', data.error || 'Unknown error');
            }
        } catch (error) {
            console.error("Error fetching instructions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = async (instructionId: string) => {
        setAcknowledging(instructionId);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/instructions/${instructionId}/acknowledge`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                // Update local state
                setInstructions(prev => prev.map(inst => {
                    if (inst.id === instructionId && userId) {
                        return {
                            ...inst,
                            acknowledgedBy: [...inst.acknowledgedBy, userId]
                        };
                    }
                    return inst;
                }));
            }
        } catch (error) {
            console.error("Error acknowledging instruction:", error);
        } finally {
            setAcknowledging(null);
        }
    };

    useEffect(() => {
        if (campaignId) {
            fetchInstructions();
        }
    }, [campaignId, videoNumber]);

    // Check if there are any unacknowledged instructions that require acknowledgment
    const pendingAcknowledgments = instructions.filter(
        inst => inst.requiresAcknowledgment && userId && !inst.acknowledgedBy.includes(userId)
    );

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Content Brief & Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Content Brief & Instructions</CardTitle>
                {pendingAcknowledgments.length > 0 && (
                    <div className="flex items-center gap-2 text-sm bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full">
                        <AlertCircle className="w-4 h-4" />
                        {pendingAcknowledgments.length} pending acknowledgment{pendingAcknowledgments.length > 1 ? 's' : ''}
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Static Brief Data */}
                    {briefData && (
                        <div className="space-y-4 pb-6 border-b border-gray-100">
                            {briefData.targetAudience && (
                                <div>
                                    <p className="text-sm font-medium text-gray-900 mb-1">Target Audience</p>
                                    <p className="text-gray-600">{briefData.targetAudience}</p>
                                </div>
                            )}
                            {briefData.mustHaves && briefData.mustHaves.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-900 mb-1">Must Haves</p>
                                    <ul className="list-disc list-inside text-gray-600">
                                        {briefData.mustHaves.map((item: string, i: number) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Dynamic Instructions */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Instructions from Founder
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                {instructions.length}
                            </span>
                        </h3>

                        {instructions.length === 0 ? (
                            <p className="text-sm text-gray-500 italic py-4 text-center bg-gray-50 rounded-lg">
                                No additional instructions provided yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {instructions.map((inst) => {
                                    const isAcknowledged = userId && inst.acknowledgedBy.includes(userId);
                                    const needsAck = inst.requiresAcknowledgment && !isAcknowledged;
                                    const scopeLabel = inst.videoNumber ? `Video ${inst.videoNumber}` : 'All Videos';

                                    return (
                                        <div
                                            key={inst.id}
                                            className={`border rounded-lg p-4 transition-all ${needsAck
                                                ? 'border-orange-200 bg-orange-50/50'
                                                : 'border-gray-200 bg-white'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span className="font-medium text-gray-900">{inst.author.fullName}</span>
                                                    <span>•</span>
                                                    <span>{new Date(inst.createdAt).toLocaleDateString()}</span>
                                                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                                                        {scopeLabel}
                                                    </span>
                                                </div>

                                                {inst.requiresAcknowledgment && (
                                                    <div>
                                                        {isAcknowledged ? (
                                                            <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                Acknowledged
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-orange-700 border-orange-300 hover:bg-orange-100"
                                                                onClick={() => handleAcknowledge(inst.id)}
                                                                disabled={acknowledging === inst.id}
                                                            >
                                                                {acknowledging === inst.id ? 'Acknowledging...' : 'Acknowledge'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-gray-800 text-sm whitespace-pre-wrap">{inst.text}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

