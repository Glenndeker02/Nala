import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/api-middleware';

// Helper to generate unique creator code
function generateCreatorCode(creatorName: string, platform: string, campaignIndex: number): string {
    const initials = creatorName
        .split(' ')
        .map(n => n.charAt(0).toUpperCase())
        .join('')
        .substring(0, 4);
    const platformCode = platform.substring(0, 2).toUpperCase();
    const year = new Date().getFullYear().toString().substring(2);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${initials}${campaignIndex.toString().padStart(2, '0')}-${platformCode}-${year}${random}`;
}

// GET - List creator codes for a campaign
export const GET = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;

        // Verify campaign ownership
        const campaign = await prisma.campaign.findFirst({
            where: {
                id: campaignId,
                founderId: user.userId
            }
        });

        if (!campaign) {
            return NextResponse.json(
                { success: false, error: 'Campaign not found' },
                { status: 404 }
            );
        }

        const { searchParams } = new URL(request.url);
        const creatorId = searchParams.get('creatorId');
        const platform = searchParams.get('platform');
        const active = searchParams.get('active');

        // Build filter
        const where: any = { campaignId };
        if (creatorId) where.creatorId = creatorId;
        if (platform) where.platform = platform;
        if (active !== null) where.active = active === 'true';

        const codes = await prisma.creatorCode.findMany({
            where,
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        redemptions: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Transform response
        const codesWithStats = codes.map(code => ({
            id: code.id,
            code: code.code,
            platform: code.platform,
            active: code.active,
            notes: code.notes,
            expirationDate: code.expirationDate?.toISOString() || null,
            createdAt: code.createdAt.toISOString(),
            creator: {
                id: code.creator.id,
                name: code.creator.fullName,
                email: code.creator.email
            },
            redemptionCount: code._count.redemptions
        }));

        console.log('[CREATOR-CODES GET] Campaign:', campaignId, 'Found codes:', codesWithStats.length);

        return NextResponse.json({
            success: true,
            data: codesWithStats
        });

    } catch (error: any) {
        console.error('Error fetching creator codes:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});

// POST - Create a new creator code
export const POST = requireRole(['FOUNDER'], async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
        const campaignId = params.id;
        const body = await request.json();
        const { creatorId, platform, code: customCode, notes, expirationDate } = body;

        if (!creatorId || !platform) {
            return NextResponse.json(
                { success: false, error: 'creatorId and platform are required' },
                { status: 400 }
            );
        }

        // Verify campaign ownership
        const campaign = await prisma.campaign.findFirst({
            where: {
                id: campaignId,
                founderId: user.userId
            }
        });

        if (!campaign) {
            return NextResponse.json(
                { success: false, error: 'Campaign not found' },
                { status: 404 }
            );
        }

        // Verify creator is assigned to this campaign
        const application = await prisma.application.findFirst({
            where: {
                campaignId,
                creatorId,
                status: 'ACCEPTED'
            },
            include: {
                creator: true
            }
        });

        if (!application) {
            return NextResponse.json(
                { success: false, error: 'Creator is not assigned to this campaign' },
                { status: 400 }
            );
        }

        // Check for existing code for this creator + platform + campaign
        const existingCode = await prisma.creatorCode.findFirst({
            where: {
                campaignId,
                creatorId,
                platform,
                active: true
            }
        });

        if (existingCode) {
            return NextResponse.json(
                { success: false, error: 'Active code already exists for this creator and platform' },
                { status: 400 }
            );
        }

        // Generate or use custom code
        let finalCode = customCode;
        if (!finalCode) {
            // Count existing codes to generate index
            const codeCount = await prisma.creatorCode.count({
                where: { creatorId }
            });
            finalCode = generateCreatorCode(application.creator.fullName, platform, codeCount + 1);
        }

        // Verify code uniqueness
        const codeExists = await prisma.creatorCode.findUnique({
            where: { code: finalCode }
        });

        if (codeExists) {
            return NextResponse.json(
                { success: false, error: 'Code already exists. Please use a different code.' },
                { status: 400 }
            );
        }

        // Create the code
        const creatorCode = await prisma.creatorCode.create({
            data: {
                campaignId,
                creatorId,
                platform,
                code: finalCode,
                notes,
                expirationDate: expirationDate ? new Date(expirationDate) : null,
                createdBy: user.userId,
                active: true
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true
                    }
                }
            }
        });

        // TODO: Send notification to creator about their new code

        return NextResponse.json({
            success: true,
            data: {
                id: creatorCode.id,
                code: creatorCode.code,
                platform: creatorCode.platform,
                notes: creatorCode.notes,
                expirationDate: creatorCode.expirationDate?.toISOString() || null,
                createdAt: creatorCode.createdAt.toISOString(),
                creator: {
                    id: creatorCode.creator.id,
                    name: creatorCode.creator.fullName
                }
            }
        });

    } catch (error: any) {
        console.error('Error creating creator code:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
