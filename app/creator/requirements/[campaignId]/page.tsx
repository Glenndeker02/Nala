"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast";

interface Instruction {
    id: string;
    text: string;
    instructionType: string;
    videoNumber?: number;
    appliesTo: string;
    createdAt: Date;
    requiresAcknowledgment: boolean;
    isAcknowledged: boolean;
}

export default function CampaignRequirementsDetailPage({ params }: { params: { campaignId: string } }) {
    const router = useRouter();
    const { toast } = useToast();
    const { campaignId } = params;

    const [campaign, setCampaign] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [acknowledging, setAcknowledging] = useState<string | null>(null);

    useEffect(() => {
        fetchRequirements();
    }, [campaignId]);

    const fetchRequirements = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetch(`/api/creator/campaign-requirements/${campaignId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const result = await response.json();
            if (result.success) {
                setCampaign(result.data);
            }
        } catch (err) {
            console.error("Error fetching campaign requirements:", err);
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
                headers: { Authorization: `Bearer ${token}` },
            });

            const result = await response.json();
            if (result.success) {
                toast({
                    title: "Success",
                    description: "Instruction acknowledged successfully",
                });
                fetchRequirements();
            } else {
                throw new Error(result.error || "Failed to acknowledge");
            }
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setAcknowledging(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Campaign not found</p>
            </div>
        );
    }

    const renderInstruction = (instruction: Instruction) => (
        <Card key={instruction.id} className={instruction.isAcknowledged ? "bg-green-50" : ""}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-base">
                            {instruction.instructionType === "VIDEO_SPECIFIC" && instruction.videoNumber
                                ? `Video #${instruction.videoNumber} Instructions`
                                : instruction.instructionType === "REVISION"
                                    ? "Revision Instructions"
                                    : "Campaign Instructions"}
                        </CardTitle>
                        <p className="text-xs text-gray-500 mt-1">
                            {new Date(instruction.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    {instruction.isAcknowledged ? (
                        <Badge className="bg-green-500 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Acknowledged
                        </Badge>
                    ) : (
                        <Badge className="bg-orange-500 text-white">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Pending
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="prose prose-sm max-w-none mb-4">
                    <div dangerouslySetInnerHTML={{ __html: instruction.text }} />
                </div>

                {!instruction.isAcknowledged && instruction.requiresAcknowledgment && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Checkbox id={`ack-${instruction.id}`} />
                            <label htmlFor={`ack-${instruction.id}`} className="text-sm">
                                I understand and accept these requirements
                            </label>
                        </div>
                        <Button
                            className="mt-3 w-full"
                            onClick={() => handleAcknowledge(instruction.id)}
                            disabled={acknowledging === instruction.id}
                        >
                            {acknowledging === instruction.id ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Acknowledging...
                                </>
                            ) : (
                                "Acknowledge & Continue"
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gray-50/50">
            <main className="max-w-[1200px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{campaign.campaign.name}</h1>
                    <p className="text-gray-500 mt-2">
                        {campaign.campaign.founderName} • {campaign.campaign.companyName}
                    </p>
                    {campaign.allAcknowledged ? (
                        <Badge className="bg-green-500 text-white mt-2">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            All Requirements Acknowledged
                        </Badge>
                    ) : (
                        <Badge className="bg-orange-500 text-white mt-2">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Action Required
                        </Badge>
                    )}
                </div>

                <div className="space-y-6">
                    {campaign.instructions.overallCampaign.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Overall Campaign Instructions</h2>
                            <div className="space-y-4">
                                {campaign.instructions.overallCampaign.map(renderInstruction)}
                            </div>
                        </div>
                    )}

                    {campaign.instructions.videoSpecific.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Video-Specific Instructions</h2>
                            <Accordion type="single" collapsible className="space-y-2">
                                {campaign.instructions.videoSpecific.map((instruction: Instruction, index: number) => (
                                    <AccordionItem key={instruction.id} value={`video-${index}`}>
                                        <AccordionTrigger>
                                            Video #{instruction.videoNumber || index + 1}
                                            {instruction.isAcknowledged ? (
                                                <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
                                            ) : (
                                                <AlertCircle className="w-4 h-4 ml-2 text-orange-500" />
                                            )}
                                        </AccordionTrigger>
                                        <AccordionContent>{renderInstruction(instruction)}</AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    )}

                    {campaign.instructions.revision.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Revision Instructions</h2>
                            <div className="space-y-4">
                                {campaign.instructions.revision.map(renderInstruction)}
                            </div>
                        </div>
                    )}
                </div>

                {campaign.allAcknowledged && (
                    <Card className="mt-8 border-green-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                                <div>
                                    <p className="font-medium">All requirements acknowledged!</p>
                                    <p className="text-sm text-gray-500">
                                        You can now proceed to upload your content.
                                    </p>
                                </div>
                            </div>
                            <Button className="mt-4 w-full" onClick={() => router.push("/creator/tasks")}>
                                Go to Tasks
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
