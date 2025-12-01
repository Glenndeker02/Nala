import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Loader2 } from 'lucide-react';
import { CompetitorVideoCard } from './CompetitorVideoCard';
import { BenchmarkComparison } from './BenchmarkComparison';
import { useToast } from '@/components/ui/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface CompetitiveInsightsProps {
    campaignId: string;
}

export function CompetitiveInsights({ campaignId }: CompetitiveInsightsProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [videos, setVideos] = useState<any[]>([]);
    const [benchmarks, setBenchmarks] = useState<any>(null);
    const [formData, setFormData] = useState({
        videoUrl: '',
        platform: 'TIKTOK',
        competitorName: '',
        notes: '',
    });

    useEffect(() => {
        fetchData();
    }, [campaignId]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');

            const [videosRes, benchmarksRes] = await Promise.all([
                fetch(`/api/campaigns/${campaignId}/competitors`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`/api/campaigns/${campaignId}/competitors/benchmarks`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if (videosRes.ok) {
                const videosData = await videosRes.json();
                setVideos(videosData.data || []);
            }

            if (benchmarksRes.ok) {
                const benchmarksData = await benchmarksRes.json();
                setBenchmarks(benchmarksData.data);
            }
        } catch (error: any) {
            console.error('Error fetching competitive data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load competitive insights',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCompetitor = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/campaigns/${campaignId}/competitors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to add competitor video');
            }

            toast({
                title: 'Success',
                description: 'Competitor video added successfully',
            });

            setIsAddModalOpen(false);
            setFormData({
                videoUrl: '',
                platform: 'TIKTOK',
                competitorName: '',
                notes: '',
            });
            fetchData();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to add competitor video',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
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
                    <h3 className="text-lg font-medium">Competitive Insights</h3>
                    <p className="text-sm text-muted-foreground">
                        Track competitor performance and benchmark your campaign
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchData}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Competitor
                    </Button>
                </div>
            </div>

            {benchmarks && videos.length > 0 && (
                <BenchmarkComparison
                    campaignStats={benchmarks.campaignStats}
                    competitorStats={benchmarks.competitorStats}
                    comparison={benchmarks.comparison}
                />
            )}

            {videos.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/50">
                    <h3 className="text-lg font-medium mb-2">No competitor videos tracked</h3>
                    <p className="text-muted-foreground mb-6">
                        Add competitor videos to benchmark your campaign performance
                    </p>
                    <Button onClick={() => setIsAddModalOpen(true)}>Add Your First Competitor</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map((video) => (
                        <CompetitorVideoCard key={video.id} video={video} />
                    ))}
                </div>
            )}

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Competitor Video</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleAddCompetitor} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="videoUrl">Video URL</Label>
                            <Input
                                id="videoUrl"
                                type="url"
                                placeholder="https://..."
                                value={formData.videoUrl}
                                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="platform">Platform</Label>
                            <Select
                                value={formData.platform}
                                onValueChange={(value) => setFormData({ ...formData, platform: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TIKTOK">TikTok</SelectItem>
                                    <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                                    <SelectItem value="YOUTUBE">YouTube</SelectItem>
                                    <SelectItem value="FACEBOOK">Facebook</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="competitorName">Competitor Name</Label>
                            <Input
                                id="competitorName"
                                placeholder="e.g., Brand X"
                                value={formData.competitorName}
                                onChange={(e) => setFormData({ ...formData, competitorName: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Why are you tracking this video?"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddModalOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Competitor
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
