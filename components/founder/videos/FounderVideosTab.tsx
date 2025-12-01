import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, RefreshCw } from 'lucide-react';
import { FounderVideoCard } from './FounderVideoCard';
import { FounderVideoUploadModal } from './FounderVideoUploadModal';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FounderVideosTabProps {
    campaignId: string;
}

export function FounderVideosTab({ campaignId }: FounderVideosTabProps) {
    const { toast } = useToast();
    const [videos, setVideos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState<any | null>(null);

    const fetchVideos = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`/api/campaigns/${campaignId}/founder-videos`);

            if (!response.ok) {
                throw new Error('Failed to fetch videos');
            }

            const data = await response.json();
            setVideos(data.data || []);
        } catch (err) {
            console.error('Error fetching videos:', err);
            setError('Failed to load videos. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, [campaignId]);

    const handleUpload = async (data: any) => {
        const response = await fetch(`/api/campaigns/${campaignId}/founder-videos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to upload video');
        }

        toast({
            title: "Success",
            description: "Video added successfully",
        });

        fetchVideos();
    };

    const handleDelete = async (videoId: string) => {
        if (!confirm('Are you sure you want to delete this video?')) return;

        try {
            const response = await fetch(`/api/campaigns/${campaignId}/founder-videos/${videoId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete video');
            }

            toast({
                title: "Success",
                description: "Video deleted successfully",
            });

            setVideos(videos.filter(v => v.id !== videoId));
        } catch (err) {
            console.error('Error deleting video:', err);
            toast({
                title: "Error",
                description: "Failed to delete video",
                variant: "destructive"
            });
        }
    };

    const handleEdit = (video: any) => {
        // TODO: Implement edit modal or reuse upload modal for editing
        toast({
            title: "Coming Soon",
            description: "Edit functionality will be implemented in the next update.",
        });
    };

    if (isLoading && videos.length === 0) {
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
                    <Button variant="outline" size="sm" onClick={fetchVideos} className="ml-auto">
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
                    <h3 className="text-lg font-medium">Founder Videos</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage your own content and video assets for this campaign.
                    </p>
                </div>
                <Button onClick={() => setIsUploadModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Video
                </Button>
            </div>

            {videos.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/50">
                    <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Plus className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No videos yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                        Upload your first video to start building your content library for this campaign.
                    </p>
                    <Button onClick={() => setIsUploadModalOpen(true)}>
                        Add Your First Video
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {videos.map((video) => (
                        <FounderVideoCard
                            key={video.id}
                            video={video}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            <FounderVideoUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUpload}
                campaignId={campaignId}
            />
        </div>
    );
}
