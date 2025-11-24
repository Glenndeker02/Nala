import { NextRequest } from 'next/server';
import { requireAuth, ApiResponse } from '@/lib/api-middleware';
import { generateBriefFromUrl } from '@/lib/ai/generator';
import { z } from 'zod';

const generateSchema = z.object({
  url: z.string().url(),
});

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validation = generateSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.error('Invalid URL', 400, validation.error.errors);
    }

    const { url } = validation.data;
    const generatedContent = await generateBriefFromUrl(url);

    return ApiResponse.success(generatedContent);
  } catch (error) {
    console.error('AI Generation error:', error);
    return ApiResponse.error('Failed to generate content', 500);
  }
});
