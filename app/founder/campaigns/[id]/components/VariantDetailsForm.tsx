import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, DollarSign, Eye, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Creator {
    id: string;
    fullName: string;
    creatorProfile: {
        baseFeeTiktok: number;
    };
}

interface VariantConfig {
    creatorId: string;
    label: string;
    budget: number;
    baseFee: number;
    performanceBudget: number;
    expectedViews: number;
    deadline: Date | undefined;
    instructions: string;
}

interface VariantDetailsFormProps {
    creators: Creator[];
    onBack: () => void;
    onSubmit: (configs: VariantConfig[]) => void;
}

export default function VariantDetailsForm({ creators, onBack, onSubmit }: VariantDetailsFormProps) {
    const [configs, setConfigs] = useState<VariantConfig[]>(
        creators.map(c => ({
            creatorId: c.id,
            label: `Variant - ${c.fullName.split(' ')[0]}`,
            baseFee: Number(c.creatorProfile.baseFeeTiktok),
            budget: Number(c.creatorProfile.baseFeeTiktok) + 200, // Default budget = base + 200 performance
            performanceBudget: 200,
            expectedViews: 10000,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            instructions: "Create a high-energy hook variation focusing on the main value proposition."
        }))
    );

    const updateConfig = (index: number, field: keyof VariantConfig, value: any) => {
        const newConfigs = [...configs];
        newConfigs[index] = { ...newConfigs[index], [field]: value };

        // Auto-update total budget if base or performance changes
        if (field === 'baseFee' || field === 'performanceBudget') {
            newConfigs[index].budget = Number(newConfigs[index].baseFee) + Number(newConfigs[index].performanceBudget);
        }

        setConfigs(newConfigs);
    };

    const handleSubmit = () => {
        onSubmit(configs);
    };

    const totalBudget = configs.reduce((sum, c) => sum + c.budget, 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Configure Variants</h3>
                <div className="text-sm text-muted-foreground">
                    Total Budget Allocation: <span className="font-bold text-foreground">${totalBudget.toFixed(2)}</span>
                </div>
            </div>

            <div className="grid gap-6">
                {configs.map((config, index) => {
                    const creator = creators.find(c => c.id === config.creatorId)!;
                    return (
                        <Card key={config.creatorId}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.id}`} />
                                        <AvatarFallback>{creator.fullName.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base">{creator.fullName}</CardTitle>
                                        <div className="text-xs text-muted-foreground">Base Rate: ${Number(creator.creatorProfile.baseFeeTiktok)}</div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Variant Label</Label>
                                        <Input
                                            value={config.label}
                                            onChange={(e) => updateConfig(index, 'label', e.target.value)}
                                            placeholder="e.g. Hook A"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Deadline</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !config.deadline && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {config.deadline ? format(config.deadline, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={config.deadline}
                                                    onSelect={(date) => updateConfig(index, 'deadline', date)}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Base Fee ($)</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                className="pl-8"
                                                value={config.baseFee}
                                                onChange={(e) => updateConfig(index, 'baseFee', Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Performance Bonus ($)</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                className="pl-8"
                                                value={config.performanceBudget}
                                                onChange={(e) => updateConfig(index, 'performanceBudget', Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Expected Views</Label>
                                        <div className="relative">
                                            <Eye className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                className="pl-8"
                                                value={config.expectedViews}
                                                onChange={(e) => updateConfig(index, 'expectedViews', Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Instructions</Label>
                                    <Textarea
                                        placeholder="Specific instructions for this variant..."
                                        value={config.instructions}
                                        onChange={(e) => updateConfig(index, 'instructions', e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={onBack}>Back to Selection</Button>
                <Button onClick={handleSubmit}>Create {configs.length} Variant{configs.length !== 1 ? 's' : ''}</Button>
            </div>
        </div>
    );
}
