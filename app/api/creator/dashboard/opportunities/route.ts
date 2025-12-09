import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

/**
 * Smart Opportunity Recommendation Algorithm
 * Matches campaigns to creators based on multiple factors
 */
async function calculateMatchScore(
    campaign: any,
    creatorProfile: any
): Promise<{ score: number; reason: string }> {
    let score = 0;
    const reasons: string[] = [];

    // 1. Category Match (30 points)
    const campaignCategories = campaign.briefData?.categories || [];
    const creatorCategories = creatorProfile.categories || [];
    const categoryMatch = campaignCategories.some((cat: string) =>
        creatorCategories.includes(cat)
    );

    if (categoryMatch) {
        score += 30;
        reasons.push('Perfect category match');
    } else {
        // Check for related categories
        const relatedMatch = campaignCategories.some((cat: string) =>
            creatorCategories.some((cCat: string) =>
                cat.toLowerCase().includes(cCat.toLowerCase()) ||
                cCat.toLowerCase().includes(cat.toLowerCase())
            )
        );
        if (relatedMatch) {
            score += 15;
            reasons.push('Related category');
        }
    }

    // 2. Past Performance / Ranking (25 points)
    const ranking = creatorProfile.rankingScore;
    if (ranking >= 75) {
        score += 25;
        reasons.push('High ranking');
    } else if (ranking >= 50) {
        score += 15;
        reasons.push('Good ranking');
    } else {
        score += 5;
    }

    // 3. Platform Experience (20 points)
    if (campaign.platform) {
        const hasPlatformExperience = await prisma.video.count({
            where: {
                creatorId: creatorProfile.userId,
                platform: campaign.platform,
                status: { in: ['POSTED', 'LOCKED'] },
            },
        });

        if (hasPlatformExperience > 0) {
            score += 20;
            reasons.push(`${campaign.platform} experience`);
        } else {
            // Check if creator has connected account
            const hasAccount = await prisma.socialAccount.count({
                where: {
                    creatorId: creatorProfile.userId,
                    platform: campaign.platform,
                },
            });

            if (hasAccount > 0) {
                score += 10;
            }
        }
    }

    // 4. Budget Alignment (15 points)
    const campaignBudget = Number(campaign.baseFeeeBudget) / campaign.videosRequested;
    const creatorBaseFee = Number(
        campaign.platform === 'TIKTOK'
            ? creatorProfile.baseFeeTiktok
            : campaign.platform === 'INSTAGRAM'
                ? creatorProfile.baseFeeInstagram
                : creatorProfile.baseFeeFacebook
    );

    if (campaignBudget >= creatorBaseFee * 0.8 && campaignBudget <= creatorBaseFee * 1.5) {
        score += 15;
        reasons.push('Budget match');
    } else if (campaignBudget > creatorBaseFee * 1.5) {
        score += 10;
        reasons.push('Higher budget');
    } else {
        score += 5;
    }

    // 5. Availability (10 points)
    const activeCampaigns = await prisma.video.count({
        where: {
            creatorId: creatorProfile.userId,
            status: { in: ['PENDING', 'DRAFT_SUBMITTED', 'IN_REVIEW', 'REVISION_REQUESTED'] },
        },
    });

    if (activeCampaigns === 0) {
        score += 10;
        reasons.push('Available');
    } else if (activeCampaigns <= 2) {
        score += 5;
    }

    return {
        score: Math.min(100, score),
        reason: reasons.join(' + '),
    };
}

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

        if (decoded.role !== 'CREATOR') {
            return NextResponse.json(
                { success: false, error: 'Access denied. Creator role required.' },
                { status: 403 }
            );
        }

        const userId = decoded.userId;

        // Get query params
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '5');

        // Get creator profile
        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId },
        });

        if (!creatorProfile) {
            return NextResponse.json(
                { success: false, error: 'Creator profile not found' },
                { status: 404 }
            );
        }

        // Get available campaigns (PENDING_CREATOR status)
        const campaigns = await prisma.campaign.findMany({
            where: {
                status: 'PENDING_CREATOR',
                // Exclude campaigns creator has already applied to
                applications: {
                    none: {
                        creatorId: userId,
                    },
                },
            },
            include: {
                founder: {
                    select: {
                        fullName: true,
                        companyName: true,
                    },
                },
            },
            take: 50, // Get more than needed for scoring
        });

        // Calculate match scores for each campaign
        const scoredCampaigns = await Promise.all(
            campaigns.map(async (campaign) => {
                const match = await calculateMatchScore(campaign, creatorProfile);
                return {
                    id: campaign.id,
                    campaignName: campaign.name,
                    brandName: campaign.founder.companyName || campaign.founder.fullName,
                    matchScore: match.score,
                    matchReason: match.reason,
                    estimatedEarnings: Number(campaign.baseFeeeBudget) / campaign.videosRequested,
                    videosNeeded: campaign.videosRequested,
                    category: campaign.briefData?.categories?.[0] || 'General',
                    platform: campaign.platform || 'TIKTOK',
                    deadline: campaign.deadline,
                };
            })
        );

        // Sort by match score and take top results
        const topOpportunities = scoredCampaigns
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);

        return NextResponse.json({
            success: true,
            data: {
                opportunities: topOpportunities,
            },
        });
    } catch (error: any) {
        console.error('Error fetching opportunities:', error);

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
