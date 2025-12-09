import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';
import { Platform } from '@prisma/client';

export const POST = requireRole(['FOUNDER', 'ADMIN', 'CREATOR'], async (request: NextRequest, user, { params }: { params: { id: string, assignmentId: string } }) => {
    try {
        const { id: campaignId, assignmentId } = params;

        // Check campaign
        const campaign = await db.campaign.findUnique({
            where: { id: campaignId }
        });

        if (!campaign) {
            return ApiResponse.error("Campaign not found", 404);
        }

        // Check assignment
        const assignment = await db.creatorCampaignAssignment.findUnique({
            where: { id: assignmentId },
            include: { creator: { include: { creatorProfile: true } } }
        });

        if (!assignment) {
            return ApiResponse.error("Assignment not found", 404);
        }

        // Authorization: Founder of campaign, Admin, or the Creator themselves
        const isFounder = user.role === 'FOUNDER' && campaign.founderId === user.userId;
        const isCreator = user.role === 'CREATOR' && assignment.creatorId === user.userId;
        const isAdmin = user.role === 'ADMIN';

        if (!isFounder && !isCreator && !isAdmin) {
            return ApiResponse.error("Unauthorized", 403);
        }

        // Check if codes enabled
        if (!campaign.enableCreatorCodes) {
            return ApiResponse.error("Creator codes are not enabled for this campaign", 400);
        }

        const creator = assignment.creator;
        let prefix = creator.creatorProfile?.codePrefix;

        // If no prefix, generate one from name (First 4 chars of name, UPPERCASE)
        if (!prefix) {
            const name = creator.fullName || creator.username || 'USER';
            prefix = name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
            if (prefix.length < 3) prefix = 'CREA'; // Fallback

            // Update profile
            await db.creatorProfile.update({
                where: { userId: creator.id },
                data: { codePrefix: prefix }
            });
        }

        // Determine next sequence number for this creator
        // Count existing codes (grouped by numeric part? Or just total count?)
        // Simplest: Count all unique numeric codes for this creator.
        // Actually, codes are unique string.
        // Strategy: Count how many codes this creator has created across ALL campaigns?
        // Or per year?
        // Let's do incrementing number across all campaigns for simplicity and uniqueness.
        // We can count `AttributionCode` records for this creator.
        // Since we generate 3 codes (one per platform) at once, they might share the number?
        // "MARY01-TT", "MARY01-IG".
        // Yes, same number for same campaign usually makes sense?
        // OR unique number per code?
        // "MARY01-TT", "MARY02-IG".
        // Use consistent number for the *batch* (assignment).
        // Check if codes already exist for this assignment.

        const existingCodes = await db.attributionCode.findMany({
            where: { assignmentId }
        });

        if (existingCodes.length > 0) {
            // Codes already exist, return them
            return ApiResponse.success({ codes: existingCodes });
        }

        // Get count of assignments that have codes?
        // Or count distinct codes?
        // We want the number to increment.
        // Let's find the highest number used so far in `code` string? Hard with string.
        // Easier: Count `AttributionCode` where `creatorId` is this creator.
        // But that counts per platform.
        // Let's count `CreatorCampaignAssignment` for this creator that have `codes`?
        // Or just count `AttributionCode` / 3?

        // Robust way: Store `lastCodeSequence` on CreatorProfile? No, schema change.
        // Just use `count` of assignments with codes.
        const priorAssignmentsWithCodes = await db.creatorCampaignAssignment.count({
            where: {
                creatorId: creator.id,
                codes: { some: {} } // Has at least one code
            }
        });

        const sequence = priorAssignmentsWithCodes + 1;
        const numberStr = sequence.toString().padStart(2, '0');
        const baseCode = `${prefix}${numberStr}`;

        const platforms: Platform[] = ['TIKTOK', 'INSTAGRAM', 'FACEBOOK'];
        const platformSuffixes: Record<Platform, string> = {
            'TIKTOK': 'TT',
            'INSTAGRAM': 'IG',
            'FACEBOOK': 'FB'
        };

        const newCodes = [];

        for (const platform of platforms) {
            const suffix = platformSuffixes[platform];
            const codeString = `${baseCode}-${suffix}`;

            const code = await db.attributionCode.create({
                data: {
                    campaignId,
                    creatorId: creator.id,
                    assignmentId,
                    platform,
                    code: codeString,
                    generatedBy: user.userId,
                }
            });
            newCodes.push(code);
        }

        return ApiResponse.success({ codes: newCodes }, 201);

    } catch (error) {
        console.error('Error generating codes:', error);
        // Handle unique constraint violations if race condition
        return ApiResponse.error('Internal Server Error', 500);
    }
});
