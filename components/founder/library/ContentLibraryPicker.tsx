import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loader2, Play, Bookmark, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface VideoFormat {
    id: string;
    name: string;
    description: string;
    platforms: string[];
    tone: string;
    categories: string[];
    avgViews: number;
    adoptionTrend: string;
    isTrending: boolean;
    _count?: { savedByCreators: number };
    structure?: any;
    bestPractices?: string[];
}

interface ContentLibraryPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (format: VideoFormat) => void;
    title?: string;
}

export function ContentLibraryPicker({ isOpen, onClose, onSelect, title = "Select from Content Library" }: ContentLibraryPickerProps) {
    const [formats, setFormats] = useState<VideoFormat[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const fetchFormats = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedPlatform !== 'all') params.append('platform', selectedPlatform);
            if (selectedCategory !== 'all') params.append('category', selectedCategory);

            // In a real app, we would also append searchQuery to the API
            // For now, we'll filter client-side if the API doesn't support it
            const res = await fetch(`/api/formats/trending?${params.toString()}`);
            const data = await res.json();

            if (data.formats) {
                let filtered = data.formats;
                if (searchQuery) {
                    const lowerQuery = searchQuery.toLowerCase();
                    filtered = filtered.filter((f: VideoFormat) =>
                        f.name.toLowerCase().includes(lowerQuery) ||
                        f.description.toLowerCase().includes(lowerQuery)
                    );
                }
                setFormats(filtered);
            }
        } catch (error) {
            console.error('Failed to fetch formats', error);
        } finally {
            setLoading(false);
        }
    }, [selectedPlatform, selectedCategory, searchQuery]);

    useEffect(() => {
        if (isOpen) {
            fetchFormats();
        }
    }, [isOpen, fetchFormats]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search formats..."
                            className="pl-9 bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="w-[140px] h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={selectedPlatform}
                            onChange={e => setSelectedPlatform(e.target.value)}
                        >
                            <option value="all">All Platforms</option>
                            <option value="TIKTOK">TikTok</option>
                            <option value="INSTAGRAM">Instagram</option>
                            <option value="FACEBOOK">Facebook</option>
                        </select>
                        <select
                            className="w-[140px] h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : formats.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No formats found matching your criteria.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {formats.map(format => (
                                <Card
                                    key={format.id}
                                    className="hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-primary/50 active:border-primary"
                                    onClick={() => onSelect(format)}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <Badge variant={format.isTrending ? 'destructive' : 'secondary'} className="mb-2 text-xs">
                                                {format.adoptionTrend}
                                            </Badge>
                                            {format.platforms.includes('TIKTOK') && <Badge variant="outline" className="text-xs">TikTok</Badge>}
                                        </div>
                                        <CardTitle className="text-base">{format.name}</CardTitle>
                                        <CardDescription className="line-clamp-2 text-xs">{format.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Play className="h-3 w-3" />
                                                <span>{format.avgViews.toLocaleString()} views</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Bookmark className="h-3 w-3" />
                                                <span>{format._count?.savedByCreators || 0}</span>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="w-full mt-4"
                                            variant="secondary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelect(format);
                                            }}
                                        >
                                            Select Format
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
