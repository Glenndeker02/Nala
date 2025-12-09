import { NextRequest } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { requireRole, ApiResponse } from '@/lib/api-middleware';
import { createCampaignPaymentIntent } from '@/lib/stripe';

// Validation schema for campaign creation
const createCampaignSchema = z.object({
  name: z.string().min(3, 'Campaign name must be at least 3 characters'),
  description: z.string().nullable().optional(),
  videosRequested: z.number().int().min(1).max(10),
  totalBudget: z.number().min(500).max(50000),
  baseFeePerVideo: z.number().min(50).max(500),
  postingFrequency: z.enum(['daily', 'every_other_day', 'every_3_days', 'weekly', 'custom']).optional(),
  startDate: z.string().optional().nullable().refine(
    (val) => !val || val === '' || !isNaN(Date.parse(val)),
    { message: 'Invalid date format' }
  ),
  briefData: z.object({
    productDescription: z.string().optional(),
    targetAudience: z.string().optional(),
    campaignGoal: z.string().optional(),
    platforms: z.array(z.enum(['TIKTOK', 'INSTAGRAM', 'FACEBOOK'])).optional(),
    videoLength: z.string().optional(),
    talkingPoints: z.array(z.string()).optional(),
    tone: z.string().optional(),
    productCategory: z.string().optional(),
    campaignDuration: z.number().int().optional(),
    mustHaves: z.array(z.string()).optional(),
    dontWants: z.array(z.string()).optional(),
    hashtags: z.string().optional(),
    guaranteedSpend: z.boolean().optional(),
    targetViews: z.number().int().optional(),
    // Phase 1: Creator eligibility criteria
    creatorCriteria: z.object({
      niche: z.array(z.string()).optional(),
      minFollowers: z.number().int().optional(),
      maxFollowers: z.number().int().optional(),
      platforms: z.array(z.enum(['TIKTOK', 'INSTAGRAM', 'FACEBOOK'])).optional(),
      languages: z.array(z.string()).optional(),
      minRating: z.number().min(0).max(5).optional(),
      location: z.string().optional(),
      minExperience: z.number().int().optional(),
      certifiedOnly: z.boolean().optional(),
    }).optional(),
  }).optional(),
  // Attribution settings
  enableCreatorCodes: z.boolean().optional(),
  autoGenerateCodes: z.boolean().optional(),
  conversionCommission: z.number().optional().nullable(),
  codeDiscountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_TRIAL']).optional().nullable(),
  codeDiscountValue: z.number().optional().nullable(),
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
      console.error('[CAMPAIGN CREATE] Validation failed:', JSON.stringify(validation.error.errors, null, 2));
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

    // Extract creator criteria from briefData
    const creatorCriteria = briefData?.creatorCriteria;

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

    // Build eligibility rules from creator criteria
    const eligibilityRules = creatorCriteria ? {
      niche: creatorCriteria.niche || [],
      minFollowers: creatorCriteria.minFollowers || 0,
      maxFollowers: creatorCriteria.maxFollowers || null,
      platforms: creatorCriteria.platforms || briefData?.platforms || [],
      languages: creatorCriteria.languages || ['English'],
      minRating: creatorCriteria.minRating || 0,
      location: creatorCriteria.location || null,
      minExperience: creatorCriteria.minExperience || 0,
      certifiedOnly: creatorCriteria.certifiedOnly || false,
    } : undefined;

    // Debug logging
    console.log('Creating campaign with data:', {
      founderId: user.userId,
      name,
      videosRequested,
      totalBudget,
      baseFeePerVideo,
      baseFeebudget,
      performanceBudget,
    });

    // Create campaign in database
    const campaign = await db.campaign.create({
      data: {
        founder: {
          connect: { id: user.userId }
        },
        name,
        description,
        status: 'ACTIVE_ACCEPTING_APPLICATIONS', // Phase 1: Set to accepting applications
        videosRequested,
        totalBudget,
        baseFeePerVideo,
        baseFeeBudget: baseFeebudget,
        performanceBudget,
        escrowBalance: 0,
        postingFrequency,
        ...(startDate && { startDate: new Date(startDate) }),
        briefData: briefData || {},
        guaranteedSpend: briefData?.guaranteedSpend || false,
        targetViews: briefData?.targetViews || 0,
        // Phase 1: Store eligibility rules
        eligibilityRules,
        notificationsSent: false,
        acceptedCreatorsCount: 0,
        // Attribution settings
        enableCreatorCodes: validation.data.enableCreatorCodes || false,
        autoGenerateCodes: validation.data.autoGenerateCodes || false,
        conversionCommission: validation.data.conversionCommission,
        codeDiscountType: validation.data.codeDiscountType,
        codeDiscountValue: validation.data.codeDiscountValue,
      },
    });

    // Try to create Stripe Payment Intent for escrow funding
    let paymentIntent = null;
    let paymentData = null;

    try {
      paymentIntent = await createCampaignPaymentIntent(
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

      paymentData = {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: totalBudget,
      };
    } catch (stripeError: any) {
      // If Stripe is not configured, log the error but continue
      console.warn('Stripe not configured or error creating payment intent:', stripeError.message);
      // Campaign is still created, just without payment processing
    }

    // Phase 1: Trigger notification to eligible creators (async, don't wait)
    if (eligibilityRules) {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/campaigns/${campaign.id}/notify-eligible-creators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || '',
        },
      }).catch(err => console.error('Failed to trigger creator notifications:', err));
    }

    return ApiResponse.created({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        totalBudget: campaign.totalBudget.toNumber(),
        videosRequested: campaign.videosRequested,
        eligibilityRules: campaign.eligibilityRules,
      },
      ...(paymentData && { payment: paymentData }),
      message: paymentData
        ? 'Campaign created successfully. Complete payment to activate.'
        : 'Campaign created successfully. Notifying eligible creators.',
    });
  } catch (error) {
    console.error('========================================');
    console.error('[CAMPAIGN CREATE] FATAL ERROR');
    console.error('========================================');
    console.error('[CAMPAIGN CREATE] Error object:', error);
    console.error('[CAMPAIGN CREATE] Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('[CAMPAIGN CREATE] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[CAMPAIGN CREATE] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    if (error && typeof error === 'object') {
      console.error('[CAMPAIGN CREATE] Error keys:', Object.keys(error));
      console.error('[CAMPAIGN CREATE] Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    }
    console.error('========================================');
    return ApiResponse.error(`Failed to create campaign: ${error instanceof Error ? error.message : String(error)}`, 500);
  }
});
