import { NextRequest } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';
import { createCampaignPaymentIntent } from '@/lib/stripe';

// Validation schema for campaign creation
const createCampaignSchema = z.object({
  name: z.string().min(3, 'Campaign name must be at least 3 characters'),
  description: z.string().optional(),
  videosRequested: z.number().int().min(1).max(10),
  totalBudget: z.number().min(500).max(50000),
  baseFeePerVideo: z.number().min(50).max(500),
  postingFrequency: z.enum(['daily', 'every_other_day', 'every_3_days', 'weekly', 'custom']).optional(),
  startDate: z.string().datetime().optional(),
  briefData: z.object({
    productDescription: z.string().optional(),
    targetAudience: z.string().optional(),
    campaignGoal: z.string().optional(),
    platforms: z.array(z.enum(['TIKTOK', 'INSTAGRAM', 'FACEBOOK'])).optional(),
    videoLength: z.string().optional(),
    talkingPoints: z.array(z.string()).optional(),
    dos: z.array(z.string()).optional(),
    donts: z.array(z.string()).optional(),
    hashtags: z.string().optional(),
  }).optional(),
});

/**
 * Create a new campaign (Founder only)
 */
export const POST = requireRole(['FOUNDER'], async (request: NextRequest, user) => {
  try {
    const body = await request.json();

    // Validate input
    const validation = createCampaignSchema.safeParse(body);
    if (!validation.success) {
      return ApiResponse.error('Validation failed', 400, validation.error.errors);
    }

    const {
      name,
      description,
      videosRequested,
      totalBudget,
      baseFeePerVideo,
      postingFrequency,
      startDate,
      briefData,
    } = validation.data;

    // Calculate budget breakdown
    const baseFeebudget = baseFeePerVideo * videosRequested;
    const performanceBudget = totalBudget - baseFeebudget;

    // Validate budget allocation
    if (performanceBudget < 0) {
      return ApiResponse.error(
        'Total budget must be greater than base fee budget',
        400,
        {
          totalBudget,
          baseFeebudget,
          message: `Base fee budget ($${baseFeebudget}) exceeds total budget ($${totalBudget})`,
        }
      );
    }

    // Get founder's Stripe customer ID
    const founder = await db.user.findUnique({
      where: { id: user.userId },
      select: { stripeCustomerId: true, email: true, fullName: true },
    });

    if (!founder) {
      return ApiResponse.error('Founder not found', 404);
    }

    // Create campaign in database (draft status)
    const campaign = await db.campaign.create({
      data: {
        founderId: user.userId,
        name,
        description,
        status: 'ACTIVE', // TODO: Change back to DRAFT when payment flow is ready
        videosRequested,
        totalBudget,
        baseFeeeBudget: baseFeebudget,
        performanceBudget,
        escrowBalance: 0,
        postingFrequency,
        ...(startDate && { startDate: new Date(startDate) }),
        briefData: briefData || {},
      },
    });

    // Create Stripe Payment Intent for escrow funding
    const paymentIntent = await createCampaignPaymentIntent(
      Math.round(totalBudget * 100), // Convert to cents
      user.userId,
      campaign.id,
      founder.stripeCustomerId || undefined
    );

    // Update campaign with payment intent ID
    await db.campaign.update({
      where: { id: campaign.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    return ApiResponse.created({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        totalBudget: campaign.totalBudget.toNumber(),
        baseFeebudget: campaign.baseFeeeBudget.toNumber(),
        performanceBudget: campaign.performanceBudget.toNumber(),
        videosRequested: campaign.videosRequested,
      },
      payment: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: totalBudget,
      },
      message: 'Campaign created successfully. Complete payment to activate.',
    });
  } catch (error) {
    console.error('Campaign creation error:', error);
    return ApiResponse.error('Failed to create campaign', 500);
  }
});
