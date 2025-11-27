import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const campaignId = 'a46ed8bb-ca71-4640-916f-4c871d1db822';

        console.log('Testing DB query (FULL) for:', campaignId);

        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
            include: {
                founder: { select: { fullName: true, companyName: true } },
                videos: { include: { creator: { select: { id: true, fullName: true, email: true } } } },
                applications: { include: { creator: { select: { id: true, fullName: true, email: true, creatorProfile: { select: { verificationStatus: true } } } } } },
                payments: {
                    include: {
                        recipient: {
                            select: {
                                fullName: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            },
        });

        return NextResponse.json({ success: true, campaign });
    } catch (error: any) {
        console.error('Test DB Query Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
