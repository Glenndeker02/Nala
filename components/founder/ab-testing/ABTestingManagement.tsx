import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, RefreshCw } from 'lucide-react';
import { ABTestWizard } from './ABTestWizard';
import { ABTestResults } from './ABTestResults';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ABTestingManagementProps {
    campaignId: string;
}

export function ABTestingManagement({ campaignId }: ABTestingManagementProps) {
    const { toast } = useToast();
    const [tests, setTests] = useState<any[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    const fetchTests = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/campaigns/${campaignId}/ab-tests`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch A/B tests');
            }

            const data = await response.json();
            setTests(data.data || []);
        } catch (err: any) {
            console.error('Error fetching A/B tests:', err);
            setError('Failed to load A/B tests. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCampaigns = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/campaigns`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch campaigns');
            }

            const data = await response.json();
            setCampaigns(data.data?.campaigns || []);
        } catch (err: any) {
            console.error('Error fetching campaigns:', err);
        }
    };

    useEffect(() => {
        fetchTests();
        fetchCampaigns();
    }, [campaignId]);

    const handleCompleteTest = async (testId: string) => {
        if (!confirm('Are you sure you want to complete this A/B test? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `/api/campaigns/${campaignId}/ab-tests/${testId}/complete`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to complete A/B test');
            }

            toast({
                title: 'Success',
                description: 'A/B test completed successfully',
            });

            fetchTests();
        } catch (err: any) {
            console.error('Error completing A/B test:', err);
            toast({
                title: 'Error',
                description: err.message || 'Failed to complete A/B test',
                variant: 'destructive',
            });
        }
    };

    if (isLoading && tests.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="flex items-center gap-2">
                    {error}
                    <Button variant="outline" size="sm" onClick={fetchTests} className="ml-auto">
                        <RefreshCw className="w-4 h-4 mr-2" /> Retry
                    </Button>
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">A/B Testing</h3>
                    <p className="text-sm text-muted-foreground">
                        Compare video performance and optimize your content strategy.
                    </p>
                </div>
                <Button onClick={() => setIsWizardOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Create A/B Test
                </Button>
            </div>

            {tests.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/50">
                    <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Plus className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No A/B tests yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                        Create your first A/B test to compare video performance and discover what works best.
                    </p>
                    <Button onClick={() => setIsWizardOpen(true)}>Create Your First A/B Test</Button>
                </div>
            ) : (
                <div className="space-y-6">
                    {tests.map((test) => (
                        <ABTestResults
                            key={test.id}
                            testName={test.name}
                            status={test.status}
                            startDate={test.startDate}
                            endDate={test.endDate}
                            winner={test.winnerVariantId ? {
                                variantId: test.winnerVariantId,
                                variantName: test.variants?.find((v: any) => v.id === test.winnerVariantId)?.variantName || 'Unknown',
                                score: 0,
                            } : undefined}
                            confidence={test.results?.confidence}
                            metrics={test.variants?.map((variant: any) => ({
                                variantId: variant.id,
                                variantName: variant.variantName,
                                views: variant.video?.currentViewCount || 0,
                                likes: variant.video?.likes || 0,
                                comments: variant.video?.comments || 0,
                                shares: variant.video?.shares || 0,
                                engagementRate: variant.video?.currentViewCount > 0
                                    ? ((variant.video?.likes + variant.video?.comments + variant.video?.shares) / variant.video?.currentViewCount) * 100
                                    : 0,
                                totalEngagement: (variant.video?.likes || 0) + (variant.video?.comments || 0) + (variant.video?.shares || 0),
                                score: test.results?.metrics?.find((m: any) => m.variantId === variant.id)?.score,
                            })) || []}
                            onComplete={test.status === 'ACTIVE' ? () => handleCompleteTest(test.id) : undefined}
                        />
                    ))}
                </div>
            )}

            <ABTestWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                onCreated={fetchTests}
                founderCampaigns={campaigns}
            />
        </div>
    );
}
