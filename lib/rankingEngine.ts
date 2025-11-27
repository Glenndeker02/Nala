import { ContentFormat } from '@/data/mockContentLibraryData';

/**
 * Ranking Engine: Calculates a performance score for each content format
 * Based on weighted metrics:
 * - Views: 30%
 * - Engagement Rate: 50%
 * - Saves/Shares momentum: 20%
 */

export function calculateRankingScore(format: ContentFormat): number {
    const { views, engagementRate, saves, shares } = format.metrics;

    // Normalize values (0-100 scale)
    const normalizedViews = Math.min((views / 5000000) * 100, 100);
    const normalizedEngagement = Math.min(engagementRate * 6.67, 100); // 15% engagement = 100
    const normalizedMomentum = Math.min(((saves + shares) / 150000) * 100, 100);

    // Calculate weighted score
    const score =
        normalizedViews * 0.3 +
        normalizedEngagement * 0.5 +
        normalizedMomentum * 0.2;

    return Math.round(score * 10) / 10; // Round to 1 decimal
}

export function rankFormats(formats: ContentFormat[]): ContentFormat[] {
    return formats.map(format => ({
        ...format,
        rankingScore: calculateRankingScore(format),
    })).sort((a, b) => (b.rankingScore || 0) - (a.rankingScore || 0));
}

export function getTrendingFormats(formats: ContentFormat[]): ContentFormat[] {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return formats
        .filter(format => new Date(format.datePosted) > thirtyDaysAgo)
        .map(format => ({
            ...format,
            rankingScore: calculateRankingScore(format),
        }))
        .sort((a, b) => (b.rankingScore || 0) - (a.rankingScore || 0));
}
