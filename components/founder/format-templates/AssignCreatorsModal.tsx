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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';

interface Creator {
    id: string;
    fullName: string;
    email: string;
}

interface AssignCreatorsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssigned: () => void;
    campaignId: string;
    templateId: string;
    templateName: string;
}

export function AssignCreatorsModal({
    isOpen,
    onClose,
    onAssigned,
    campaignId,
    templateId,
    templateName,
}: AssignCreatorsModalProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [creators, setCreators] = useState<Creator[]>([]);
    const [selectedCreatorIds, setSelectedCreatorIds] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [deadline, setDeadline] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchCreators();
        }
    }, [isOpen, campaignId]);

    const fetchCreators = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/campaigns/${campaignId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch campaign');
            }

            const data = await response.json();
            // Extract creators from campaign applications or videos
            const campaignCreators: Creator[] = [];

            // You might need to adjust this based on your actual data structure
            if (data.data?.campaign?.videos) {
                data.data.campaign.videos.forEach((video: any) => {
                    if (video.creator && !campaignCreators.find(c => c.id === video.creator.id)) {
                        campaignCreators.push({
                            id: video.creator.id,
                            fullName: video.creator.fullName,
                            email: video.creator.email || '',
                        });
                    }
                });
            }

            setCreators(campaignCreators);
        } catch (error: any) {
            console.error('Error fetching creators:', error);
            toast({
                title: 'Error',
                description: 'Failed to load creators',
                variant: 'destructive',
            });
        }
    };

    const handleCreatorToggle = (creatorId: string) => {
        setSelectedCreatorIds((prev) =>
            prev.includes(creatorId)
                ? prev.filter((id) => id !== creatorId)
                : [...prev, creatorId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedCreatorIds.length === 0) {
            toast({
                title: 'No Creators Selected',
                description: 'Please select at least one creator',
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch(
                `/api/campaigns/${campaignId}/format-templates/${templateId}/adopt`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        creatorIds: selectedCreatorIds,
                        notes: notes || undefined,
                        deadline: deadline || undefined,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to assign template');
            }

            toast({
                title: 'Success',
                description: `Template assigned to ${selectedCreatorIds.length} creator(s)`,
            });

            onAssigned();
            onClose();

            // Reset form
            setSelectedCreatorIds([]);
            setNotes('');
            setDeadline('');
        } catch (error: any) {
            console.error('Error assigning template:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to assign template',
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
                    <DialogTitle>Assign Format Template</DialogTitle>
                    <DialogDescription>
                        Assign "{templateName}" to creators in this campaign.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-3">
                        <Label>Select Creators ({selectedCreatorIds.length} selected)</Label>

                        {creators.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No creators found for this campaign.</p>
                                <p className="text-sm mt-2">Creators will appear here once they submit videos.</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-lg p-3">
                                {creators.map((creator) => (
                                    <Card
                                        key={creator.id}
                                        className={`cursor-pointer transition-all ${selectedCreatorIds.includes(creator.id)
                                                ? 'ring-2 ring-primary'
                                                : 'hover:border-primary/50'
                                            }`}
                                        onClick={() => handleCreatorToggle(creator.id)}
                                    >
                                        <CardContent className="p-3">
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={selectedCreatorIds.includes(creator.id)}
                                                    onCheckedChange={() => handleCreatorToggle(creator.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <div className="flex items-center gap-2 flex-1">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">{creator.fullName}</p>
                                                        {creator.email && (
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {creator.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes for Creators (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Instructions or guidelines for using this format..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="deadline">Deadline (Optional)</Label>
                        <Input
                            id="deadline"
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || selectedCreatorIds.length === 0}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Assign to {selectedCreatorIds.length} Creator{selectedCreatorIds.length !== 1 ? 's' : ''}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
