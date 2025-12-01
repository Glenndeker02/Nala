import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
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
    SelectValue
} from '@/components/ui/select';
import { Loader2, Upload, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FounderVideoUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (data: any) => Promise<void>;
    campaignId: string;
}

export function FounderVideoUploadModal({
    isOpen,
    onClose,
    onUpload,
    campaignId
}: FounderVideoUploadModalProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        videoUrl: '',
        thumbnailUrl: '',
        caption: '',
        description: '',
        platform: 'TIKTOK',
        status: 'DRAFT'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.videoUrl) {
            toast({
                title: "Missing URL",
                description: "Please provide a video URL",
                variant: "destructive"
            });
            return;
        }

        try {
            setIsLoading(true);
            await onUpload(formData);
            onClose();
            setFormData({
                videoUrl: '',
                thumbnailUrl: '',
                caption: '',
                description: '',
                platform: 'TIKTOK',
                status: 'DRAFT'
            });
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: "Error",
                description: "Failed to create video record",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Founder Video</DialogTitle>
                    <DialogDescription>
                        Add a video to your campaign's content library.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="videoUrl">Video URL</Label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="videoUrl"
                                placeholder="https://..."
                                className="pl-9"
                                value={formData.videoUrl}
                                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Direct link to your video file or hosted content
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="thumbnailUrl">Thumbnail URL (Optional)</Label>
                        <Input
                            id="thumbnailUrl"
                            placeholder="https://..."
                            value={formData.thumbnailUrl}
                            onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="platform">Platform</Label>
                            <Select
                                value={formData.platform}
                                onValueChange={(value) => setFormData({ ...formData, platform: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select platform" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TIKTOK">TikTok</SelectItem>
                                    <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                                    <SelectItem value="FACEBOOK">Facebook</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                    <SelectItem value="READY_TO_POST">Ready to Post</SelectItem>
                                    <SelectItem value="POSTED">Posted</SelectItem>
                                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="caption">Caption</Label>
                        <Input
                            id="caption"
                            placeholder="Video caption or title"
                            value={formData.caption}
                            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Internal Notes / Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Notes about this video, performance goals, etc."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Video
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
