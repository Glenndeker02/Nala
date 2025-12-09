import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

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

        if (decoded.role !== 'FOUNDER') {
            return NextResponse.json(
                { success: false, error: 'Access denied. Founder role required.' },
                { status: 403 }
            );
        }

        const userId = decoded.userId;

        // Get founder's campaigns to understand their industry/niche
        const campaigns = await prisma.campaign.findMany({
            where: { founderId: userId },
            include: {
                videos: {
                    where: { status: 'POSTED' },
                    include: {
                        viewSnapshots: {
                            orderBy: { snapshotAt: 'desc' },
                            take: 1
                        }
                    }
                }
            },
            take: 10
        });

        const suggestions: any[] = [];

        // Analyze campaign performance
        if (campaigns.length > 0) {
            // Calculate average performance
            let totalViews = 0;
            let videoCount = 0;

            campaigns.forEach(campaign => {
                campaign.videos.forEach(video => {
                    if (video.viewSnapshots.length > 0) {
                        totalViews += video.viewSnapshots[0].viewCount;
                        videoCount++;
                    }
                });
            });

            const avgViews = videoCount > 0 ? totalViews / videoCount : 0;

            // Suggestion 1: Budget optimization
            const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE');
            if (activeCampaigns.length > 0 && avgViews > 10000) {
                suggestions.push({
                    id: 'budget-opt-1',
                    title: 'Increase budget for high-performing campaigns',
                    description: 'Your videos are getting great engagement. Consider increasing budget for better reach.',
                    type: 'budget',
                    actionType: 'add_budget',
                    actionUrl: `/founder/campaigns/${activeCampaigns[0].id}`,
                    actionData: { campaignId: activeCampaigns[0].id }
                });
            }

            // Suggestion 2: Format recommendation
            if (videoCount > 5) {
                suggestions.push({
                    id: 'format-1',
                    title: 'Try "Day in the Life" format',
                    description: 'This format is trending and matches your campaign style',
                    type: 'format',
                    actionType: 'view_library',
                    actionUrl: '/founder/library',
                    actionData: {}
                });
            }

            // Suggestion 3: Creator diversity
            const uniqueCreators = new Set(
                campaigns.flatMap(c => c.videos.map(v => v.creatorId).filter(Boolean))
            );

            if (uniqueCreators.size < 3 && campaigns.length > 2) {
                suggestions.push({
                    id: 'creator-1',
                    title: 'Work with more creators',
                    description: 'Diversifying creators can help reach different audiences',
                    type: 'strategy',
                    actionType: 'create_campaign',
                    actionUrl: '/founder/campaigns/create',
                    actionData: {}
                });
            }
        } else {
            // New founder suggestions
            suggestions.push({
                id: 'welcome-1',
                title: 'Create your first campaign',
                description: 'Start by defining your product and target audience',
                type: 'getting-started',
                actionType: 'create_campaign',
                actionUrl: '/founder/campaigns/create',
                actionData: {}
            });

            suggestions.push({
                id: 'welcome-2',
                title: 'Browse the content library',
                description: 'See what formats work best for brands like yours',
                type: 'getting-started',
                actionType: 'view_library',
                actionUrl: '/founder/library',
                actionData: {}
            });
        }

        // Add general best practices
        suggestions.push({
            id: 'best-practice-1',
            title: 'Review videos within 24 hours',
            description: 'Quick feedback helps creators deliver better content',
            type: 'best-practice',
            actionType: 'view_deadlines',
            actionUrl: '/founder/dashboard',
            actionData: {}
        });

        return NextResponse.json({
            success: true,
            data: {
                suggestions: suggestions.slice(0, 5)
            }
        });

    } catch (error: any) {
        console.error('Error fetching suggestions:', error);

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
