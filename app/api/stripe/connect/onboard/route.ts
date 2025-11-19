import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireAuth, ApiResponse } from '@/lib/api-middleware';
import { createConnectAccount, createAccountLink } from '@/lib/stripe';

/**
 * Initiate Stripe Connect onboarding for creators
 */
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    // Only creators can onboard to Stripe Connect
    if (user.role !== 'CREATOR') {
      return ApiResponse.error('Only creators can onboard to Stripe Connect', 403);
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.userId },
    });

    if (!dbUser) {
      return ApiResponse.error('User not found', 404);
    }

    let accountId = dbUser.stripeAccountId;

    // Create Stripe Connect account if doesn't exist
    if (!accountId) {
      const account = await createConnectAccount(dbUser.email, dbUser.id);
      accountId = account.id;

      // Save account ID to database
      await db.user.update({
        where: { id: dbUser.id },
        data: { stripeAccountId: accountId },
      });
    }

    // Generate account link for onboarding
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const accountLink = await createAccountLink(
      accountId,
      `${appUrl}/creator/settings/payment?refresh=true`,
      `${appUrl}/creator/settings/payment?success=true`
    );

    return ApiResponse.success({
      url: accountLink.url,
      accountId,
    });
  } catch (error) {
    console.error('Stripe Connect onboarding error:', error);
    return ApiResponse.error('Failed to initiate Stripe onboarding', 500);
  }
});
