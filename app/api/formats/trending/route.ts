import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, ApiResponse } from '@/lib/api-middleware';

export const GET = requireAuth(async (request: NextRequest, user) => {
    try {
        const { searchParams } = new URL(request.url);
        const platform = searchParams.get('platform');
        const tone = searchParams.get('tone');
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '10');

        const where: any = {
            isTrending: true,
        };

        if (platform) {
            where.platforms = {
                has: platform,
            };
        }

        if (tone) {
            where.tone = tone;
        }

        if (category) {
            where.categories = {
                has: category,
            };
        }

        const formats = await db.videoFormat.findMany({
            where,
            orderBy: {
                trendMomentum: 'desc',
            },
            take: limit,
            include: {
                _count: {
                    select: { savedByCreators: true },
                },
            },
        });

        return ApiResponse.success({ formats });
    } catch (error) {
        console.error('Error fetching trending formats:', error);
        return ApiResponse.error('Failed to fetch trending formats', 500);
    }
});
