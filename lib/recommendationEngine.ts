import { ContentFormat } from '@/data/mockContentLibraryData';

/**
 * Recommendation Engine: Suggests formats based on founder profile
 */

export type FounderProfile = {
    industry?: string;
    preferredPlatforms?: string[];
    budgetRange?: 'low' | 'medium' | 'high';
    targetLanguage?: string;
    previousSuccessfulFormats?: string[];
};

export function calculateRecommendationScore(
    format: ContentFormat,
    founderProfile: FounderProfile
): number {
    let score = 0;

    // Industry match (40 points)
    if (founderProfile.industry && format.industry === founderProfile.industry) {
        score += 40;
    }

    // Platform preference (20 points)
    if (founderProfile.preferredPlatforms?.includes(format.platform)) {
        score += 20;
    }

    // Language match (15 points)
    if (founderProfile.targetLanguage && format.creator.language === founderProfile.targetLanguage) {
        score += 15;
    }

    // Format type match (25 points)
    if (founderProfile.previousSuccessfulFormats?.includes(format.formatType)) {
        score += 25;
    }

    return score;
}

export function getRecommendedFormats(
    formats: ContentFormat[],
    founderProfile: FounderProfile
): ContentFormat[] {
    return formats
        .map(format => ({
            ...format,
            recommendationScore: calculateRecommendationScore(format, founderProfile),
        }))
        .filter(format => (format as any).recommendationScore > 20) // Only show if some match
        .sort((a, b) => ((b as any).recommendationScore || 0) - ((a as any).recommendationScore || 0));
}
