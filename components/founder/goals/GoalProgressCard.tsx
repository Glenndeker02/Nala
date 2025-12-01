import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, Trash2, Edit2, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface CampaignGoal {
    id: string;
    type: 'VIEWS' | 'LIKES' | 'SHARES' | 'COMMENTS' | 'CONVERSIONS' | 'REVENUE';
    targetValue: number;
    currentValue: number;
    deadline?: string;
    description?: string;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
}

interface GoalProgressCardProps {
    goal: CampaignGoal;
    onEdit?: (goal: CampaignGoal) => void;
    onDelete?: (id: string) => void;
}

export function GoalProgressCard({ goal, onEdit, onDelete }: GoalProgressCardProps) {
    const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
    const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && goal.status === 'IN_PROGRESS';

    const formatNumber = (num: number) => {
        if (goal.type === 'REVENUE') {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
        }
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const getStatusColor = (status: string, overdue: boolean) => {
        if (status === 'COMPLETED') return 'bg-green-100 text-green-800';
        if (status === 'FAILED' || overdue) return 'bg-red-100 text-red-800';
        return 'bg-blue-100 text-blue-800';
    };

    const getIcon = () => {
        if (goal.status === 'COMPLETED') return <CheckCircle2 className="w-5 h-5 text-green-600" />;
        if (goal.status === 'FAILED' || isOverdue) return <AlertCircle className="w-5 h-5 text-red-600" />;
        return <Target className="w-5 h-5 text-blue-600" />;
    };

    return (
        <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        {getIcon()}
                        <div>
                            <CardTitle className="text-lg font-semibold capitalize">
                                {goal.type.toLowerCase()} Goal
                            </CardTitle>
                            {goal.deadline && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>Due {format(new Date(goal.deadline), 'MMM d, yyyy')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(goal.status, isOverdue || false)}>
                        {isOverdue ? 'Overdue' : goal.status.replace('_', ' ')}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {goal.description && (
                    <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
                )}

                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                        <span>{formatNumber(goal.currentValue)}</span>
                        <span className="text-muted-foreground">Target: {formatNumber(goal.targetValue)}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-right text-muted-foreground">
                        {progress.toFixed(1)}% Completed
                    </p>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    {onEdit && (
                        <Button variant="ghost" size="sm" onClick={() => onEdit(goal)}>
                            <Edit2 className="w-4 h-4" />
                        </Button>
                    )}
                    {onDelete && (
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onDelete(goal.id)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
