"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Upload, CheckCircle, AlertCircle, Trophy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface CreatorABTestPageProps {
    params: { abId: string };
}

export default function CreatorABTestPage({ params }: CreatorABTestPageProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { abId } = params;

    const [test, setTest] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadingVariant, setUploadingVariant] = useState<string | null>(null);
    const [uploadUrls, setUploadUrls] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchTest();
    }, []);

    const fetchTest = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            // Note: You'll need to create this API endpoint
            const response = await fetch(`/api/creator/ab-tests/${abId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setTest(data.data);
            }
        } catch (error) {
            console.error('Error fetching test:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (variantId: string) => {
        const videoUrl = uploadUrls[variantId];
        if (!videoUrl) {
            toast({
                title: 'Error',
                description: 'Please enter a video URL',
                variant: 'destructive',
            });
            return;
        }

        setUploadingVariant(variantId);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `/api/campaigns/${test.campaignId}/ab-tests/${abId}/variants/${variantId}/upload`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ videoUrl }),
                }
            );

            if (!response.ok) throw new Error('Failed to upload video');

            toast({
                title: 'Success',
                description: 'Video uploaded successfully',
            });

            fetchTest();
            setUploadUrls(prev => ({ ...prev, [variantId]: '' }));
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setUploadingVariant(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { label: string; icon: any; className: string }> = {
            PENDING_UPLOAD: { label: 'Pending Upload', icon: AlertCircle, className: 'bg-yellow-500' },
            PENDING_REVIEW: { label: 'In Review', icon: Loader2, className: 'bg-blue-500' },
            REVISION_REQUESTED: { label: 'Revision Requested', icon: AlertCircle, className: 'bg-orange-500' },
            APPROVED: { label: 'Approved', icon: CheckCircle, className: 'bg-green-500' },
            DEPLOYED: { label: 'Live', icon: CheckCircle, className: 'bg-green-600' },
        };

        const config = variants[status] || variants.PENDING_UPLOAD;
        const Icon = config.icon;

        return (
            <Badge className={config.className}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!test) {
        return (
            <div className="container max-w-6xl mx-auto py-8">
                <p>Test not found</p>
            </div>
        );
    }

    const isCompleted = test.status === 'COMPLETED';

    return (
        <div className="container max-w-6xl mx-auto py-8">
            <Button variant="ghost" onClick={() => router.push('/creator/tasks')} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tasks
            </Button>

            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">{test.name}</h1>
                {test.hypothesis && (
                    <p className="text-muted-foreground mb-4">
                        <strong>Hypothesis:</strong> {test.hypothesis}
                    </p>
                )}
                <div className="flex gap-4 text-sm text-muted-foreground">
                    <div>
                        <strong>Goal:</strong> {test.testGoal?.replace(/_/g, ' ')}
                    </div>
                    <div>
                        <strong>Success Metric:</strong> {test.successMetric?.replace(/_/g, ' ')}
                    </div>
                </div>
            </div>

            {isCompleted && test.winnerVariantId && (
                <Card className="mb-6 border-primary">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="w-5 h-5" />
                            Test Completed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-2">
                            <strong>Winner:</strong>{' '}
                            {test.variants?.find((v: any) => v.id === test.winnerVariantId)?.variantName}
                        </p>
                        {test.conclusionNotes && (
                            <p className="text-sm text-muted-foreground">{test.conclusionNotes}</p>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Variants</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    {test.variants?.map((variant: any) => (
                        <Card key={variant.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <CardTitle>{variant.variantName}</CardTitle>
                                    {getStatusBadge(variant.approvalStatus)}
                                </div>
                                <CardDescription>{variant.label}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium mb-2">Description</p>
                                    <p className="text-sm text-muted-foreground">{variant.description}</p>
                                </div>

                                {variant.variantInstructions && (
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-sm font-medium mb-2">Instructions</p>
                                        <div className="text-sm space-y-2">
                                            <p><strong>Tone:</strong> {variant.variantInstructions.tone}</p>
                                            {variant.variantInstructions.visualStyle && (
                                                <p><strong>Visual Style:</strong> {variant.variantInstructions.visualStyle}</p>
                                            )}
                                            {variant.variantInstructions.requiredLength && (
                                                <p><strong>Length:</strong> {variant.variantInstructions.requiredLength}</p>
                                            )}
                                            {variant.variantInstructions.talkingPoints && (
                                                <div>
                                                    <strong>Talking Points:</strong>
                                                    <ul className="list-disc list-inside ml-2 mt-1">
                                                        {variant.variantInstructions.talkingPoints.map((tp: string, i: number) => (
                                                            <li key={i}>{tp}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {variant.founderFeedback && (
                                    <div className="p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                                        <p className="text-sm font-medium mb-1 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            Revision Requested
                                        </p>
                                        <p className="text-sm">{variant.founderFeedback}</p>
                                        {variant.revisionDeadline && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Deadline: {new Date(variant.revisionDeadline).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {variant.videoUploadUrl && (
                                    <div>
                                        <p className="text-sm font-medium mb-2">Uploaded Video</p>
                                        <video
                                            src={variant.videoUploadUrl}
                                            controls
                                            className="w-full rounded-lg"
                                        />
                                    </div>
                                )}

                                {(variant.approvalStatus === 'PENDING_UPLOAD' || variant.approvalStatus === 'REVISION_REQUESTED') && (
                                    <div className="space-y-2">
                                        <Label htmlFor={`upload-${variant.id}`}>Video URL</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id={`upload-${variant.id}`}
                                                value={uploadUrls[variant.id] || ''}
                                                onChange={(e) => setUploadUrls(prev => ({ ...prev, [variant.id]: e.target.value }))}
                                                placeholder="https://..."
                                            />
                                            <Button
                                                onClick={() => handleUpload(variant.id)}
                                                disabled={uploadingVariant === variant.id}
                                            >
                                                {uploadingVariant === variant.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        Upload
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
