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

        if (decoded.role !== 'CREATOR') {
            return NextResponse.json(
                { success: false, error: 'Access denied. Creator role required.' },
                { status: 403 }
            );
        }

        const userId = decoded.userId;

        // Get creator's profile to understand their niche
        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId }
        });

        // Get active campaigns that match creator's niche
        const opportunities = await prisma.campaign.findMany({
            where: {
                status: { in: ['ACTIVE', 'PENDING_CREATOR'] },
                creatorId: null, // Not yet assigned
                // In production, would filter by niche/category matching
            },
            include: {
                founder: {
                    select: {
                        companyName: true,
                        fullName: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // Calculate match scores and format opportunities
        const formattedOpportunities = opportunities.map(campaign => {
            // Mock match score calculation
            // In production, would use recommendation engine
            const matchScore = Math.floor(Math.random() * 30) + 70; // 70-100%

            // Calculate estimated earnings (base fee)
            const estimatedEarnings = Number(campaign.totalBudget) / (campaign.videosRequested || 1);

            return {
                id: campaign.id,
                campaignName: campaign.name,
                brandName: campaign.founder.companyName || campaign.founder.fullName,
                matchScore,
                estimatedEarnings: Math.round(estimatedEarnings),
                videosNeeded: campaign.videosRequested - campaign.videosCompleted,
                deadline: campaign.deadline,
                category: 'UGC', // In production, get from campaign
                description: `Create ${campaign.videosRequested} UGC videos for ${campaign.founder.companyName || campaign.founder.fullName}`
            };
        });

        // Sort by match score
        formattedOpportunities.sort((a, b) => b.matchScore - a.matchScore);

        return NextResponse.json({
            success: true,
            data: {
                opportunities: formattedOpportunities
            }
        });

    } catch (error: any) {
        console.error('Error fetching creator opportunities:', error);

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
