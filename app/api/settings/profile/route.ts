import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export const GET = requireRole(['FOUNDER', 'CREATOR'], async (request: NextRequest, user) => {
    try {
        const userData = await prisma.user.findUnique({
            where: { id: user.userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                profilePictureUrl: true,
                phoneNumber: true,
                timezone: true,
                language: true,
                role: true,
                // Founder fields
                companyName: true,
                companyLogo: true,
                companyIndustry: true,
                companySize: true,
                companyWebsite: true,
                // Creator fields
                creatorProfile: {
                    select: {
                        bio: true,
                        categories: true,
                        availabilityStatus: true,
                        responseTime: true,
                        verificationStatus: true,
                        rankingScore: true
                    }
                }
            }
        });

        if (!userData) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: userData
        });

    } catch (error: any) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});

export const PUT = requireRole(['FOUNDER', 'CREATOR'], async (request: NextRequest, user) => {
    try {
        const body = await request.json();
        const {
            fullName,
            phoneNumber,
            timezone,
            language,
            // Founder fields
            companyName,
            companyIndustry,
            companySize,
            companyWebsite,
            // Creator fields
            bio,
            categories,
            availabilityStatus
        } = body;

        // Update user profile
        const updateData: any = {};

        if (fullName !== undefined) updateData.fullName = fullName;
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
        if (timezone !== undefined) updateData.timezone = timezone;
        if (language !== undefined) updateData.language = language;

        // Founder-specific updates
        if (user.role === 'FOUNDER') {
            if (companyName !== undefined) updateData.companyName = companyName;
            if (companyIndustry !== undefined) updateData.companyIndustry = companyIndustry;
            if (companySize !== undefined) updateData.companySize = companySize;
            if (companyWebsite !== undefined) updateData.companyWebsite = companyWebsite;
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                fullName: true,
                profilePictureUrl: true,
                phoneNumber: true,
                timezone: true,
                language: true,
                role: true,
                companyName: true,
                companyLogo: true,
                companyIndustry: true,
                companySize: true,
                companyWebsite: true
            }
        });

        // Creator-specific updates
        if (user.role === 'CREATOR' && (bio !== undefined || categories !== undefined || availabilityStatus !== undefined)) {
            const creatorUpdateData: any = {};
            if (bio !== undefined) creatorUpdateData.bio = bio;
            if (categories !== undefined) creatorUpdateData.categories = categories;
            if (availabilityStatus !== undefined) creatorUpdateData.availabilityStatus = availabilityStatus;

            await prisma.creatorProfile.upsert({
                where: { userId: user.userId },
                update: creatorUpdateData,
                create: {
                    userId: user.userId,
                    ...creatorUpdateData
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: updatedUser,
            message: 'Profile updated successfully'
        });

    } catch (error: any) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
