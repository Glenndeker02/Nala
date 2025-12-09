import { prisma } from '@/lib/prisma';
import { Platform } from '@prisma/client';

/**
 * Generate a unique creator code for a campaign
 * Pattern: {CREATOR_SHORT}-{CAMPAIGN_SHORT}-{PLATFORM}
 * Example: MARY01-NFT-TT, JOHN02-NFT-IG
 */
export async function generateCreatorCode(
    campaignId: string,
    creatorId: string,
    platform: Platform,
    customCode?: string
): Promise<string> {
    // If custom code provided, validate and return
    if (customCode) {
        const normalized = normalizeCode(customCode);
        await validateCodeUniqueness(normalized, campaignId);
        return normalized;
    }

    // Fetch creator and campaign info
    const [creator, campaign, existingCodes] = await Promise.all([
        prisma.user.findUnique({
            where: { id: creatorId },
            select: { fullName: true }
        }),
        prisma.campaign.findUnique({
            where: { id: campaignId },
            select: { name: true }
        }),
        prisma.creatorCode.findMany({
            where: { campaignId, creatorId },
            select: { code: true }
        })
    ]);

    if (!creator || !campaign) {
        throw new Error('Creator or campaign not found');
    }

    // Generate creator short code (first name + number)
    const creatorShort = generateCreatorShort(creator.fullName, existingCodes.length);

    // Generate campaign short code (first 3 letters of campaign name)
    const campaignShort = campaign.name
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 3)
        .toUpperCase();

    // Platform suffix
    const platformSuffix = getPlatformSuffix(platform);

    // Combine: MARY01-NFT-TT
    let code = `${creatorShort}-${campaignShort}-${platformSuffix}`;

    // Ensure uniqueness (add suffix if needed)
    let attempt = 0;
    while (await codeExists(code, campaignId)) {
        attempt++;
        code = `${creatorShort}-${campaignShort}-${platformSuffix}${attempt}`;
        if (attempt > 99) {
            throw new Error('Unable to generate unique code');
        }
    }

    return code;
}

/**
 * Generate creator short code from full name
 * Examples: "Mary Johnson" -> "MARY01", "John Doe" -> "JOHN01"
 */
function generateCreatorShort(fullName: string, existingCount: number): string {
    const firstName = fullName.split(' ')[0];
    const normalized = firstName
        .replace(/[^a-zA-Z]/g, '')
        .substring(0, 4)
        .toUpperCase();

    const number = String(existingCount + 1).padStart(2, '0');
    return `${normalized}${number}`;
}

/**
 * Get platform suffix
 */
function getPlatformSuffix(platform: Platform): string {
    const suffixes: Record<Platform, string> = {
        TIKTOK: 'TT',
        INSTAGRAM: 'IG',
        FACEBOOK: 'FB',
        YOUTUBE: 'YT'
    };
    return suffixes[platform] || 'XX';
}

/**
 * Normalize code (uppercase, alphanumeric + hyphens only)
 */
function normalizeCode(code: string): string {
    return code
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, '');
}

/**
 * Check if code exists in campaign
 */
async function codeExists(code: string, campaignId: string): Promise<boolean> {
    const existing = await prisma.creatorCode.findFirst({
        where: {
            code: {
                equals: code,
                mode: 'insensitive'
            },
            campaignId
        }
    });
    return !!existing;
}

/**
 * Validate code uniqueness across campaign
 */
async function validateCodeUniqueness(code: string, campaignId: string): Promise<void> {
    if (await codeExists(code, campaignId)) {
        throw new Error(`Code "${code}" already exists in this campaign`);
    }
}

/**
 * Create creator codes for all platforms
 */
export async function createCreatorCodes(
    campaignId: string,
    creatorId: string,
    founderId: string,
    platforms: Platform[] = [Platform.TIKTOK, Platform.INSTAGRAM]
): Promise<Array<{ platform: Platform; code: string; id: string }>> {
    const codes = [];

    for (const platform of platforms) {
        const code = await generateCreatorCode(campaignId, creatorId, platform);

        const creatorCode = await prisma.creatorCode.create({
            data: {
                campaignId,
                creatorId,
                platform,
                code,
                createdBy: founderId,
                active: true
            }
        });

        codes.push({
            platform,
            code: creatorCode.code,
            id: creatorCode.id
        });
    }

    return codes;
}
