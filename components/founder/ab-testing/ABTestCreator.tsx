import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Play } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';

interface Video {
    id: string;
    thumbnailUrl?: string;
    finalPostUrl?: string;
    currentViewCount: number;
    title?: string;
}

interface ABTestCreatorProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
    campaignId: string;
    availableVideos: Video[];
}

export function ABTestCreator({
    isOpen,
    onClose,
    onCreated,
    campaignId,
    availableVideos,
}: ABTestCreatorProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        testDurationDays: 7,
    });
    const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);

    const handleVideoToggle = (videoId: string) => {
        setSelectedVideoIds((prev) =>
            prev.includes(videoId)
                ? prev.filter((id) => id !== videoId)
                : [...prev, videoId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedVideoIds.length < 2) {
            toast({
                title: 'Invalid Selection',
                description: 'Please select at least 2 videos for A/B testing',
                variant: 'destructive',
            });
            return;
        }

        if (selectedVideoIds.length > 5) {
            toast({
                title: 'Too Many Videos',
                description: 'Maximum 5 videos allowed for A/B testing',
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/campaigns/${campaignId}/ab-tests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    videoIds: selectedVideoIds,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create A/B test');
            }

            toast({
                title: 'Success',
                description: 'A/B test created successfully',
            });

            onCreated();
            onClose();

            // Reset form
            setFormData({ name: '', description: '', testDurationDays: 7 });
            setSelectedVideoIds([]);
        } catch (error: any) {
            console.error('Error creating A/B test:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to create A/B test',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create A/B Test</DialogTitle>
                    <DialogDescription>
                        Select 2-5 videos to compare performance and determine which performs best.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Test Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Thumbnail Comparison Test"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="What are you testing?"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="duration">Test Duration (Days)</Label>
                        <Input
                            id="duration"
                            type="number"
                            min="1"
                            max="30"
                            value={formData.testDurationDays}
                            onChange={(e) =>
                                setFormData({ ...formData, testDurationDays: parseInt(e.target.value) })
                            }
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <Label>Select Videos ({selectedVideoIds.length} selected)</Label>
                        <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-2 border rounded-lg">
                            {availableVideos.map((video) => (
                                <Card
                                    key={video.id}
                                    className={`cursor-pointer transition-all ${selectedVideoIds.includes(video.id)
                                            ? 'ring-2 ring-primary'
                                            : 'hover:border-primary/50'
                                        }`}
                                    onClick={() => handleVideoToggle(video.id)}
                                >
                                    <CardContent className="p-3">
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                checked={selectedVideoIds.includes(video.id)}
                                                onCheckedChange={() => handleVideoToggle(video.id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <div className="flex-1 min-w-0">
                                                {video.thumbnailUrl ? (
                                                    <img
                                                        src={video.thumbnailUrl}
                                                        alt="Video thumbnail"
                                                        className="w-full aspect-video object-cover rounded mb-2"
                                                    />
                                                ) : (
                                                    <div className="w-full aspect-video bg-muted rounded mb-2 flex items-center justify-center">
                                                        <Play className="w-8 h-8 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <p className="text-xs font-medium truncate">
                                                    {video.title || `Video ${video.id.slice(0, 8)}`}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {video.currentViewCount?.toLocaleString() || 0} views
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        {availableVideos.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No videos available for A/B testing. Please add videos to your campaign first.
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || selectedVideoIds.length < 2}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Test
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
