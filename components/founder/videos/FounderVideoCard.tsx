import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Play,
    MoreVertical,
    Eye,
    Heart,
    MessageCircle,
    Share2,
    Trash2,
    Edit,
    ExternalLink
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { formatNumber } from '@/lib/utils';

interface FounderVideo {
    id: string;
    videoUrl: string;
    thumbnailUrl?: string;
    caption?: string;
    platform: 'TIKTOK' | 'INSTAGRAM' | 'FACEBOOK';
    status: 'DRAFT' | 'READY_TO_POST' | 'POSTED' | 'ARCHIVED';
    currentViewCount: number;
    likes: number;
    comments: number;
    shares: number;
    createdAt: string;
}

interface FounderVideoCardProps {
    video: FounderVideo;
    onEdit: (video: FounderVideo) => void;
    onDelete: (videoId: string) => void;
}

export function FounderVideoCard({ video, onEdit, onDelete }: FounderVideoCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'POSTED': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
            case 'READY_TO_POST': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
            case 'ARCHIVED': return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
            default: return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
        }
    };

    return (
        <Card className="overflow-hidden bg-card hover:border-primary/50 transition-colors">
            <div className="relative aspect-[9/16] bg-muted group">
                {video.thumbnailUrl ? (
                    <img
                        src={video.thumbnailUrl}
                        alt={video.caption || 'Video thumbnail'}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Play className="w-12 h-12 opacity-50" />
                    </div>
                )}

                <div className="absolute top-2 right-2">
                    <Badge className={getStatusColor(video.status)}>
                        {video.status.replace(/_/g, ' ')}
                    </Badge>
                </div>

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm" className="gap-2" onClick={() => window.open(video.videoUrl, '_blank')}>
                        <Play className="w-4 h-4" /> Preview
                    </Button>
                </div>
            </div>

            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="font-medium line-clamp-2 text-sm">
                            {video.caption || 'No caption'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                            {video.platform.toLowerCase()} • {new Date(video.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(video)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(video.videoUrl, '_blank')}>
                                <ExternalLink className="w-4 h-4 mr-2" /> View Original
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => onDelete(video.id)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-muted/50 p-2 rounded-lg">
                        <Eye className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                        <span className="text-xs font-medium">{formatNumber(video.currentViewCount)}</span>
                    </div>
                    <div className="bg-muted/50 p-2 rounded-lg">
                        <Heart className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                        <span className="text-xs font-medium">{formatNumber(video.likes)}</span>
                    </div>
                    <div className="bg-muted/50 p-2 rounded-lg">
                        <MessageCircle className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                        <span className="text-xs font-medium">{formatNumber(video.comments)}</span>
                    </div>
                    <div className="bg-muted/50 p-2 rounded-lg">
                        <Share2 className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                        <span className="text-xs font-medium">{formatNumber(video.shares)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
