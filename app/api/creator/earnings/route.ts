import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';

export const GET = requireRole(['CREATOR'], async (request: NextRequest, user) => {
    try {
        // Fetch all videos for this creator with campaign and payment details
        const videos = await db.video.findMany({
            where: {
                creatorId: user.userId
            },
            include: {
                campaign: {
                    include: {
                        founder: {
                            select: {
                                fullName: true,
                                companyName: true
                            }
                        }
                    }
                },
                payments: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate earnings summary
        let totalEarnings = 0;
        let pendingEarnings = 0;
        let paidEarnings = 0;
        let baseFeeTotal = 0;
        let performanceBonusTotal = 0;
        let campaignsCompleted = 0;

        const campaignEarnings: any[] = [];
        const paymentHistory: any[] = [];

        videos.forEach(video => {
            const campaign = video.campaign;
            const baseFee = Number(campaign.baseFeePerVideo) || 0;
            const views = video.views || 0;

            // Calculate performance bonus: $4 per 1000 views
            const performanceBonus = views > 0 ? (views / 1000) * 4 : 0;
            const total = baseFee + performanceBonus;

            // Determine if earnings are pending or paid based on video status
            const isPaid = video.status === 'COMPLETED';
            const isPosted = video.status === 'POSTED';

            if (isPaid) {
                paidEarnings += total;
                campaignsCompleted++;
            } else if (isPosted || video.status === 'APPROVED') {
                // Approved videos have base fee paid, performance bonus pending
                paidEarnings += baseFee;
                pendingEarnings += performanceBonus;
            }

            totalEarnings += total;
            baseFeeTotal += baseFee;
            performanceBonusTotal += performanceBonus;

            // Build campaign earnings data
            campaignEarnings.push({
                id: video.id,
                campaignName: campaign.title || campaign.name,
                founderName: campaign.founder.companyName || campaign.founder.fullName,
                status: video.status,
                baseFee,
                performanceBonus,
                total,
                views,
                postedDate: video.postedAt?.toISOString() || video.createdAt.toISOString(),
                settledDate: video.status === 'COMPLETED' ? video.lockedAt?.toISOString() : undefined
            });

            // Build payment history from actual payment records
            video.payments.forEach(payment => {
                paymentHistory.push({
                    id: payment.id,
                    date: payment.createdAt.toISOString(),
                    type: payment.type,
                    campaignName: campaign.title || campaign.name,
                    amount: Number(payment.amount),
                    status: payment.status
                });
            });
        });

        // Calculate average earnings per campaign
        const averageEarningsPerCampaign = campaignsCompleted > 0
            ? totalEarnings / campaignsCompleted
            : 0;

        const summary = {
            totalEarnings,
            pendingEarnings,
            paidEarnings,
            baseFeeTotal,
            performanceBonusTotal,
            campaignsCompleted,
            averageEarningsPerCampaign
        };

        return ApiResponse.success({
            summary,
            campaigns: campaignEarnings,
            payments: paymentHistory.sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            )
        });
    } catch (error) {
        console.error('Error fetching earnings:', error);
        return ApiResponse.error('Failed to fetch earnings', 500);
    }
});
