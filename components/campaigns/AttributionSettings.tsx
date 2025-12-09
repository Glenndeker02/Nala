"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, DollarSign, Percent, Gift } from "lucide-react";

interface AttributionSettingsProps {
    enabled: boolean;
    onEnabledChange: (enabled: boolean) => void;
    strategy: "AUTO" | "CUSTOM";
    onStrategyChange: (strategy: "AUTO" | "CUSTOM") => void;
    commissionPerConversion: number;
    onCommissionChange: (commission: number) => void;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_TRIAL" | "FREE_MONTH" | null;
    onDiscountTypeChange: (type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_TRIAL" | "FREE_MONTH" | null) => void;
    discountValue: number;
    onDiscountValueChange: (value: number) => void;
    attributionWindowDays: number;
    onAttributionWindowChange: (days: number) => void;
}

export default function AttributionSettings({
    enabled,
    onEnabledChange,
    strategy,
    onStrategyChange,
    commissionPerConversion,
    onCommissionChange,
    discountType,
    onDiscountTypeChange,
    discountValue,
    onDiscountValueChange,
    attributionWindowDays,
    onAttributionWindowChange,
}: AttributionSettingsProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Attribution Codes & Creator Compensation</CardTitle>
                        <CardDescription>
                            Enable creator attribution codes to track conversions and pay commissions
                        </CardDescription>
                    </div>
                    <Switch
                        checked={enabled}
                        onCheckedChange={onEnabledChange}
                    />
                </div>
            </CardHeader>

            {enabled && (
                <CardContent className="space-y-6">
                    {/* Info Alert */}
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            When enabled, creators will receive unique codes to share with their audience.
                            You'll track redemptions and conversions, and pay creators commission for verified sales.
                        </AlertDescription>
                    </Alert>

                    {/* Code Generation Strategy */}
                    <div className="space-y-3">
                        <Label>Code Generation Strategy</Label>
                        <RadioGroup
                            value={strategy}
                            onValueChange={(value) => onStrategyChange(value as "AUTO" | "CUSTOM")}
                            className="flex flex-col space-y-2"
                        >
                            <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                                <RadioGroupItem value="AUTO" id="auto" />
                                <Label htmlFor="auto" className="flex-1 cursor-pointer">
                                    <div className="font-medium">Automatic Generation</div>
                                    <div className="text-sm text-muted-foreground">
                                        Codes are auto-generated when you accept creators (e.g., MARY01-TT, JOHN02-IG)
                                    </div>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                                <RadioGroupItem value="CUSTOM" id="custom" />
                                <Label htmlFor="custom" className="flex-1 cursor-pointer">
                                    <div className="font-medium">Custom Codes</div>
                                    <div className="text-sm text-muted-foreground">
                                        You manually create custom codes for each creator
                                    </div>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Commission Settings */}
                    <div className="space-y-3">
                        <Label htmlFor="commission" className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Commission per Conversion
                        </Label>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">$</span>
                            <Input
                                id="commission"
                                type="number"
                                min="0"
                                step="0.01"
                                value={commissionPerConversion}
                                onChange={(e) => onCommissionChange(parseFloat(e.target.value) || 0)}
                                className="max-w-[200px]"
                                placeholder="15.00"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Amount paid to creator for each verified conversion
                        </p>
                    </div>

                    {/* Discount Settings */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                            <Gift className="h-4 w-4" />
                            Customer Discount (Optional)
                        </Label>
                        <Select
                            value={discountType || "NONE"}
                            onValueChange={(value) =>
                                onDiscountTypeChange(value === "NONE" ? null : value as any)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select discount type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">No Discount</SelectItem>
                                <SelectItem value="PERCENTAGE">Percentage Off</SelectItem>
                                <SelectItem value="FIXED_AMOUNT">Fixed Amount Off</SelectItem>
                                <SelectItem value="FREE_TRIAL">Free Trial Period</SelectItem>
                                <SelectItem value="FREE_MONTH">Free Month</SelectItem>
                            </SelectContent>
                        </Select>

                        {discountType && discountType !== "FREE_TRIAL" && discountType !== "FREE_MONTH" && (
                            <div className="flex items-center gap-2">
                                {discountType === "PERCENTAGE" && <Percent className="h-5 w-5" />}
                                {discountType === "FIXED_AMOUNT" && <span className="text-xl font-bold">$</span>}
                                <Input
                                    type="number"
                                    min="0"
                                    step={discountType === "PERCENTAGE" ? "1" : "0.01"}
                                    max={discountType === "PERCENTAGE" ? "100" : undefined}
                                    value={discountValue}
                                    onChange={(e) => onDiscountValueChange(parseFloat(e.target.value) || 0)}
                                    className="max-w-[200px]"
                                    placeholder={discountType === "PERCENTAGE" ? "20" : "10.00"}
                                />
                                {discountType === "PERCENTAGE" && <span className="text-sm text-muted-foreground">%</span>}
                            </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                            Discount applied when customers use creator codes
                        </p>
                    </div>

                    {/* Attribution Window */}
                    <div className="space-y-3">
                        <Label htmlFor="attribution-window">Attribution Window</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="attribution-window"
                                type="number"
                                min="1"
                                max="90"
                                value={attributionWindowDays}
                                onChange={(e) => onAttributionWindowChange(parseInt(e.target.value) || 30)}
                                className="max-w-[200px]"
                            />
                            <span className="text-sm text-muted-foreground">days</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            How long after code redemption to attribute conversions to the creator
                        </p>
                    </div>

                    {/* Summary */}
                    <div className="bg-accent/50 rounded-lg p-4 space-y-2">
                        <h4 className="font-medium">Summary</h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• Codes will be {strategy === "AUTO" ? "automatically generated" : "manually created"}</li>
                            <li>• Creators earn ${commissionPerConversion.toFixed(2)} per conversion</li>
                            {discountType && (
                                <li>
                                    • Customers get{" "}
                                    {discountType === "PERCENTAGE" && `${discountValue}% off`}
                                    {discountType === "FIXED_AMOUNT" && `$${discountValue.toFixed(2)} off`}
                                    {discountType === "FREE_TRIAL" && "a free trial"}
                                    {discountType === "FREE_MONTH" && "a free month"}
                                </li>
                            )}
                            <li>• {attributionWindowDays}-day attribution window</li>
                        </ul>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
