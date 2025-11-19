import { NextRequest } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';
import { generateUGCBrief } from '@/lib/ai-brief-generator';

const generateBriefSchema = z.object({
  productName: z.string().min(2),
  productDescription: z.string().min(10),
  targetAudience: z.string().min(5),
  keyFeatures: z.array(z.string()).min(1).max(10),
  videoStyle: z
    .enum(['tutorial', 'testimonial', 'unboxing', 'comparison', 'review'])
    .optional(),
  tone: z
    .enum(['professional', 'casual', 'energetic', 'friendly', 'educational'])
    .optional(),
  videoLength: z.number().min(15).max(180).optional(),
  campaignId: z.string().uuid().optional(),
});

/**
 * Generate AI-powered UGC brief
 */
export const POST = requireRole(['FOUNDER'], async (request: NextRequest, user) => {
  try {
    const body = await request.json();

    // Validate input
    const validation = generateBriefSchema.safeParse(body);
    if (!validation.success) {
      return ApiResponse.error('Validation failed', 400, validation.error.errors);
    }

    const input = validation.data;

    // Generate brief using AI
    const generatedBrief = await generateUGCBrief({
      productName: input.productName,
      productDescription: input.productDescription,
      targetAudience: input.targetAudience,
      keyFeatures: input.keyFeatures,
      videoStyle: input.videoStyle,
      tone: input.tone,
      videoLength: input.videoLength,
    });

    // Save to database
    const aiBrief = await db.aIBrief.create({
      data: {
        founderId: user.userId,
        campaignId: input.campaignId,
        productName: input.productName,
        productDescription: input.productDescription,
        targetAudience: input.targetAudience,
        keyFeatures: input.keyFeatures,
        videoStyle: input.videoStyle,
        tone: input.tone,
        generatedScript: generatedBrief.generatedScript,
        talkingPoints: generatedBrief.talkingPoints,
        hookIdeas: generatedBrief.hookIdeas,
        hashtagSuggestions: generatedBrief.hashtagSuggestions,
        callToAction: generatedBrief.callToAction,
        tokensUsed: generatedBrief.tokensUsed,
      },
    });

    return ApiResponse.success({
      id: aiBrief.id,
      script: aiBrief.generatedScript,
      talkingPoints: aiBrief.talkingPoints,
      hookIdeas: aiBrief.hookIdeas,
      hashtags: aiBrief.hashtagSuggestions,
      callToAction: aiBrief.callToAction,
      tokensUsed: aiBrief.tokensUsed,
      message: 'AI brief generated successfully!',
    });
  } catch (error) {
    console.error('AI brief generation error:', error);
    return ApiResponse.error('Failed to generate brief', 500);
  }
});
