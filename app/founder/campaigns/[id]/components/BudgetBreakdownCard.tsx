import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useCampaignRealtime } from "@/lib/hooks/useWebSocket";

interface BudgetBreakdown {
    campaignId: string;
    totalBudget: number;
    fixedBudget: number;
    variableBudget: number;
    spentVariable: number;
    remainingVariable: number;
    creatorPayoutTotal: number;
    refundProjected: number;
    breakdownPerVideo: {
        assignmentId: string;
        creatorId: string | null;
        creatorName: string;
        baseFee: number;
        bonusAccrued: number;
        views: number;
        videoStatus: string;
    }[];
}

interface BudgetBreakdownCardProps {
    campaignId: string;
}

export default function BudgetBreakdownCard({ campaignId }: BudgetBreakdownCardProps) {
    const [budget, setBudget] = useState<BudgetBreakdown | null>(null);
    const [loading, setLoading] = useState(true);
    const { lastEvent } = useCampaignRealtime(campaignId);

    const fetchBudget = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/campaigns/${campaignId}/budget`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setBudget(data.data);
            }
        } catch (error) {
            console.error("Error fetching budget:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudget();
    }, [campaignId]);

    // Listen for real-time updates
    useEffect(() => {
        if (lastEvent && (lastEvent.type === 'budget_updated' || lastEvent.type === 'payment_sent')) {
            fetchBudget();
        }
    }, [lastEvent]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Budget Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!budget) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Budget Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* High Level Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Total Budget</p>
                            <p className="text-2xl font-bold text-gray-900">${budget.totalBudget.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-700 mb-1">Projected Refund</p>
                            <p className="text-2xl font-bold text-green-700">${budget.refundProjected.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Fixed Production Costs</span>
                            <span className="font-medium">${budget.fixedBudget.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Performance Budget</span>
                            <span className="font-medium">${budget.variableBudget.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Performance Spent</span>
                            <span className="font-medium text-orange-600">${budget.spentVariable.toLocaleString()}</span>
                        </div>
                        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                            <span className="font-semibold text-gray-900">Total Paid to Creators</span>
                            <span className="font-bold text-primary-DEFAULT">${budget.creatorPayoutTotal.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                            <span>Budget Utilization</span>
                            <span>{Math.round(((budget.fixedBudget + budget.spentVariable) / budget.totalBudget) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary-DEFAULT rounded-full transition-all duration-500"
                                style={{ width: `${((budget.fixedBudget + budget.spentVariable) / budget.totalBudget) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
