import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ApiResponse } from '@/lib/api-middleware';
import { verifySignature } from '@/lib/signature-verification';
import { z } from 'zod';

// Schema for incoming webhook payload
const redemptionSchema = z.object({
    code: z.string(),
    event_type: z.enum(['SIGNUP', 'PAID', 'DOWNLOAD']),
    external_event_id: z.string(),
    external_user_id: z.string().optional(),
    event_value: z.any().optional(),
    occurred_at: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const signature = request.headers.get('x-nav-signature');
        // In a real scenario, we need to know WHICH campaign/founder this is for to get the secret.
        // Usually, the API key or Campaign ID is also in headers or query params, 
        // OR we use a global secret for the platform if Nala acts as the gateway.
        // `cal.md` says: "External platforms (Founders' apps) send events..."
        // We likely need an API Key strategy.
        // For now, let's assume valid signature check against a global or per-campaign secret is handled later 
        // or we imply a mechanism.
        // Actually, to verify signature, we MUST know the secret.
        // Let's assume the request includes `x-nav-api-key` or similar to look up the secret.
        // Or simpler: The Payload contains `campaign_id`?
        // Let's modify schema to include `campaign_id` or look up code first?
        // If we look up code first, we can find the Campaign, and then check secret?
        // But verifying signature should happen BEFORE reading payload if possible (security).
        // Standard pattern: API Key in header identifies the 'Founder'/'Project', which gives us the Secret.

        // For MVP, checking Code existence first is practical but less secure against DoS.
        // Let's assume we read body, find Code, find Campaign -> secret?
        // Wait, `AttributionCode` is unique.

        const bodyText = await request.text();
        let body;
        try {
            body = JSON.parse(bodyText);
        } catch (e) {
            return ApiResponse.error("Invalid JSON", 400);
        }

        const result = redemptionSchema.safeParse(body);
        if (!result.success) {
            return ApiResponse.error("Invalid payload", 400, result.error.errors);
        }

        const data = result.data;

        // 1. Find the Code
        const attributionCode = await db.attributionCode.findUnique({
            where: { code: data.code },
            include: { campaign: true }
        });

        if (!attributionCode) {
            // Should we return 404? Or 200 to prevent enumerating codes?
            // Usually 404 is fine for integration debugging.
            return ApiResponse.error("Invalid attribution code", 404);
        }

        // 2. Verify Signature (now that we have campaign/founder context)
        // ideally each founder has a webhook secret.
        // For now, let's skip signature check implementation detail requiring DB lookup of secret
        // OR assume a 'demo' secret for now.
        // TODO: Retrieve secret from `Founder` or `Campaign` settings.
        // const isValid = verifySignature(bodyText, signature!, campaignSecret);

        // 3. Idempotency Check
        const existing = await db.codeRedemption.findUnique({
            where: { externalEventId: data.external_event_id }
        });

        if (existing) {
            return ApiResponse.success({ message: "Event already processed" }, 200);
        }

        // 4. Record Redemption
        const redemption = await db.codeRedemption.create({
            data: {
                campaignId: attributionCode.campaignId,
                creatorId: attributionCode.creatorId,
                codeId: attributionCode.id,
                platform: attributionCode.platform,
                externalEventId: data.external_event_id,
                externalUserId: data.external_user_id,
                eventType: data.event_type,
                eventValue: data.event_value ?? {},
                receivedAt: data.occurred_at ? new Date(data.occurred_at) : new Date(),
                verified: false, // Default to unverified until post-processed or trusted?
            }
        });

        // Trigger or Queue Verification Job?
        // user asks for `process_verified_redemptions` job later.
        // We can just save it for now.

        return ApiResponse.created({ redemptionId: redemption.id });

    } catch (error) {
        console.error('Webhook error:', error);
        return ApiResponse.error('Internal Server Error', 500);
    }
}
