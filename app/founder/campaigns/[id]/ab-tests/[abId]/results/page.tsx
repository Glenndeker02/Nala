"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Loader2, Trophy, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ABTestResultsPageProps {
    params: { id: string; abId: string };
}

export default function ABTestResultsPage({ params }: ABTestResultsPageProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { id: campaignId, abId } = params;

    const [test, setTest] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [winnerVariantId, setWinnerVariantId] = useState('');
    const [conclusionNotes, setConclusionNotes] = useState('');
    const [adoptAction, setAdoptAction] = useState('');

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
                if (data.data.winnerVariantId) {
                    setWinnerVariantId(data.data.winnerVariantId);
                }
            }
        } catch (error) {
            console.error('Error fetching test:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConclude = async () => {
        if (!winnerVariantId) {
            toast({
                title: 'Error',
                description: 'Please select a winner variant',
                variant: 'destructive',
            });
            return;
        }

        if (!confirm('Are you sure you want to conclude this A/B test? This action cannot be undone.')) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/campaigns/${campaignId}/ab-tests/${abId}/conclude`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    winnerVariantId,
                    conclusionNotes,
                    adoptAction: adoptAction || undefined,
                }),
            });

            if (!response.ok) throw new Error('Failed to conclude test');

            toast({
                title: 'Success',
                description: 'A/B test concluded successfully',
            });

            router.push(`/founder/campaigns/${campaignId}`);
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
    const canConclude = test.status === 'ACTIVE' && !isCompleted;

    return (
        <div className="container max-w-6xl mx-auto py-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold">{test.name} - Results</h1>
                        <p className="text-muted-foreground mt-2">
                            {test.hypothesis && `Hypothesis: ${test.hypothesis}`}
                        </p>
                    </div>
                    {isCompleted && (
                        <Badge variant="default" className="flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            Completed
                        </Badge>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Comparison</CardTitle>
                        <CardDescription>Compare metrics between variants</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3">Metric</th>
                                        {test.variants?.map((variant: any) => (
                                            <th key={variant.id} className="text-center p-3">
                                                {variant.variantName}
                                            </th>
                                        ))}
                                        <th className="text-center p-3">Winner</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="p-3 font-medium">Views</td>
                                        {test.variants?.map((variant: any) => (
                                            <td key={variant.id} className="text-center p-3">
                                                {variant.views?.toLocaleString() || 0}
                                            </td>
                                        ))}
                                        <td className="text-center p-3">
                                            {test.variants?.[0]?.views > test.variants?.[1]?.views ? (
                                                <Badge variant="default">A</Badge>
                                            ) : (
                                                <Badge variant="default">B</Badge>
                                            )}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-3 font-medium">Conversions</td>
                                        {test.variants?.map((variant: any) => (
                                            <td key={variant.id} className="text-center p-3">
                                                {variant.conversions?.toLocaleString() || 0}
                                            </td>
                                        ))}
                                        <td className="text-center p-3">
                                            {test.variants?.[0]?.conversions > test.variants?.[1]?.conversions ? (
                                                <Badge variant="default">A</Badge>
                                            ) : (
                                                <Badge variant="default">B</Badge>
                                            )}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-3 font-medium">Engagement</td>
                                        {test.variants?.map((variant: any) => (
                                            <td key={variant.id} className="text-center p-3">
                                                {variant.engagement?.toLocaleString() || 0}
                                            </td>
                                        ))}
                                        <td className="text-center p-3">
                                            {test.variants?.[0]?.engagement > test.variants?.[1]?.engagement ? (
                                                <Badge variant="default">A</Badge>
                                            ) : (
                                                <Badge variant="default">B</Badge>
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-medium">Performance Score</td>
                                        {test.variants?.map((variant: any) => (
                                            <td key={variant.id} className="text-center p-3">
                                                {variant.performanceScore || 0}
                                            </td>
                                        ))}
                                        <td className="text-center p-3">
                                            {test.variants?.[0]?.performanceScore > test.variants?.[1]?.performanceScore ? (
                                                <Badge variant="default">A</Badge>
                                            ) : (
                                                <Badge variant="default">B</Badge>
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {isCompleted && test.winnerVariantId && (
                    <Card className="border-primary">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="w-5 h-5" />
                                Winner Selected
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium mb-2">
                                {test.variants?.find((v: any) => v.id === test.winnerVariantId)?.variantName}
                            </p>
                            {test.conclusionNotes && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium mb-1">Conclusion Notes:</p>
                                    <p className="text-sm text-muted-foreground">{test.conclusionNotes}</p>
                                </div>
                            )}
                            {test.adoptAction && (
                                <div className="mt-2">
                                    <Badge variant="secondary">{test.adoptAction.replace(/_/g, ' ')}</Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {canConclude && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Conclude Test</CardTitle>
                            <CardDescription>Select the winning variant and finalize the test</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="winner">Select Winner *</Label>
                                <Select value={winnerVariantId} onValueChange={setWinnerVariantId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose winning variant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {test.variants?.map((variant: any) => (
                                            <SelectItem key={variant.id} value={variant.id}>
                                                {variant.variantName} - {variant.label}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="inconclusive">Inconclusive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="notes">Conclusion Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={conclusionNotes}
                                    onChange={(e) => setConclusionNotes(e.target.value)}
                                    placeholder="Summarize your findings and insights..."
                                    rows={4}
                                />
                            </div>

                            <div>
                                <Label>Adoption Action (Optional)</Label>
                                <RadioGroup value={adoptAction} onValueChange={setAdoptAction}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="CONVERT_TO_FORMAT" id="convert" />
                                        <Label htmlFor="convert" className="font-normal">
                                            Convert to Campaign Format
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="REQUEST_MORE" id="request" />
                                        <Label htmlFor="request" className="font-normal">
                                            Request More Videos with Winning Format
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="REPLACE_LOSING" id="replace" />
                                        <Label htmlFor="replace" className="font-normal">
                                            Replace Losing Format Across Campaign
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <Button onClick={handleConclude} disabled={isSubmitting || !winnerVariantId}>
                                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Conclude Test
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
