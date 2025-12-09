import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRole, ApiResponse } from "@/lib/api-middleware";

export const GET = requireRole(['CREATOR'], async (request: NextRequest, user) => {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get("role");

        if (role !== "creator") {
            return ApiResponse.error("Invalid role", 400);
        }

        // Get creator's existing applications with status
        const existingApplications = await db.application.findMany({
            where: { creatorId: user.userId },
            select: {
                campaignId: true,
                createdAt: true,
                status: true
            }
        });

        const appliedCampaignIds = existingApplications.map(app => app.campaignId);
        const applicationMap = new Map(existingApplications.map(app => [app.campaignId, app]));

        // Fetch active campaigns (including those accepting applications)
        const campaigns = await db.campaign.findMany({
            where: {
                status: {
                    in: ["ACTIVE", "ACTIVE_ACCEPTING_APPLICATIONS"]
                }
            },
            include: {
                founder: {
                    select: {
                        id: true,
                        fullName: true,
                        companyName: true
                    }
                },
                _count: {
                    select: {
                        applications: true,
                        videos: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        // Calculate urgency and categorize campaigns
        const now = new Date();
        const enrichedCampaigns = campaigns.map(campaign => {
            const application = applicationMap.get(campaign.id);
            const hasApplied = appliedCampaignIds.includes(campaign.id);
            const applicationStatus = application?.status;
            const appliedDate = application?.createdAt;

            // Calculate days until deadline (if exists)
            let daysUntilDeadline = null;
            let isUrgent = false;

            if (campaign.startDate) {
                const deadline = new Date(campaign.startDate);
                daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                isUrgent = daysUntilDeadline <= 3 && daysUntilDeadline > 0;
            }

            // Check if campaign is new (created within last 7 days)
            const createdAt = new Date(campaign.createdAt);
            const daysSinceCreated = Math.ceil((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
            const isNew = daysSinceCreated <= 7;

            // Check if slots are limited
            const slotsRemaining = campaign.videosRequested - campaign._count.videos;
            const isLimitedSlots = slotsRemaining <= 2 && slotsRemaining > 0;

            // Parse brief data safely
            const briefData = campaign.briefData as any || {};
            const platforms = campaign.platform ? [campaign.platform] : (briefData.platforms || []);

            return {
                id: campaign.id,
                name: campaign.name,
                title: campaign.name, // Map name to title for frontend compatibility
                description: campaign.description || "",
                industry: briefData.industry || "General",
                platforms: platforms,
                videosRequested: campaign.videosRequested,
                videosCompleted: campaign._count.videos,
                baseFeePerVideo: campaign.videosRequested > 0
                    ? Number(campaign.baseFeeBudget) / campaign.videosRequested
                    : 0,
                totalBudget: Number(campaign.totalBudget),
                maxViews: campaign.targetViews || 150000,
                tone: briefData.tone || "Professional",
                founderName: campaign.founder.companyName || campaign.founder.fullName,
                founderId: campaign.founder.id,
                createdAt: campaign.createdAt,
                startDate: campaign.startDate,
                deadline: campaign.deadline || campaign.startDate,
                applicationsCount: campaign._count.applications,
                hasApplied,
                applicationStatus, // NEW: Include status
                appliedDate: appliedDate?.toISOString(),

                // Categorization flags
                isUrgent,
                isNew,
                isLimitedSlots,
                daysUntilDeadline,
                daysSinceCreated,
                slotsRemaining,

                // Additional metadata
                category: briefData.industry || "General",
                briefData: briefData
            };
        });

        // Sort campaigns: Urgent first, then new, then by date
        enrichedCampaigns.sort((a, b) => {
            // Urgent campaigns first
            if (a.isUrgent && !b.isUrgent) return -1;
            if (!a.isUrgent && b.isUrgent) return 1;

            // Then new campaigns
            if (a.isNew && !b.isNew) return -1;
            if (!a.isNew && b.isNew) return 1;

            // Then by creation date (newest first)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return ApiResponse.success(enrichedCampaigns);
    } catch (error) {
        console.error("Error fetching available campaigns:", error);
        return ApiResponse.error("Failed to fetch campaigns", 500);
    }
});
