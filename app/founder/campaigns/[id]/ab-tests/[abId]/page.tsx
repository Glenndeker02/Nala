"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, CheckCircle, XCircle, Clock, Rocket, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ABTestDetailPageProps {
    params: { id: string; abId: string };
}

export default function ABTestDetailPage({ params }: ABTestDetailPageProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { id: campaignId, abId } = params;

    const [test, setTest] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reviewDialog, setReviewDialog] = useState<{ open: boolean; variantId: string; action: 'APPROVE' | 'REQUEST_REVISION' }>({ open: false, variantId: '', action: 'APPROVE' });
    const [feedback, setFeedback] = useState('');
    const [revisionDeadline, setRevisionDeadline] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchTest();
    }, []);

    const fetchTest = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/campaigns/${campaignId}/ab-tests/${abId}`, {
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

    const handleReview = async () => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `/api/campaigns/${campaignId}/ab-tests/${abId}/variants/${reviewDialog.variantId}/review`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        action: reviewDialog.action,
                        feedback: reviewDialog.action === 'REQUEST_REVISION' ? feedback : undefined,
                        revisionDeadline: reviewDialog.action === 'REQUEST_REVISION' ? revisionDeadline : undefined,
                    }),
                }
            );

            if (!response.ok) throw new Error('Failed to review variant');

            toast({
                title: 'Success',
                description: reviewDialog.action === 'APPROVE' ? 'Variant approved' : 'Revision requested',
            });

            setReviewDialog({ open: false, variantId: '', action: 'APPROVE' });
            setFeedback('');
            setRevisionDeadline('');
            fetchTest();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeploy = async () => {
        if (!confirm('Are you sure you want to deploy this A/B test? This will start tracking performance.')) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/campaigns/${campaignId}/ab-tests/${abId}/deploy`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Failed to deploy test');

            toast({
                title: 'Success',
                description: 'A/B test deployed successfully',
            });

            fetchTest();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { label: string; variant: any; icon: any }> = {
            DRAFT: { label: 'Draft', variant: 'secondary', icon: Clock },
            PENDING_CONTENT: { label: 'Pending Upload', variant: 'default', icon: Clock },
            IN_REVIEW: { label: 'In Review', variant: 'default', icon: AlertCircle },
            ACTIVE: { label: 'Active', variant: 'default', icon: Rocket },
            COMPLETED: { label: 'Completed', variant: 'default', icon: CheckCircle },
        };

        const config = variants[status] || variants.DRAFT;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="w-3 h-3" />
                {config.label}
            </Badge>
        );
    };

    const getApprovalStatusBadge = (status: string) => {
        const variants: Record<string, { label: string; variant: any }> = {
            PENDING_UPLOAD: { label: 'Pending Upload', variant: 'secondary' },
            PENDING_REVIEW: { label: 'Pending Review', variant: 'default' },
            REVISION_REQUESTED: { label: 'Revision Requested', variant: 'destructive' },
            APPROVED: { label: 'Approved', variant: 'default' },
            DEPLOYED: { label: 'Deployed', variant: 'default' },
        };

        const config = variants[status] || variants.PENDING_UPLOAD;
        return <Badge variant={config.variant}>{config.label}</Badge>;
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

    const allApproved = test.variants?.every((v: any) => v.approvalStatus === 'APPROVED');
    const canDeploy = allApproved && test.status !== 'ACTIVE' && test.status !== 'COMPLETED';

    return (
        <div className="container max-w-6xl mx-auto py-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Campaign
            </Button>

            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold">{test.name}</h1>
                        {test.hypothesis && (
                            <p className="text-muted-foreground mt-2">
                                <strong>Hypothesis:</strong> {test.hypothesis}
                            </p>
                        )}
                    </div>
                    {getStatusBadge(test.status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Test Goal</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{test.testGoal?.replace(/_/g, ' ')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Success Metric</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{test.successMetric?.replace(/_/g, ' ')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Duration</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">
                                {test.startDate && test.endDate
                                    ? `${Math.ceil((new Date(test.endDate).getTime() - new Date(test.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                                    : 'N/A'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Assigned Creators</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{test.assignedCreatorIds?.length || 0}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Variants</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    {test.variants?.map((variant: any) => (
                        <Card key={variant.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{variant.variantName}</CardTitle>
                                    {getApprovalStatusBadge(variant.approvalStatus)}
                                </div>
                                <CardDescription>{variant.label}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium mb-2">Description</p>
                                    <p className="text-sm text-muted-foreground">{variant.description}</p>
                                </div>

                                {variant.variantInstructions && (
                                    <div>
                                        <p className="text-sm font-medium mb-2">Instructions</p>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p><strong>Tone:</strong> {variant.variantInstructions.tone}</p>
                                            {variant.variantInstructions.talkingPoints && (
                                                <div>
                                                    <strong>Talking Points:</strong>
                                                    <ul className="list-disc list-inside ml-2">
                                                        {variant.variantInstructions.talkingPoints.map((tp: string, i: number) => (
                                                            <li key={i}>{tp}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
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

                                {variant.founderFeedback && (
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-sm font-medium mb-1">Feedback</p>
                                        <p className="text-sm">{variant.founderFeedback}</p>
                                        {variant.revisionDeadline && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Deadline: {new Date(variant.revisionDeadline).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {variant.approvalStatus === 'PENDING_REVIEW' && (
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => setReviewDialog({ open: true, variantId: variant.id, action: 'APPROVE' })}
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setReviewDialog({ open: true, variantId: variant.id, action: 'REQUEST_REVISION' })}
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Request Revision
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {canDeploy && (
                    <Card className="border-primary">
                        <CardHeader>
                            <CardTitle>Ready to Deploy</CardTitle>
                            <CardDescription>
                                All variants have been approved. Deploy this test to start tracking performance.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={handleDeploy} disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Rocket className="w-4 h-4 mr-2" />
                                )}
                                Deploy Test
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {test.status === 'ACTIVE' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Tracking</CardTitle>
                            <CardDescription>Test is currently active and tracking performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => router.push(`/founder/campaigns/${campaignId}/ab-tests/${abId}/results`)}>
                                View Results
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog({ ...reviewDialog, open })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {reviewDialog.action === 'APPROVE' ? 'Approve Variant' : 'Request Revision'}
                        </DialogTitle>
                        <DialogDescription>
                            {reviewDialog.action === 'APPROVE'
                                ? 'Approve this variant to proceed with the test.'
                                : 'Provide feedback for the creator to revise this variant.'}
                        </DialogDescription>
                    </DialogHeader>

                    {reviewDialog.action === 'REQUEST_REVISION' && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="feedback">Feedback *</Label>
                                <Textarea
                                    id="feedback"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Explain what needs to be changed..."
                                    rows={4}
                                />
                            </div>
                            <div>
                                <Label htmlFor="deadline">Revision Deadline (Optional)</Label>
                                <Input
                                    id="deadline"
                                    type="datetime-local"
                                    value={revisionDeadline}
                                    onChange={(e) => setRevisionDeadline(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReviewDialog({ ...reviewDialog, open: false })}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReview}
                            disabled={isSubmitting || (reviewDialog.action === 'REQUEST_REVISION' && !feedback)}
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {reviewDialog.action === 'APPROVE' ? 'Approve' : 'Send Feedback'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
