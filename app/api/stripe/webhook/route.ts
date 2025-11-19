import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { verifyWebhookSignature } from '@/lib/stripe';
import db from '@/lib/db';
import { ApiResponse } from '@/lib/api-middleware';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return ApiResponse.error('Missing stripe-signature header', 400);
    }

    let event: Stripe.Event;

    try {
      event = verifyWebhookSignature(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return ApiResponse.error('Invalid signature', 400);
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'transfer.created':
        await handleTransferCreated(event.data.object as Stripe.Transfer);
        break;

      case 'transfer.failed':
        await handleTransferFailed(event.data.object as Stripe.Transfer);
        break;

      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      case 'refund.created':
        await handleRefundCreated(event.data.object as Stripe.Refund);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return ApiResponse.success({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return ApiResponse.error('Webhook handler failed', 500);
  }
}

/**
 * Handle successful payment intent (campaign funding)
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { campaignId } = paymentIntent.metadata;

  if (campaignId) {
    await db.campaign.update({
      where: { id: campaignId },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        escrowBalance: paymentIntent.amount / 100, // Convert from cents
        status: 'IN_PROGRESS',
      },
    });

    console.log(`Campaign ${campaignId} funded: $${paymentIntent.amount / 100}`);
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { campaignId } = paymentIntent.metadata;

  if (campaignId) {
    console.error(`Payment failed for campaign ${campaignId}:`, paymentIntent.last_payment_error);

    // TODO: Notify founder of payment failure
    // await sendPaymentFailureNotification(campaignId);
  }
}

/**
 * Handle transfer creation (base fee or performance bonus)
 */
async function handleTransferCreated(transfer: Stripe.Transfer) {
  const { campaignId, videoId, paymentType } = transfer.metadata;

  if (campaignId && videoId) {
    console.log(`Transfer created: ${paymentType} for video ${videoId} - $${transfer.amount / 100}`);

    // Payment record should already exist from API call
    // This webhook confirms it was processed
  }
}

/**
 * Handle transfer failure
 */
async function handleTransferFailed(transfer: Stripe.Transfer) {
  const { campaignId, videoId, paymentType } = transfer.metadata;

  if (campaignId && videoId) {
    console.error(`Transfer failed: ${paymentType} for video ${videoId}`);

    // Mark payment as failed in database
    await db.payment.updateMany({
      where: {
        campaignId,
        videoId,
        type: paymentType === 'base_fee' ? 'BASE_FEE' : 'PERFORMANCE_BONUS',
        status: 'PROCESSING',
      },
      data: {
        status: 'FAILED',
        failureReason: 'Stripe transfer failed',
      },
    });

    // TODO: Alert admin and notify creator
  }
}

/**
 * Handle Stripe Connect account update
 */
async function handleAccountUpdated(account: Stripe.Account) {
  const { userId } = account.metadata;

  if (userId) {
    // Check if account is fully onboarded
    const transfersActive = account.capabilities?.transfers === 'active';

    console.log(`Stripe account ${account.id} updated for user ${userId}. Transfers active: ${transfersActive}`);

    // TODO: Update user record with onboarding status
    // Could add a field like `stripeOnboardingComplete: boolean`
  }
}

/**
 * Handle refund creation (unspent budget)
 */
async function handleRefundCreated(refund: Stripe.Refund) {
  const { campaignId } = refund.metadata;

  if (campaignId) {
    console.log(`Refund created for campaign ${campaignId}: $${refund.amount / 100}`);

    // Record the refund in payments table
    // This should already be done by the settlement process
    // Webhook confirms it was processed
  }
}
