import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { formatDistanceToNow } from 'date-fns';

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

        // Get creator's assigned videos/campaigns
        const assignments = await prisma.video.findMany({
            where: {
                creatorId: userId,
                status: { in: ['PENDING', 'DRAFT_SUBMITTED', 'IN_REVIEW', 'REVISION_REQUESTED', 'APPROVED'] }
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true,
                        founder: {
                            select: {
                                companyName: true,
                                fullName: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // Format assignments
        const formattedAssignments = assignments.map(video => {
            let status: 'PENDING' | 'DRAFT' | 'REVIEW' | 'APPROVED' | 'POSTED' = 'PENDING';

            if (video.status === 'DRAFT_SUBMITTED' || video.status === 'IN_REVIEW') {
                status = 'REVIEW';
            } else if (video.status === 'APPROVED') {
                status = 'APPROVED';
            } else if (video.status === 'POSTED' || video.status === 'LOCKED') {
                status = 'POSTED';
            } else if (video.status === 'REVISION_REQUESTED') {
                status = 'DRAFT';
            }

            // Calculate payment amount (base fee from campaign)
            const paymentAmount = 350; // Mock value, in production get from campaign/video

            return {
                id: video.id,
                campaignName: video.campaign.name,
                brandName: video.campaign.founder.companyName || video.campaign.founder.fullName,
                status,
                dueDate: video.createdAt ? formatDistanceToNow(video.createdAt, { addSuffix: true }) : 'No deadline',
                deliverableType: 'UGC Video',
                paymentAmount
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                assignments: formattedAssignments
            }
        });

    } catch (error: any) {
        console.error('Error fetching creator assignments:', error);

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
