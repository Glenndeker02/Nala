import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { mockContentLibraryData } from '@/data/mockContentLibraryData';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        // Extract and verify JWT token
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
            userId: string;
            role: string;
        };

        const userId = decoded.userId;

        // Get query parameters
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '8');
        const industry = searchParams.get('industry');
        const platform = searchParams.get('platform');

        // Query database for video formats
        const where: any = {};

        // Filter by industry (checking categories or structure)
        if (industry) {
            where.categories = { has: industry };
        }

        // Filter by platform
        if (platform) {
            where.platforms = { has: platform };
        }

        const dbFormats = await prisma.videoFormat.findMany({
            where,
            take: limit,
            orderBy: {
                avgViews: 'desc' // Default sort by popularity
            }
        });

        // Map DB formats to frontend expected structure
        // We assume 'structure' JSON field contains the UI-specific details like thumbnail, creator info, etc.
        let formats = dbFormats.map(f => {
            const uiData: any = f.structure || {};

            return {
                id: f.id,
                thumbnailUrl: uiData.thumbnailUrl || '/placeholders/video-placeholder.jpg',
                videoUrl: uiData.videoUrl || '',
                platform: f.platforms[0] || 'TikTok',
                formatType: f.name,
                hookStyle: uiData.hookStyle || 'Visual',
                creator: {
                    name: uiData.creatorName || 'Nala Creator',
                    handle: uiData.creatorHandle || '@nalacreator',
                    avatarUrl: uiData.creatorAvatarUrl || ''
                },
                metrics: {
                    views: f.avgViews,
                    engagementRate: Number(f.avgEngagementRate) || 0
                },
                rankingScore: 0, // Will be calculated below
                industry: f.categories[0] || 'General'
            };
        });

        // Calculate ranking scores based on metrics
        formats = formats.map(format => ({
            ...format,
            rankingScore: calculateRankingScore(format)
        }));

        // Sort by ranking score
        formats.sort((a, b) => (b.rankingScore || 0) - (a.rankingScore || 0));

        // Return top formats
        const topFormats = formats.slice(0, limit);

        return NextResponse.json({
            success: true,
            data: {
                formats: topFormats,
                total: formats.length
            }
        });

    } catch (error: any) {
        console.error('Error fetching content library:', error);

        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json(
                { success: false, error: 'Invalid token' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Calculate ranking score based on multiple factors
function calculateRankingScore(format: any): number {
    const viewsWeight = 0.4;
    const engagementWeight = 0.3;
    const completionWeight = 0.2;
    const savesWeight = 0.1;

    // Normalize metrics (0-100 scale)
    const normalizedViews = Math.min(100, (format.metrics.views / 50000) * 100);
    const normalizedEngagement = Math.min(100, format.metrics.engagementRate * 10);
    const normalizedCompletion = format.metrics.completionRate;
    const normalizedSaves = Math.min(100, (format.metrics.saves / 1000) * 100);

    const score =
        (normalizedViews * viewsWeight) +
        (normalizedEngagement * engagementWeight) +
        (normalizedCompletion * completionWeight) +
        (normalizedSaves * savesWeight);

    return Math.round(score);
}
