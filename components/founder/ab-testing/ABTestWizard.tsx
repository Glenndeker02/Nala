import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/Card";
import { Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle2, User, Video, FileText, Target, Library } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ContentLibraryPicker } from "@/components/founder/library/ContentLibraryPicker";

interface ABTestWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
    founderCampaigns: any[];
}

type Step = 'CAMPAIGN' | 'CONFIG' | 'VARIANTS' | 'CREATORS' | 'REVIEW';

export function ABTestWizard({ isOpen, onClose, onCreated, founderCampaigns }: ABTestWizardProps) {
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState<Step>('CAMPAIGN');
    const [loading, setLoading] = useState(false);

    // Form State
    const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
    const [testConfig, setTestConfig] = useState({
        name: "",
        testGoal: "BEST_HOOK",
        successMetric: "CONVERSION_RATE",
        description: ""
    });
    const [variants, setVariants] = useState<any[]>([
        { id: 1, name: "Variant A", type: "HOOK", label: "", instructions: "" },
        { id: 2, name: "Variant B", type: "HOOK", label: "", instructions: "" }
    ]);
    const [assignments, setAssignments] = useState<Record<number, string>>({});

    // Library Picker State
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [activeVariantId, setActiveVariantId] = useState<number | null>(null);

    // Mock data for creators (replace with API call)
    const [availableCreators, setAvailableCreators] = useState<any[]>([]);

    const handleNext = () => {
        switch (currentStep) {
            case 'CAMPAIGN':
                if (!selectedCampaignId) return;
                setCurrentStep('CONFIG');
                break;
            case 'CONFIG':
                if (!testConfig.name) return;
                setCurrentStep('VARIANTS');
                break;
            case 'VARIANTS':
                if (variants.some(v => !v.label)) {
                    toast({ title: "Validation Error", description: "All variants must have a label", variant: "destructive" });
                    return;
                }
                setCurrentStep('CREATORS');
                // Fetch creators for the selected campaign/platform if needed
                break;
            case 'CREATORS':
                setCurrentStep('REVIEW');
                break;
        }
    };

    const handleBack = () => {
        switch (currentStep) {
            case 'CONFIG': setCurrentStep('CAMPAIGN'); break;
            case 'VARIANTS': setCurrentStep('CONFIG'); break;
            case 'CREATORS': setCurrentStep('VARIANTS'); break;
            case 'REVIEW': setCurrentStep('CREATORS'); break;
        }
    };

    const addVariant = () => {
        if (variants.length >= 6) return;
        const nextId = variants.length + 1;
        const letter = String.fromCharCode(65 + variants.length);
        setVariants([...variants, {
            id: Date.now(),
            name: `Variant ${letter}`,
            type: testConfig.testGoal === 'BEST_CREATOR' ? 'CREATOR' : 'HOOK',
            label: "",
            instructions: ""
        }]);
    };

    const removeVariant = (id: number) => {
        if (variants.length <= 2) return;
        setVariants(variants.filter(v => v.id !== id));
    };

    const openLibraryPicker = (variantId: number) => {
        setActiveVariantId(variantId);
        setIsLibraryOpen(true);
    };

    const handleLibrarySelect = (format: any) => {
        if (activeVariantId) {
            const newVariants = variants.map(v => {
                if (v.id === activeVariantId) {
                    return {
                        ...v,
                        label: format.name,
                        instructions: `Based on format: ${format.name}. ${format.description}`,
                        type: 'FORMAT', // Auto-switch type to FORMAT
                        metadata: {
                            formatId: format.id,
                            source: 'CONTENT_LIBRARY'
                        }
                    };
                }
                return v;
            });
            setVariants(newVariants);
            toast({ title: "Format Selected", description: `Applied ${format.name} to variant.` });
        }
        setIsLibraryOpen(false);
        setActiveVariantId(null);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/ab-tests/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    campaignId: selectedCampaignId,
                    ...testConfig,
                    variants: variants.map(v => ({
                        ...v,
                        creatorId: assignments[v.id]
                    }))
                })
            });

            if (!response.ok) throw new Error('Failed to create test');

            toast({ title: "Success", description: "A/B Test created successfully!" });
            onCreated();
            onClose();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to create A/B test", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create A/B Test</DialogTitle>
                    </DialogHeader>

                    <div className="py-6">
                        {/* Progress Steps */}
                        <div className="flex justify-between mb-8 px-4">
                            {['CAMPAIGN', 'CONFIG', 'VARIANTS', 'CREATORS', 'REVIEW'].map((step, index) => (
                                <div key={step} className={`flex flex-col items-center ${['CAMPAIGN', 'CONFIG', 'VARIANTS', 'CREATORS', 'REVIEW'].indexOf(currentStep) >= index
                                    ? 'text-primary' : 'text-gray-400'
                                    }`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 ${['CAMPAIGN', 'CONFIG', 'VARIANTS', 'CREATORS', 'REVIEW'].indexOf(currentStep) >= index
                                        ? 'border-primary bg-primary/10' : 'border-gray-200'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <span className="text-xs font-medium">{step}</span>
                                </div>
                            ))}
                        </div>

                        {/* Step Content */}
                        <div className="min-h-[400px]">
                            {currentStep === 'CAMPAIGN' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Select Campaign</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {founderCampaigns.map(campaign => (
                                            <Card
                                                key={campaign.id}
                                                className={`cursor-pointer transition-all hover:border-primary ${selectedCampaignId === campaign.id ? 'border-primary ring-2 ring-primary/20' : ''
                                                    }`}
                                                onClick={() => setSelectedCampaignId(campaign.id)}
                                            >
                                                <CardContent className="p-4">
                                                    <h4 className="font-semibold">{campaign.name}</h4>
                                                    <p className="text-sm text-gray-500">{campaign.platform} • {campaign.status}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentStep === 'CONFIG' && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>Test Name</Label>
                                        <Input
                                            placeholder="e.g., Hook Testing Q1"
                                            value={testConfig.name}
                                            onChange={e => setTestConfig({ ...testConfig, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Test Goal</Label>
                                            <Select
                                                value={testConfig.testGoal}
                                                onValueChange={v => setTestConfig({ ...testConfig, testGoal: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="BEST_HOOK">Best Hook</SelectItem>
                                                    <SelectItem value="BEST_CREATOR">Best Creator</SelectItem>
                                                    <SelectItem value="BEST_FORMAT">Best Format</SelectItem>
                                                    <SelectItem value="BEST_CTA">Best CTA</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Success Metric</Label>
                                            <Select
                                                value={testConfig.successMetric}
                                                onValueChange={v => setTestConfig({ ...testConfig, successMetric: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="CONVERSION_RATE">Conversion Rate</SelectItem>
                                                    <SelectItem value="VIEW_THROUGH_RATE">View Through Rate</SelectItem>
                                                    <SelectItem value="ENGAGEMENT_RATE">Engagement Rate</SelectItem>
                                                    <SelectItem value="COST_PER_VIEW">Cost Per View</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            placeholder="Describe what you're testing..."
                                            value={testConfig.description}
                                            onChange={e => setTestConfig({ ...testConfig, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {currentStep === 'VARIANTS' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-medium">Define Variants</h3>
                                        <Button variant="outline" size="sm" onClick={addVariant} disabled={variants.length >= 6}>
                                            <Plus className="w-4 h-4 mr-2" /> Add Variant
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {variants.map((variant, index) => (
                                            <Card key={variant.id}>
                                                <CardContent className="p-4 space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-2">
                                                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-bold">
                                                                {variant.name}
                                                            </span>
                                                            <Select
                                                                value={variant.type}
                                                                onValueChange={v => {
                                                                    const newVariants = [...variants];
                                                                    newVariants[index].type = v;
                                                                    setVariants(newVariants);
                                                                }}
                                                            >
                                                                <SelectTrigger className="w-[150px] h-8">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="HOOK">Hook</SelectItem>
                                                                    <SelectItem value="CREATOR">Creator</SelectItem>
                                                                    <SelectItem value="FORMAT">Format</SelectItem>
                                                                    <SelectItem value="SCRIPT">Script</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8"
                                                                onClick={() => openLibraryPicker(variant.id)}
                                                                title="Adopt from Content Library"
                                                            >
                                                                <Library className="w-3 h-3 mr-2" />
                                                                Library
                                                            </Button>
                                                            {variants.length > 2 && (
                                                                <Button variant="ghost" size="sm" onClick={() => removeVariant(variant.id)}>
                                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Label</Label>
                                                            <Input
                                                                placeholder="e.g., Problem-First Hook"
                                                                value={variant.label}
                                                                onChange={e => {
                                                                    const newVariants = [...variants];
                                                                    newVariants[index].label = e.target.value;
                                                                    setVariants(newVariants);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Instructions</Label>
                                                            <Input
                                                                placeholder="Specific instructions for this variant..."
                                                                value={variant.instructions}
                                                                onChange={e => {
                                                                    const newVariants = [...variants];
                                                                    newVariants[index].instructions = e.target.value;
                                                                    setVariants(newVariants);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentStep === 'CREATORS' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium">Assign Creators</h3>
                                    <p className="text-sm text-gray-500">Select which creator will produce each variant.</p>

                                    <div className="space-y-4">
                                        {variants.map(variant => (
                                            <div key={variant.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <h4 className="font-medium">{variant.name}: {variant.label}</h4>
                                                    <p className="text-sm text-gray-500">{variant.instructions || "No specific instructions"}</p>
                                                </div>
                                                <Select
                                                    value={assignments[variant.id]}
                                                    onValueChange={v => setAssignments({ ...assignments, [variant.id]: v })}
                                                >
                                                    <SelectTrigger className="w-[250px]">
                                                        <SelectValue placeholder="Select Creator" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {/* Replace with real creators */}
                                                        <SelectItem value="creator1">Sarah Martinez (Tech)</SelectItem>
                                                        <SelectItem value="creator2">James Wilson (Fitness)</SelectItem>
                                                        <SelectItem value="creator3">Emma Thompson (Creative)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentStep === 'REVIEW' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium">Review & Launch</h3>

                                    <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Test Name</span>
                                            <span className="font-medium">{testConfig.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Goal</span>
                                            <span className="font-medium">{testConfig.testGoal}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Metric</span>
                                            <span className="font-medium">{testConfig.successMetric}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Total Variants</span>
                                            <span className="font-medium">{variants.length}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-medium">Variant Summary</h4>
                                        {variants.map(v => (
                                            <div key={v.id} className="flex items-center gap-2 text-sm text-gray-600">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                <span className="font-medium">{v.name}:</span>
                                                <span>{v.label}</span>
                                                <span className="text-gray-400">•</span>
                                                <span>Assigned to {assignments[v.id] ? "Creator" : "Pending"}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="flex justify-between items-center">
                        <Button variant="ghost" onClick={currentStep === 'CAMPAIGN' ? onClose : handleBack}>
                            {currentStep === 'CAMPAIGN' ? 'Cancel' : 'Back'}
                        </Button>
                        <Button onClick={currentStep === 'REVIEW' ? handleSubmit : handleNext} disabled={loading}>
                            {loading ? 'Creating...' : currentStep === 'REVIEW' ? 'Launch Test' : 'Next'}
                            {currentStep !== 'REVIEW' && <ArrowRight className="w-4 h-4 ml-2" />}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ContentLibraryPicker
                isOpen={isLibraryOpen}
                onClose={() => setIsLibraryOpen(false)}
                onSelect={handleLibrarySelect}
                title="Adopt Format for Variant"
            />
        </>
    );
}
