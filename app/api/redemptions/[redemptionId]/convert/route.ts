import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Mark a redemption as converted to paid customer
export async function POST(
    request: NextRequest,
    { params }: { params: { redemptionId: string } }
) {
    try {
        const { redemptionId } = params;
        const body = await request.json();
        const { amountPaid, orderId, metadata } = body;

        // Find the redemption
        const redemption = await prisma.redemption.findUnique({
            where: { id: redemptionId },
            include: {
                campaign: {
                    select: {
                        conversionCommission: true,
                        founderId: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        fullName: true
                    }
                }
            }
        });

        if (!redemption) {
            return NextResponse.json(
                { success: false, error: 'Redemption not found' },
                { status: 404 }
            );
        }

        if (redemption.convertedToPaid) {
            return NextResponse.json(
                { success: false, error: 'Redemption already converted' },
                { status: 400 }
            );
        }

        // Update redemption with conversion
        const updatedRedemption = await prisma.redemption.update({
            where: { id: redemptionId },
            data: {
                convertedToPaid: true,
                conversionDate: new Date(),
                amountPaidByUser: amountPaid ? Number(amountPaid) : redemption.amountPaidByUser,
                orderId: orderId || redemption.orderId,
                metadata: {
                    ...(redemption.metadata as object || {}),
                    ...(metadata || {}),
                    convertedAt: new Date().toISOString()
                }
            }
        });

        // Create commission payment if configured
        let commissionPayment = null;
        if (redemption.campaign.conversionCommission) {
            const commissionAmount = Number(redemption.campaign.conversionCommission);

            commissionPayment = await prisma.payment.create({
                data: {
                    campaignId: redemption.campaignId,
                    recipientId: redemption.creatorId,
                    amount: commissionAmount,
                    type: 'BONUS', // Using existing PaymentType
                    status: 'PENDING',
                    description: `Conversion commission for code redemption`,
                    commissionType: 'CONVERSION_COMMISSION',
                    redemptionId: redemptionId,
                    metadata: {
                        redemptionId,
                        orderId: orderId || redemption.orderId,
                        amountPaid
                    }
                }
            });
        }

        // TODO: Send notification to creator about conversion

        return NextResponse.json({
            success: true,
            data: {
                redemptionId: updatedRedemption.id,
                convertedToPaid: true,
                conversionDate: updatedRedemption.conversionDate?.toISOString(),
                commission: commissionPayment ? {
                    paymentId: commissionPayment.id,
                    amount: Number(commissionPayment.amount),
                    status: commissionPayment.status
                } : null
            }
        });

    } catch (error: any) {
        console.error('Error marking conversion:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
