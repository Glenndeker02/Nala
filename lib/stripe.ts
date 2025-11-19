import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

/**
 * Create a Stripe Connect Express account for creators
 */
export async function createConnectAccount(email: string, userId: string): Promise<Stripe.Account> {
  return await stripe.accounts.create({
    type: 'express',
    country: 'US',
    email,
    capabilities: {
      transfers: { requested: true },
    },
    metadata: {
      userId,
      platform: 'nala',
    },
  });
}

/**
 * Create an account link for Stripe Connect onboarding
 */
export async function createAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<Stripe.AccountLink> {
  return await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });
}

/**
 * Retrieve Stripe Connect account details
 */
export async function getConnectAccount(accountId: string): Promise<Stripe.Account> {
  return await stripe.accounts.retrieve(accountId);
}

/**
 * Create a Payment Intent for campaign funding (escrow deposit)
 */
export async function createCampaignPaymentIntent(
  amount: number, // In cents
  founderId: string,
  campaignId: string,
  customerId?: string
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    ...(customerId && { customer: customerId }),
    metadata: {
      founderId,
      campaignId,
      type: 'campaign_funding',
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

/**
 * Create a transfer to creator (Phase 1: Base Fee)
 */
export async function transferBaseFee(params: {
  amount: number; // In cents
  creatorAccountId: string;
  campaignId: string;
  videoId: string;
  founderId: string;
  creatorId: string;
}): Promise<Stripe.Transfer> {
  const { amount, creatorAccountId, campaignId, videoId, founderId, creatorId } = params;

  return await stripe.transfers.create({
    amount,
    currency: 'usd',
    destination: creatorAccountId,
    transfer_group: campaignId,
    description: `Base fee payment - Video ${videoId}`,
    metadata: {
      campaignId,
      videoId,
      paymentType: 'base_fee',
      founderId,
      creatorId,
    },
  });
}

/**
 * Create a transfer to creator (Phase 2: Performance Bonus)
 */
export async function transferPerformanceBonus(params: {
  amount: number; // In cents
  creatorAccountId: string;
  campaignId: string;
  videoId: string;
  viewsAchieved: number;
}): Promise<Stripe.Transfer> {
  const { amount, creatorAccountId, campaignId, videoId, viewsAchieved } = params;

  return await stripe.transfers.create({
    amount,
    currency: 'usd',
    destination: creatorAccountId,
    transfer_group: campaignId,
    description: `Performance bonus - ${viewsAchieved.toLocaleString()} views`,
    metadata: {
      campaignId,
      videoId,
      paymentType: 'performance_bonus',
      viewsAchieved: viewsAchieved.toString(),
    },
  });
}

/**
 * Issue a refund to founder (unspent performance budget)
 */
export async function refundUnspentBudget(
  paymentIntentId: string,
  amount: number, // In cents
  campaignId: string
): Promise<Stripe.Refund> {
  return await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount,
    reason: 'requested_by_customer',
    metadata: {
      campaignId,
      refundType: 'unspent_budget',
    },
  });
}

/**
 * Create a Stripe customer for founders
 */
export async function createCustomer(
  email: string,
  name: string,
  metadata: { userId: string }
): Promise<Stripe.Customer> {
  return await stripe.customers.create({
    email,
    name,
    metadata,
  });
}

/**
 * Generate idempotency key for Stripe operations
 */
export function generateIdempotencyKey(
  campaignId: string,
  videoId: string,
  type: string
): string {
  return `${campaignId}_${videoId}_${type}_${Date.now()}`;
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

/**
 * Calculate settlement breakdown
 */
export function calculateSettlement(viewCount: number, performanceBudget: number) {
  const CREATOR_RATE = 4.0; // per 1k views
  const NALA_MARKUP = 1.0; // per 1k views
  const FOUNDER_RATE = 5.0; // per 1k views

  const viewsInThousands = viewCount / 1000;

  const creatorPerformanceBonus = viewsInThousands * CREATOR_RATE;
  const nalaRevenue = viewsInThousands * NALA_MARKUP;
  const totalPerformanceCost = viewsInThousands * FOUNDER_RATE;

  const founderRefund = Math.max(0, performanceBudget - totalPerformanceCost);

  return {
    creatorPerformanceBonus: Math.round(creatorPerformanceBonus * 100) / 100,
    nalaRevenue: Math.round(nalaRevenue * 100) / 100,
    totalPerformanceCost: Math.round(totalPerformanceCost * 100) / 100,
    founderRefund: Math.round(founderRefund * 100) / 100,
    viewsInThousands: Math.round(viewsInThousands * 100) / 100,
  };
}
