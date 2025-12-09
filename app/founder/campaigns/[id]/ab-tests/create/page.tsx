"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Loader2, Plus, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Creator {
    id: string;
    fullName: string;
    email: string;
    creatorProfile?: {
        categories: string[];
        avgRating: number;
    };
}

interface ABTestCreatePageProps {
    params: { id: string };
}

export default function ABTestCreatePage({ params }: ABTestCreatePageProps) {
    const router = useRouter();
    const { toast } = useToast();
    const campaignId = params.id;

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [creators, setCreators] = useState<Creator[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        hypothesis: '',
        testGoal: '',
        successMetric: '',
        variantA: {
            title: '',
            description: '',
            talkingPoints: [''],
            tone: '',
            visualStyle: '',
            requiredLength: '',
        },
        variantB: {
            title: '',
            description: '',
            talkingPoints: [''],
            tone: '',
            visualStyle: '',
            requiredLength: '',
        },
        assignedCreatorIds: [] as string[],
        trackingMetrics: [] as string[],
        testDurationDays: 7,
    });

    useEffect(() => {
        fetchCreators();
    }, []);

    const fetchCreators = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/campaigns/${campaignId}/creators`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setCreators(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching creators:', error);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/campaigns/${campaignId}/ab-tests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create A/B test');
            }

            const data = await response.json();
            toast({
                title: 'Success',
                description: 'A/B test created successfully',
            });

            router.push(`/founder/campaigns/${campaignId}/ab-tests/${data.data.id}`);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const addTalkingPoint = (variant: 'variantA' | 'variantB') => {
        setFormData(prev => ({
            ...prev,
            [variant]: {
                ...prev[variant],
                talkingPoints: [...prev[variant].talkingPoints, ''],
            },
        }));
    };

    const removeTalkingPoint = (variant: 'variantA' | 'variantB', index: number) => {
        setFormData(prev => ({
            ...prev,
            [variant]: {
                ...prev[variant],
                talkingPoints: prev[variant].talkingPoints.filter((_, i) => i !== index),
            },
        }));
    };

    const updateTalkingPoint = (variant: 'variantA' | 'variantB', index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            [variant]: {
                ...prev[variant],
                talkingPoints: prev[variant].talkingPoints.map((tp, i) => i === index ? value : tp),
            },
        }));
    };

    const renderStep1 = () => (
        <Card>
            <CardHeader>
                <CardTitle>Test Design</CardTitle>
                <CardDescription>Define your A/B test goals and hypothesis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="name">Test Name *</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Hook Variation Test"
                    />
                </div>

                <div>
                    <Label htmlFor="hypothesis">Hypothesis (Optional)</Label>
                    <Textarea
                        id="hypothesis"
                        value={formData.hypothesis}
                        onChange={(e) => setFormData({ ...formData, hypothesis: e.target.value })}
                        placeholder="What do you expect to learn from this test?"
                        rows={3}
                    />
                </div>

                <div>
                    <Label htmlFor="testGoal">Test Goal *</Label>
                    <Select value={formData.testGoal} onValueChange={(value) => setFormData({ ...formData, testGoal: value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select test goal" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="BEST_HOOK">Increase CTR</SelectItem>
                            <SelectItem value="BEST_FORMAT">Improve Conversions</SelectItem>
                            <SelectItem value="BEST_OVERALL">Boost Engagement</SelectItem>
                            <SelectItem value="BEST_CTA">Reduce CAC</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="successMetric">Success Metric *</Label>
                    <Select value={formData.successMetric} onValueChange={(value) => setFormData({ ...formData, successMetric: value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select success metric" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TOTAL_VIEWS">Total Views</SelectItem>
                            <SelectItem value="VIEW_THROUGH_RATE">View Through Rate</SelectItem>
                            <SelectItem value="ENGAGEMENT_RATE">Engagement Rate</SelectItem>
                            <SelectItem value="CONVERSION_RATE">Conversion Rate</SelectItem>
                            <SelectItem value="COST_PER_VIEW">Cost Per View</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );

    const renderVariantForm = (variant: 'variantA' | 'variantB', label: string) => (
        <Card>
            <CardHeader>
                <CardTitle>{label}</CardTitle>
                <CardDescription>Define the specific requirements for this variant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label>Title *</Label>
                    <Input
                        value={formData[variant].title}
                        onChange={(e) => setFormData({
                            ...formData,
                            [variant]: { ...formData[variant], title: e.target.value }
                        })}
                        placeholder="e.g., Emotional Hook"
                    />
                </div>

                <div>
                    <Label>Description *</Label>
                    <Textarea
                        value={formData[variant].description}
                        onChange={(e) => setFormData({
                            ...formData,
                            [variant]: { ...formData[variant], description: e.target.value }
                        })}
                        placeholder="Describe this variant..."
                        rows={3}
                    />
                </div>

                <div>
                    <Label>Talking Points *</Label>
                    {formData[variant].talkingPoints.map((point, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                            <Input
                                value={point}
                                onChange={(e) => updateTalkingPoint(variant, index, e.target.value)}
                                placeholder={`Talking point ${index + 1}`}
                            />
                            {formData[variant].talkingPoints.length > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeTalkingPoint(variant, index)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addTalkingPoint(variant)}
                        className="mt-2"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Talking Point
                    </Button>
                </div>

                <div>
                    <Label>Tone *</Label>
                    <Input
                        value={formData[variant].tone}
                        onChange={(e) => setFormData({
                            ...formData,
                            [variant]: { ...formData[variant], tone: e.target.value }
                        })}
                        placeholder="e.g., Professional, Casual, Energetic"
                    />
                </div>

                <div>
                    <Label>Visual Style (Optional)</Label>
                    <Input
                        value={formData[variant].visualStyle}
                        onChange={(e) => setFormData({
                            ...formData,
                            [variant]: { ...formData[variant], visualStyle: e.target.value }
                        })}
                        placeholder="e.g., Close-up, Wide shot, B-roll heavy"
                    />
                </div>

                <div>
                    <Label>Required Length (Optional)</Label>
                    <Input
                        value={formData[variant].requiredLength}
                        onChange={(e) => setFormData({
                            ...formData,
                            [variant]: { ...formData[variant], requiredLength: e.target.value }
                        })}
                        placeholder="e.g., 15-30 seconds, 60 seconds max"
                    />
                </div>
            </CardContent>
        </Card>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            {renderVariantForm('variantA', 'Variant A Configuration')}
            {renderVariantForm('variantB', 'Variant B Configuration')}
        </div>
    );

    const renderStep3 = () => (
        <Card>
            <CardHeader>
                <CardTitle>Creator Selection</CardTitle>
                <CardDescription>Select creators to assign to this A/B test</CardDescription>
            </CardHeader>
            <CardContent>
                {creators.length === 0 ? (
                    <p className="text-muted-foreground">No creators available for this campaign.</p>
                ) : (
                    <div className="space-y-3">
                        {creators.map((creator) => (
                            <div key={creator.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                                <Checkbox
                                    checked={formData.assignedCreatorIds.includes(creator.id)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setFormData({
                                                ...formData,
                                                assignedCreatorIds: [...formData.assignedCreatorIds, creator.id]
                                            });
                                        } else {
                                            setFormData({
                                                ...formData,
                                                assignedCreatorIds: formData.assignedCreatorIds.filter(id => id !== creator.id)
                                            });
                                        }
                                    }}
                                />
                                <div className="flex-1">
                                    <p className="font-medium">{creator.fullName}</p>
                                    <p className="text-sm text-muted-foreground">{creator.email}</p>
                                    {creator.creatorProfile && (
                                        <p className="text-xs text-muted-foreground">
                                            {creator.creatorProfile.categories.join(', ')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );

    const renderStep4 = () => (
        <Card>
            <CardHeader>
                <CardTitle>Tracking Setup</CardTitle>
                <CardDescription>Configure performance tracking metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label>Select Metrics to Track</Label>
                    <div className="space-y-2 mt-2">
                        {['views', 'clicks', 'conversions', 'watchTime', 'engagement'].map((metric) => (
                            <div key={metric} className="flex items-center space-x-2">
                                <Checkbox
                                    checked={formData.trackingMetrics.includes(metric)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setFormData({
                                                ...formData,
                                                trackingMetrics: [...formData.trackingMetrics, metric]
                                            });
                                        } else {
                                            setFormData({
                                                ...formData,
                                                trackingMetrics: formData.trackingMetrics.filter(m => m !== metric)
                                            });
                                        }
                                    }}
                                />
                                <Label className="capitalize">{metric}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <Label htmlFor="testDuration">Test Duration (Days)</Label>
                    <Input
                        id="testDuration"
                        type="number"
                        min="1"
                        max="30"
                        value={formData.testDurationDays}
                        onChange={(e) => setFormData({ ...formData, testDurationDays: parseInt(e.target.value) || 7 })}
                    />
                </div>
            </CardContent>
        </Card>
    );

    const canProceed = () => {
        switch (step) {
            case 1:
                return formData.name && formData.testGoal && formData.successMetric;
            case 2:
                return formData.variantA.title && formData.variantA.description && formData.variantA.tone &&
                    formData.variantB.title && formData.variantB.description && formData.variantB.tone &&
                    formData.variantA.talkingPoints.some(tp => tp.trim()) &&
                    formData.variantB.talkingPoints.some(tp => tp.trim());
            case 3:
                return formData.assignedCreatorIds.length > 0;
            case 4:
                return true;
            default:
                return false;
        }
    };

    return (
        <div className="container max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Campaign
                </Button>
                <h1 className="text-3xl font-bold">Create A/B Test</h1>
                <p className="text-muted-foreground mt-2">
                    Step {step} of 4: {
                        step === 1 ? 'Test Design' :
                            step === 2 ? 'Define Variants' :
                                step === 3 ? 'Creator Selection' :
                                    'Tracking Setup'
                    }
                </p>
            </div>

            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex items-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${s <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                }`}>
                                {s}
                            </div>
                            {s < 4 && <div className={`flex-1 h-1 mx-2 ${s < step ? 'bg-primary' : 'bg-muted'}`} />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-8">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
            </div>

            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    disabled={step === 1}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                </Button>

                {step < 4 ? (
                    <Button
                        onClick={() => setStep(step + 1)}
                        disabled={!canProceed()}
                    >
                        Next <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !canProceed()}
                    >
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Create A/B Test
                    </Button>
                )}
            </div>
        </div>
    );
}
