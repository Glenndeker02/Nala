import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Video, TrendingUp, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FormatTemplate {
    id: string;
    name: string;
    description?: string;
    sourceVideo: {
        id: string;
        thumbnailUrl?: string;
        currentViewCount: number;
    };
    formatData: {
        hookStyle?: string;
        pacing?: string;
        visualStyle?: string;
        musicStyle?: string;
        transitions?: string[];
        textOverlays?: boolean;
        duration?: number;
        aspectRatio?: string;
    };
    tags: string[];
    _count: {
        adoptedFormats: number;
    };
    createdAt: string;
}

interface FormatLibraryProps {
    campaignId: string;
    onCreateTemplate: () => void;
    onAssignCreators: (templateId: string) => void;
}

export function FormatLibrary({
    campaignId,
    onCreateTemplate,
    onAssignCreators
}: FormatLibraryProps) {
    const { toast } = useToast();
    const [templates, setTemplates] = useState<FormatTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTemplates();
    }, [campaignId]);

    const fetchTemplates = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/campaigns/${campaignId}/format-templates`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch templates');
            }

            const data = await response.json();
            setTemplates(data.data || []);
        } catch (error: any) {
            console.error('Error fetching templates:', error);
            toast({
                title: 'Error',
                description: 'Failed to load format templates',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const copyFormatData = (template: FormatTemplate) => {
        const formatText = `
Format: ${template.name}
Hook Style: ${template.formatData.hookStyle || 'N/A'}
Pacing: ${template.formatData.pacing || 'N/A'}
Visual Style: ${template.formatData.visualStyle || 'N/A'}
Music Style: ${template.formatData.musicStyle || 'N/A'}
Duration: ${template.formatData.duration || 'N/A'}s
Aspect Ratio: ${template.formatData.aspectRatio || 'N/A'}
    `.trim();

        navigator.clipboard.writeText(formatText);
        toast({
            title: 'Copied',
            description: 'Format details copied to clipboard',
        });
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading templates...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Format Library</h3>
                    <p className="text-sm text-muted-foreground">
                        Reusable video formats extracted from high-performing content
                    </p>
                </div>
                <Button onClick={onCreateTemplate}>
                    <Plus className="w-4 h-4 mr-2" /> Create Template
                </Button>
            </div>

            {templates.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/50">
                    <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Video className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No format templates yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                        Create your first format template from a successful video to share with creators.
                    </p>
                    <Button onClick={onCreateTemplate}>Create Your First Template</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <Card key={template.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                            <div className="relative aspect-video bg-muted">
                                {template.sourceVideo.thumbnailUrl ? (
                                    <img
                                        src={template.sourceVideo.thumbnailUrl}
                                        alt={template.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Video className="w-12 h-12 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <Badge variant="secondary" className="gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        {template.sourceVideo.currentViewCount?.toLocaleString() || 0} views
                                    </Badge>
                                </div>
                            </div>

                            <CardHeader>
                                <CardTitle className="text-base">{template.name}</CardTitle>
                                {template.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {template.description}
                                    </p>
                                )}
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Format Details */}
                                <div className="space-y-2 text-sm">
                                    {template.formatData.hookStyle && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Hook:</span>
                                            <span className="font-medium">{template.formatData.hookStyle}</span>
                                        </div>
                                    )}
                                    {template.formatData.pacing && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Pacing:</span>
                                            <span className="font-medium">{template.formatData.pacing}</span>
                                        </div>
                                    )}
                                    {template.formatData.duration && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Duration:</span>
                                            <span className="font-medium">{template.formatData.duration}s</span>
                                        </div>
                                    )}
                                </div>

                                {/* Tags */}
                                {template.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {template.tags.slice(0, 3).map((tag, index) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                        {template.tags.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{template.tags.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="flex items-center justify-between pt-2 border-t">
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Users className="w-4 h-4" />
                                        <span>{template._count.adoptedFormats} adoptions</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyFormatData(template)}
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => onAssignCreators(template.id)}
                                        >
                                            <Users className="w-4 h-4 mr-1" /> Assign
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
