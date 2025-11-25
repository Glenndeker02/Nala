import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loader2, Bookmark, Play, TrendingUp } from 'lucide-react';
import FormatDetailModal from '@/components/creator/FormatDetailModal';

interface VideoFormat {
    id: string;
    name: string;
    description: string;
    platforms: string[];
    tone: string;
    categories: string[];
    avgViews: number;
    adoptionTrend: string;
    trendMomentum: number;
    isTrending: boolean;
    _count?: { savedByCreators: number };
    // Additional fields for creator actions
    structure?: any;
    bestPractices?: string[];
}

export default function FounderContentLibrary() {
    const [formats, setFormats] = useState<VideoFormat[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFormat, setSelectedFormat] = useState<VideoFormat | null>(null);
    const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const fetchFormats = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedPlatform !== 'all') params.append('platform', selectedPlatform);
            if (selectedCategory !== 'all') params.append('category', selectedCategory);
            const res = await fetch(`/api/formats/trending?${params.toString()}`);
            const data = await res.json();
            if (data.formats) setFormats(data.formats);
        } catch (error) {
            console.error('Failed to fetch formats', error);
        } finally {
            setLoading(false);
        }
    }, [selectedPlatform, selectedCategory]);

    useEffect(() => {
        fetchFormats();
    }, [fetchFormats]);

    const handleCreateCampaign = () => {
        if (!selectedFormat) return;
        const query = new URLSearchParams({ formatId: selectedFormat.id }).toString();
        window.location.href = `/founder/campaigns/create?${query}`;
    };

    const handleRequestVideos = () => {
        if (!selectedFormat) return;
        const query = new URLSearchParams({ formatId: selectedFormat.id, requestVideos: 'true' }).toString();
        window.location.href = `/founder/campaigns/create?${query}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Content Library</h2>
                    <p className="text-muted-foreground">Browse high‑performing video formats and launch campaigns instantly.</p>
                </div>
                <div className="flex gap-2">
                    <select
                        className="w-[140px] h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={selectedPlatform}
                        onChange={e => setSelectedPlatform(e.target.value)}
                    >
                        <option value="all">All Platforms</option>
                        <option value="TIKTOK">TikTok</option>
                        <option value="INSTAGRAM">Instagram</option>
                        <option value="FACEBOOK">Facebook</option>
                    </select>
                    <select
                        className="w-[140px] h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        <option value="SAAS">SaaS</option>
                        <option value="ECOMMERCE">E‑commerce</option>
                        <option value="APP">Mobile App</option>
                    </select>
                </div>
            </div>
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {formats.map(format => (
                        <Card key={format.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                            <div onClick={() => setSelectedFormat(format)}>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <Badge variant={format.isTrending ? 'destructive' : 'secondary'} className="mb-2">
                                            {format.adoptionTrend}
                                        </Badge>
                                        {format.platforms.includes('TIKTOK') && <Badge variant="outline">TikTok</Badge>}
                                    </div>
                                    <CardTitle className="text-lg">{format.name}</CardTitle>
                                    <CardDescription className="line-clamp-2">{format.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                                        <div className="flex items-center gap-1">
                                            <Play className="h-3 w-3" />
                                            <span>{format.avgViews.toLocaleString()} avg views</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Bookmark className="h-3 w-3" />
                                            <span>{format._count?.savedByCreators || 0} saves</span>
                                        </div>
                                    </div>
                                    <Button className="w-full" variant="secondary" onClick={e => { e.stopPropagation(); handleCreateCampaign(); }}>Create Campaign From This Format</Button>
                                    <Button className="w-full mt-2" variant="outline" onClick={e => { e.stopPropagation(); handleRequestVideos(); }}>Request Videos Using This Format</Button>
                                </CardContent>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
            {selectedFormat && (
                <FormatDetailModal
                    format={selectedFormat}
                    isOpen={!!selectedFormat}
                    onClose={() => setSelectedFormat(null)}
                />
            )}
        </div>
    );
}
