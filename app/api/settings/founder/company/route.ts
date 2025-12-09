import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export const GET = requireRole(['FOUNDER'], async (request: NextRequest, user) => {
    try {
        const userData = await prisma.user.findUnique({
            where: { id: user.userId },
            select: {
                companyName: true,
                companyLogo: true,
                companyIndustry: true,
                companySize: true,
                companyWebsite: true
            }
        });

        return NextResponse.json({
            success: true,
            data: userData || {}
        });

    } catch (error: any) {
        console.error('Error fetching company info:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});

export const PUT = requireRole(['FOUNDER'], async (request: NextRequest, user) => {
    try {
        const body = await request.json();
        const { companyName, companyIndustry, companySize, companyWebsite } = body;

        const updateData: any = {};
        if (companyName !== undefined) updateData.companyName = companyName;
        if (companyIndustry !== undefined) updateData.companyIndustry = companyIndustry;
        if (companySize !== undefined) updateData.companySize = companySize;
        if (companyWebsite !== undefined) updateData.companyWebsite = companyWebsite;

        const updatedUser = await prisma.user.update({
            where: { id: user.userId },
            data: updateData,
            select: {
                companyName: true,
                companyLogo: true,
                companyIndustry: true,
                companySize: true,
                companyWebsite: true
            }
        });

        return NextResponse.json({
            success: true,
            data: updatedUser,
            message: 'Company information updated successfully'
        });

    } catch (error: any) {
        console.error('Error updating company info:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
