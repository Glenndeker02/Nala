# Dead Code and Incompatibility Analysis Report

**Generated:** 2025-12-05  
**Codebase:** Nala Platform

---

## Executive Summary

This report identifies dead code, incomplete implementations, and incompatibilities between frontend, backend, and database layers in the Nala codebase. The analysis covered **188 API route files**, numerous frontend components, and the Prisma database schema.

### Key Findings:
- **19+ API endpoints** called by frontend but missing backend implementations
- **15+ incomplete features** with TODO markers indicating non-functional code
- **Database schema mismatches** with commented-out fields in use
- **Unused/incomplete components** with placeholder implementations

---

## 1. Frontend-to-Backend API Mismatches

### 1.1 Missing Backend Routes

These API endpoints are called by the frontend but **do not exist** in the backend:

#### **Settings & Profile**
| Frontend Call | File | Purpose | Status |
|--------------|------|---------|--------|
| `/api/settings/profile` | `app/founder/settings/profile/page.tsx:43,66` | Get/update founder profile | ❌ **MISSING** |
| `/api/settings/notifications` | `app/founder/settings/notifications/page.tsx:34,55` | Get/update notification preferences | ❌ **MISSING** |

**Intended Purpose:** These endpoints should handle user profile and notification preference management but are completely unimplemented.

---

#### **Dashboard & Analytics**
| Frontend Call | File | Purpose | Status |
|--------------|------|---------|--------|
| `/api/founder/dashboard/weekly-summary` | `app/founder/components/dashboard/WeeklySummaryCard.tsx:25` | Weekly performance summary | ❌ **MISSING** |
| `/api/founder/dashboard/campaign-overview` | `app/founder/components/dashboard/CampaignOverviewCard.tsx:37` | Campaign overview stats | ❌ **MISSING** |
| `/api/founder/deadlines` | `app/founder/components/dashboard/UpcomingDeadlinesCard.tsx:32` | Upcoming deadlines | ❌ **MISSING** |
| `/api/founder/suggestions` | `app/founder/components/dashboard/SuggestionsCard.tsx:29` | AI-powered suggestions | ❌ **MISSING** |
| `/api/founder/applications/pending` | `app/founder/components/dashboard/PendingApplications.tsx:38` | Pending creator applications | ❌ **MISSING** |
| `/api/founder/notifications` | `app/founder/components/dashboard/NotificationsCard.tsx:27` | Founder notifications | ❌ **MISSING** |
| `/api/founder/creator-activity` | `app/founder/components/dashboard/CreatorActivityCard.tsx:31` | Creator activity feed | ❌ **MISSING** |
| `/api/analytics/performance` | `app/founder/components/dashboard/PerformanceAnalyticsCard.tsx:49` | Performance analytics | ❌ **MISSING** |

**Intended Purpose:** Dashboard components fetch real-time analytics and metrics, but all backend endpoints are missing, causing dashboard cards to fail silently or show loading states indefinitely.

---

#### **Content & Formats**
| Frontend Call | File | Purpose | Status |
|--------------|------|---------|--------|
| `/api/content-library/recommended` | `app/founder/components/dashboard/ContentLibraryCard.tsx:33` | Recommended content | ❌ **MISSING** |
| `/api/formats/trending` | `app/founder/components/ContentLibrary.tsx:38` | Trending video formats | ❌ **MISSING** |
| `/api/formats/library` | `components/creator/FormatDetailModal.tsx:32` | Save format to library | ❌ **MISSING** |

**Intended Purpose:** Content recommendation and trending format discovery features are non-functional due to missing backend.

---

#### **Creator Features**
| Frontend Call | File | Purpose | Status |
|--------------|------|---------|--------|
| `/api/creators/available` | `app/founder/campaigns/[id]/components/CreatorSelectionModal.tsx:60` | List available creators | ❌ **MISSING** |
| `/api/templates` | `app/founder/campaigns/[id]/applicants/SendInstructionsModal.tsx:51` | Get instruction templates | ❌ **MISSING** |
| `/api/templates/create` | `app/founder/campaigns/[id]/applicants/SendInstructionsModal.tsx:72` | Create instruction template | ❌ **MISSING** |

**Intended Purpose:** Creator selection and instruction template management are broken.

---

#### **Scheduling & Revenue**
| Frontend Call | File | Purpose | Status |
|--------------|------|---------|--------|
| `/api/schedule/create` | `components/PostScheduler.tsx:32` | Schedule social media posts | ❌ **MISSING** |
| `/api/revenue-projection` | `components/landing/RevenueCalculator.tsx:32` | Calculate revenue projections | ❌ **MISSING** |

**Intended Purpose:** Post scheduling and revenue calculator features are completely non-functional.

---

#### **A/B Testing**
| Frontend Call | File | Purpose | Status |
|--------------|------|---------|--------|
| `/api/ab-tests/create` | `components/founder/ab-testing/ABTestWizard.tsx:133` | Create A/B test | ❌ **MISSING** |

**Intended Purpose:** A/B test creation wizard is broken.

---

### 1.2 Incomplete Backend Routes (with TODOs)

These routes **exist** but have incomplete implementations:

#### **Video Submission**
**File:** `app/api/videos/[id]/submit-url/route.ts`  
**Lines:** 81-83
```typescript
// TODO: Add to view polling queue
// TODO: Send notification to founder
// TODO: Schedule first view count update (within 1 hour)
```
**Intended Purpose:** After a creator submits a posted video URL, the system should:
- Add the video to a polling queue for view count tracking
- Notify the founder that the video is live
- Schedule automated view count updates
**Current State:** Video URL is saved but no tracking or notifications occur.

---

#### **Stripe Webhooks**
**File:** `app/api/stripe/webhook/route.ts`  
**Lines:** 97-98, 139-140, 155-156
```typescript
// TODO: Notify founder of payment failure (line 97-98)
// TODO: Alert admin and notify creator (line 139-140)
// TODO: Update user record with onboarding status (line 155-156)
```
**Intended Purpose:** Handle Stripe payment events with proper notifications and status updates.  
**Current State:** Webhooks log events but don't send notifications or update user records.

---

#### **Video Approval & Revision**
**File:** `app/api/videos/[id]/approve/route.ts`
```typescript
// TODO: Send notification to creator
```
**Intended Purpose:** Notify creator when video is approved.  
**Current State:** Approval works but creator is not notified.

**File:** `app/api/videos/[id]/request-revision/route.ts`
```typescript
// TODO: Send notification to creator with revision details
```
**Intended Purpose:** Notify creator of revision requests.  
**Current State:** Revision requests saved but no notification sent.

---

#### **Submission Review**
**File:** `app/api/submissions/[submissionId]/approve/route.ts`
```typescript
// TODO: Trigger base fee payment
// TODO: Send notification to creator
```
**Intended Purpose:** Pay creator base fee and notify them upon approval.  
**Current State:** Approval recorded but no payment or notification.

**File:** `app/api/submissions/[submissionId]/requestRevision/route.ts`
```typescript
// TODO: Send notification to creator
```
**Intended Purpose:** Notify creator of revision request.  
**Current State:** No notification sent.

---

#### **Video Upload**
**File:** `app/api/videos/upload/route.ts`
```typescript
// TODO: Implement video upload to cloud storage (S3/Cloudinary)
// TODO: Generate thumbnail
// TODO: Add watermark
```
**Intended Purpose:** Full video processing pipeline with cloud storage, thumbnails, and watermarks.  
**Current State:** Likely just saves metadata without actual file processing.

**File:** `app/api/videos/submit/route.ts`
```typescript
// TODO: Implement video submission logic
```
**Intended Purpose:** Handle video submission workflow.  
**Current State:** Placeholder implementation.

---

#### **Notifications**
**File:** `app/api/notifications/send/route.ts`
```typescript
// TODO: Implement notification sending (email, push, SMS)
```
**Intended Purpose:** Send multi-channel notifications.  
**Current State:** Likely just creates database records without sending actual notifications.

---

#### **Cron Jobs**
**File:** `app/api/cron/lock-videos/route.ts`
```typescript
// TODO: Implement video locking logic after 7 days
// TODO: Calculate final performance bonuses
// TODO: Process settlements
```
**Intended Purpose:** Automated job to lock videos after 7 days, calculate bonuses, and settle payments.  
**Current State:** Cron job exists but core logic is missing.

---

#### **Campaign Instructions**
**File:** `app/api/campaigns/[id]/instructions/route.ts`
```typescript
// TODO: Implement instruction creation and retrieval
```
**Intended Purpose:** Manage campaign-specific instructions for creators.  
**Current State:** Placeholder.

---

#### **A/B Test Adoption**
**File:** `app/api/campaigns/[id]/ab-tests/[abId]/adopt/route.ts`
```typescript
// TODO: Implement A/B test adoption logic
```
**Intended Purpose:** Allow founders to adopt winning A/B test variants.  
**Current State:** Not implemented.

---

#### **Authentication**
**File:** `app/api/auth/register/route.ts`
```typescript
// TODO: Send verification email
```
**Intended Purpose:** Email verification for new users.  
**Current State:** Users registered but no verification email sent.

**File:** `app/api/auth/login/route.ts`  
**Lines:** 49-53
```typescript
// TODO: Uncomment when lastLoginAt column is added to database
// await db.user.update({
//   where: { id: user.id },
//   data: { lastLoginAt: new Date() },
// });
```
**Intended Purpose:** Track last login time.  
**Current State:** Code commented out, waiting for database migration.

---

#### **OAuth Callbacks**
**File:** `app/api/auth/tiktok/callback/route.ts`
```typescript
// TODO: Implement TikTok OAuth callback
```
**Intended Purpose:** Handle TikTok social login.  
**Current State:** Not implemented.

**File:** `app/api/auth/meta/callback/route.ts`
```typescript
// TODO: Implement Meta (Facebook/Instagram) OAuth callback
```
**Intended Purpose:** Handle Meta social login.  
**Current State:** Not implemented.

---

#### **Admin Features**
**File:** `app/api/admin/campaigns/[id]/resume/route.ts`
```typescript
// TODO: Implement campaign resume logic
```
**Intended Purpose:** Allow admins to resume paused campaigns.  
**Current State:** Not implemented.

---

## 2. Database Schema Issues

### 2.1 Commented-Out Fields in Active Use

**File:** `app/api/auth/login/route.ts`  
**Lines:** 49-53, 68
```typescript
// Commented out code trying to update lastLoginAt
// Field emailVerified also commented out in response
```

**Database Schema:** `prisma/schema.prisma`  
The `User` model **does have** these fields:
- `lastLoginAt` (line 26)
- `emailVerified` (line 20)
- `emailVerifiedAt` (line 21)

**Issue:** The code comments suggest these fields don't exist, but they're actually defined in the schema. This indicates:
1. Either the schema was updated but code wasn't
2. Or there's confusion about what's in the database

**Recommendation:** Uncomment the code and use these fields, or remove them from the schema if not needed.

---

### 2.2 Unused Database Models

Based on the schema analysis, these models may be underutilized:

- **`Settlement`** - Appears to be for final payment calculations but no API routes use it
- **`Revenue`** - Revenue tracking model with no corresponding API endpoints
- **`VerificationToken`** - Email verification tokens defined but verification flow incomplete
- **`CreatorPerformanceMetric`** - Performance tracking model with no usage found

---

## 3. Frontend Components with Incomplete Implementations

### 3.1 Payment Setup (Creator Onboarding)

**File:** `app/creator/onboarding/steps/PaymentStep.tsx`  
**Lines:** 15-16
```typescript
// TODO: Implement actual Stripe Connect flow
// For now, simulate connection delay and complete
```
**Intended Purpose:** Connect creator's Stripe account for payouts.  
**Current State:** Fake implementation that just delays 2 seconds and completes without actually connecting Stripe.

---

### 3.2 Post Scheduler

**File:** `components/PostScheduler.tsx`  
**Line:** 32
```typescript
const response = await fetch('/api/schedule/create', {
```
**Issue:** Calls non-existent `/api/schedule/create` endpoint.  
**Intended Purpose:** Schedule social media posts.  
**Current State:** Component exists but backend is missing.

---

### 3.3 Protected Video Player

**File:** `components/ProtectedVideoPlayer.tsx`  
**Line:** 20
```typescript
const response = await fetch(`/api/videos/stream/${videoId}`, {
```
**Status:** Backend route `/api/videos/stream/[videoId]/route.ts` **exists**.  
**Note:** This component appears functional.

---

## 4. Potential Dead Code Patterns

### 4.1 Duplicate/Conflicting Files

**File:** `app/founder/campaigns/[id]/page_part1.tsx`  
This appears to be a partial/backup file alongside `page.tsx`. Likely dead code from refactoring.

---

### 4.2 Unused Enums

The Prisma schema defines many enums that may not be fully utilized:

- **`AdminQueue`** - Defines queues (CREATOR_KYC, DISPUTES, etc.) but admin queue assignment may not be implemented
- **`ActivityType`** - Activity logging defined but may not be actively used
- **`AssetType`** - Asset management system may be incomplete

---

## 5. Critical Integration Gaps

### 5.1 Notification System

**Status:** 🔴 **BROKEN**

- Frontend components call notification APIs
- Backend routes exist but have TODOs for actual sending
- Database models exist (`Notification`, `NotificationPreferences`)
- **Gap:** No actual email/push/SMS delivery implementation

**Files Affected:**
- `app/api/notifications/send/route.ts` (TODO)
- Multiple video/payment routes with notification TODOs

---

### 5.2 Payment Processing

**Status:** 🟡 **PARTIALLY WORKING**

- Stripe integration exists
- Webhook handlers exist but incomplete
- Payment records created in database
- **Gaps:**
  - No automatic base fee payment on approval
  - No performance bonus calculation
  - No settlement processing
  - Missing admin alerts for failed payments

**Files Affected:**
- `app/api/stripe/webhook/route.ts` (multiple TODOs)
- `app/api/submissions/[submissionId]/approve/route.ts` (TODO)
- `app/api/cron/lock-videos/route.ts` (TODO)

---

### 5.3 View Tracking & Performance

**Status:** 🟡 **PARTIALLY WORKING**

- View snapshots saved to database
- **Gaps:**
  - No polling queue implementation
  - No automated view count updates
  - No cron job for locking videos after 7 days

**Files Affected:**
- `app/api/videos/[id]/submit-url/route.ts` (TODOs)
- `app/api/cron/lock-videos/route.ts` (TODO)

---

### 5.4 Email Verification

**Status:** 🔴 **NOT IMPLEMENTED**

- `VerificationToken` model exists in schema
- Registration route has TODO for sending verification email
- No email sending implementation

**Files Affected:**
- `app/api/auth/register/route.ts` (TODO)

---

### 5.5 Social OAuth

**Status:** 🔴 **NOT IMPLEMENTED**

- TikTok and Meta OAuth callback routes exist but are empty placeholders
- Social account linking non-functional

**Files Affected:**
- `app/api/auth/tiktok/callback/route.ts` (TODO)
- `app/api/auth/meta/callback/route.ts` (TODO)

---

## 6. Recommendations

### High Priority (Breaks User Flows)

1. **Implement missing dashboard API endpoints** - Founder dashboard is completely broken
2. **Complete payment processing** - Base fees and bonuses not being paid
3. **Implement notification system** - Users not receiving critical updates
4. **Fix creator onboarding** - Stripe Connect flow is fake

### Medium Priority (Degrades Experience)

5. **Implement view tracking cron jobs** - Performance tracking incomplete
6. **Add email verification** - Security issue
7. **Complete video processing** - Upload/watermark/thumbnail generation
8. **Implement missing settings endpoints** - Profile/notification management broken

### Low Priority (Nice to Have)

9. **Social OAuth** - TikTok/Meta login
10. **A/B testing features** - Advanced features
11. **Content recommendation** - AI-powered suggestions
12. **Post scheduling** - Automation features

---

## 7. Summary Statistics

| Category | Count |
|----------|-------|
| Total API Routes | 188 |
| Missing Backend Routes | 19+ |
| Incomplete Routes (with TODOs) | 15+ |
| Frontend Components Analyzed | 50+ |
| Database Models | 40+ |
| Critical Integration Gaps | 5 |

---

**End of Report**
