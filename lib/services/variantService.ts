import db from "@/lib/db";
import { VariantStatus } from "@prisma/client";

export class VariantService {
    static async createVariant(
        campaignId: string,
        creatorId: string,
        label: string,
        details?: {
            budget?: number;
            baseFee?: number;
            performanceBudget?: number;
            expectedViews?: number;
            deadline?: Date;
            instructions?: string;
        }
    ) {
        // Generate a unique tracking code/URL
        const trackingId = Math.random().toString(36).substring(2, 15);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const trackingUrl = `${baseUrl}/t/${trackingId}`;

        const variant = await db.uGCVariant.create({
            data: {
                campaignId,
                creatorId,
                label,
                trackingUrl,
                utmSource: 'nala_platform',
                utmMedium: 'ugc_variant',
                utmCampaign: campaignId,
                status: 'PENDING_UPLOAD',
                // New fields
                budget: details?.budget,
                baseFee: details?.baseFee,
                performanceBudget: details?.performanceBudget,
                expectedViews: details?.expectedViews,
                deadline: details?.deadline,
                instructions: details?.instructions,
                assignedAt: new Date(),
                notificationSent: true
            },
            include: {
                campaign: {
                    include: {
                        founder: true
                    }
                }
            }
        });

        // Create notification for the creator
        await db.notification.create({
            data: {
                userId: creatorId,
                type: 'CAMPAIGN_INVITE',
                title: 'New Variant Video Request',
                message: `${variant.campaign.founder.fullName} has requested you to create a variant video "${label}" for the campaign "${variant.campaign.name}"`,
                link: `/creator/variants/${variant.id}`,
                isRead: false,
            }
        });

        return variant;
    }

    static async getVariants(campaignId: string) {
        return db.uGCVariant.findMany({
            where: { campaignId },
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        creatorProfile: {
                            select: {
                                verificationStatus: true,
                                baseFeeTiktok: true
                            }
                        }
                    }
                },
                metrics: {
                    orderBy: { date: 'desc' },
                    take: 1
                }
            }
        });
    }

    static async updateVariant(variantId: string, data: { status?: VariantStatus; videoUrl?: string; label?: string }) {
        return db.uGCVariant.update({
            where: { id: variantId },
            data
        });
    }

    static async recordMetric(variantId: string, type: 'view' | 'click' | 'conversion', amount: number = 0) {
        // Find today's metric record or create it
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Upsert logic manually since we need to increment
        const metric = await db.variantMetric.findFirst({
            where: {
                variantId,
                date: today
            }
        });

        if (metric) {
            const updateData: any = {};
            if (type === 'view') updateData.views = { increment: 1 };
            if (type === 'click') updateData.clicks = { increment: 1 };
            if (type === 'conversion') {
                updateData.conversions = { increment: 1 };
                updateData.revenue = { increment: amount };
            }

            // Recalculate derived metrics
            // Note: In a real high-scale system, this calculation would be async/batched
            const updated = await db.variantMetric.update({
                where: { id: metric.id },
                data: updateData
            });

            return this.recalculateDerivedMetrics(updated.id);
        } else {
            return db.variantMetric.create({
                data: {
                    variantId,
                    date: today,
                    views: type === 'view' ? 1 : 0,
                    clicks: type === 'click' ? 1 : 0,
                    conversions: type === 'conversion' ? 1 : 0,
                    revenue: type === 'conversion' ? amount : 0
                }
            });
        }
    }

    private static async recalculateDerivedMetrics(metricId: string) {
        const metric = await db.variantMetric.findUnique({ where: { id: metricId } });
        if (!metric) return;

        const views = metric.views;
        const clicks = metric.clicks;
        const conversions = metric.conversions;
        const revenue = Number(metric.revenue);
        const spend = Number(metric.spend);

        const ctr = views > 0 ? (clicks / views) * 100 : 0;
        const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
        const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;

        // Simple performance score (0-100)
        // Weighted: 40% Conversion Rate, 30% ROI, 30% CTR
        const performanceScore = Math.min(100, (conversionRate * 2) + (roi * 0.1) + (ctr * 2));

        return db.variantMetric.update({
            where: { id: metricId },
            data: {
                ctr,
                conversionRate,
                roi,
                performanceScore
            }
        });
    }
}
