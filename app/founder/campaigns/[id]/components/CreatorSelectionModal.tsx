import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Check, Star, Instagram, Facebook } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Creator {
    id: string;
    fullName: string;
    email: string;
    creatorProfile: {
        bio: string;
        categories: string[];
        baseFeeTiktok: number;
        baseFeeInstagram: number;
        baseFeeFacebook: number;
        portfolioVideos: any[];
        responseTime: string;
    };
    socialAccounts: {
        platform: string;
        followerCount: number;
        username: string;
    }[];
}

interface CreatorSelectionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (creators: Creator[]) => void;
    selectedCreators: Creator[];
}

export default function CreatorSelectionModal({
    open,
    onOpenChange,
    onSelect,
    selectedCreators: initialSelected
}: CreatorSelectionModalProps) {
    const [creators, setCreators] = useState<Creator[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selected, setSelected] = useState<Creator[]>(initialSelected);
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            fetchCreators();
            setSelected(initialSelected);
        }
    }, [open, initialSelected]);

    const fetchCreators = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/creators/available');
            if (res.ok) {
                const data = await res.json();
                setCreators(data.creators);
            }
        } catch (error) {
            console.error("Failed to fetch creators", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCreator = (creator: Creator) => {
        if (selected.some(c => c.id === creator.id)) {
            setSelected(selected.filter(c => c.id !== creator.id));
        } else {
            setSelected([...selected, creator]);
        }
    };

    const filteredCreators = creators.filter(creator => {
        const matchesSearch = creator.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            creator.creatorProfile.categories.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = categoryFilter ?
            creator.creatorProfile.categories.includes(categoryFilter) : true;

        return matchesSearch && matchesCategory;
    });

    const allCategories = Array.from(new Set(creators.flatMap(c => c.creatorProfile.categories)));

    const formatFollowers = (count: number) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>Select Creators for A/B Testing</DialogTitle>
                </DialogHeader>

                <div className="px-6 py-4 border-b flex gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search creators by name or category..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto max-w-[40%] pb-1 scrollbar-hide">
                        <Badge
                            variant={categoryFilter === null ? "default" : "outline"}
                            className="cursor-pointer whitespace-nowrap"
                            onClick={() => setCategoryFilter(null)}
                        >
                            All
                        </Badge>
                        {allCategories.map(cat => (
                            <Badge
                                key={cat}
                                variant={categoryFilter === cat ? "default" : "outline"}
                                className="cursor-pointer whitespace-nowrap"
                                onClick={() => setCategoryFilter(cat)}
                            >
                                {cat}
                            </Badge>
                        ))}
                    </div>
                </div>

                <ScrollArea className="flex-1 p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">Loading creators...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredCreators.map(creator => {
                                const isSelected = selected.some(c => c.id === creator.id);
                                const tiktok = creator.socialAccounts.find(s => s.platform === 'TIKTOK');
                                const instagram = creator.socialAccounts.find(s => s.platform === 'INSTAGRAM');

                                return (
                                    <Card
                                        key={creator.id}
                                        className={`cursor-pointer transition-all border-2 ${isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-muted'}`}
                                        onClick={() => toggleCreator(creator)}
                                    >
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.id}`} />
                                                        <AvatarFallback>{creator.fullName.substring(0, 2)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-semibold text-sm">{creator.fullName}</div>
                                                        <div className="text-xs text-muted-foreground line-clamp-1">{creator.creatorProfile.categories.join(', ')}</div>
                                                    </div>
                                                </div>
                                                {isSelected && <div className="bg-primary text-primary-foreground rounded-full p-1"><Check className="h-3 w-3" /></div>}
                                            </div>

                                            <div className="flex gap-3 text-xs">
                                                {tiktok && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-bold">TikTok</span>
                                                        <span className="text-muted-foreground">{formatFollowers(tiktok.followerCount)}</span>
                                                    </div>
                                                )}
                                                {instagram && (
                                                    <div className="flex items-center gap-1">
                                                        <Instagram className="h-3 w-3" />
                                                        <span className="text-muted-foreground">{formatFollowers(instagram.followerCount)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center text-xs pt-2 border-t">
                                                <div className="text-muted-foreground">Base Fee</div>
                                                <div className="font-semibold">${Number(creator.creatorProfile.baseFeeTiktok).toFixed(0)}</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter className="px-6 py-4 border-t">
                    <div className="flex-1 flex items-center text-sm text-muted-foreground">
                        {selected.length} creator{selected.length !== 1 ? 's' : ''} selected
                    </div>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={() => onSelect(selected)} disabled={selected.length === 0}>
                        Continue with {selected.length} Creator{selected.length !== 1 ? 's' : ''}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
