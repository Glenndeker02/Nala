import React, { useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

interface Video {
    id: string;
    thumbnailUrl?: string;
    currentViewCount: number;
    title?: string;
}

interface FormatAdoptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
    campaignId: string;
    availableVideos: Video[];
}

export function FormatAdoptionModal({
    isOpen,
    onClose,
    onCreated,
    campaignId,
    availableVideos,
}: FormatAdoptionModalProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        sourceVideoId: '',
        hookStyle: '',
        pacing: '',
        visualStyle: '',
        musicStyle: '',
        duration: '',
        aspectRatio: '9:16',
        tags: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.sourceVideoId) {
            toast({
                title: 'Missing Source Video',
                description: 'Please select a source video',
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');

            const formatData = {
                hookStyle: formData.hookStyle || undefined,
                pacing: formData.pacing || undefined,
                visualStyle: formData.visualStyle || undefined,
                musicStyle: formData.musicStyle || undefined,
                duration: formData.duration ? parseInt(formData.duration) : undefined,
                aspectRatio: formData.aspectRatio,
            };

            const response = await fetch(`/api/campaigns/${campaignId}/format-templates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description || undefined,
                    sourceVideoId: formData.sourceVideoId,
                    formatData,
                    tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                    isPublic: false,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create format template');
            }

            toast({
                title: 'Success',
                description: 'Format template created successfully',
            });

            onCreated();
            onClose();

            // Reset form
            setFormData({
                name: '',
                description: '',
                sourceVideoId: '',
                hookStyle: '',
                pacing: '',
                visualStyle: '',
                musicStyle: '',
                duration: '',
                aspectRatio: '9:16',
                tags: '',
            });
        } catch (error: any) {
            console.error('Error creating template:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to create format template',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Format Template</DialogTitle>
                    <DialogDescription>
                        Extract a reusable format from a high-performing video.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Template Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Viral Hook Format"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="What makes this format successful?"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sourceVideo">Source Video</Label>
                        <Select
                            value={formData.sourceVideoId}
                            onValueChange={(value) => setFormData({ ...formData, sourceVideoId: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a video" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableVideos.map((video) => (
                                    <SelectItem key={video.id} value={video.id}>
                                        <div className="flex items-center gap-2">
                                            <span>{video.title || `Video ${video.id.slice(0, 8)}`}</span>
                                            <Badge variant="secondary" className="text-xs">
                                                {video.currentViewCount?.toLocaleString() || 0} views
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="hookStyle">Hook Style</Label>
                            <Input
                                id="hookStyle"
                                placeholder="e.g., Question-based"
                                value={formData.hookStyle}
                                onChange={(e) => setFormData({ ...formData, hookStyle: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pacing">Pacing</Label>
                            <Select
                                value={formData.pacing}
                                onValueChange={(value) => setFormData({ ...formData, pacing: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select pacing" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Slow">Slow</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Fast">Fast</SelectItem>
                                    <SelectItem value="Very Fast">Very Fast</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="visualStyle">Visual Style</Label>
                            <Input
                                id="visualStyle"
                                placeholder="e.g., Dynamic cuts"
                                value={formData.visualStyle}
                                onChange={(e) => setFormData({ ...formData, visualStyle: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="musicStyle">Music Style</Label>
                            <Input
                                id="musicStyle"
                                placeholder="e.g., Upbeat"
                                value={formData.musicStyle}
                                onChange={(e) => setFormData({ ...formData, musicStyle: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration (seconds)</Label>
                            <Input
                                id="duration"
                                type="number"
                                placeholder="30"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="aspectRatio">Aspect Ratio</Label>
                            <Select
                                value={formData.aspectRatio}
                                onValueChange={(value) => setFormData({ ...formData, aspectRatio: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                                    <SelectItem value="16:9">16:9 (Horizontal)</SelectItem>
                                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                                    <SelectItem value="4:5">4:5 (Portrait)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input
                            id="tags"
                            placeholder="viral, hook, question"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Template
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
