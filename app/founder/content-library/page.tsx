"use client";

import React, { useState, useMemo } from 'react';
import { mockContentLibraryData, ContentFormat } from '@/data/mockContentLibraryData';
import { rankFormats, getTrendingFormats } from '@/lib/rankingEngine';
import { getRecommendedFormats, FounderProfile } from '@/lib/recommendationEngine';
import ContentFormatCard from '@/app/founder/components/library/ContentFormatCard';
import FilterBar, { FilterOptions, SortOption } from '@/app/founder/components/library/FilterBar';
import { Sparkles } from 'lucide-react';

export default function ContentLibraryPage() {
    const [filters, setFilters] = useState<FilterOptions>({
        platform: [],
        duration: [],
        formatType: [],
        followers: [],
        language: [],
        industry: [],
    });
    const [sortBy, setSortBy] = useState<SortOption>('mostPopular');
    const [searchQuery, setSearchQuery] = useState('');

    // Mock founder profile (in production, fetch from user data)
    const founderProfile: FounderProfile = {
        industry: 'Beauty',
        preferredPlatforms: ['TikTok', 'Instagram'],
        targetLanguage: 'English',
        previousSuccessfulFormats: ['Review', 'Demo'],
    };

    // Filter and sort logic
    const filteredAndSortedFormats = useMemo(() => {
        let formats = [...mockContentLibraryData];

        // Apply filters
        if (filters.platform.length > 0) {
            formats = formats.filter(f => filters.platform.includes(f.platform));
        }

        if (filters.duration.length > 0) {
            formats = formats.filter(f => {
                const duration = f.duration;
                return filters.duration.some(range => {
                    if (range === '<15s') return duration < 15;
                    if (range === '15-30s') return duration >= 15 && duration <= 30;
                    if (range === '30-60s') return duration > 30 && duration <= 60;
                    if (range === '>60s') return duration > 60;
                    return false;
                });
            });
        }

        if (filters.formatType.length > 0) {
            formats = formats.filter(f => filters.formatType.includes(f.formatType));
        }

        if (filters.followers.length > 0) {
            formats = formats.filter(f => {
                const followers = f.creator.followers;
                return filters.followers.some(range => {
                    if (range === '<10K') return followers < 10000;
                    if (range === '10K-50K') return followers >= 10000 && followers <= 50000;
                    if (range === '50K-200K') return followers > 50000 && followers <= 200000;
                    if (range === '200K+') return followers > 200000;
                    return false;
                });
            });
        }

        if (filters.language.length > 0) {
            formats = formats.filter(f => filters.language.includes(f.creator.language));
        }

        if (filters.industry.length > 0) {
            formats = formats.filter(f => filters.industry.includes(f.industry));
        }

        // Apply search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            formats = formats.filter(f =>
                f.formatType.toLowerCase().includes(query) ||
                f.creator.name.toLowerCase().includes(query) ||
                f.creator.niche.toLowerCase().includes(query) ||
                f.platform.toLowerCase().includes(query)
            );
        }

        // Apply sorting
        switch (sortBy) {
            case 'mostPopular':
                formats = rankFormats(formats);
                break;
            case 'highestEngagement':
                formats = formats.sort((a, b) => b.metrics.engagementRate - a.metrics.engagementRate);
                break;
            case 'newest':
                formats = formats.sort((a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime());
                break;
            case 'oldest':
                formats = formats.sort((a, b) => new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime());
                break;
            case 'trending':
                formats = getTrendingFormats(formats);
                break;
            case 'recommended':
                formats = getRecommendedFormats(formats, founderProfile);
                break;
        }

        return formats;
    }, [filters, sortBy, searchQuery]);

    // Get recommended formats for the top section
    const recommendedFormats = useMemo(() => {
        return getRecommendedFormats(mockContentLibraryData, founderProfile).slice(0, 3);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50/50">
            <main className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Content Library</h1>
                    <p className="mt-1 text-gray-500">
                        Browse high-performing UGC formats and create campaigns from proven templates
                    </p>
                </div>

                {/* Recommended Section */}
                {sortBy !== 'recommended' && recommendedFormats.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Recommended for You</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recommendedFormats.map(format => (
                                <ContentFormatCard key={format.id} format={format} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Filter Bar */}
                <div className="mb-6">
                    <FilterBar
                        filters={filters}
                        sortBy={sortBy}
                        searchQuery={searchQuery}
                        onFilterChange={setFilters}
                        onSortChange={setSortBy}
                        onSearchChange={setSearchQuery}
                    />
                </div>

                {/* Results Count */}
                <div className="mb-4">
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-semibold">{filteredAndSortedFormats.length}</span> formats
                    </p>
                </div>

                {/* Content Grid */}
                {filteredAndSortedFormats.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No formats found matching your criteria</p>
                        <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search query</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredAndSortedFormats.map(format => (
                            <ContentFormatCard key={format.id} format={format} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
