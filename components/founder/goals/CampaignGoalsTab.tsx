import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, RefreshCw, Loader2, Target } from 'lucide-react';
import { GoalProgressCard } from './GoalProgressCard';
import { CreateGoalModal } from './CreateGoalModal';
import { useToast } from '@/components/ui/use-toast';

interface CampaignGoalsTabProps {
    campaignId: string;
}

export function CampaignGoalsTab({ campaignId }: CampaignGoalsTabProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [goals, setGoals] = useState<any[]>([]);

    useEffect(() => {
        fetchGoals();
    }, [campaignId]);

    const fetchGoals = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/campaigns/${campaignId}/goals`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setGoals(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching goals:', error);
            toast({
                title: 'Error',
                description: 'Failed to load campaign goals',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateGoal = async (data: any) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/campaigns/${campaignId}/goals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to create goal');
        }

        toast({
            title: 'Success',
            description: 'Campaign goal created successfully',
        });
        fetchGoals();
    };

    const handleDeleteGoal = async (goalId: string) => {
        if (!confirm('Are you sure you want to delete this goal?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/campaigns/${campaignId}/goals/${goalId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error('Failed to delete goal');
            }

            toast({
                title: 'Success',
                description: 'Goal deleted successfully',
            });
            fetchGoals();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete goal',
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Campaign Goals</h3>
                    <p className="text-sm text-muted-foreground">
                        Track progress towards your campaign objectives
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchGoals}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Set New Goal
                    </Button>
                </div>
            </div>

            {goals.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/50">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Target className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <h3 className="text-lg font-medium mb-2">No goals set yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Setting clear goals helps you track campaign success and align creator efforts.
                        Start by setting a view or engagement target.
                    </p>
                    <Button onClick={() => setIsCreateModalOpen(true)}>Set Your First Goal</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map((goal) => (
                        <GoalProgressCard
                            key={goal.id}
                            goal={goal}
                            onDelete={handleDeleteGoal}
                        />
                    ))}
                </div>
            )}

            <CreateGoalModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateGoal}
            />
        </div>
    );
}
