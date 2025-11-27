import { ContentFormat } from "@/data/mockContentLibraryData";
import { SuggestedOpportunity } from "@/data/mockCreatorDashboardData";

export interface CreatorProfile {
    niche: string;
    platforms: string[];
    languages: string[];
    averageEngagement: number;
    completedCampaigns: number;
}

// Mock creator profile for testing
export const mockCreatorProfile: CreatorProfile = {
    niche: 'Beauty',
    platforms: ['TikTok', 'Instagram'],
    languages: ['English'],
    averageEngagement: 4.8,
    completedCampaigns: 12,
};

/**
 * Calculates a match score (0-100) between a creator and a campaign opportunity
 */
export function calculateCampaignMatchScore(opportunity: SuggestedOpportunity, profile: CreatorProfile): number {
    let score = 0;

    // Niche match (40 points)
    if (opportunity.niche === profile.niche) {
        score += 40;
    } else if (['Lifestyle', 'Wellness'].includes(opportunity.niche) && profile.niche === 'Beauty') {
        score += 20; // Related niche
    }

    // Budget/Experience match (30 points)
    // Higher budget campaigns require more experience
    if (opportunity.budget > 500) {
        if (profile.completedCampaigns > 10) score += 30;
        else if (profile.completedCampaigns > 5) score += 15;
    } else {
        score += 30; // Accessible to most
    }

    // Requirement match (30 points)
    // Simplified: check if creator meets basic implied requirements
    score += 30;

    return Math.min(100, score);
}

/**
 * Calculates a match score (0-100) between a creator and a content format
 */
export function calculateFormatMatchScore(format: ContentFormat, profile: CreatorProfile): number {
    let score = 0;

    // Platform match (30 points)
    if (profile.platforms.map(p => p.toUpperCase()).includes(format.platform.toUpperCase())) {
        score += 30;
    }

    // Niche/Industry match (40 points)
    if (format.creator.niche === profile.niche || format.industry === profile.niche) {
        score += 40;
    }

    // Performance match (30 points)
    // Recommend high-performing formats
    if (format.metrics.engagementRate > profile.averageEngagement) {
        score += 30;
    } else {
        score += 15;
    }

    return Math.min(100, score);
}

/**
 * Returns sorted recommended campaigns for a creator
 */
export function getRecommendedCampaigns(opportunities: SuggestedOpportunity[], profile: CreatorProfile): SuggestedOpportunity[] {
    return opportunities
        .map(opp => ({
            ...opp,
            matchScore: calculateCampaignMatchScore(opp, profile)
        }))
        .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Returns sorted recommended content formats for a creator
 */
export function getRecommendedCreatorFormats(formats: ContentFormat[], profile: CreatorProfile): ContentFormat[] {
    return formats
        .map(format => ({
            ...format,
            recommendationScore: calculateFormatMatchScore(format, profile)
        }))
        .filter(format => (format.recommendationScore || 0) > 50) // Only show relevant ones
        .sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0));
}
