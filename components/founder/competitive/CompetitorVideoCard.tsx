import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Eye, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompetitorVideo {
    id: string;
    competitorName: string;
    platform: string;
    videoUrl: string;
    viewCount: number;
    likes: number;
    comments: number;
    shares: number;
    notes?: string;
    createdAt: string;
}

interface CompetitorVideoCardProps {
    video: CompetitorVideo;
    onDelete?: (id: string) => void;
}

export function CompetitorVideoCard({ video, onDelete }: CompetitorVideoCardProps) {
    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const getPlatformColor = (platform: string) => {
        switch (platform) {
            case 'TIKTOK':
                return 'bg-black text-white';
            case 'INSTAGRAM':
                return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
            case 'YOUTUBE':
                return 'bg-red-600 text-white';
            case 'FACEBOOK':
                return 'bg-blue-600 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    return (
        <Card className="overflow-hidden hover:border-primary/50 transition-colors">
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{video.competitorName}</h4>
                        <Badge className={`mt-1 ${getPlatformColor(video.platform)}`}>
                            {video.platform}
                        </Badge>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(video.videoUrl, '_blank')}
                    >
                        <ExternalLink className="w-4 h-4" />
                    </Button>
                </div>

                {video.notes && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {video.notes}
                    </p>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Views</p>
                            <p className="font-semibold">{formatNumber(video.viewCount)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Likes</p>
                            <p className="font-semibold">{formatNumber(video.likes)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Comments</p>
                            <p className="font-semibold">{formatNumber(video.comments)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Shares</p>
                            <p className="font-semibold">{formatNumber(video.shares)}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                    Added {new Date(video.createdAt).toLocaleDateString()}
                </div>
            </CardContent>
        </Card>
    );
}
