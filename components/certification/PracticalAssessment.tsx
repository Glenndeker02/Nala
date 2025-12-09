
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, FileVideo, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PracticalAssessmentProps {
    canStart: boolean;
    onSubmit: () => void;
}

export default function PracticalAssessment({ canStart, onSubmit }: PracticalAssessmentProps) {
    const { toast } = useToast();
    const [videoUrl, setVideoUrl] = useState('');
    const [strategy, setStrategy] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (!videoUrl || !strategy) {
            toast({
                title: "Validation Error",
                description: "Please provide both a video URL and your strategy.",
                variant: "destructive",
            });
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/certification/practical', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoUrl, strategyText: strategy }),
            });

            if (!res.ok) throw new Error('Submission failed');

            setSubmitted(true);
            toast({
                title: "Success",
                description: "Assessment submitted successfully! Our team will review it shortly.",
            });
            onSubmit();
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to submit assessment. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (!canStart) {
        return (
            <Card className="opacity-50">
                <CardHeader>
                    <CardTitle>Phase 2: Practical Assessment</CardTitle>
                    <CardDescription>Locked until you pass Phase 1.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-40 flex items-center justify-center border-2 border-dashed rounded-md bg-gray-50">
                        <p className="text-gray-400">Complete the Knowledge Exam to unlock.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (submitted) {
        return (
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6 text-center">
                    <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-blue-800 mb-2">Submission Received</h2>
                    <p className="text-blue-700 mb-4">Your practical assessment is under review. This usually takes 24-48 hours.</p>
                    <p className="text-sm text-blue-600">You will be notified via email once graded.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Phase 2: Practical Assessment</CardTitle>
                <CardDescription>Create a 30s UGC video based on the brief below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md border">
                    <h3 className="font-semibold mb-2">Creative Brief: "EnergyBoost Drink"</h3>
                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                        <li><strong>Product:</strong> All-natural energy drink.</li>
                        <li><strong>Hook:</strong> Show the "3pm slump" problem.</li>
                        <li><strong>Body:</strong> Drink EnergyBoost, show immediate focus.</li>
                        <li><strong>CTA:</strong> "Grab yours at the link in bio!"</li>
                        <li><strong>Format:</strong> 9:16 Vertical Video, 30 seconds max.</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="video-url">Video URL (Google Drive, Dropbox, Loom)</Label>
                    <div className="flex gap-2">
                        <Input
                            id="video-url"
                            placeholder="https://..."
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                        />
                    </div>
                    <p className="text-xs text-gray-500">Please ensure the link is publicly accessible.</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="strategy">Strategy Breakdown</Label>
                    <Textarea
                        id="strategy"
                        placeholder="Explain why you chose this hook and how you structured the video..."
                        className="h-32"
                        value={strategy}
                        onChange={(e) => setStrategy(e.target.value)}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2 h-4 w-4" />}
                    Submit for Review
                </Button>
            </CardFooter>
        </Card>
    );
}
