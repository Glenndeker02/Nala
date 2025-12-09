
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { videoUrl, strategyText } = body;

        if (!videoUrl || !strategyText) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        // Create submission
        const submission = await prisma.practicalSubmission.create({
            data: {
                creatorId: session.user.id,
                videoUrl,
                strategyText,
                status: 'PENDING',
            },
        });

        // Do not auto-certify. Admin must review.

        return NextResponse.json(submission);
    } catch (error) {
        console.error('[PRACTICAL_SUBMIT_POST]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const submission = await prisma.practicalSubmission.findFirst({
            where: {
                creatorId: session.user.id,
            },
            orderBy: {
                submittedAt: 'desc',
            },
        });

        return NextResponse.json(submission || null);
    } catch (error) {
        console.error('[PRACTICAL_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
