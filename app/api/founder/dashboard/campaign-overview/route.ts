import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';

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

        // Verify user is a founder
        if (decoded.role !== 'FOUNDER') {
            return NextResponse.json(
                { success: false, error: 'Access denied. Founder role required.' },
                { status: 403 }
            );
        }

        const userId = decoded.userId;

        // Get campaign counts by status
        const [activeCampaigns, completedCampaigns, totalCampaigns] = await Promise.all([
            db.campaign.count({
                where: { founderId: userId, status: 'ACTIVE' }
            }),
            db.campaign.count({
                where: { founderId: userId, status: 'COMPLETED' }
            }),
            db.campaign.count({
                where: { founderId: userId }
            })
        ]);

        // Get budget statistics
        const budgetStats = await db.campaign.aggregate({
            where: { founderId: userId },
            _sum: {
                totalBudget: true,
                // escrowBalance: true // TODO: Uncomment when added
            }
        });

        // Calculate total budget spent
        const totalBudget = Number(budgetStats._sum.totalBudget || 0);
        const escrowBalance = 0; // Number(budgetStats._sum.escrowBalance || 0); // TODO: Uncomment when added
        const budgetSpent = totalBudget - escrowBalance;

        // Calculate average engagement rate from posted videos
        const videos = await db.video.findMany({
            where: {
                campaign: { founderId: userId },
                status: 'POSTED'
            },
            include: {
                viewSnapshots: {
                    orderBy: { snapshotAt: 'desc' },
                    take: 1
                }
            }
        });

        // Calculate engagement rate (mock calculation based on views)
        // In production, this would use actual engagement metrics
        let totalEngagement = 0;
        let videoCount = 0;

        videos.forEach(video => {
            if (video.viewSnapshots.length > 0) {
                const views = video.viewSnapshots[0].viewCount;
                // Mock engagement calculation: higher views = higher engagement
                // This is a placeholder - real engagement would come from platform APIs
                const engagementRate = Math.min(10, (views / 10000) * 5);
                totalEngagement += engagementRate;
                videoCount++;
            }
        });

        const avgEngagementRate = videoCount > 0
            ? Number((totalEngagement / videoCount).toFixed(1))
            : 0;

        return NextResponse.json({
            success: true,
            data: {
                activeCampaigns,
                completedCampaigns,
                totalCampaigns,
                totalBudget,
                budgetSpent,
                avgEngagementRate
            }
        });

    } catch (error: any) {
        console.error('Error fetching campaign overview:', error);

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
