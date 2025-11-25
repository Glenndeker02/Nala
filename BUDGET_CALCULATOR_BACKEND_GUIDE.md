# Budget Calculator Backend Implementation Guide

## Status: READY TO IMPLEMENT (Blocked on Schema Edit)

This document contains all the code needed to implement the budget calculator backend once the Prisma schema is updated.

---

## Step 1: Schema Update (MANUAL - Required First)

Add these fields to the Campaign model in `prisma/schema.prisma` after line 227:

```prisma
// Budget calculator options
guaranteedSpend       Boolean         @default(false) @map("guaranteed_spend")
targetViews           Int?            @map("target_views")
```

Then run:
```bash
npx prisma migrate dev --name add_guaranteed_spend
npx prisma generate
```

---

## Step 2: Update Campaign Creation API

File: `app/api/campaigns/create/route.ts`

### Add to Request Body Validation

```typescript
// Add these fields to the validation schema
guaranteedSpend: z.boolean().optional().default(false),
targetViews: z.number().int().positive().optional(),
```

### Add to Database Insert

```typescript
// In the db.campaign.create() call, add:
guaranteedSpend: validatedData.guaranteedSpend,
targetViews: validatedData.targetViews,
```

### Complete Example

```typescript
const campaign = await db.campaign.create({
    data: {
        founderId: user.id,
        name: validatedData.name,
        description: validatedData.description,
        totalBudget: validatedData.totalBudget,
        baseFeeeBudget: baseFeeTotal,
        performanceBudget,
        videosRequested: validatedData.videosRequested,
        // ... other existing fields
        
        // NEW: Budget calculator fields
        guaranteedSpend: validatedData.guaranteedSpend,
        targetViews: validatedData.targetViews,
    },
});
```

---

## Step 3: Update Refund Logic

File: `app/api/cron/process-refunds/route.ts` (or wherever refund logic exists)

### Add Guaranteed Spend Check

```typescript
// Before processing refund, check guaranteed spend flag
const campaign = await db.campaign.findUnique({
    where: { id: campaignId },
    select: {
        guaranteedSpend: true,
        // ... other fields
    },
});

// Skip refund if guaranteed spend is enabled
if (campaign.guaranteedSpend) {
    console.log(`Skipping refund for campaign ${campaignId} - guaranteed spend mode`);
    
    // Log for audit trail
    await db.adminAuditLog.create({
        data: {
            userId: 'SYSTEM',
            action: 'REFUND_SKIPPED',
            targetType: 'CAMPAIGN',
            targetId: campaignId,
            details: {
                reason: 'Guaranteed spend mode enabled',
                performanceBudget: campaign.performanceBudget,
            },
        },
    });
    
    continue; // Skip to next campaign
}

// Otherwise, process refund as normal
// ... existing refund logic
```

---

## Step 4: Update Frontend Campaign Creation

File: `app/founder/campaigns/create/page.tsx`

### Update Form Data State

```typescript
const [formData, setFormData] = useState<CampaignFormData>({
    // ... existing fields
    guaranteedSpend: false,
    targetViews: undefined,
});
```

### Update Form Submission

```typescript
const response = await fetch("/api/campaigns/create", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
        // ... existing fields
        guaranteedSpend: formData.guaranteedSpend,
        targetViews: formData.targetViews,
    }),
});
```

---

## Step 5: Update TypeScript Types

File: `app/founder/campaigns/create/page.tsx`

```typescript
type CampaignFormData = {
    // ... existing fields
    guaranteedSpend: boolean;
    targetViews?: number;
};
```

---

## Testing Checklist

Once implemented, test the following scenarios:

### Scenario 1: Regular Campaign (Auto-Refund)
1. Create campaign with `guaranteedSpend: false`
2. Complete campaign with unspent budget
3. Verify refund is processed after 7 days
4. Check refund amount is correct

### Scenario 2: Guaranteed Spend Campaign
1. Create campaign with `guaranteedSpend: true` and `targetViews: 150000`
2. Complete campaign with unspent budget
3. Verify NO refund is processed
4. Check audit log shows "REFUND_SKIPPED"
5. Verify views delivered match guaranteed amount

### Scenario 3: Frontend Integration
1. Navigate to `/founder/campaigns/create`
2. Go to Step 4: Budget Configuration
3. Toggle "Guaranteed Spend Mode" ON
4. Set target views to 150,000
5. Complete campaign creation
6. Verify database shows:
   - `guaranteed_spend = true`
   - `target_views = 150000`

---

## Database Queries for Verification

```sql
-- Check campaigns with guaranteed spend
SELECT id, name, guaranteed_spend, target_views, performance_budget
FROM campaigns
WHERE guaranteed_spend = true;

-- Check refunds (should be empty for guaranteed spend campaigns)
SELECT p.id, p.campaign_id, p.amount, c.guaranteed_spend
FROM payments p
JOIN campaigns c ON p.campaign_id = c.id
WHERE p.type = 'REFUND'
AND c.guaranteed_spend = true;

-- Should return 0 rows if working correctly
```

---

## Rollback Plan

If issues arise, rollback steps:

1. Revert Prisma schema changes
2. Run migration: `npx prisma migrate dev --name revert_guaranteed_spend`
3. Revert API changes
4. Revert frontend changes
5. Clear any test data

---

## Notes

- The `guaranteedSpend` flag defaults to `false` for backward compatibility
- `targetViews` is optional and only used for display purposes
- Refund logic must check `guaranteedSpend` before processing
- Audit logs should track when refunds are skipped
- Frontend already has the UI implemented in `Step4Budget` component

---

## Implementation Time Estimate

- Schema update + migration: 5 minutes
- API updates: 15 minutes
- Frontend updates: 10 minutes
- Testing: 30 minutes

**Total**: ~1 hour
