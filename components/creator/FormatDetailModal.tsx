"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, Copy, Bookmark } from "lucide-react";

interface VideoFormat {
    id: string;
    name: string;
    description: string;
    platforms: string[];
    tone: string;
    categories: string[];
    avgViews: number;
    adoptionTrend: string;
    trendMomentum: number;
    structure?: any;
    bestPractices?: string[];
}

interface FormatDetailModalProps {
    format: VideoFormat;
    isOpen: boolean;
    onClose: () => void;
}

export default function FormatDetailModal({ format, isOpen, onClose }: FormatDetailModalProps) {
    const handleSave = async () => {
        try {
            await fetch('/api/formats/library', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ formatId: format.id }),
            });
            // Ideally show toast here
            onClose();
        } catch (error) {
            console.error("Failed to save format", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{format.tone}</Badge>
                        {format.platforms.map(p => <Badge key={p} variant="secondary">{p}</Badge>)}
                    </div>
                    <DialogTitle className="text-2xl">{format.name}</DialogTitle>
                    <DialogDescription className="text-base">{format.description}</DialogDescription>
                </DialogHeader>

                <div className="p-6 pt-0 space-y-6">
                    {/* Stats Section */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{format.avgViews.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">Avg Views</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-500">{format.adoptionTrend}</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">Trend</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">High</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">Conversion</div>
                        </div>
                    </div>

                    {/* Structure Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Video Structure</h3>
                        <div className="space-y-4 border-l-2 border-primary/20 ml-2 pl-4">
                            {format.structure && Object.entries(format.structure).map(([phase, desc]: [string, any], idx) => (
                                <div key={idx} className="relative">
                                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-indigo-600" />
                                    <h4 className="font-medium capitalize">{phase.replace('_', ' ')}</h4>
                                    <p className="text-sm text-muted-foreground">{desc as string}</p>
                                </div>
                            ))}
                            {!format.structure && <p className="text-muted-foreground">Structure details not available.</p>}
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Best Practices */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Best Practices</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {format.bestPractices?.map((practice, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>{practice}</span>
                                </li>
                            ))}
                            {!format.bestPractices && <p className="text-muted-foreground">No specific best practices listed.</p>}
                        </ul>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="secondary" className="flex-1" onClick={handleSave}>
                            <Bookmark className="mr-2 h-4 w-4" />
                            Save to Library
                        </Button>
                        <Button className="flex-1">
                            <Copy className="mr-2 h-4 w-4" />
                            Use Template
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
