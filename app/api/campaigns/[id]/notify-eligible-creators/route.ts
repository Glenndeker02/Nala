import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

/**
 * Notify eligible creators about a new campaign
 * POST /api/campaigns/[id]/notify-eligible-creators
 */
export const POST = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;

        // Get campaign with eligibility rules
        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
            select: {
                id: true,
                name: true,
                founderId: true,
                eligibilityRules: true,
                notificationsSent: true,
                baseFeeeBudget: true,
                videosRequested: true,
                briefData: true,
            },
        });

        if (!campaign) {
            return ApiResponse.error('Campaign not found', 404);
        }

        // Verify ownership
        if (campaign.founderId !== user.userId) {
            return ApiResponse.error('Unauthorized', 403);
        }

        // Check if notifications already sent
        if (campaign.notificationsSent) {
            return ApiResponse.success({
                message: 'Notifications already sent for this campaign',
                notifiedCount: 0,
            });
        }

        // If no eligibility rules, notify all creators
        const eligibilityRules = campaign.eligibilityRules as any;

        // Build query to find eligible creators
        const whereClause: any = {
            role: 'CREATOR',
            creatorProfile: {
                isNot: null,
                verificationStatus: 'VERIFIED',
            },
        };

        // Apply eligibility filters if they exist
        if (eligibilityRules) {
            const profileFilters: any = {};

            // Minimum rating filter
            if (eligibilityRules.minRating && eligibilityRules.minRating > 0) {
                profileFilters.avgRating = {
                    gte: eligibilityRules.minRating,
                };
            }

            // Categories/niche filter
            if (eligibilityRules.niche && eligibilityRules.niche.length > 0) {
                profileFilters.categories = {
                    hasSome: eligibilityRules.niche,
                };
            }

            // Certified Only filter
            if (eligibilityRules.certifiedOnly) {
                profileFilters.certificationStatus = 'CERTIFIED';
            }

            // Add profile filters to where clause
            if (Object.keys(profileFilters).length > 0) {
                whereClause.creatorProfile = {
                    ...whereClause.creatorProfile,
                    ...profileFilters,
                };
            }
        }

        // Find eligible creators
        const eligibleCreators = await db.user.findMany({
            where: whereClause,
            select: {
                id: true,
                fullName: true,
                email: true,
            },
            take: 100, // Limit to 100 creators per batch
        });

        // Create notifications for each eligible creator
        const notifications = await Promise.all(
            eligibleCreators.map(creator =>
                db.notification.create({
                    data: {
                        userId: creator.id,
                        type: 'CAMPAIGN_INVITE',
                        title: 'New Campaign Available',
                        message: `${campaign.name} is now accepting applications. Base fee: $${(Number(campaign.baseFeeeBudget) / campaign.videosRequested).toFixed(2)}/video`,
                        link: `/creator/briefs`,
                        metadata: {
                            campaignId: campaign.id,
                            campaignName: campaign.name,
                        },
                    },
                })
            )
        );

        // Mark notifications as sent
        await db.campaign.update({
            where: { id: campaignId },
            data: { notificationsSent: true },
        });

        return ApiResponse.success({
            message: `Notified ${eligibleCreators.length} eligible creators`,
            notifiedCount: eligibleCreators.length,
            creatorIds: eligibleCreators.map(c => c.id),
        });
    } catch (error) {
        console.error('Error notifying creators:', error);
        return ApiResponse.error('Failed to notify creators', 500);
    }
});
