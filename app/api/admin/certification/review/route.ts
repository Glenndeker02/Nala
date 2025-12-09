
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CertificationStatus } from '@prisma/client';

// Helper to check if user is admin
async function isAdmin(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }, // Assuming role is on User, or check AdminUser table
    });
    // Adjust based on your role system. Schema shows `AdminUser` model linked to `User`.
    const adminUser = await prisma.adminUser.findUnique({
        where: { userId },
    });
    return !!adminUser;
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        if (!(await isAdmin(session.user.id))) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        const submissions = await prisma.practicalSubmission.findMany({
            where: {
                status: 'PENDING',
            },
            include: {
                creator: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                submittedAt: 'asc',
            },
        });

        return NextResponse.json(submissions);
    } catch (error) {
        console.error('[ADMIN_REVIEW_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        if (!(await isAdmin(session.user.id))) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        const body = await req.json();
        const { submissionId, approved, feedback } = body;

        if (!submissionId || approved === undefined) {
            return new NextResponse('Missing fields', { status: 400 });
        }

        const submission = await prisma.practicalSubmission.findUnique({
            where: { id: submissionId },
        });

        if (!submission) {
            return new NextResponse('Submission not found', { status: 404 });
        }

        // Update submission status
        await prisma.practicalSubmission.update({
            where: { id: submissionId },
            data: {
                status: approved ? 'APPROVED' : 'REJECTED',
                adminFeedback: feedback,
                reviewedAt: new Date(),
                reviewedBy: session.user.id,
            },
        });

        // Update creator profile if approved
        if (approved) {
            await prisma.creatorProfile.update({
                where: { userId: submission.creatorId },
                data: {
                    certificationStatus: CertificationStatus.CERTIFIED,
                },
            });

            // Send notification (mock)
            await prisma.notification.create({
                data: {
                    userId: submission.creatorId,
                    type: 'SYSTEM', // Assuming SYSTEM type exists, or use appropriate enum
                    title: 'Certification Approved!',
                    message: 'Congratulations! You are now a Nala Certified Creator.',
                    link: '/creator/certification',
                },
            });
        } else {
            await prisma.notification.create({
                data: {
                    userId: submission.creatorId,
                    type: 'SYSTEM',
                    title: 'Certification Update',
                    message: 'Your practical assessment needs revision. Check feedback.',
                    link: '/creator/certification',
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[ADMIN_REVIEW_POST]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
