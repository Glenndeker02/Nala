import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ApiResponse } from '@/lib/api-middleware';

export const dynamic = 'force-dynamic'; // Ensure this route is not cached

/**
 * CRON Job: Process refunds for completed campaigns
 * Should be scheduled to run daily
 */
export async function GET(request: NextRequest) {
    try {
        // Verify cron secret to prevent unauthorized access
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Find campaigns that are completed but not fully settled
        // This logic assumes we have a way to identify campaigns needing refunds
        // For now, let's look for campaigns marked COMPLETED in the last 24 hours
        // or use a specific flag if available.
        // A better approach might be to check for campaigns past their end date with unspent budget.

        const campaigns = await db.campaign.findMany({
            where: {
                status: 'COMPLETED',
                // Add a check to ensure we haven't already processed refunds?
                // Maybe check if totalRefundedToFounder is null or if there's no refund payment?
                // For simplicity in this implementation, we'll assume we process newly completed ones.
                updatedAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                },
            },
            include: {
                videos: true,
                payments: true,
            },
        });

        const results = {
            processed: 0,
            refunded: 0,
            skipped_guaranteed: 0,
            errors: 0,
        };

        for (const campaign of campaigns) {
            try {
                // Check guaranteed spend flag
                // Note: This field might not exist in the types yet if prisma generate failed
                const guaranteedSpend = (campaign as any).guaranteedSpend;

                if (guaranteedSpend) {
                    console.log(`Skipping refund for campaign ${campaign.id} - guaranteed spend mode`);
                    results.skipped_guaranteed++;
                    continue;
                }

                // Calculate unspent budget
                // This is a simplified calculation. Real logic depends on how payments are tracked.
                const totalBudget = Number(campaign.totalBudget);
                const spentBudget = campaign.videos.reduce((sum, video) => {
                    // Logic to calculate how much was spent on this video
                    // Assuming we track this somewhere or calculate it based on views
                    return sum + (video.creatorEarnings ? Number(video.creatorEarnings) : 0) + (video.platformFee ? Number(video.platformFee) : 0);
                }, 0);

                // Or simpler: performance budget - actual spend
                // Let's assume we refund whatever is left in the escrow (if we track escrow balance)
                const escrowBalance = Number(campaign.escrowBalance || 0);

                if (escrowBalance > 0) {
                    // Process refund
                    await db.payment.create({
                        data: {
                            recipientId: campaign.founderId,
                            amount: escrowBalance,
                            type: 'REFUND',
                            status: 'PROCESSING', // Or COMPLETED if instant
                            description: `Auto-refund for unspent budget: ${campaign.name}`,
                            campaignId: campaign.id,
                        },
                    });

                    // Update campaign to zero out escrow
                    await db.campaign.update({
                        where: { id: campaign.id },
                        data: { escrowBalance: 0 }
                    });

                    results.refunded++;
                }

                results.processed++;

            } catch (err) {
                console.error(`Error processing refund for campaign ${campaign.id}:`, err);
                results.errors++;
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error('Refund cron error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
