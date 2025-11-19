# Nala Platform - Implementation Rules & Constraints

## Document Purpose
This document extracts all critical constraints, requirements, flows, edge cases, logic, and behaviors from prd.md and userflow.md. These rules govern all development decisions and must be validated before any code is written or modified.

---

## 1. FINANCIAL RULES & PAYMENT LOGIC

### 1.1 Pricing Structure (IMMUTABLE)
```
CREATOR_RATE = $4.00 per 1,000 views
NALA_MARKUP = $1.00 per 1,000 views
FOUNDER_RATE = $5.00 per 1,000 views (Creator Rate + Nala Markup)
```

### 1.2 Base Fee Rules
- **Range**: $50 - $500 per video
- **Default Suggestion**: $75 - $150
- **Platform Specific**: Creators can set different rates for TikTok, Instagram, Facebook
- **Payment Timing**: Paid immediately upon Founder approval (Phase 1)
- **Retention**: 100% to creator (no Nala commission on base fee)
- **Non-Refundable**: Once approved, cannot be reversed

### 1.3 Campaign Budget Rules
- **Minimum Campaign Budget**: $500
- **Maximum Campaign Budget**: $50,000
- **Budget Modification**: Can only INCREASE during active campaign, never decrease
- **Budget Composition**: Total Budget = Base Fee Budget + Performance Budget
- **Escrow Requirement**: Full budget must be in escrow before campaign starts

### 1.4 Settlement Calculation (CRITICAL)
```javascript
// For each video at 7-day lock:
viewsInThousands = locked_view_count / 1000

creatorPerformanceBonus = viewsInThousands × 4.00
nalaRevenue = viewsInThousands × 1.00
totalPerformanceCost = viewsInThousands × 5.00

remainingBudget = campaign.performance_budget - totalPerformanceCost
founderRefund = Math.max(0, remainingBudget)

// VALIDATION: Must always be true
totalPerformanceCost + founderRefund = campaign.performance_budget
```

### 1.5 Accounting Integrity Rules
- **Golden Rule**: `Funds In = Funds Out` (always balance to zero)
- **Campaign Level**: `Base Fees + Performance Costs + Nala Revenue + Founder Refund = Original Budget`
- **No Fund Leakage**: Every cent must be accounted for in database
- **Atomic Transactions**: All payment operations must be transactional (all or nothing)
- **Idempotency**: All Stripe API calls must use idempotency keys: `{campaign_id}_{video_id}_{payment_type}_{timestamp}`

### 1.6 Payment Phases (SEQUENCE CRITICAL)

**Phase 1: Base Fee Payment**
- **Trigger**: Founder clicks "Approve" on content
- **Timing**: Within 2 minutes of approval
- **Amount**: Creator's base fee for that video
- **Validation**: Must verify escrow has sufficient funds BEFORE transfer
- **Failure Handling**: If fails, mark payment as pending, retry automatically every hour for 24 hours

**Phase 2: Performance Settlement**
- **Trigger**: 168 hours (7 days) after post.posted_at
- **Timing**: Executes via daily cron at 12:05 AM EST
- **Lock View Count**: Final view count becomes immutable
- **Actions** (in order):
  1. Lock view count in database
  2. Calculate settlement breakdown
  3. Transfer performance bonus to creator
  4. Record Nala revenue (stays in platform account)
  5. Refund unspent budget to founder
  6. Generate and store license
  7. Send notifications to all parties
  8. Mark campaign as completed (if all videos locked)

### 1.7 Refund Rules
- **Automatic Refunds**: Processed automatically for unspent performance budget
- **Timing**: 5-7 business days (Stripe standard)
- **Partial Refunds**: Each video settles independently
- **Campaign Cancellation**:
  - Before any approvals: Full refund
  - After approvals: Refund = Total Budget - Approved Base Fees - Performance Costs Incurred
- **Disputed Refunds**: Require admin review and manual processing

### 1.8 Payout Options (Creator)
- **Instant Payout**:
  - Available balance → bank account in < 1 hour
  - Fee: $0.50 per transaction
  - Minimum: $20
- **Standard Payout**:
  - 2-3 business days
  - Fee: Free
  - Minimum: $20
- **Tax Reporting**: Automatic 1099 generation for US creators earning $600+

---

## 2. TIME-BASED RULES

### 2.1 Critical Timestamps
- **7-Day Performance Window**: Exactly 168 hours from `video.posted_at`
- **Lock Tolerance**: ±5 minutes is acceptable
- **View Update Frequency**: Daily at 12:00 AM EST
- **Token Refresh**:
  - TikTok: Access token valid 24 hours, refresh token 365 days
  - Meta: Long-lived token 60 days
- **Session Expiry**: JWT access token 24 hours, refresh token 30 days

### 2.2 Deadline Rules
- **Content Submission**: Default 48 hours for revisions
- **Campaign Start Date**: Minimum 5 days from campaign creation
- **Posting Schedule**: 24-hour grace period for posting violations
- **Email Verification**: Token expires after 24 hours
- **Password Reset**: Token expires after 1 hour

### 2.3 Notification Timing
- **Immediate** (< 1 minute):
  - Payment confirmations
  - Content approval/rejection
  - Revision requests
- **Daily Digest** (12:00 PM EST):
  - Upcoming deadlines
  - Performance updates
- **Real-Time** (< 5 minutes):
  - Balance updates
  - Campaign status changes
  - 7-day lock completions

---

## 3. SOCIAL MEDIA INTEGRATION RULES

### 3.1 TikTok API Rules
- **Minimum Followers**: 10,000 (hard requirement)
- **OAuth Scopes**: `user.info.basic`, `video.list`, `video.insights`
- **Rate Limits**:
  - 1,000 requests per day per user
  - 100 requests per minute (burst)
- **Error Handling**: Exponential backoff on 429 errors (1min, 5min, 15min)
- **Token Refresh**: Automatic when access token expires
- **Data Caching**: Cache view counts for 23 hours (fallback during API outage)
- **View Metric**: Use `view_count` field from `/v2/video/query/`

### 3.2 Meta API Rules
- **Instagram Requirements**:
  - Minimum 5,000 followers
  - MUST be Business or Creator account (not personal)
  - Connected to Facebook Page
- **Facebook Requirements**:
  - Minimum 5,000 followers
- **OAuth Scopes**: `instagram_basic`, `instagram_manage_insights`, `pages_read_engagement`
- **View Metrics**:
  - Instagram Reels: Use `plays` metric
  - Facebook Reels: Use `post_video_views` metric
- **Data Normalization**: Map all platform metrics to standard "views" field
- **Pagination**: Handle pagination for creators with 100+ posts
- **Business Account Guide**: Must provide UI guidance for converting personal → business

### 3.3 API Health & Reliability
- **Circuit Breaker**: Open after 5 consecutive failures
- **Retry Logic**: 3 attempts with exponential backoff (2s, 4s, 8s)
- **Fallback Strategy**: Use cached data if API unavailable
- **Alert Threshold**: Alert ops team if >10% of view polling requests fail
- **Manual Override**: Admin can manually input view counts if API persistently fails

### 3.4 View Count Discrepancy Handling
- **Tolerance**: ±2% variance between API and platform analytics is acceptable
- **Dispute Process**: If >5% variance, flag for manual review
- **Creator Evidence**: Allow screenshot submission for verification
- **Final Authority**: Admin decision is final in disputes

---

## 4. CONTENT & WORKFLOW RULES

### 4.1 Content Review Rules
- **Approval States**: `pending` → `draft_submitted` → `in_review` → `approved` OR `revision_requested`
- **Revision Limit**: Maximum 2 revisions per video
- **Revision Deadline**: Default 48 hours, customizable by founder
- **Rejection Conditions**: Only for severe violations (requires admin review)
- **Partial Payment on Rejection**: May still require partial base fee (admin decision)
- **Approval is Final**: Cannot unapprove once approved (triggers payment)

### 4.2 Video Requirements
- **File Formats**: MP4, MOV
- **Max File Size**: 500MB per video
- **Transcoding**: All videos transcoded to H.264, 720p for web preview
- **Storage**: AWS S3 with encryption at rest
- **Retention**: Videos stored indefinitely (included in license)
- **Download**: Founders can download approved videos anytime

### 4.3 Posting Schedule Verification (T-307)
- **Compliance Check**: Daily cron compares `actual_posted_at` vs. `expected_posted_at`
- **Grace Period**: 24 hours late = Warning
- **Violations**:
  - Minor (24-48 hours late): Warning notification
  - Major (48+ hours late): Flag for admin review
  - Severe (missed entirely): Pause campaign, require founder approval
- **Admin Override**: Admin can approve variances

### 4.4 Brief Requirements
- **Minimum Fields**:
  - Campaign name
  - Product description
  - Target audience
  - Number of videos
  - Video length
  - Platforms
  - At least 1 talking point
  - Budget
- **Optional Fields**:
  - Brand guidelines (PDF)
  - Do's and Don'ts
  - Required hashtags
  - Reference videos
  - Specific posting times
- **Auto-Save**: Every 30 seconds during creation
- **Draft Status**: Can save incomplete briefs as drafts

---

## 5. USER AUTHENTICATION & AUTHORIZATION

### 5.1 Password Requirements
- Minimum 8 characters
- At least 1 number
- At least 1 special character
- Hashed with bcrypt (cost factor 12)
- No password reuse (last 5 passwords)

### 5.2 Role-Based Access Control
```
Roles:
- founder: Can create campaigns, review content, view performance
- creator: Can submit content, track earnings, request payouts
- admin: Full platform access, dispute resolution, manual overrides

Permission Matrix:
| Action                  | Founder | Creator | Admin |
|------------------------|---------|---------|-------|
| Create Campaign        | ✓       | ✗       | ✓     |
| Submit Content         | ✗       | ✓       | ✓     |
| Approve Content        | ✓       | ✗       | ✓     |
| Request Payout         | ✗       | ✓       | ✓     |
| View All Users         | ✗       | ✗       | ✓     |
| Manual Payment Override| ✗       | ✗       | ✓     |
| Access Analytics       | Own     | Own     | All   |
```

### 5.3 Security Requirements
- **Rate Limiting**: 100 requests per minute per IP
- **2FA**: Optional for founders/creators, MANDATORY for admins
- **Session Management**: Invalidate on password change
- **IP Whitelisting**: Admin access only from approved IPs
- **Audit Logging**: All sensitive actions logged with timestamp, user, IP
- **Data Encryption**: AES-256 for PII at rest, TLS 1.3 in transit

---

## 6. DATA VALIDATION & CONSTRAINTS

### 6.1 Database Constraints
```sql
-- Users
email: UNIQUE, NOT NULL, valid email format
role: CHECK (role IN ('founder', 'creator', 'admin'))

-- Campaigns
total_budget: >= 500, <= 50000
videos_requested: >= 1, <= 10
status: CHECK (status IN ('draft', 'pending_creator', 'in_progress', 'in_review', 'active', 'completed', 'cancelled'))

-- Videos
status: CHECK (status IN ('pending', 'draft_submitted', 'in_review', 'revision_requested', 'approved', 'posted', 'locked'))
platform: CHECK (platform IN ('tiktok', 'instagram', 'facebook'))

-- Creator Profiles
base_fee_tiktok: >= 50, <= 500
base_fee_instagram: >= 50, <= 500
base_fee_facebook: >= 50, <= 500

-- Social Accounts
platform: CHECK (platform IN ('tiktok', 'instagram', 'facebook'))
UNIQUE(creator_id, platform) -- One account per platform per creator
```

### 6.2 Input Validation Rules
- **Email**: RFC 5322 compliant
- **URLs**: Must be valid HTTPS URLs
- **Phone**: E.164 format (if collected)
- **Currency**: Always stored as DECIMAL(10,2), never FLOAT
- **Timestamps**: Always UTC in database, convert to user timezone in UI
- **Text Fields**: Sanitize to prevent XSS (escape HTML entities)
- **File Uploads**: Validate MIME type, not just extension

### 6.3 Business Logic Validations
- **Campaign Creation**: Cannot create campaign without payment method
- **Content Approval**: Cannot approve without sufficient escrow balance
- **Payout Request**: Cannot exceed available balance
- **Posting**: Cannot submit post URL before expected posting date
- **Budget Increase**: Cannot decrease budget once campaign started

---

## 7. NOTIFICATION & COMMUNICATION RULES

### 7.1 Email Triggers (MUST SEND)
| Event                          | Recipient | Timing    |
|--------------------------------|-----------|-----------|
| Account registration           | User      | Immediate |
| Email verification             | User      | Immediate |
| Campaign created               | Founder   | Immediate |
| Brief assigned to creator      | Creator   | Immediate |
| Content submitted for review   | Founder   | Immediate |
| Content approved               | Creator   | Immediate |
| Revision requested             | Creator   | Immediate |
| Payment sent (base fee)        | Creator   | Immediate |
| Payment sent (performance)     | Creator   | Immediate |
| Refund processed               | Founder   | Immediate |
| Campaign completed             | Both      | Immediate |
| 7-day lock completed           | Both      | Immediate |
| Deadline approaching (24h)     | Creator   | Daily     |
| Posting schedule violation     | Both      | Immediate |

### 7.2 In-App Notifications
- **Real-Time**: Use WebSockets or Server-Sent Events for live updates
- **Notification Center**: Store all notifications in database for history
- **Read Status**: Track read/unread state
- **Dismissal**: Allow users to dismiss non-critical notifications
- **Badge Count**: Show unread count on notification icon

### 7.3 Email Templates (HTML + Plain Text)
- **Branding**: All emails use Nala branding
- **Unsubscribe**: Include unsubscribe link (except transactional)
- **Support Link**: Include "Contact Support" in footer
- **Mobile Optimized**: Responsive email templates
- **Deliverability**: Use established email service (SendGrid, AWS SES)

---

## 8. ERROR HANDLING & EDGE CASES

### 8.1 Payment Failure Handling
```javascript
// Phase 1 Payment Failure
IF stripe_transfer_fails:
  - Mark payment as 'pending'
  - Retry every hour for 24 hours
  - IF still failing after 24 hours:
    - Alert admin
    - Add to manual payment queue
    - Notify founder of delay
    - DO NOT block creator from other activities

// Phase 2 Settlement Failure
IF stripe_refund_fails:
  - Log failure
  - Queue for retry (every 6 hours for 7 days)
  - Alert finance team after 24 hours
  - DO NOT mark campaign as completed until refund succeeds
```

### 8.2 API Integration Edge Cases
```javascript
// Zero Views Achieved
IF locked_view_count === 0:
  - Creator still gets base fee
  - Performance bonus = $0
  - Nala revenue = $0
  - Full performance budget refunded to founder
  - Generate license (founder still owns content)

// Views Exceed Maximum Purchasable
IF locked_view_count > max_purchasable_views:
  - Cap payment at max_purchasable_views
  - Creator gets: max_purchasable_views × $4/1k
  - Nala gets: max_purchasable_views × $1/1k
  - Founder pays: max_purchasable_views × $5/1k (no refund)
  - Log overperformance for analytics

// API Unavailable at Lock Time
IF api_request_fails_at_lock:
  - Use last known view count (from last successful poll)
  - Flag video for manual review
  - Send alert to admin
  - Proceed with settlement using last known count
  - Allow admin to adjust if creator provides evidence

// Creator Account Banned Mid-Campaign
IF creator_platform_account_banned:
  - Pause campaign
  - Notify founder
  - Offer: (1) Wait for appeal, (2) Cancel with partial refund
  - IF cancelled: Refund = Total Budget - Completed Videos Cost
```

### 8.3 Dispute Scenarios
```javascript
// View Count Dispute
IF founder_contests_view_count:
  - Admin reviews evidence (API logs, screenshots)
  - IF variance > 5%:
    - Request additional verification
    - May manually adjust count
  - IF variance < 5%:
    - Uphold original count
  - Decision is FINAL

// Content Quality Dispute
IF founder_rejects_after_approval:
  - Payment already sent (cannot be reversed)
  - Founder can request new video (additional cost)
  - Admin mediates if needed
  - Use revision process properly to avoid this

// Late Posting Dispute
IF creator_posts_late:
  - Check grace period (24 hours)
  - IF within grace: No penalty
  - IF major violation: Admin may reduce payment or cancel
```

---

## 9. PERFORMANCE & SCALABILITY RULES

### 9.1 Response Time Requirements
- **API Endpoints**: < 200ms average
- **Dashboard Load**: < 2 seconds
- **Video Upload**: Progress indicator required
- **Search/Filter**: < 500ms
- **Payment Processing**: < 2 minutes (Phase 1), < 24 hours (Phase 2)

### 9.2 Database Performance
- **Connection Pooling**: Min 5, Max 20 connections
- **Query Timeout**: 30 seconds maximum
- **Indexes Required**:
  - users(email) - UNIQUE
  - campaigns(founder_id, status)
  - videos(campaign_id, status)
  - videos(posted_at) - for 7-day lock queries
  - view_snapshots(video_id, snapshot_at)
  - payments(campaign_id, type, status)
- **Pagination**: Default 20 items, max 100 items per page

### 9.3 Caching Strategy
- **User Sessions**: Redis, TTL 24 hours
- **API Responses**: Cache view counts for 23 hours
- **Static Assets**: CDN with 30-day cache
- **Database Queries**: Cache frequently accessed data (creator profiles, campaign briefs)

### 9.4 Job Queue Performance
- **Concurrent Workers**: 3-5 workers for view polling
- **Job Timeout**: 5 minutes per job
- **Retry Strategy**: 3 attempts, exponential backoff
- **Throughput Target**: Process 1,000 active posts in < 10 minutes

---

## 10. COMPLIANCE & LEGAL RULES

### 10.1 Content License Terms (MUST INCLUDE)
- **Grant**: Perpetual, worldwide, non-exclusive
- **Permitted Uses**: Marketing, advertising, website, social media, paid ads
- **Attribution**: Optional (founder's choice)
- **Modifications**: Founder may edit, crop, add overlays, subtitle
- **Exclusions**: Cannot resell license to third parties
- **Creator Warranty**: Content is original, no copyright infringement
- **Trigger**: License generates automatically on Phase 2 payment completion

### 10.2 GDPR Requirements
- **Data Export**: Users can request full data export (JSON format)
- **Right to Deletion**:
  - Soft delete user accounts
  - Anonymize in payment records (cannot fully delete due to financial regulations)
  - Delete uploaded content from S3
- **Cookie Consent**: Required for EU users
- **Privacy Policy**: Link on every page, last updated date visible
- **Data Processing Agreements**: Store for all creators and founders

### 10.3 PCI Compliance
- **Never Store**: Raw card numbers, CVV codes
- **Use Stripe Elements**: For all card input (SAQ-A compliant)
- **Tokenization**: Only store Stripe customer IDs and payment method IDs
- **SCA**: Strong Customer Authentication for EU cards
- **Audit Trail**: Log all payment-related actions

### 10.4 Tax Compliance
- **1099 Generation**: Automatic for US creators earning $600+
- **Threshold Tracking**: Monitor creator earnings throughout year
- **Form Delivery**: Email + in-app download by January 31st
- **Storage**: Retain tax forms for 7 years
- **International**: Collect W-8BEN for non-US creators (future)

---

## 11. ADMIN TOOLS & OVERRIDES

### 11.1 Manual Interventions Allowed
- **Payment Retry**: Admin can manually trigger failed payment retry
- **View Count Override**: Admin can manually set view count (with audit log)
- **Campaign Cancellation**: Admin can cancel campaign with custom refund amount
- **User Suspension**: Admin can suspend accounts (freeze activity)
- **Verification Override**: Admin can manually verify creators
- **Deadline Extension**: Admin can extend content submission deadlines
- **Dispute Resolution**: Admin can adjust settlements in disputes

### 11.2 Admin Alerts (MUST TRIGGER)
- **Payment failure** after 3 automatic retries
- **API downtime** >10% failure rate
- **Balance mismatch** > $10 in daily reconciliation
- **High-value transaction** > $10,000
- **Fraud detection** Stripe Radar flags
- **Chargeback** received
- **Platform error rate** > 1% of requests

### 11.3 Financial Reconciliation (DAILY)
```javascript
// Run at 1:00 AM EST daily
reconciliation_check:
  stripe_balance = fetch_stripe_balance()
  database_balance = sum(escrow_balances) + pending_payouts

  IF abs(stripe_balance - database_balance) > 10:
    - Send urgent alert to finance team
    - Lock new campaign creation until resolved
    - Generate detailed discrepancy report
```

---

## 12. UI/UX CONSISTENCY RULES

### 12.1 Design Patterns
- **Loading States**: Show skeleton loaders, never blank screens
- **Error States**: User-friendly messages, include support contact
- **Empty States**: Provide guidance on next action
- **Success Feedback**: Green checkmark + confirmation message
- **Destructive Actions**: Require confirmation modal (red button)
- **Optimistic Updates**: Update UI immediately, rollback if fails

### 12.2 Accessibility (WCAG 2.1 AA)
- **Color Contrast**: Minimum 4.5:1 for normal text
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader**: Proper ARIA labels on all components
- **Focus Indicators**: Visible focus states
- **Alt Text**: All images have descriptive alt text
- **Form Labels**: All inputs have associated labels

### 12.3 Mobile-First Rules
- **Responsive Breakpoints**:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- **Touch Targets**: Minimum 44x44px
- **Navigation**: Hamburger menu on mobile
- **Tables**: Horizontal scroll or card layout on mobile
- **Forms**: Stack vertically on mobile

---

## 13. TESTING REQUIREMENTS

### 13.1 Test Coverage Minimums
- **Unit Tests**: 80% code coverage
- **Integration Tests**: 70% coverage
- **E2E Tests**: All critical user journeys
- **Payment Tests**: 100% coverage of payment logic

### 13.2 Critical Test Scenarios (MUST PASS)
```javascript
Payment Flow Tests:
- Base fee payment triggers correctly on approval
- Performance bonus calculates correctly
- Refund amount is accurate
- Settlement always balances (funds in = funds out)
- Zero views scenario handled correctly
- Maximum views exceeded handled correctly
- Payment failures retry correctly
- Idempotency prevents duplicate payments

API Integration Tests:
- TikTok OAuth flow completes successfully
- Meta OAuth flow completes successfully
- View count polling fetches accurate data
- Token refresh works automatically
- API failures trigger fallback to cached data
- Rate limits are respected

User Journey Tests:
- Creator can complete onboarding end-to-end
- Founder can create and fund campaign
- Content review and approval flow works
- 7-day lock and settlement execute correctly
- Payout requests process successfully
```

### 13.3 Staging Environment Rules
- **Mirror Production**: Same architecture, scaled down
- **Stripe Test Mode**: Use Stripe test keys
- **Test Social Accounts**: Create test TikTok/IG accounts
- **Seed Data**: Pre-populate with test campaigns
- **No Real Money**: Never process real payments in staging

---

## 14. DEPLOYMENT & OPERATIONS RULES

### 14.1 Deployment Process
- **Zero Downtime**: Use blue-green or rolling deployment
- **Database Migrations**: Run migrations before code deployment
- **Rollback Plan**: Can rollback to previous version within 5 minutes
- **Health Checks**: Deployment pauses if health check fails
- **Smoke Tests**: Run after deployment to verify critical paths

### 14.2 Monitoring Requirements
- **Uptime**: 99.9% target (43.2 minutes downtime per month max)
- **Error Rate**: < 1% of requests
- **API Response Time**: P95 < 500ms
- **Database Queries**: P95 < 100ms
- **Job Queue**: No jobs delayed > 10 minutes

### 14.3 Backup & Recovery
- **Database Backups**:
  - Automated daily backups
  - Retain for 30 days
  - Test restore monthly
- **S3 Backups**:
  - Versioning enabled
  - Cross-region replication
- **RTO**: Recovery Time Objective < 4 hours
- **RPO**: Recovery Point Objective < 1 hour (max data loss)

---

## 15. CRITICAL SUCCESS CRITERIA

### 15.1 Launch Readiness Checklist
```
BLOCKERS (P0 - Must be 100% complete):
☐ All payment flows tested and working
☐ TikTok API integration functional
☐ Meta API integration functional
☐ 7-day settlement logic verified
☐ Stripe Connect onboarding works
☐ Database schema finalized
☐ Security audit passed
☐ Legal documents approved (Terms, Privacy, License)
☐ Email delivery configured
☐ Production environment configured
☐ Monitoring and alerting active

HIGH PRIORITY (P1 - Should be complete):
☐ Creator onboarding flow polished
☐ Founder campaign creation flow polished
☐ Content review tool functional
☐ Performance dashboard working
☐ Mobile responsiveness complete
☐ Error handling comprehensive

MEDIUM PRIORITY (P2 - Nice to have):
☐ Advanced analytics
☐ Campaign templates
☐ In-app chat support
```

### 15.2 Beta Launch Criteria
- 10 verified creators with connected social accounts
- 5 pilot founder campaigns completed successfully
- Zero critical payment processing errors
- All API integrations stable for 7+ days
- Average page load time < 2 seconds
- 4.0+ average rating from beta testers

---

## RULE CHANGE PROTOCOL

**IMPORTANT**: These rules are derived directly from prd.md and userflow.md.

**Before changing any rule:**
1. Verify change doesn't contradict PRD requirements
2. Update this document with justification
3. Update TODO.md if tasks are affected
4. Document in commit message
5. Notify team of business logic changes

**If conflict arises:**
- PRD supersedes rules.md
- userflow.md provides detailed implementation guidance
- rules.md interprets and consolidates both

---

**Document Version**: 1.0
**Last Updated**: 2025-11-19
**Status**: Active - Governs all development
