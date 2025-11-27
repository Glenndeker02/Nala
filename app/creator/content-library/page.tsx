"use client";

import React, { useState, useMemo } from "react";
import { mockContentLibraryData } from "@/data/mockContentLibraryData";
import FilterBar from "@/app/founder/components/library/FilterBar"; // Reusing FilterBar
import CreatorFormatCard from "@/app/creator/components/library/CreatorFormatCard";
import { getRecommendedCreatorFormats, mockCreatorProfile } from "@/lib/creatorRecommendationEngine";
import { Sparkles } from "lucide-react";

export default function CreatorContentLibraryPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("recommended");
    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

    // Get recommended formats first
    const recommendedFormats = useMemo(() => {
        return getRecommendedCreatorFormats(mockContentLibraryData, mockCreatorProfile);
    }, []);

    // Filter and Sort Logic
    const filteredFormats = useMemo(() => {
        let result = [...mockContentLibraryData];

        // 1. Apply Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.formatType.toLowerCase().includes(query) ||
                item.creator.name.toLowerCase().includes(query) ||
                item.creator.niche.toLowerCase().includes(query) ||
                item.platform.toLowerCase().includes(query)
            );
        }

        // 2. Apply Filters
        Object.entries(activeFilters).forEach(([category, values]) => {
            if (values.length > 0) {
                result = result.filter(item => {
                    switch (category) {
                        case 'Platform': return values.includes(item.platform);
                        case 'Duration': return values.includes(item.duration); // Simplified matching
                        case 'Content Type': return values.includes(item.formatType);
                        case 'Language': return values.includes(item.creator.language);
                        case 'Industry': return values.includes(item.industry);
                        default: return true;
                    }
                });
            }
        });

        // 3. Apply Sorting
        switch (sortBy) {
            case 'recommended':
                // Use the recommendation engine logic
                result = getRecommendedCreatorFormats(result, mockCreatorProfile);
                break;
            case 'popular':
                result.sort((a, b) => b.metrics.views - a.metrics.views);
                break;
            case 'engagement':
                result.sort((a, b) => b.metrics.engagementRate - a.metrics.engagementRate);
                break;
            case 'newest':
                // Mock date sorting (assuming data has dates or just keeping order)
                break;
            case 'trending':
                // Use ranking score
                result.sort((a, b) => (b.rankingScore || 0) - (a.rankingScore || 0));
                break;
        }

        return result;
    }, [searchQuery, activeFilters, sortBy]);

    return (
        <div className="min-h-screen bg-gray-50/50">
            <main className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Content Library</h1>
                    <p className="mt-2 text-gray-600 max-w-2xl">
                        Discover high-performing video formats to inspire your next creation.
                    </p>
                </div>

                {/* Recommended Section (Only show if no search/filters active) */}
                {!searchQuery && Object.keys(activeFilters).length === 0 && sortBy === 'recommended' && (
                    <div className="mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Recommended for You</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {recommendedFormats.slice(0, 5).map((format) => (
                                <CreatorFormatCard
                                    key={`rec-${format.id}`}
                                    format={format}
                                    recommendationScore={format.recommendationScore}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Library */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filter Sidebar */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="sticky top-8">
                            <FilterBar
                                onSearch={setSearchQuery}
                                onSortChange={setSortBy}
                                onFilterChange={setActiveFilters}
                            />
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">
                                All Formats <span className="text-gray-400 font-normal ml-2">({filteredFormats.length})</span>
                            </h2>
                        </div>

                        {filteredFormats.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                                <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Sparkles className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No formats found</h3>
                                <p className="text-gray-500 mt-1">Try adjusting your filters or search terms</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredFormats.map((format) => (
                                    <CreatorFormatCard
                                        key={format.id}
                                        format={format}
                                        recommendationScore={format.recommendationScore}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
