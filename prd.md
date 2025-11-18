# Product Requirements Document: Nala Agency Platform

## Document Control

| **Field** | **Value** |
|-----------|-----------|
| **Product Name** | Nala Agency Platform (UGC Managed Marketplace) |
| **Version** | 1.0 (Initial Development) |
| **Document Owner** | Product Manager |
| **Last Updated** | November 18, 2025 |
| **Status** | Approved for Development |
| **Stakeholders** | Engineering, Design, Finance, Legal, Operations |

---

## 1. Executive Summary

### 1.1 Product Vision
Nala is a performance-based UGC (User-Generated Content) agency platform that creates a trust bridge between SaaS Founders and professional content creators. By implementing a hybrid payment model and automated escrow system, Nala eliminates financial risk while ensuring fair compensation.

### 1.2 Problem Statement
**Founder Pain Points:**
- High upfront costs for UGC content with no performance guarantee
- Risk of paying for content that doesn't generate views/engagement
- Difficulty tracking ROI on creator partnerships
- Lack of transparency in payment processes

**Creator Pain Points:**
- Unpredictable income and late payments
- Undervaluation when content performs exceptionally well
- No base compensation guarantee for time invested
- Complex contract negotiations

### 1.3 Solution Overview
Nala implements a **Hybrid Fixed/Variable Payment Model**:
- **Fixed Base Fee**: Guaranteed payment per video ($50-200 typical range)
- **Variable Performance Bonus**: $4.00 per 1,000 verified views (7-day window)
- **Nala Revenue Model**: $1.00 per 1,000 views markup
- **Founder Rate**: $5.00 per 1,000 views + Base Fee
- **Automatic Refunds**: Unspent performance budget returned to Founder

### 1.4 Business Model
- **Revenue Source**: $1.00 markup per 1,000 verified views
- **Target Volume**: 100+ campaigns/month
- **Average Campaign Size**: $1,000-$5,000
- **Profitability Timeline**: 12 months

---

## 2. Goals and Success Metrics

### 2.1 Strategic Objectives

**Financial Goals:**
- Achieve profitability within 12 months
- Maintain 20%+ platform margin after creator payouts
- Process $100K+ in monthly transaction volume by Month 6

**Product Goals:**
- Maintain 99.9% payment accuracy and timeliness
- Achieve 4.5+ star average rating from both Founders and Creators
- Support 3 major social platforms (TikTok, Instagram, Facebook)

**Market Goals:**
- Onboard 50+ verified creators in first 6 months
- Secure 25+ active Founder clients by Month 6
- Establish brand as trusted UGC performance marketplace

### 2.2 Key Performance Indicators (KPIs)

| **Category** | **Metric** | **Target** | **Measurement** |
|--------------|------------|------------|-----------------|
| **Volume** | Completed campaigns/month | 100+ | Campaign status = "Completed" |
| **Performance** | Avg views achieved vs. purchased | 75%+ | Total views / Max purchasable views |
| **Retention** | Founder repeat rate (3+ campaigns) | 50%+ | Unique Founders with 3+ campaigns |
| **Creator Satisfaction** | Average creator rating | 4.5+ | Post-campaign survey |
| **Payment Accuracy** | Payment disputes | <1% | Support tickets tagged "payment" |
| **Platform Reliability** | API uptime | 99.9% | Status monitoring |
| **Speed to Value** | Time from brief to first post | <7 days | Timestamp analysis |

### 2.3 Success Criteria for Launch
- [ ] 10 verified creators with connected social accounts
- [ ] 5 pilot Founder campaigns completed successfully
- [ ] Zero critical payment processing errors
- [ ] All API integrations functional (TikTok, Meta)
- [ ] Legal framework approved (Terms, Privacy, Content License)

---

## 3. User Personas and User Stories

### 3.1 Primary Personas

#### **Persona 1: Mike (SaaS Founder)**

**Demographics:**
- Age: 28-45
- Role: Founder/Marketing Lead at B2B SaaS startup
- Technical: Moderate to high
- Budget: $1,000-$10,000/month for content marketing

**Goals:**
- Drive brand awareness through authentic UGC
- Maximize ROI on content spend
- Scale content production without hiring full-time
- Track performance metrics clearly

**Pain Points:**
- Burned by agencies that overpromise and underdeliver
- Needs guaranteed results or money back
- Limited time to manage creator relationships
- Difficulty verifying authentic view counts

**User Stories:**
```
As a Founder, I want to set a maximum budget and only pay for views achieved,
so that I can control costs and eliminate waste.

As a Founder, I want to review and approve content before it goes live,
so that I can ensure brand alignment and quality.

As a Founder, I want to see real-time performance data,
so that I can make informed decisions about future campaigns.

As a Founder, I want automatic refunds for unused budget,
so that I don't have to chase down money or argue about performance.
```

---

#### **Persona 2: Mary (UGC Creator)**

**Demographics:**
- Age: 22-35
- Role: Professional UGC creator/influencer
- Platforms: TikTok (50K+ followers), Instagram (30K+)
- Experience: 2+ years creating sponsored content

**Goals:**
- Earn consistent income from content creation
- Get paid fairly when content goes viral
- Work with reputable brands
- Reduce time spent on invoicing and payment follow-up

**Pain Points:**
- Clients often delay payment or dispute results
- Flat fees don't reward exceptional performance
- Platforms take large cuts (30-40%)
- Complex contract negotiations waste time

**User Stories:**
```
As a Creator, I want a guaranteed base fee for every video,
so that my time is compensated regardless of performance.

As a Creator, I want unlimited upside if my video goes viral,
so that I'm rewarded for creating exceptional content.

As a Creator, I want automatic, daily payment updates,
so that I can track my earnings in real-time.

As a Creator, I want instant payouts,
so that I can access my money when I need it.
```

---

#### **Persona 3: Admin (Nala Operations)**

**Demographics:**
- Role: Platform operations manager
- Technical: High
- Responsibilities: Campaign monitoring, dispute resolution, creator vetting

**Goals:**
- Ensure smooth campaign execution
- Minimize payment disputes
- Verify data accuracy
- Scale operations efficiently

**User Stories:**
```
As an Admin, I want automated alerts for posting schedule violations,
so that I can intervene before issues escalate.

As an Admin, I want a dashboard showing all active campaigns,
so that I can monitor platform health at a glance.

As an Admin, I want tools to verify creator authenticity,
so that we maintain platform quality and trust.
```

---

## 4. Financial Model Deep Dive

### 4.1 Pricing Structure

**Founder Pricing:**
- Fixed Base Fee: $50-200 per video (set by creator)
- Performance Rate: $5.00 per 1,000 views
- Minimum Campaign: $500
- No hidden fees or monthly subscriptions

**Creator Earnings:**
- Fixed Base Fee: 100% retained by creator
- Performance Rate: $4.00 per 1,000 views
- Payment Schedule: Base fee on approval, performance bonus at 7-day mark
- No platform commissions on base fee

**Nala Revenue:**
- Markup: $1.00 per 1,000 views
- Revenue Share: 20% of performance budget
- Target Margin: 25-30% after operational costs

### 4.2 Example Campaign Breakdown

**Campaign Parameters:**
- Total Budget: $1,000
- Videos Requested: 5
- Base Fee: $50/video
- Performance Budget Available: $750
- Maximum Views Purchasable: 150,000 views @ $5/1k

**Scenario 1: High Performance (120,000 views achieved)**

| **Item** | **Amount** | **Recipient** |
|----------|------------|---------------|
| Base Fee Payout | $250.00 | Creator (5 × $50) |
| Performance Payout | $480.00 | Creator (120k × $4/1k) |
| Nala Markup | $120.00 | Nala (120k × $1/1k) |
| Founder Refund | $150.00 | Founder (unused: 30k views) |
| **Total** | **$1,000.00** | **Balanced** ✓ |

**Scenario 2: Moderate Performance (75,000 views achieved)**

| **Item** | **Amount** | **Recipient** |
|----------|------------|---------------|
| Base Fee Payout | $250.00 | Creator |
| Performance Payout | $300.00 | Creator (75k × $4/1k) |
| Nala Markup | $75.00 | Nala (75k × $1/1k) |
| Founder Refund | $375.00 | Founder (unused: 75k views) |
| **Total** | **$1,000.00** | **Balanced** ✓ |

**Scenario 3: Low Performance (30,000 views achieved)**

| **Item** | **Amount** | **Recipient** |
|----------|------------|---------------|
| Base Fee Payout | $250.00 | Creator |
| Performance Payout | $120.00 | Creator (30k × $4/1k) |
| Nala Markup | $30.00 | Nala (30k × $1/1k) |
| Founder Refund | $600.00 | Founder (unused: 120k views) |
| **Total** | **$1,000.00** | **Balanced** ✓ |

### 4.3 Payment Flow Architecture

```
[Founder] 
    ↓ (Deposits $1,000 via Stripe)
[Escrow Account]
    ↓ (On content approval)
[Phase 1: Base Fee] → $250 → [Creator Account]
    ↓ (7 days after posting)
[Phase 2: Settlement]
    ├→ $300 (Performance) → [Creator Account]
    ├→ $75 (Markup) → [Nala Revenue Account]
    └→ $375 (Refund) → [Founder Account]
```

---

## 5. Detailed Feature Requirements

### 5.1 Creator Module Features

#### **C-101: Account Authentication & Onboarding**

**Priority:** P0 (Blocker)  
**Complexity:** High  
**Dependencies:** TikTok API, Meta Graph API

**Requirements:**
- OAuth integration with TikTok for Developers
- OAuth integration with Meta (Instagram/Facebook Business)
- Minimum follower requirements: TikTok 10K+, Instagram 5K+
- Account verification status badge
- Multi-platform linking (can connect multiple accounts)
- Annual re-verification requirement

**Acceptance Criteria:**
- [ ] Creator can link TikTok account via OAuth without leaving platform
- [ ] Creator can link Instagram Business account
- [ ] System validates minimum follower count automatically
- [ ] Verification badge displays on creator profile
- [ ] Error handling for failed API connections

**Technical Notes:**
- Use TikTok Login Kit for authentication
- Requires Meta Business verification for analytics access
- Store refresh tokens securely (encrypted at rest)
- Implement token refresh mechanism (automatic retry)

---

#### **C-102: Base Rate Card & Profile**

**Priority:** P0  
**Complexity:** Medium  
**Dependencies:** C-101

**Requirements:**
- Customizable base fee per video ($50-$500 range)
- Platform-specific pricing (TikTok, Instagram, Facebook)
- Portfolio gallery (upload up to 10 sample videos)
- Bio/description (max 500 characters)
- Category tags (e.g., SaaS, B2B, Tech, Lifestyle)
- Availability calendar
- Response time indicator

**Acceptance Criteria:**
- [ ] Creator can set different base fees for different platforms
- [ ] System enforces minimum base fee of $50
- [ ] Portfolio videos display in grid format
- [ ] Profile preview shows how Founders see the profile
- [ ] Changes save instantly with visual confirmation

**UI/UX Notes:**
- Use slider for base fee with live preview of potential earnings
- Display "Estimated earnings for 100K views" calculator
- Show "Most creators charge $75-150" guidance

---

#### **C-103: Task Dashboard & Content Submission**

**Priority:** P0  
**Complexity:** High  
**Dependencies:** C-101, F-201

**Requirements:**

**Dashboard View:**
- Active briefs (status: Draft, In Review, Approved)
- Upcoming deadlines with countdown timers
- Earnings summary (Base + Performance + Pending)
- Notification center for approvals, revisions, comments

**Brief Detail View:**
- Campaign overview (brand, budget, deadlines)
- Creative brief (talking points, do's/don'ts, hashtags)
- Asset downloads (logos, product images)
- Reference videos/examples

**Submission Workflow:**
1. Draft Upload (MP4, MOV up to 500MB)
2. Draft submission for review
3. Revision handling (re-upload with version tracking)
4. Final approval notification
5. Post URL submission with posting confirmation

**Acceptance Criteria:**
- [ ] Creator sees all assigned briefs in one view
- [ ] Upload supports drag-and-drop for videos
- [ ] System sends email notification on status changes
- [ ] Creator can submit post URL with timestamp proof
- [ ] Version history shows all draft iterations

**Technical Notes:**
- Use AWS S3 for video storage
- Implement video transcoding for preview (720p)
- Store video metadata (duration, resolution, file size)
- Webhook notifications for status changes

---

#### **C-104: Payout Wallet & Earnings Tracking**

**Priority:** P0  
**Complexity:** High  
**Dependencies:** C-101, T-304

**Requirements:**

**Wallet Dashboard:**
- Current balance (available + pending)
- Base fee earned (completed campaigns)
- Performance bonus (live updating during 7-day window)
- Lifetime earnings chart
- Transaction history (filterable by date, campaign)

**Real-Time Performance Tracking:**
- Live view counter for active posts (updated daily)
- Estimated bonus calculation: `(Current Views × $4.00) / 1,000`
- Projection chart showing potential earnings if current trajectory continues
- Time remaining until 7-day lock

**Payout Options:**
- Instant Payout (available balance to bank account)
- Minimum payout: $20
- Processing fee: $0.50 for instant, free for standard (2-3 days)
- Payout history with transaction IDs

**Acceptance Criteria:**
- [ ] Balance updates within 5 minutes of payment event
- [ ] Performance bonus updates daily at 12:00 AM EST
- [ ] Payout request processed within 1 hour (instant)
- [ ] Receipt generated for every transaction
- [ ] Tax form (1099) generated automatically at year-end

**Technical Notes:**
- Use Stripe Connect Express for creator accounts
- Implement daily cron job for view count updates
- Cache balance calculations for performance
- Webhook listeners for Stripe transfer events

---

### 5.2 Founder Module Features

#### **F-201: Guided Brief Builder**

**Priority:** P0  
**Complexity:** High  
**Dependencies:** None

**Requirements:**

**Step 1: Campaign Basics**
- Campaign name
- Product/service description
- Target audience
- Campaign goal (awareness, signups, sales)

**Step 2: Content Requirements**
- Number of videos (1-10)
- Video length (15s, 30s, 60s, custom)
- Platforms (TikTok, Instagram, Facebook - multi-select)
- Preferred video style (testimonial, tutorial, unboxing, etc.)

**Step 3: Creative Direction**
- Key talking points (bullet list)
- Brand guidelines document upload (PDF)
- Do's and Don'ts
- Required hashtags/mentions
- Sample videos (URL links)
- Asset uploads (logo, product images)

**Step 4: Posting Schedule**
- Start date
- Posting frequency (daily, every other day, weekly)
- Specific time preferences (optional)
- Timezone

**Step 5: Budget Configuration**
- Base fee budget allocation
- Performance budget allocation
- Total campaign budget
- Budget breakdown preview

**Step 6: Creator Selection**
- Browse creator profiles
- Filter by: platform, follower count, niche, base fee range
- View portfolio and past performance
- Select creator(s) for campaign

**Acceptance Criteria:**
- [ ] Founder can complete brief in under 10 minutes
- [ ] System validates all required fields before proceeding
- [ ] Budget calculator shows real-time cost breakdown
- [ ] Progress saved automatically at each step
- [ ] Brief preview before submission

**UI/UX Notes:**
- Progress bar showing completion (e.g., "Step 3 of 6")
- Tooltips for complex concepts (e.g., "What is performance budget?")
- Smart defaults based on campaign goal
- Template library for common brief types

---

#### **F-202: Escrow & Funding**

**Priority:** P0  
**Complexity:** High  
**Dependencies:** T-304

**Requirements:**

**Payment Setup:**
- Stripe Checkout integration
- Payment methods: Credit card, ACH bank transfer
- Save payment method for future campaigns
- PCI compliance for card storage

**Escrow Management:**
- Funds held in Stripe Connect platform account
- Real-time balance display
- Fund allocation visualization (base vs. performance)
- Transaction log with timestamps

**Budget Controls:**
- Minimum campaign budget: $500
- Maximum campaign budget: $50,000
- Budget modification during campaign (increase only)
- Emergency pause/cancel with refund calculation

**Acceptance Criteria:**
- [ ] Founder can deposit funds in under 2 minutes
- [ ] Payment confirmation instant via email
- [ ] Escrow balance visible in dashboard
- [ ] Failed payment retries automatically (up to 3 attempts)
- [ ] Refund processing completes within 5-7 business days

**Security Requirements:**
- Two-factor authentication for payments over $5,000
- Fraud detection via Stripe Radar
- Webhook signature verification for all payment events
- Audit log for all financial transactions

---

#### **F-203: Content Review Tool**

**Priority:** P0  
**Complexity:** Medium  
**Dependencies:** C-103

**Requirements:**

**Review Interface:**
- Side-by-side view: Video player + Brief details
- Video controls: Play, pause, seek, speed adjustment (0.5x, 1x, 2x)
- Frame-by-frame scrubbing for detailed review
- Annotation tools: Add timestamped comments
- Download option for offline review

**Review Actions:**
1. **Approve**: Triggers Phase 1 payment (base fee)
   - Confirmation modal with payment amount
   - Cannot be undone once confirmed
   - Sends notification to creator

2. **Request Revision**:
   - Comment field (required, min 20 characters)
   - Specific timestamps for issues
   - Suggested changes checklist
   - Revision deadline (default: 48 hours)
   - Revision counter (max 2 revisions per video)

3. **Reject** (extreme cases only):
   - Requires detailed justification
   - Triggers admin review
   - Partial payment may still be required

**Collaboration Features:**
- Internal notes (not visible to creator)
- Team member tagging for feedback
- Approval workflow for multi-stakeholder review
- Version comparison (side-by-side)

**Acceptance Criteria:**
- [ ] Video loads and plays smoothly (< 3 second buffer)
- [ ] Approve action triggers payment within 5 minutes
- [ ] Creator receives revision feedback within 1 minute
- [ ] Revision history preserved indefinitely
- [ ] Notification sent to creator on each action

**Technical Notes:**
- Use video.js or similar player library
- Store annotations in database with timestamp references
- Implement optimistic UI updates for actions
- Queue payment processing jobs

---

#### **F-204: Performance Dashboard**

**Priority:** P0  
**Complexity:** High  
**Dependencies:** T-301, T-302, T-303

**Requirements:**

**Dashboard Overview:**
- Campaign status cards (Active, Pending Review, Completed)
- Key metrics: Total views, Est. refund, Days remaining
- Performance trend chart (views over 7-day period)
- Platform breakdown (TikTok vs Instagram vs Facebook)

**Detailed Campaign View:**

**Metrics Display:**
- Views Achieved (current count)
- Maximum Views Purchasable (based on budget)
- Performance Percentage: `(Views Achieved / Max Purchasable) × 100%`
- Estimated Refund: `(Unspent Budget)`
- Days Remaining: Countdown timer to 7-day lock

**Video Performance Table:**
| Video | Platform | Post Date | Views | Performance % | Status |
|-------|----------|-----------|-------|---------------|--------|
| Video 1 | TikTok | Nov 15 | 45,232 | 90% | Active |
| Video 2 | Instagram | Nov 16 | 28,540 | 57% | Active |

**Real-Time Updates:**
- View counts refresh daily at 12:00 AM EST
- Live indicator showing last update time
- Manual refresh button (rate limited to 1/hour)

**Export & Reporting:**
- Download performance report (PDF, CSV)
- Custom date range selection
- Campaign comparison tool
- ROI calculator

**Acceptance Criteria:**
- [ ] Dashboard loads in under 2 seconds
- [ ] View counts match official platform analytics (±2% tolerance)
- [ ] Refund calculation updates in real-time
- [ ] Export generates within 30 seconds
- [ ] Mobile-responsive design

**UI/UX Notes:**
- Use color coding: Green (>75%), Yellow (50-75%), Red (<50%)
- Tooltips explaining each metric
- Expandable rows for video details
- Skeleton loaders during data fetch

---

## 6. Technical Architecture & Requirements

### 6.1 System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend Layer                      │
│  (React/Next.js, TailwindCSS, React Query)             │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│                   API Gateway Layer                      │
│     (Node.js/Express, Authentication, Rate Limiting)    │
└────────────────┬────────────────────────────────────────┘
                 │
     ┌───────────┴───────────┐
     │                       │
┌────▼─────────┐   ┌────────▼─────────┐
│  Application │   │   Background     │
│    Server    │   │   Job Queue      │
│ (Business    │   │  (Bull/Redis)    │
│  Logic)      │   └──────┬───────────┘
└────┬─────────┘          │
     │              ┌─────▼──────┐
     │              │  Workers   │
     │              │  - View    │
     │              │   Polling  │
     │              │  - Payment │
     │              │   Processor│
     └──────┬───────┴─────┬──────┘
            │             │
    ┌───────▼─────┐  ┌────▼──────────┐
    │  PostgreSQL │  │  External APIs │
    │  (Primary   │  │  - TikTok      │
    │   Database) │  │  - Meta Graph  │
    └─────────────┘  │  - Stripe      │
                     └────────────────┘
```

### 6.2 Data Acquisition & API Integration

#### **T-301: TikTok & Meta API Integration**

**Priority:** P0  
**Complexity:** High  
**Risk Level:** High

**TikTok Display API Integration:**

**Endpoints Required:**
- `GET /v2/video/list/` - Fetch creator's videos
- `GET /v2/video/query/` - Get specific video analytics
- Metrics: `view_count`, `like_count`, `share_count`, `comment_count`

**Authentication:**
- OAuth 2.0 with PKCE flow
- Scopes required: `user.info.basic`, `video.list`, `video.insights`
- Access token validity: 24 hours
- Refresh token validity: 365 days

**Rate Limits:**
- 1,000 requests per day per user
- Burst limit: 100 requests per minute
- Implement exponential backoff on 429 errors

**Implementation Requirements:**
- [ ] OAuth flow with token storage
- [ ] Automatic token refresh mechanism
- [ ] Error handling for API downtime
- [ ] Fallback to cached data during outages
- [ ] Rate limit monitoring and alerting

---

**Meta Graph API Integration:**

**Endpoints Required:**
- `GET /{ig-user-id}/media` - List Instagram posts
- `GET /{ig-media-id}/insights` - Get Reel/post metrics
- `GET /{fb-page-id}/videos` - List Facebook videos
- Metrics: `reach`, `plays`, `impressions`

**Authentication:**
- Facebook Login for Business
- Permissions: `instagram_basic`, `instagram_manage_insights`, `pages_read_engagement`
- Long-lived tokens (60 days)

**Data Mapping:**
- Instagram Reels: Use `plays` metric as "views"
- Facebook Reels: Use `post_video_views` metric
- Handle missing data gracefully (display "Data Unavailable")

**Implementation Requirements:**
- [ ] OAuth with Instagram Business account requirement
- [ ] Webhook subscriptions for real-time updates (future)
- [ ] Pagination handling for large datasets
- [ ] Data normalization layer (map different metric names to standard "views")

**Critical Notes:**
- **TikTok API is notoriously unstable** - implement aggressive error handling
- **Meta requires Business account** - guide creators through setup
- **View count definitions vary** - document platform-specific definitions clearly
- **API quotas are strict** - implement request batching and caching

---

#### **T-302: Scheduled View Polling System**

**Priority:** P0  
**Complexity:** High  
**Dependencies:** T-301

**Architecture:**

```
[Cron Trigger] (Daily at 12:00 AM EST)
       ↓
[Job Queue] (Bull Queue with Redis)
       ↓
[Worker Pool] (3-5 concurrent workers)
       ↓
[Batch API Requests] (Max 50 videos per batch)
       ↓
[Database Update] (Atomic transactions)
       ↓
[Event Emission] (Payment triggers, notifications)
```

**Requirements:**

**Job Scheduling:**
- Primary cron: Daily at 12:00 AM EST (05:00 UTC)
- Backup cron: Daily at 6:00 AM EST (in case of failure)
- Retry logic: 3 attempts with exponential backoff (1min, 5min, 15min)

**Data Collection Logic:**
1. Query database for all active posts (status = "live", posted_date < 7 days ago)
2. Group by platform (TikTok batch, Instagram batch, Facebook batch)
3. Batch API requests (max 50 videos per request)
4. Parse responses and extract view counts
5. Calculate deltas (new views since last check)
6. Update database with new view counts and timestamps

**Performance Requirements:**
- Process 1,000 active posts in under 10 minutes
- Database connection pooling (min 5, max 20 connections)
- Request timeout: 30 seconds per API call
- Circuit breaker for API failures (open after 5 consecutive failures)

**Error Handling:**
- Log all API errors with full context
- Send alert to ops team if >10% of requests fail
- Continue processing other videos if one fails
- Store failed video IDs for manual retry

**Acceptance Criteria:**
- [ ] Cron executes reliably every day (99.9% uptime)
- [ ] All active posts updated within 15 minutes
- [ ] Zero data loss during failures
- [ ] Idempotent operations (safe to retry)
- [ ] Monitoring dashboard shows job health

**Technical Stack:**
- **Scheduler**: node-cron or Kubernetes CronJob
- **Queue**: Bull (Redis-backed)
- **Database**: PostgreSQL with advisory locks
- **Monitoring**: DataDog or Prometheus

---

#### **T-303: 7-Day Metric Lock & Final Settlement**

**Priority:** P0  
**Complexity:** Medium  
**Dependencies:** T-302, T-304

**Requirements:**

**Lock Trigger Logic:**
- Calculate hours since post: `NOW() - post.posted_at`
- Lock condition: `hours_since_post >= 168` (7 days)
- Execute lock as atomic database transaction
- Set post status: `"locked"` (immutable)

**Final Settlement Calculation:**

```javascript
// Pseudocode for settlement logic
function calculateFinalSettlement(post, campaign) {
  const CREATOR_RATE = 4.00; // per 1k views
  const NALA_MARKUP = 1.00; // per 1k views
  const FOUNDER_RATE = 5.00; // per 1k views
  
  const finalViews = post.locked_view_count;
  const viewsInThousands = finalViews / 1000;
  
  const creatorPerformanceBonus = viewsInThousands * CREATOR_RATE;
  const nalaRevenue = viewsInThousands * NALA_MARKUP;
  const totalPerformanceCost = viewsInThousands * FOUNDER_RATE;
  
  const remainingBudget = campaign.performance_budget - totalPerformanceCost;
  const founderRefund = Math.max(0, remainingBudget);
  
  return {
    creatorPerformanceBonus,
    nalaRevenue,
    founderRefund,
    totalSettled: creatorPerformanceBonus + nalaRevenue + founderRefund
  };
}
```

**Automated Actions:**
1. Lock view count in database (prevent further updates)
2. Calculate final settlement breakdown
3. Create payout records (creator performance bonus)
4. Create refund record (founder unspent budget)
5. Create revenue record (Nala markup)
6. Trigger payment processor (T-306)
7. Update campaign status (check if all videos locked)
8. Send notifications (email + in-app)

**Edge Cases:**
- **Zero views**: Creator still gets base fee, full performance budget refunded
- **Partial campaign completion**: Lock videos individually, settle as they complete
- **API data unavailable at lock time**: Use last known view count, flag for manual review
- **Disputed metrics**: Implement admin override mechanism

**Acceptance Criteria:**
- [ ] Lock executes exactly at 168-hour mark (±5 minutes tolerance)
- [ ] Settlement calculation is deterministic (same inputs = same outputs)
- [ ] All monetary values sum to original budget (accounting integrity)
- [ ] Notifications sent within 5 minutes of lock
- [ ] Database transaction is atomic (all or nothing)

---

### 6.3 Payment Processing & Escrow

#### **T-304: Stripe Connect Integration**

**Priority:** P0  
**Complexity:** Very High  
**Risk Level:** Critical

**Stripe Architecture:**

```
[Nala Platform Account] (Master)
        ↓
[Stripe Connect Express Accounts]
        ├─ [Creator 1 Account]
        ├─ [Creator 2 Account]
        └─ [Creator N Account]
```

**Implementation Model:** Separate Charges and Transfers  
**Why:** Provides maximum control over fund flow and escrow management

**Account Setup:**

**Platform Account (Nala):**
- Business type: Platform/Marketplace
- Account country: United States
- Enable features: `card_payments`, `transfers`, `treasury` (for escrow)

**Creator Accounts (Express):**
- Onboarding: Stripe Connect Onboarding (hosted flow)
- Requirements: Bank account, Tax ID (SSN/EIN), Address
- Payout schedule: Instant or Standard (configurable by creator)
- 1099 generation: Automatic for US creators earning $600+

---

**Payment Flow Implementation:**

**Phase 1: Campaign Funding (Founder Deposits)**

```javascript
// Stripe API call
const paymentIntent = await stripe.paymentIntents.create({
  amount: campaignBudget * 100, // Convert to cents
  currency: 'usd',
  customer: founder.stripeCustomerId,
  payment_method: founder.defaultPaymentMethod,
  confirm: true,
  metadata: {
    campaign_id: campaign.id,
    founder_id: founder.id,
    type: 'campaign_funding'
  }
});

// Hold funds in platform account (escrow)
// Do NOT transfer to creator yet
```

**Phase 2: Base Fee Payout (Content Approval)**

```javascript
// Triggered by F-203 "Approve" action
const transfer = await stripe.transfers.create({
  amount: baseFee * 100,
  currency: 'usd',
  destination: creator.stripeConnectedAccountId,
  transfer_group: campaign.id,
  metadata: {
    campaign_id: campaign.id,
    video_id: video.id,
    payment_type: 'base_fee'
  }
});

// Update database
await db.payments.create({
  campaign_id: campaign.id,
  recipient_id: creator.id,
  amount: baseFee,
  type: 'base_fee',
  stripe_transfer_id: transfer.id,
  status: 'completed'
});
```

**Phase 3: Final Settlement (7-Day Lock)**

```javascript
// Triggered by T-303 metric lock
const settlement = calculateFinalSettlement(post, campaign);

// 1. Creator Performance Bonus
if (settlement.creatorPerformanceBonus > 0) {
  const creatorTransfer = await stripe.transfers.create({
    amount: settlement.creatorPerformanceBonus * 100,
    currency: 'usd',
    destination: creator.stripeConnectedAccountId,
    metadata: {
      campaign_id: campaign.id,
      payment_type: 'performance_bonus',
      views_achieved: post.locked_view_count
    }
  });
}

// 2. Nala Revenue (stays in platform account)
await db.revenue.create({
  campaign_id: campaign.id,
  amount: settlement.nalaRevenue,
  type: 'markup',
  views_count: post.locked_view_count
});

// 3. Founder Refund
if (settlement.founderRefund > 0) {
  const refund = await stripe.refunds.create({
    payment_intent: campaign.stripePaymentIntentId,
    amount: settlement.founderRefund * 100,
    reason: 'requested_by_customer', // Automatic refund
    metadata: {
      campaign_id: campaign.id,
      refund_type: 'unspent_budget'
    }
  });
}
```

**Security & Compliance:**

**PCI Compliance:**
- Never store raw card numbers (use Stripe tokens)
- Use Stripe Elements for card input (PCI SAQ-A compliant)
- Implement SCA (Strong Customer Authentication) for EU customers

**Fraud Prevention:**
- Enable Stripe Radar (automatic fraud detection)
- Implement velocity checks (max 5 campaigns per day per founder)
- Manual review for campaigns >$10,000
- Block VPNs/proxies for payment actions

**Financial Controls:**
- Daily reconciliation: Compare Stripe balance vs. database records
- Monthly audit: External accountant review
- Reserve account: Hold 10% of monthly volume for disputes/chargebacks
- Insurance: Cyber liability and E&O insurance

**Acceptance Criteria:**
- [ ] Zero payment failures due to integration bugs
- [ ] 100% accounting accuracy (funds in = funds out)
- [ ] Payout processing < 2 minutes for instant payouts
- [ ] Refunds processed within 5-7 business days
- [ ] All transactions logged with full audit trail

**Monitoring & Alerts:**
- Alert: Failed payment intent (immediate notification)
- Alert: Transfer failure (retry automatically)
- Alert: Daily balance mismatch >$10
- Dashboard: Real-time payment processing status

---

#### **T-305: Phase 1 Payout Trigger**

**Priority:** P0  
**Complexity:** Medium  
**Dependencies:** T-304, F-203

**Trigger Event:** Founder clicks "Approve" in Content Review Tool

**Pre-Trigger Validation:**
- Verify campaign has sufficient escrow balance
- Confirm creator Stripe account is active and verified
- Check for existing base fee payment (prevent double payment)
- Validate video submission is complete

**Execution Flow:**
1. Create pending payment record in database
2. Initiate Stripe transfer API call
3. Handle response (success/failure)
4. Update payment status
5. Send notification to creator
6. Log transaction in audit trail

**Error Handling:**

| Error Type | Response | User Impact |
|------------|----------|-------------|
| Insufficient balance | Block approval, alert admin | Founder sees error message |
| Creator account inactive | Queue payment, notify creator | Payment pending until account fixed |
| Stripe API timeout | Retry 3 times, then queue | Creator notified of delay |
| Network failure | Automatic retry with backoff | Transparent to user |

**Idempotency:**
- Use idempotency keys for all Stripe API calls
- Format: `${campaign_id}_${video_id}_base_fee_${timestamp}`
- Prevents duplicate payments if request is retried

**Acceptance Criteria:**
- [ ] Payment executes within 2 minutes of approval
- [ ] Creator sees updated balance immediately
- [ ] Email confirmation sent to both parties
- [ ] Zero duplicate payments
- [ ] 99.9% success rate

---

#### **T-306: Phase 2 Payout/Refund Trigger**

**Priority:** P0  
**Complexity:** High  
**Dependencies:** T-303, T-304

**Trigger Event:** 7-Day metric lock completion

**Pre-Settlement Validation:**
- Confirm view count is locked and immutable
- Verify all settlement calculations sum to original budget
- Check creator and founder accounts are active
- Validate no pending disputes on campaign

**Execution Flow (Atomic Transaction):**

```sql
BEGIN TRANSACTION;

-- 1. Create settlement records
INSERT INTO settlements (campaign_id, video_id, locked_views, ...)
VALUES (...);

-- 2. Create payout records
INSERT INTO payouts (creator_id, amount, type, ...)
VALUES (...);

-- 3. Create refund records
INSERT INTO refunds (founder_id, amount, reason, ...)
VALUES (...);

-- 4. Update campaign status
UPDATE campaigns 
SET status = 'completed', completed_at = NOW()
WHERE id = ...;

COMMIT;
```

**After Database Commit:**
1. Initiate Stripe transfers (creator performance bonus)
2. Initiate Stripe refund (founder unspent budget)
3. Send email notifications with PDF receipts
4. Generate campaign performance report
5. Update analytics dashboard

**Error Recovery:**
- If Stripe API fails after DB commit, queue for retry
- Admin dashboard shows "Pending Payouts" for manual intervention
- Automatic retry every hour for 24 hours
- After 24 hours, alert finance team for manual processing

**Acceptance Criteria:**
- [ ] Settlement always balances to original budget
- [ ] All parties receive payment/refund within 24 hours
- [ ] Zero fund leakage (all money accounted for)
- [ ] Notifications sent within 5 minutes
- [ ] Campaign marked "completed" correctly

---

### 6.4 Compliance & Verification

#### **T-307: Posting Schedule Verification**

**Priority:** P1 (High)  
**Complexity:** Medium  
**Dependencies:** T-302

**Purpose:** Ensure creators follow agreed posting schedule (e.g., "one video per day")

**Verification Logic:**

```javascript
function verifyPostingSchedule(campaign, posts) {
  const schedule = campaign.posting_frequency; // 'daily', 'every_other_day', etc.
  const startDate = campaign.start_date;
  
  const violations = [];
  
  posts.forEach((post, index) => {
    const expectedDate = calculateExpectedPostDate(startDate, index, schedule);
    const actualDate = post.posted_at;
    const hoursDifference = Math.abs(actualDate - expectedDate) / (1000 * 60 * 60);
    
    if (hoursDifference > 24) { // 24-hour grace period
      violations.push({
        video_id: post.id,
        expected_date: expectedDate,
        actual_date: actualDate,
        hours_late: hoursDifference - 24
      });
    }
  });
  
  return violations;
}
```

**Automated Actions:**
- **Minor Violation (24-48 hours late)**: Warning notification to creator
- **Major Violation (48+ hours late)**: Alert admin, flag campaign
- **Severe Violation (missed post entirely)**: Pause campaign, require founder approval to continue

**Admin Dashboard:**
- View all schedule violations
- Filter by severity (minor, major, severe)
- One-click action: Approve variance, issue warning, cancel campaign

**Acceptance Criteria:**
- [ ] System checks posting times daily
- [ ] Violations flagged within 1 hour of occurrence
- [ ] Admin can override false positives
- [ ] Creator receives clear explanation of violation

---

#### **T-308: UGC Rights Management & Licensing**

**Priority:** P1 (High)  
**Complexity:** Medium  
**Dependencies:** T-306

**Purpose:** Generate and store content usage license granting founder rights to use UGC

**License Generation Trigger:** Final payment completion (Phase 2)

**License Terms (Standard):**
- **Grant of Rights**: Perpetual, worldwide, non-exclusive license
- **Permitted Uses**: Marketing, advertising, website, social media, paid ads
- **Attribution**: Optional (founder may use with or without creator credit)
- **Modifications**: Founder may edit, crop, add overlays, subtitle
- **Exclusions**: Cannot resell license to third parties
- **Creator Warranty**: Content is original, doesn't infringe copyrights

**License Document Generation:**

```javascript
async function generateLicense(campaign, video, creator, founder) {
  const licenseData = {
    license_id: uuid(),
    campaign_id: campaign.id,
    video_id: video.id,
    creator_name: creator.full_name,
    founder_name: founder.company_name,
    grant_date: new Date(),
    video_url: video.final_post_url,
    views_achieved: video.locked_view_count,
    total_compensation: video.base_fee + video.performance_bonus
  };
  
  // Generate PDF using template
  const pdf = await generatePdfFromTemplate('license_template.html', licenseData);
  
  // Store in S3
  const s3Key = `licenses/${campaign.id}/${video.id}.pdf`;
  await s3.upload(pdf, s3Key);
  
  // Store metadata in DB
  await db.licenses.create({
    ...licenseData,
    pdf_url: s3Key
  });
  
  return licenseData;
}
```

**Storage & Access:**
- Store PDFs in AWS S3 with encryption at rest
- Founder can download from dashboard anytime
- Creator receives copy via email
- Admin has full audit access

**Legal Review:**
- Have license template reviewed by legal counsel
- Update annually or when laws change
- Include dispute resolution clause (arbitration)

**Acceptance Criteria:**
- [ ] License generates automatically on final payment
- [ ] PDF is legally valid and enforceable
- [ ] Both parties receive copies
- [ ] Accessible from dashboard indefinitely

---

## 7. Database Schema

### 7.1 Core Tables

**users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('founder', 'creator', 'admin')),
  full_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255), -- For founders
  stripe_customer_id VARCHAR(255), -- For founders
  stripe_account_id VARCHAR(255), -- For creators (Connect account)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**creator_profiles**
```sql
CREATE TABLE creator_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  base_fee_tiktok DECIMAL(10,2) DEFAULT 50.00,
  base_fee_instagram DECIMAL(10,2) DEFAULT 50.00,
  base_fee_facebook DECIMAL(10,2) DEFAULT 50.00,
  categories TEXT[], -- ['SaaS', 'B2B', 'Tech']
  portfolio_videos JSONB, -- [{url, thumbnail, platform}]
  verification_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**social_accounts**
```sql
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'facebook')),
  platform_user_id VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  follower_count INTEGER,
  access_token TEXT, -- Encrypted
  refresh_token TEXT, -- Encrypted
  token_expires_at TIMESTAMP,
  verified_at TIMESTAMP,
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(creator_id, platform)
);
```

**campaigns**
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  founder_id UUID REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  -- 'draft', 'pending_creator', 'in_progress', 'in_review', 'active', 'completed', 'cancelled'
  
  -- Budget
  total_budget DECIMAL(10,2) NOT NULL,
  base_fee_budget DECIMAL(10,2) NOT NULL,
  performance_budget DECIMAL(10,2) NOT NULL,
  
  -- Videos
  videos_requested INTEGER NOT NULL,
  videos_completed INTEGER DEFAULT 0,
  
  -- Posting
  posting_frequency VARCHAR(50), -- 'daily', 'every_other_day'
  start_date DATE,
  
  -- Stripe
  stripe_payment_intent_id VARCHAR(255),
  
  -- Brief data (JSONB for flexibility)
  brief_data JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**videos**
```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Content
  draft_video_url VARCHAR(500),
  final_post_url VARCHAR(500),
  platform VARCHAR(20),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  -- 'pending', 'draft_submitted', 'in_review', 'revision_requested', 'approved', 'posted', 'locked'
  
  -- Dates
  submitted_at TIMESTAMP,
  approved_at TIMESTAMP,
  posted_at TIMESTAMP,
  locked_at TIMESTAMP,
  
  -- Views tracking
  current_view_count INTEGER DEFAULT 0,
  locked_view_count INTEGER,
  last_view_update TIMESTAMP,
  
  -- Payments
  base_fee_paid BOOLEAN DEFAULT FALSE,
  performance_bonus_paid BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**view_snapshots**
```sql
CREATE TABLE view_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  view_count INTEGER NOT NULL,
  snapshot_at TIMESTAMP DEFAULT NOW(),
  data_source VARCHAR(50), -- 'tiktok_api', 'meta_api'
  
  INDEX idx_video_snapshot (video_id, snapshot_at)
);
```

**payments**
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id),
  video_id UUID REFERENCES videos(id),
  recipient_id UUID REFERENCES users(id),
  
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(50) NOT NULL,
  -- 'base_fee', 'performance_bonus', 'refund', 'revenue'
  
  status VARCHAR(20) DEFAULT 'pending',
  -- 'pending', 'processing', 'completed', 'failed'
  
  stripe_transfer_id VARCHAR(255),
  stripe_refund_id VARCHAR(255),
  
  metadata JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);
```

**licenses**
```sql
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id),
  video_id UUID REFERENCES videos(id),
  creator_id UUID REFERENCES users(id),
  founder_id UUID REFERENCES users(id),
  
  license_number VARCHAR(100) UNIQUE,
  pdf_url VARCHAR(500),
  
  granted_at TIMESTAMP DEFAULT NOW()
);
```

---

## 8. User Interface & Experience

### 8.1 Design Principles

1. **Transparency First**: All costs, timelines, and performance metrics visible at all times
2. **Trust Through Clarity**: No hidden fees, clear breakdowns, honest communication
3. **Mobile-First**: 60%+ of creators will access via mobile
4. **Speed Matters**: Load times <2s, optimistic UI updates
5. **Accessible**: WCAG 2.1 AA compliance minimum

### 8.2 Creator Dashboard Wireframe

```
┌─────────────────────────────────────────────────┐
│  NALA    [Notifications 🔔]  [Profile 👤]       │
├─────────────────────────────────────────────────┤
│                                                 │
│  💰 Available Balance: $1,247.50               │
│     [Instant Payout] [View Details]            │
│                                                 │
│  📊 This Month                                  │
│     $2,430 earned  |  12 videos  |  847K views │
│                                                 │
├─────────────────────────────────────────────────┤
│  📋 Active Briefs (3)                          │
│                                                 │
│  ┌───────────────────────────────────────┐    │
│  │ 🟢 SaaS Product Launch                │    │
│  │ Due: Nov 20 (2 days)                  │    │
│  │ ⏳ Draft Submitted - In Review        │    │
│  │ Base: $75  |  Est. Bonus: $200-400   │    │
│  └───────────────────────────────────────┘    │
│                                                 │
│  [View All Briefs →]                           │
│                                                 │
├─────────────────────────────────────────────────┤
│  📈 Recent Performance                         │
│                                                 │
│  Video 1: "Productivity Tool Review"           │
│  ████████░░ 85K views (Day 5/7) 📈           │
│  Est. earnings: +$340                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 8.3 Founder Dashboard Wireframe

```
┌─────────────────────────────────────────────────┐
│  NALA    [Create Campaign +]  [Profile 👤]      │
├─────────────────────────────────────────────────┤
│                                                 │
│  📊 Campaign: Product Launch Q4                │
│                                                 │
│  Budget: $1,000  |  Videos: 5/5  |  Active: 3  │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │ 💰 Budget Status                        │  │
│  │                                         │  │
│  │ Spent:    $650  ████████░░ 65%        │  │
│  │ Reserved: $200  ████░░░░░░ 20%        │  │
│  │ Refund:   $150  ███░░░░░░░ 15%        │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  📹 Video Performance                          │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │ Video 1  TikTok  ✅ Posted Nov 15      │  │
│  │ 45,232 views  ████████░░ 90%          │  │
│  │ Days remaining: 2  |  On track 🎯      │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  [View Detailed Report] [Download CSV]         │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 9. Security & Privacy

### 9.1 Security Requirements

**Authentication:**
- [ ] JWT tokens with 24-hour expiration
- [ ] Refresh tokens with 30-day expiration
- [ ] Rate limiting: 100 requests/minute per IP
- [ ] 2FA optional for all users, mandatory for admins

**Data Protection:**
- [ ] Encryption at rest (AES-256) for PII
- [ ] Encryption in transit (TLS 1.3)
- [ ] Access tokens stored with encryption
- [ ] PCI DSS compliance for payment data

**Access Control:**
- [ ] Role-based access control (RBAC)
- [ ] Principle of least privilege
- [ ] Audit logs for all sensitive actions
- [ ] IP whitelisting for admin access

### 9.2 Privacy Compliance

**GDPR Compliance:**
- [ ] Data processing agreements with creators/founders
- [ ] Right to access: Users can download their data
- [ ] Right to deletion: Users can request account deletion
- [ ] Cookie consent banner
- [ ] Privacy policy reviewed by legal

**CCPA Compliance:**
- [ ] "Do Not Sell My Personal Information" opt-out
- [ ] Data inventory documentation
- [ ] Vendor data processing agreements

---

## 10. Testing Strategy

### 10.1 Test Coverage Requirements

| Test Type | Coverage Target | Priority |
|-----------|----------------|----------|
| Unit Tests | 80%+ | P0 |
| Integration Tests | 70%+ | P0 |
| E2E Tests | Critical paths | P0 |
| API Tests | 100% endpoints | P0 |
| Performance Tests | Load testing | P1 |

### 10.2 Critical Test Scenarios

**Payment Flow Testing:**
- [ ] Phase 1 payout triggers correctly on approval
- [ ] Phase 2 settlement calculates accurately
- [ ] Refunds process without errors
- [ ] Stripe webhook handling (simulate all events)
- [ ] Edge case: Zero views achieved
- [ ] Edge case: Maximum views exceeded

**API Integration Testing:**
- [ ] TikTok API: Token refresh, rate limiting
- [ ] Meta API: Data fetching, error handling
- [ ] View count polling accuracy
- [ ] API downtime resilience

**User Journey Testing:**
- [ ] Creator onboarding end-to-end
- [ ] Founder campaign creation end-to-end
- [ ] Content review and approval flow
- [ ] Payout request and processing

---

## 11. Launch Plan

### 11.1 Phased Rollout

**Phase 1: Closed Beta (Weeks 1-4)**
- Invite 10 handpicked creators
- Invite 5 pilot founder clients
- Goal: Complete 20 campaigns
- Focus: Bug identification, UX feedback

**Phase 2: Open Beta (Weeks 5-8)**
- Open creator applications (manual approval)
- Accept all founder signups
- Goal: Complete 50 campaigns
- Focus: Scalability, payment accuracy

**Phase 3: Public Launch (Week 9+)**
- Full public launch
- Marketing campaign
- Goal: 100+ campaigns/month
- Focus: Growth, retention

### 11.2 Success Criteria for Each Phase

**Phase 1 Exit Criteria:**
- [ ] Zero critical bugs
- [ ] 4.0+ average rating from testers
- [ ] 100% payment accuracy
- [ ] All API integrations stable

**Phase 2 Exit Criteria:**
- [ ] 50+ completed campaigns
- [ ] <5% support ticket rate
- [ ] 99.5%+ uptime
- [ ] Positive unit economics

---

## 12. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| TikTok API instability | High | Critical | Implement aggressive caching, manual override tools |
| Payment processing failures | Medium | Critical | Automatic retries, manual payment queue, 24/7 monitoring |
| Creator fraud (fake views) | Medium | High | Cross-reference multiple data sources, manual audits |
| Founder chargebacks | Low | Medium | Clear terms, evidence collection, Stripe Radar |
| Regulatory compliance issues | Low | High | Legal review, compliance monitoring, insurance |
| Platform dependencies | High | High | Diversify platforms, build API fallbacks |

---

## 13. Appendix

### 13.1 Glossary

- **Base Fee**: Guaranteed payment to creator per video
- **Performance Budget**: Funds allocated for view-based bonuses
- **Escrow**: Held funds in platform account
- **7-Day Lock**: Final view count measurement point
- **Markup**: Nala's revenue per 1,000 views ($1.00)

### 13.2 Open Questions

1. How to handle content that violates platform guidelines after posting?
2. Should we support campaigns with multiple creators?
3. What happens if a creator's account is banned mid-campaign?
4. How to handle view count discrepancies between platforms?

### 13.3 Future Enhancements (Post-MVP)

- Campaign templates for common use cases
- AI-powered brief generator
- Creator matching algorithm (automatic)
- White-label solution for agencies
- Advanced analytics (competitor benchmarking)
- Mobile apps (iOS/Android)
