import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export const GET = requireRole(['FOUNDER', 'CREATOR'], async (request: NextRequest, user) => {
    try {
        let preferences = await prisma.notificationPreferences.findUnique({
            where: { userId: user.userId }
        });

        // Create default preferences if they don't exist
        if (!preferences) {
            preferences = await prisma.notificationPreferences.create({
                data: {
                    userId: user.userId
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: preferences
        });

    } catch (error: any) {
        console.error('Error fetching notification preferences:', error);
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
            emailCampaignUpdates,
            emailPayments,
            emailDeadlines,
            emailNewMessages,
            emailApplications,
            pushNotifications,
            smsNotifications,
            notificationFrequency
        } = body;

        const updateData: any = {};
        if (emailCampaignUpdates !== undefined) updateData.emailCampaignUpdates = emailCampaignUpdates;
        if (emailPayments !== undefined) updateData.emailPayments = emailPayments;
        if (emailDeadlines !== undefined) updateData.emailDeadlines = emailDeadlines;
        if (emailNewMessages !== undefined) updateData.emailNewMessages = emailNewMessages;
        if (emailApplications !== undefined) updateData.emailApplications = emailApplications;
        if (pushNotifications !== undefined) updateData.pushNotifications = pushNotifications;
        if (smsNotifications !== undefined) updateData.smsNotifications = smsNotifications;
        if (notificationFrequency !== undefined) updateData.notificationFrequency = notificationFrequency;

        const preferences = await prisma.notificationPreferences.upsert({
            where: { userId: user.userId },
            update: updateData,
            create: {
                userId: user.userId,
                ...updateData
            }
        });

        return NextResponse.json({
            success: true,
            data: preferences,
            message: 'Notification preferences updated successfully'
        });

    } catch (error: any) {
        console.error('Error updating notification preferences:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
});
