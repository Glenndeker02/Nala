import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/api-middleware';

// GET - Fetch campaign details
export const GET = requireRole(['FOUNDER', 'CREATOR'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;
        const userRole = user.role;

        console.log('=== GET Campaign Details ===');
        console.log('Campaign ID:', campaignId);
        console.log('User Role:', userRole);
        console.log('User ID:', user.userId);

        // Build the query based on user role
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            include: {
                founder: {
                    select: {
                        id: true,
                        fullName: true,
                        companyName: true,
                        email: true
                    }
                },
                videos: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                fullName: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                _count: {
                    select: {
                        videos: true,
                        applications: true
                    }
                }
            }
        });

        console.log('Campaign found:', campaign ? 'YES' : 'NO');
        if (campaign) {
            console.log('Campaign Name:', campaign.name);
            console.log('Campaign Founder ID:', campaign.founderId);
        }

        if (!campaign) {
            console.log('❌ Campaign not found in database');
            return NextResponse.json(
                { success: false, error: 'Campaign not found' },
                { status: 404 }
            );
        }

        // Authorization check for founders - they can only view their own campaigns
        if (userRole === 'FOUNDER' && campaign.founderId !== user.userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized - You can only view your own campaigns' },
                { status: 403 }
            );
        }

        // Parse briefData if it's a string
        let briefData = campaign.briefData;
        if (typeof briefData === 'string') {
            try {
                briefData = JSON.parse(briefData);
            } catch (e) {
                briefData = {};
            }
        }

        // Format the response
        const response = {
            success: true,
            campaign: {
                id: campaign.id,
                name: campaign.name,
                title: campaign.name, // Alias for compatibility
                description: campaign.description,
                status: campaign.status,
                totalBudget: Number(campaign.totalBudget),
                baseFeePerVideo: Number(campaign.baseFeePerVideo),
                baseFeeBudget: Number(campaign.baseFeeBudget),
                performanceBudget: Number(campaign.performanceBudget),
                performanceRate: Number(campaign.performanceRate),
                videosRequested: campaign.videosRequested,
                videosCompleted: campaign.videosCompleted,
                targetViews: campaign.targetViews,
                startDate: campaign.startDate,
                deadline: campaign.deadline,
                postingFrequency: campaign.postingFrequency,
                createdAt: campaign.createdAt,
                updatedAt: campaign.updatedAt,
                briefData: briefData,
                founder: campaign.founder,
                videos: campaign.videos,
                _count: campaign._count
            }
        };

        console.log('✅ Successfully fetched campaign');
        return NextResponse.json(response);

    } catch (error: any) {
        console.error('Error fetching campaign details:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});

// PUT - Edit campaign (with idempotency)
export const PUT = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;
        const body = await request.json();
        const { name, description, videosRequested, totalBudget, baseFeePerVideo, performanceRate, targetViews, deadline, postingFrequency } = body;

        // Verify campaign exists and belongs to founder
        const existingCampaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            select: {
                founderId: true,
                videosRequested: true,
                _count: {
                    select: {
                        videos: true
                    }
                }
            }
        });

        if (!existingCampaign) {
            return NextResponse.json(
                { success: false, error: 'Campaign not found' },
                { status: 404 }
            );
        }

        if (existingCampaign.founderId !== user.userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Validate videosRequested change
        if (videosRequested !== undefined && videosRequested < existingCampaign._count.videos) {
            return NextResponse.json(
                { success: false, error: `Cannot reduce videos requested below current video count (${existingCampaign._count.videos})` },
                { status: 400 }
            );
        }

        // Build update data (only include provided fields)
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (videosRequested !== undefined) updateData.videosRequested = videosRequested;
        if (targetViews !== undefined) updateData.targetViews = targetViews;
        if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;
        if (postingFrequency !== undefined) updateData.postingFrequency = postingFrequency;

        // Attribution settings
        if (body.enableCreatorCodes !== undefined) updateData.enableCreatorCodes = body.enableCreatorCodes;
        if (body.autoGenerateCodes !== undefined) updateData.autoGenerateCodes = body.autoGenerateCodes;
        if (body.conversionCommission !== undefined) updateData.conversionCommission = body.conversionCommission;
        if (body.codeDiscountType !== undefined) updateData.codeDiscountType = body.codeDiscountType;
        if (body.codeDiscountValue !== undefined) updateData.codeDiscountValue = body.codeDiscountValue;
        if (body.attributionWindowDays !== undefined) updateData.attributionWindowDays = body.attributionWindowDays;

        // Handle budget updates
        if (totalBudget !== undefined || baseFeePerVideo !== undefined || performanceRate !== undefined) {
            const currentTotalBudget = totalBudget !== undefined ? totalBudget : undefined;
            const currentBaseFee = baseFeePerVideo !== undefined ? baseFeePerVideo : undefined;
            const currentPerfRate = performanceRate !== undefined ? performanceRate : undefined;

            if (currentTotalBudget !== undefined) updateData.totalBudget = currentTotalBudget;
            if (currentBaseFee !== undefined) {
                updateData.baseFeePerVideo = currentBaseFee;
                // Recalculate base fee budget
                const vids = videosRequested !== undefined ? videosRequested : existingCampaign.videosRequested;
                updateData.baseFeeBudget = currentBaseFee * vids;
                if (currentTotalBudget !== undefined) {
                    updateData.performanceBudget = currentTotalBudget - (currentBaseFee * vids);
                }
            }
            if (currentPerfRate !== undefined) updateData.performanceRate = currentPerfRate;
        }

        // Update campaign (idempotent - uses same ID)
        const updated = await prisma.campaign.update({
            where: { id: campaignId }, // Using UUID ensures idempotency
            data: updateData
        });

        return NextResponse.json({
            success: true,
            message: 'Campaign updated successfully',
            data: {
                id: updated.id,
                name: updated.name,
                description: updated.description,
                videosRequested: updated.videosRequested,
                totalBudget: Number(updated.totalBudget),
                baseFeePerVideo: Number(updated.baseFeePerVideo),
                performanceRate: Number(updated.performanceRate),
                targetViews: updated.targetViews,
                updatedAt: updated.updatedAt.toISOString()
            }
        });

    } catch (error: any) {
        console.error('Error updating campaign:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
