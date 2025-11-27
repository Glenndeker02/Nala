import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

export type FilterOptions = {
    platform: string[];
    duration: string[];
    formatType: string[];
    followers: string[];
    language: string[];
    industry: string[];
};

export type SortOption =
    | 'mostPopular'
    | 'highestEngagement'
    | 'newest'
    | 'oldest'
    | 'trending'
    | 'recommended';

interface FilterBarProps {
    filters: FilterOptions;
    sortBy: SortOption;
    searchQuery: string;
    onFilterChange: (filters: FilterOptions) => void;
    onSortChange: (sort: SortOption) => void;
    onSearchChange: (query: string) => void;
}

export default function FilterBar({
    filters,
    sortBy,
    searchQuery,
    onFilterChange,
    onSortChange,
    onSearchChange,
}: FilterBarProps) {
    const [showFilters, setShowFilters] = React.useState(false);

    const toggleFilter = (category: keyof FilterOptions, value: string) => {
        const current = filters[category];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];

        onFilterChange({ ...filters, [category]: updated });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
            {/* Search and Sort Row */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search formats..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>

                {/* Sort */}
                <div className="flex gap-2">
                    <select
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value as SortOption)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                    >
                        <option value="mostPopular">Most Popular</option>
                        <option value="highestEngagement">Highest Engagement</option>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="trending">Trending</option>
                        <option value="recommended">Recommended</option>
                    </select>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${showFilters ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    {/* Platform */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Platform</h4>
                        <div className="space-y-1">
                            {['TikTok', 'Instagram', 'YouTube', 'Facebook'].map(platform => (
                                <label key={platform} className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={filters.platform.includes(platform)}
                                        onChange={() => toggleFilter('platform', platform)}
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span>{platform}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Duration */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Duration</h4>
                        <div className="space-y-1">
                            {['<15s', '15-30s', '30-60s', '>60s'].map(duration => (
                                <label key={duration} className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={filters.duration.includes(duration)}
                                        onChange={() => toggleFilter('duration', duration)}
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span>{duration}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Format Type */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Content Type</h4>
                        <div className="space-y-1">
                            {['Review', 'Demo', 'Tutorial', 'Testimonial', 'Storytime', 'Skit', 'Unboxing'].map(type => (
                                <label key={type} className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={filters.formatType.includes(type)}
                                        onChange={() => toggleFilter('formatType', type)}
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span>{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Followers */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Creator Following</h4>
                        <div className="space-y-1">
                            {['<10K', '10K-50K', '50K-200K', '200K+'].map(range => (
                                <label key={range} className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={filters.followers.includes(range)}
                                        onChange={() => toggleFilter('followers', range)}
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span>{range}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Language */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Language</h4>
                        <div className="space-y-1">
                            {['English', 'Spanish', 'French', 'Swahili'].map(lang => (
                                <label key={lang} className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={filters.language.includes(lang)}
                                        onChange={() => toggleFilter('language', lang)}
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span>{lang}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Industry */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Industry</h4>
                        <div className="space-y-1">
                            {['Beauty', 'Wellness', 'Tech', 'Fashion', 'Fitness', 'Food'].map(industry => (
                                <label key={industry} className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={filters.industry.includes(industry)}
                                        onChange={() => toggleFilter('industry', industry)}
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span>{industry}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
