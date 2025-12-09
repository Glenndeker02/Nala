import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ABTestingManagementProps {
    campaignId: string;
}

export function ABTestingManagement({ campaignId }: ABTestingManagementProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [tests, setTests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    useEffect(() => {
        fetchTests();
    }, [campaignId]);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { label: string; className: string }> = {
            DRAFT: { label: 'Draft', className: 'bg-gray-500' },
            PENDING_CONTENT: { label: 'Pending Upload', className: 'bg-yellow-500' },
            IN_REVIEW: { label: 'In Review', className: 'bg-blue-500' },
            ACTIVE: { label: 'Active', className: 'bg-green-500' },
            COMPLETED: { label: 'Completed', className: 'bg-purple-500' },
            CANCELLED: { label: 'Cancelled', className: 'bg-red-500' },
        };

        const config = variants[status] || variants.DRAFT;
        return <Badge className={config.className}>{config.label}</Badge>;
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
                        Test different content variations to optimize performance
                    </p>
                </div>
                <Button onClick={() => router.push(`/founder/campaigns/${campaignId}/ab-tests/create`)}>
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
                        Create your first A/B test to compare content variations and discover what works best.
                    </p>
                    <Button onClick={() => router.push(`/founder/campaigns/${campaignId}/ab-tests/create`)}>
                        Create Your First A/B Test
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {tests.map((test) => (
                        <Card
                            key={test.id}
                            className="cursor-pointer hover:border-primary transition-colors"
                            onClick={() => router.push(`/founder/campaigns/${campaignId}/ab-tests/${test.id}`)}
                        >
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{test.name}</CardTitle>
                                    {getStatusBadge(test.status)}
                                </div>
                                {test.hypothesis && (
                                    <CardDescription>{test.hypothesis}</CardDescription>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Goal</p>
                                        <p className="font-medium">{test.testGoal?.replace(/_/g, ' ')}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Metric</p>
                                        <p className="font-medium">{test.successMetric?.replace(/_/g, ' ')}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Variants</p>
                                        <p className="font-medium">{test.variants?.length || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Creators</p>
                                        <p className="font-medium">{test.assignedCreatorIds?.length || 0}</p>
                                    </div>
                                </div>
                                {test.status === 'ACTIVE' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="mt-4"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/founder/campaigns/${campaignId}/ab-tests/${test.id}/results`);
                                        }}
                                    >
                                        View Results
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
