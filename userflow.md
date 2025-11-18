# Nala Platform - Detailed User Flows

## Table of Contents
1. [Creator Onboarding Flow](#1-creator-onboarding-flow)
2. [Founder Campaign Creation Flow](#2-founder-campaign-creation-flow)
3. [Content Creation & Review Flow](#3-content-creation--review-flow)
4. [Payment Processing Flow](#4-payment-processing-flow)
5. [Performance Tracking Flow](#5-performance-tracking-flow)
6. [Dispute Resolution Flow](#6-dispute-resolution-flow)

---

## 1. Creator Onboarding Flow

### 1.1 Account Registration

**Entry Point:** Landing page → "Sign Up as Creator" button

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Basic Information                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Creator enters:                                             │
│  • Full Name                                                │
│  • Email Address                                            │
│  • Password (8+ chars, 1 number, 1 special)                │
│  • Confirm Password                                         │
│                                                             │
│ [Checkbox] I agree to Terms of Service & Privacy Policy    │
│                                                             │
│ [Continue →]                                                │
│                                                             │
│ System Actions:                                             │
│  1. Validate email format and uniqueness                    │
│  2. Hash password (bcrypt)                                  │
│  3. Create user record (role: 'creator')                    │
│  4. Send verification email                                 │
│  5. Create empty creator_profile record                     │
│  6. Generate session token                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Email Verification                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Screen: "Check your email"                                  │
│  📧 We sent a verification link to mary@email.com          │
│                                                             │
│ Creator clicks link in email →                              │
│                                                             │
│ System Actions:                                             │
│  1. Verify token from email link                            │
│  2. Update user.email_verified = true                       │
│  3. Redirect to platform onboarding                         │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Social Media Account Connection

**Critical Path:** This determines creator eligibility

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Connect Your Platforms                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "Connect your social accounts to start earning"             │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 🎵 TikTok         [Connect Account]   Not Connected │   │
│ │    Minimum: 10,000 followers                        │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 📸 Instagram      [Connect Account]   Not Connected │   │
│ │    Minimum: 5,000 followers                         │   │
│ │    ⚠️ Requires Business Account                     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 👍 Facebook       [Connect Account]   Not Connected │   │
│ │    Minimum: 5,000 followers                         │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Note: Connect at least one platform to continue            │
│                                                             │
│ [Skip for now]  [Continue]  ← Disabled until 1 connected   │
└─────────────────────────────────────────────────────────────┘
```

#### 1.2.1 TikTok Connection Sub-Flow

```
Creator clicks "Connect Account" on TikTok
                ↓
┌─────────────────────────────────────────────────────────────┐
│ POPUP: TikTok OAuth                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ System Actions:                                             │
│  1. Generate OAuth state token (CSRF protection)            │
│  2. Redirect to TikTok Login Kit:                           │
│     https://www.tiktok.com/auth/authorize/                  │
│     ?client_key={CLIENT_KEY}                                │
│     &scope=user.info.basic,video.list,video.insights        │
│     &response_type=code                                     │
│     &redirect_uri={CALLBACK_URL}                            │
│     &state={STATE_TOKEN}                                    │
│                                                             │
│ Creator sees TikTok login screen →                          │
│  • Logs into TikTok (if not already)                        │
│  • Reviews permissions request                              │
│  • Clicks "Authorize"                                       │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ CALLBACK: TikTok Returns to Nala                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ System Actions:                                             │
│  1. Receive authorization code                              │
│  2. Verify state token (prevent CSRF)                       │
│  3. Exchange code for access token:                         │
│     POST https://open-api.tiktok.com/oauth/access_token/    │
│  4. Fetch user profile:                                     │
│     GET /v2/user/info/                                      │
│  5. Extract: username, follower_count, user_id              │
│                                                             │
│  6. Validate eligibility:                                   │
│     IF follower_count < 10,000:                             │
│       ❌ Show error: "Minimum 10K followers required"       │
│       STOP                                                  │
│                                                             │
│  7. Store in database:                                      │
│     INSERT INTO social_accounts (                           │
│       creator_id, platform, platform_user_id,               │
│       username, follower_count,                             │
│       access_token [ENCRYPTED], refresh_token [ENCRYPTED],  │
│       token_expires_at, verified_at                         │
│     )                                                       │
│                                                             │
│  8. Update creator_profile.verification_status = 'verified' │
│  9. Show success message                                    │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ SUCCESS SCREEN                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ✅ TikTok Connected Successfully!                           │
│                                                             │
│ @marythcreator                                              │
│ 47,234 followers                                            │
│                                                             │
│ [Connect Another Platform]  [Continue →]                    │
└─────────────────────────────────────────────────────────────┘
```

#### 1.2.2 Instagram Connection Sub-Flow

**Note:** More complex due to Business Account requirement

```
Creator clicks "Connect Account" on Instagram
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Check Account Type                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "Do you have an Instagram Business or Creator Account?"     │
│                                                             │
│ [Yes, I have a Business Account] → Continue to OAuth        │
│ [No, I have a Personal Account] → Show conversion guide     │
│                                                             │
│ IF "No" selected:                                           │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ ℹ️  How to Convert to Business Account:            │   │
│ │                                                     │   │
│ │ 1. Open Instagram app                              │   │
│ │ 2. Go to Settings → Account                        │   │
│ │ 3. Select "Switch to Professional Account"         │   │
│ │ 4. Choose "Business"                               │   │
│ │ 5. Connect to Facebook Page                        │   │
│ │                                                     │   │
│ │ [Watch Video Tutorial]  [I've Converted]           │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Facebook Login (Required for Instagram)             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ System Actions:                                             │
│  1. Redirect to Facebook OAuth:                             │
│     https://www.facebook.com/v18.0/dialog/oauth             │
│     ?client_id={APP_ID}                                     │
│     &redirect_uri={CALLBACK}                                │
│     &scope=instagram_basic,instagram_manage_insights,       │
│             pages_read_engagement                           │
│                                                             │
│ Creator:                                                    │
│  • Logs into Facebook                                       │
│  • Selects connected Instagram Business Account            │
│  • Grants permissions                                       │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Fetch Instagram Data                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ System Actions:                                             │
│  1. Exchange code for access token                          │
│  2. Get Instagram Business Account ID:                      │
│     GET /{facebook-page-id}?fields=instagram_business_accou │
│     nt                                                      │
│  3. Get Instagram profile data:                             │
│     GET /{ig-user-id}?fields=username,followers_count       │
│                                                             │
│  4. Validate:                                               │
│     IF followers_count < 5,000:                             │
│       ❌ Error: "Minimum 5K followers required"             │
│     IF account_type != 'BUSINESS':                          │
│       ❌ Error: "Business account required"                 │
│                                                             │
│  5. Store data (same as TikTok flow)                        │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Profile Setup

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Set Your Rates                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "How much do you charge per video?"                         │
│                                                             │
│ TikTok Base Fee:                                            │
│ [$75] ◄────●────────────────► [$500]                       │
│  $50                                  Max                   │
│                                                             │
│ 💡 Most creators charge: $75-$150                           │
│ 📊 Your potential earnings for 100K views:                  │
│     Base Fee: $75 + Performance: $400 = $475 total          │
│                                                             │
│ Instagram Base Fee:                                         │
│ [$75] ◄────●────────────────► [$500]                       │
│                                                             │
│ Facebook Base Fee:                                          │
│ [$75] ◄────●────────────────► [$500]                       │
│                                                             │
│ [Continue →]                                                │
│                                                             │
│ System Actions:                                             │
│  • Update creator_profile with base fees                    │
│  • Calculate average fee for matching algorithm             │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Build Your Portfolio                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "Upload 3-10 sample videos to showcase your style"          │
│                                                             │
│ [Drag & Drop Videos Here]                                   │
│  or [Browse Files]                                          │
│                                                             │
│ Uploaded (2/10):                                            │
│ ┌─────────┐  ┌─────────┐                                   │
│ │ [Video] │  │ [Video] │  [+ Add More]                     │
│ │  30s    │  │  45s    │                                   │
│ └─────────┘  └─────────┘                                   │
│                                                             │
│ For each video:                                             │
│  • Title: [Product Review - SaaS Tool]                      │
│  • Platform: [TikTok ▼]                                     │
│                                                             │
│ [Skip for now]  [Continue →]                                │
│                                                             │
│ System Actions:                                             │
│  1. Upload to S3 (max 500MB per video)                      │
│  2. Generate thumbnail (frame at 2s)                        │
│  3. Transcode to web format (H.264, 720p)                   │
│  4. Store metadata in creator_profile.portfolio_videos      │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Category & Bio                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ What niches do you specialize in? (Select all that apply)   │
│                                                             │
│ ☑ SaaS & Software    ☐ E-commerce     ☐ Health & Fitness   │
│ ☑ B2B Tech           ☐ Beauty         ☐ Food & Beverage    │
│ ☐ Finance            ☐ Fashion        ☐ Gaming             │
│                                                             │
│ Tell brands about yourself: (500 char max)                  │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Hi! I'm Mary, a tech enthusiast who creates          │   │
│ │ engaging video reviews for SaaS products. My         │   │
│ │ audience loves honest, detailed breakdowns...        │   │
│ │                                                      │   │
│ │ 347/500 characters                                   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ [Back]  [Complete Setup →]                                  │
│                                                             │
│ System Actions:                                             │
│  • Update creator_profile.categories                        │
│  • Update creator_profile.bio                               │
│  • Set profile_completed = true                             │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Payment Setup (Stripe Connect)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "Last step: Set up payouts"                                 │
│                                                             │
│ Nala uses Stripe to send you payments securely.             │
│                                                             │
│ [Connect Stripe Account]                                    │
│                                                             │
│ System Actions:                                             │
│  1. Create Stripe Connect Express account link:             │
│     POST /v1/account_links                                  │
│     type: 'account_onboarding'                              │
│  2. Redirect creator to Stripe hosted onboarding            │
│                                                             │
│ Creator completes on Stripe:                                │
│  • Personal information (name, DOB, SSN)                    │
│  • Business details (if applicable)                         │
│  • Bank account for deposits                                │
│  • Identity verification (photo ID)                         │
│                                                             │
│ Stripe redirects back to Nala with account_id               │
│                                                             │
│ System Actions:                                             │
│  1. Store stripe_account_id in users table                  │
│  2. Verify account capabilities:                            │
│     - transfers: 'active'                                   │
│     - card_payments: 'active' (if needed)                   │
│  3. Mark creator as payment_ready = true                    │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ 🎉 SUCCESS: You're All Set!                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Your creator profile is live!                               │
│                                                             │
│ ✅ TikTok connected (47K followers)                         │
│ ✅ Base fee set ($75/video)                                 │
│ ✅ Portfolio added (2 videos)                               │
│ ✅ Payments ready                                           │
│                                                             │
│ Next steps:                                                 │
│ • Brands will discover your profile                         │
│ • You'll receive brief invitations                          │
│ • Start earning with performance-based pay!                 │
│                                                             │
│ [Go to Dashboard →]                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Founder Campaign Creation Flow

### 2.1 Campaign Initiation

**Entry Point:** Dashboard → "Create Campaign" button

```
┌─────────────────────────────────────────────────────────────┐
│ Create New Campaign                     [Save Draft] [Exit] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Progress: ●──○──○──○──○──○  Step 1 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 1: Campaign Basics                                     │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ Campaign Name: *                                            │
│ [Q4 Product Launch Campaign                              ] │
│                                                             │
│ What are you promoting?                                     │
│ [ProductivityPro - AI-powered task management SaaS       ] │
│                                                             │
│ Target Audience:                                            │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Professionals aged 25-40, interested in              │   │
│ │ productivity tools, remote workers, small business   │   │
│ │ owners.                                              │   │
│ │                                                      │   │
│ │ 178/500 characters                                   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Campaign Goal:                                              │
│ ○ Brand Awareness    ● Website Traffic    ○ Signups        │
│ ○ Sales              ○ App Downloads                        │
│                                                             │
│ [Continue →]                                                │
│                                                             │
│ System Actions:                                             │
│  • Auto-save every 30 seconds                               │
│  • Create draft campaign record                             │
│  • Status: 'draft'                                          │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ Progress: ●──●──○──○──○──○  Step 2 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 2: Content Requirements                                │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ How many videos do you need?                                │
│ [5▼] videos                                                 │
│  (Min: 1, Max: 10 per campaign)                             │
│                                                             │
│ Preferred video length:                                     │
│ ○ 15 seconds     ● 30 seconds                               │
│ ○ 60 seconds     ○ Creator's choice                         │
│                                                             │
│ Which platforms? (Select all that apply)                    │
│ ☑ TikTok    ☑ Instagram Reels    ☐ Facebook Reels          │
│                                                             │
│ Video style preference:                                     │
│ ☑ Product Tutorial    ☐ Unboxing    ☐ Testimonial          │
│ ☐ Behind the Scenes   ☐ Comparison                          │
│                                                             │
│ [← Back]  [Continue →]                                      │
│                                                             │
│ System Actions:                                             │
│  • Update campaign.videos_requested = 5                     │
│  • Store platform preferences in brief_data JSONB           │
│  • Calculate estimated budget preview                       │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ Progress: ●──●──●──○──○──○  Step 3 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 3: Creative Brief                                      │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ Key Talking Points: (What should the creator highlight?)    │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ • AI-powered task prioritization                    │   │
│ │ • Integrates with 50+ tools (Slack, Gmail, etc)     │   │
│ │ • Saves 2 hours per day on average                  │   │
│ │ • Free 14-day trial available                       │   │
│ │                                                      │   │
│ │ [+ Add Point]                                        │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Brand Guidelines: (Upload PDF, images, or describe)         │
│ [📄 Brand_Guidelines.pdf] [✓ Uploaded]  [Remove]           │
│ [+ Upload Assets] (Logo, product images, etc.)              │
│                                                             │
│ Do's:                          │ Don'ts:                    │
│ • Be authentic                 │ • Compare to competitors   │
│ • Show real use cases          │ • Make health claims       │
│ • Use trending audio           │ • Show competitor logos    │
│ [+ Add]                        │ [+ Add]                    │
│                                                             │
│ Required Hashtags/Mentions:                                 │
│ [#ProductivityPro #AItools @productivitypro_official     ] │
│                                                             │
│ Reference Videos: (Optional - paste URLs)                   │
│ [https://tiktok.com/@competitor/video/123                ] │
│ [+ Add Another]                                             │
│                                                             │
│ [← Back]  [Continue →]                                      │
│                                                             │
│ System Actions:                                             │
│  • Store all data in campaign.brief_data (JSONB)            │
│  • Upload brand assets to S3                                │
│  • Generate brief preview PDF                               │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Posting Schedule & Budget Configuration

```
┌─────────────────────────────────────────────────────────────┐
│ Progress: ●──●──●──●──○──○  Step 4 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 4: Posting Schedule                                    │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ When should the first video go live?                        │
│ [Nov 25, 2025 ▼]  📅                                        │
│  (Minimum 5 days from today for creator prep)               │
│                                                             │
│ How often should videos be posted?                          │
│ ● One per day           ○ Every other day                   │
│ ○ Every 3 days          ○ Weekly                            │
│ ○ Custom schedule                                           │
│                                                             │
│ 📅 Your Posting Calendar:                                   │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Video 1:  Nov 25 (Mon) 📱 TikTok                    │   │
│ │ Video 2:  Nov 26 (Tue) 📱 TikTok                    │   │
│ │ Video 3:  Nov 27 (Wed) 📸 Instagram                 │   │
│ │ Video 4:  Nov 28 (Thu) 📸 Instagram                 │   │
│ │ Video 5:  Nov 29 (Fri) 📱 TikTok                    │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Preferred posting time: (Optional)                          │
│ [09:00 AM ▼]  [EST ▼]                                       │
│                                                             │
│ [← Back]  [Continue →]                                      │
│                                                             │
│ System Actions:                                             │
│  • Calculate posting dates                                  │
│  • Store in campaign.start_date, posting_frequency          │
│  • Validate timeline (min 5 days buffer)                    │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ Progress: ●──●──●──●──●──○  Step 5 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 5: Budget Configuration                                │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ 💰 Set Your Total Budget                                    │
│                                                             │
│ Total Campaign Budget:                                      │
│ $ [1000.00]                                                 │
│   (Minimum: $500 | Maximum: $50,000)                        │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 📊 BUDGET BREAKDOWN                                  │   │
│ │                                                      │   │
│ │ Fixed Production Costs:         $250.00 (25%)       │   │
│ │ └─ 5 videos × $50 base fee                          │   │
│ │                                                      │   │
│ │ Variable Performance Budget:    $750.00 (75%)       │   │
│ │ └─ Pays for actual views achieved                   │   │
│ │                                                      │   │
│ │ ─────────────────────────────────────────────────   │   │
│ │                                                      │   │
│ │ Maximum Views You Can Purchase:                     │   │
│ │ 150,000 views @ $5.00 per 1,000                     │   │
│ │                                                      │   │
│ │ ═════════════════════════════════════════════════   │   │
│ │                                                      │   │
│ │ 💡 How Performance Budget Works:                    │   │
│ │                                                      │   │
│ │ If videos achieve 120K views (80% of max):          │   │
│ │  • You pay: $250 + $600 = $850                      │   │
│ │  • You save: $150 (refunded automatically)          │   │
│ │                                                      │   │
│ │ If videos achieve 150K views (100% of max):         │   │
│ │  • You pay: $250 + $750 = $1,000 (full budget)      │   │
│ │  • You save: $0 (great performance!)                │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ☑ I understand that:                                        │
│    • Base fees are paid when I approve content              │
│    • Performance budget is charged based on actual views    │
│    • Unused budget is refunded automatically after 7 days   │
│                                                             │
│ [← Back]  [Continue to Creator Selection →]                 │
│                                                             │
│ System Actions:                                             │
│  • Validate budget (min $500)                               │
│  • Calculate: base_fee_budget, performance_budget           │
│  • Store in campaigns table                                 │
│  • Update max_views_purchasable                             │
└─────────────────────────────────────────────────────────────┘
│                                                             │
│ Next up: Video 2 (Due Nov 23)                               │
│                                                             │
│ [View All Briefs]  [Upload Next Video]                      │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Founder Content Review

**Trigger:** Founder receives notification of new draft

```
┌─────────────────────────────────────────────────────────────┐
│ FOUNDER DASHBOARD - Content Review Queue                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🔔 1 video ready for review                                 │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Q4 Product Launch Campaign                           │   │
│ │                                                      │   │
│ │ 🎥 Video 1 of 5 - TikTok                            │   │
│ │ Submitted by @marythcreator  |  2 hours ago         │   │
│ │                                                      │   │
│ │ [Review Now →]                                       │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                ↓ (Founder clicks "Review Now")
┌─────────────────────────────────────────────────────────────┐
│ 📹 CONTENT REVIEW INTERFACE                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────┬───────────────────────────┐   │
│ │ 🎥 VIDEO PLAYER         │ 📋 BRIEF REQUIREMENTS     │   │
│ │                         │                           │   │
│ │  ┌─────────────────┐   │ ✓ 30 seconds              │   │
│ │  │                 │   │ ✓ Product tutorial style  │   │
│ │  │  [▶ Play]       │   │ ✓ #ProductivityPro used   │   │
│ │  │                 │   │                           │   │
│ │  │  Mary's Draft   │   │ Key Talking Points:       │   │
│ │  │  Video          │   │ • AI prioritization ✓     │   │
│ │  │                 │   │ • 50+ integrations ✓      │   │
│ │  │  0:15 / 0:30    │   │ • Free trial ✓            │   │
│ │  └─────────────────┘   │                           │   │
│ │                         │ Do's/Don'ts Check:        │   │
│ │  [0.5x] [1x] [2x]      │ ✓ Authentic               │   │
│ │  [Download]            │ ✓ Real use case shown     │   │
│ │                         │ ✓ No competitor mentions  │   │
│ └─────────────────────────┴───────────────────────────┘   │
│                                                             │
│ Creator's Notes:                                            │
│ "I focused on the AI prioritization feature as requested.   │
│  Used trending audio 'That's Crazy'."                       │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ YOUR FEEDBACK                                               │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ Add Comments: (Timestamped annotations)                     │
│ [Click on video timeline to add feedback at specific times] │
│                                                             │
│ ┌─ Annotations ───────────────────────────────────────┐   │
│ │ 0:05 - "Love the opening hook!" - You                │   │
│ │ 0:15 - "Can you show the UI here?" - You             │   │
│ │ [+ Add Comment]                                      │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ DECISION                                                    │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ [✅ Approve]   [📝 Request Revision]   [❌ Reject]          │
│                                                             │
│ ⚠️ Important: Approving will trigger payment of $75 to      │
│    creator. This cannot be undone.                          │
└─────────────────────────────────────────────────────────────┘
```

#### 3.3.1 Approval Flow

```
Founder clicks "✅ Approve"
                ↓
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ CONFIRM APPROVAL                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ You are about to approve Video 1                            │
│                                                             │
│ This will:                                                  │
│ ✓ Authorize creator to post on Nov 25                       │
│ ✓ Release $75 payment to @marythcreator                     │
│ ✓ Grant you perpetual content usage rights                  │
│                                                             │
│ ⚠️ This action cannot be undone                             │
│                                                             │
│ [Cancel]  [Confirm Approval]                                │
│                                                             │
│ System Actions (Confirm):                                   │
│  1. Update video.status = 'approved'                        │
│  2. Update video.approved_at = NOW()                        │
│  3. Trigger Phase 1 Payment (T-305):                        │
│     a. Verify escrow has sufficient funds                   │
│     b. Create Stripe transfer:                              │
│        POST /v1/transfers                                   │
│        {                                                    │
│          amount: 7500, // $75 in cents                      │
│          currency: 'usd',                                   │
│          destination: mary.stripe_account_id,               │
│          transfer_group: campaign.id,                       │
│          metadata: {                                        │
│            campaign_id, video_id,                           │
│            payment_type: 'base_fee'                         │
│          }                                                  │
│        }                                                    │
│     c. Create payment record in database                    │
│     d. Update video.base_fee_paid = true                    │
│  4. Send notifications:                                     │
│     • Creator: "Payment sent! $75 on the way"               │
│     • Founder: "Approval confirmed"                         │
│  5. Update campaign.videos_approved += 1                    │
│  6. Decrement escrow balance                                │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ ✅ VIDEO APPROVED                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Video 1 has been approved!                                  │
│                                                             │
│ ✓ $75 payment sent to @marythcreator                        │
│ ✓ Creator authorized to post on Nov 25                      │
│                                                             │
│ Next: Wait for creator to post and track performance        │
│                                                             │
│ [View Campaign Dashboard]  [Review Next Video]              │
└─────────────────────────────────────────────────────────────┘
```

#### 3.3.2 Revision Request Flow

```
Founder clicks "📝 Request Revision"
                ↓
┌─────────────────────────────────────────────────────────────┐
│ 📝 REQUEST REVISION                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ What needs to be changed?                                   │
│ (Be specific to help the creator deliver what you need)     │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Please make the following changes:                   │   │
│ │                                                      │   │
│ │ 1. At 0:15, show the actual ProductivityPro UI       │   │
│ │    instead of generic screenshots                    │   │
│ │                                                      │   │
│ │ 2. Add more emphasis on the "2 hours saved" stat    │   │
│ │                                                      │   │
│ │ 3. Include a call-to-action to try the free trial   │   │
│ │                                                      │   │
│ │ 187/1000 characters                                  │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Revision deadline:                                          │
│ [48 hours ▼]  from now (Nov 21 at 2:00 PM)                 │
│                                                             │
│ Priority:                                                   │
│ ○ Minor tweaks     ● Significant changes     ○ Major rework│
│                                                             │
│ ☑ Allow creator to ask clarifying questions                │
│                                                             │
│ [Cancel]  [Send Revision Request]                           │
│                                                             │
│ System Actions (Send):                                      │
│  1. Update video.status = 'revision_requested'              │
│  2. Create revision record:                                 │
│     INSERT INTO revisions (                                 │
│       video_id, requested_by, feedback,                     │
│       deadline, priority, iteration_number                  │
│     )                                                       │
│  3. Send notification to creator (high priority)            │
│  4. Email with full feedback                                │
│  5. Create task in creator dashboard                        │
│  6. Set reminder 12 hours before deadline                   │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 Video Posting & URL Submission

```
┌─────────────────────────────────────────────────────────────┐
│ CREATOR - Post-Approval Phase                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🎉 Video 1 Approved!                                        │
│                                                             │
│ ✓ $75 payment sent (check your wallet)                      │
│ ✓ Ready to post on Nov 25                                   │
│                                                             │
│ ⚠️ Important Reminder:                                      │
│ • Post exactly on Nov 25                                    │
│ • Use hashtags: #ProductivityPro                            │
│ • After posting, submit the live URL here immediately       │
│                                                             │
│ [I've Posted - Submit URL]  [View Posting Instructions]     │
└─────────────────────────────────────────────────────────────┘
                ↓ (After posting on TikTok/Instagram)
┌─────────────────────────────────────────────────────────────┐
│ 🔗 SUBMIT POST URL                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Video 1 - TikTok Post                                       │
│                                                             │
│ Paste your live post URL:                                   │
│ [https://tiktok.com/@marythcreator/video/7298547382...  ]  │
│                                                             │
│ Posting Date/Time:                                          │
│ [Nov 25, 2025]  [09:30 AM]  [EST ▼]                        │
│                                                             │
│ Screenshot (Optional but recommended):                      │
│ [Upload screenshot showing post is live]                    │
│                                                             │
│ [Cancel]  [Submit & Start Tracking]                         │
│                                                             │
│ System Actions (Submit):                                    │
│  1. Validate URL format (TikTok/Instagram domain)           │
│  2. Extract post ID from URL                                │
│  3. Verify post exists via API (optional check)             │
│  4. Update video record:                                    │
│     • status = 'posted'                                     │
│     • final_post_url = submitted_url                        │
│     • posted_at = submitted_datetime                        │
│  5. Calculate 7-day lock time:                              │
│     lock_at = posted_at + INTERVAL '7 days'                 │
│  6. Add to view polling queue (T-302)                       │
│  7. Send confirmation to founder                            │
│  8. Initialize first view count snapshot (within 1 hour)    │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ ✅ POST URL SUBMITTED                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Your post is now being tracked!                             │
│                                                             │
│ 📊 Performance tracking started                             │
│ 🕐 7-day window: Nov 25 - Dec 2                             │
│                                                             │
│ What happens next:                                          │
│ • Views are updated daily at 12:00 AM EST                   │
│ • Your performance bonus accumulates in real-time           │
│ • On Dec 2, final views are locked                          │
│ • Your bonus is paid automatically within 24 hours          │
│                                                             │
│ Current performance:                                        │
│ Views: 1,247  |  Est. Bonus: $4.99                          │
│                                                             │
│ [View Live Performance]  [Continue to Next Video]           │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Payment Processing Flow

### 4.1 Phase 1: Base Fee Payment (Detailed)

**Trigger:** Founder approves content (see 3.3.1)

```
┌─────────────────────────────────────────────────────────────┐
│ SYSTEM: Phase 1 Payment Processor                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Event: video.approved (video_id: v123, campaign_id: c456)   │
│                                                             │
│ STEP 1: Pre-Flight Validation                               │
│ ─────────────────────────────────────────────────────────── │
│ ✓ Check campaign has sufficient escrow balance              │
│   Current escrow: $1,000                                    │
│   Required: $75                                             │
│   Remaining after: $925                                     │
│                                                             │
│ ✓ Verify creator Stripe account is active                   │
│   stripe_account_id: acct_mary123                           │
│   capabilities.transfers: 'active'                          │
│                                                             │
│ ✓ Check for duplicate payment (idempotency)                 │
│   Query: SELECT * FROM payments                             │
│          WHERE video_id='v123' AND type='base_fee'          │
│   Result: No existing payment found ✓                       │
│                                                             │
│ STEP 2: Create Database Payment Record (Pending)            │
│ ─────────────────────────────────────────────────────────── │
│ INSERT INTO payments (                                      │
│   id: 'pay_abc123',                                         │
│   campaign_id: 'c456',                                      │
│   video_id: 'v123',                                         │
│   recipient_id: mary.id,                                    │
│   amount: 75.00,                                            │
│   type: 'base_fee',                                         │
│   status: 'pending',                                        │
│   created_at: NOW()                                         │
│ )                                                           │
│                                                             │
│ STEP 3: Stripe API Call (With Idempotency Key)              │
│ ─────────────────────────────────────────────────────────── │
│ POST https://api.stripe.com/v1/transfers                    │
│ Headers:                                                    │
│   Authorization: Bearer sk_live_xxx                         │
│   Idempotency-Key: c456_v123_base_fee_1732012800           │
│                                                             │
│ Body:                                                       │
│ {                                                           │
│   amount: 7500,                                             │
│   currency: "usd",                                          │
│   destination: "acct_mary123",                              │
│   transfer_group: "c456",                                   │
│   description: "Base fee - Video 1 approval",               │
│   metadata: {                                               │
│     campaign_id: "c456",                                    │
│     video_id: "v123",                                       │
│     payment_type: "base_fee",                               │
│     founder_id: "mike.id",                                  │
│     creator_id: "mary.id"                                   │
│   }                                                         │
│ }                                                           │
│                                                             │
│ Response: (Success)                                         │
│ {                                                           │
│   id: "tr_stripe789",                                       │
│   object: "transfer",                                       │
│   amount: 7500,                                             │
│   created: 1732012800,                                      │
│   destination: "acct_mary123",                              │
│   status: "paid"                                            │
│ }                                                           │
│                                                             │
│ STEP 4: Update Database (Success State)                     │
│ ─────────────────────────────────────────────────────────── │
│ UPDATE payments                                             │
│ SET                                                         │
│   status = 'completed',                                     │
│   stripe_transfer_id = 'tr_stripe789',                      │
│   processed_at = NOW()                                      │
│ WHERE id = 'pay_abc123';                                    │
│                                                             │
│ UPDATE videos                                               │
│ SET base_fee_paid = true                                    │
│ WHERE id = 'v123';                                          │
│                                                             │
│ UPDATE campaigns                                            │
│ SET escrow_balance = escrow_balance - 75.00                 │
│ WHERE id = 'c456';                                          │
│                                                             │
│ STEP 5: Notifications & Webhooks                            │
│ ─────────────────────────────────────────────────────────── │
│ • Send email to creator: "Payment sent: $75"                │
│ • Push notification to creator app                          │
│ • Update creator wallet balance (live)                      │
│ • Send confirmation to founder                              │
│ • Log event to analytics                                    │
│                                                             │
│ ✅ Phase 1 Payment Complete                                 │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Phase 2: Performance Bonus & Refund (7-Day Settlement)

**Trigger:** Automated cron job detects video.posted_at >= 168 hours ago

```
┌─────────────────────────────────────────────────────────────┐
│ SYSTEM: 7-Day Metric Lock & Settlement Processor            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Cron Job: Daily at 12:05 AM EST                             │
│ Query: SELECT * FROM videos                                 │
│        WHERE status = 'posted'                              │
│        AND posted_at <= NOW() - INTERVAL '168 hours'        │
│        AND status != 'locked'                               │
│                                                             │
│ Result: video_id 'v123' eligible for lock                   │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ PHASE 2A: METRIC LOCK                                       │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ STEP 1: Final View Count Fetch                              │
│ ─────────────────────────────────────────────────────────── │
│ • Platform: TikTok                                          │
│ • Post URL: https://tiktok.com/@marythcreator/video/729... │
│                                                             │
│ API Call: GET /v2/video/query/                              │
│ {                                                           │
│   video_id: "7298547382..."                                 │
│ }                                                           │
│                                                             │
│ Response:                                                   │
│ {                                                           │
│   data: {                                                   │
│     view_count: 45232,                                      │
│     like_count: 3421,                                       │
│     share_count: 287                                        │
│   }                                                         │
│ }                                                           │
│                                                             │
│ STEP 2: Lock View Count (Immutable)                         │
│ ─────────────────────────────────────────────────────────── │
│ BEGIN TRANSACTION;                                          │
│                                                             │
│ UPDATE videos                                               │
│ SET                                                         │
│   locked_view_count = 45232,                                │
│   locked_at = NOW(),                                        │
│   status = 'locked'                                         │
│ WHERE id = 'v123';                                          │
│                                                             │
│ INSERT INTO view_snapshots (                                │
│   video_id, view_count, snapshot_at, data_source            │
│ ) VALUES (                                                  │
│   'v123', 45232, NOW(), 'tiktok_api_final'                  │
│ );                                                          │
│                                                             │
│ COMMIT;                                                     │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ PHASE 2B: SETTLEMENT CALCULATION                            │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ Campaign Budget Overview:                                   │
│ • Total Budget: $1,000.00                                   │
│ • Base Fee Budget: $250.00 (5 videos × $50, but Mary gets  │
│   $75/video = $375 total)                                   │
│ • Performance Budget Available: $625.00                     │
│                                                             │
│ Final Views Achieved: 45,232 (across all 5 videos so far)   │
│ This specific video (v123): 45,232 views                    │
│                                                             │
│ Calculation for Video 1:                                    │
│ ───────────────────────────────────────────────────────────│
│ Views in thousands: 45232 / 1000 = 45.232                   │
│                                                             │
│ Creator Performance Bonus:                                  │
│   45.232 × $4.00 = $180.93                                  │
│                                                             │
│ Nala Revenue (Markup):                                      │
│   45.232 × $1.00 = $45.23                                   │
│                                                             │
│ Total Performance Cost:                                     │
│   45.232 × $5.00 = $226.16                                  │
│                                                             │
│ [Stored in settlement record]                               │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ PHASE 2C: PAYMENT EXECUTION                                 │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ STEP 1: Creator Performance Bonus Transfer                  │
│ ─────────────────────────────────────────────────────────── │
│ POST /v1/transfers                                          │
│ {                                                           │
│   amount: 18093, // $180.93 in cents                        │
│   currency: "usd",                                          │
│   destination: "acct_mary123",                              │
│   metadata: {                                               │
│     campaign_id: "c456",                                    │
│     video_id: "v123",                                       │
│     payment_type: "performance_bonus",                      │
│     views_achieved: 45232                                   │
│   }                                                         │
│ }                                                           │
│                                                             │
│ Response: { id: "tr_perf456", status: "paid" }              │
│                                                             │
│ INSERT INTO payments (                                      │
│   campaign_id: 'c456',                                      │
│   video_id: 'v123',                                         │
│   recipient_id: mary.id,                                    │
│   amount: 180.93,                                           │
│   type: 'performance_bonus',                                │
│   status: 'completed',                                      │
│   stripe_transfer_id: 'tr_perf456',                         │
│   metadata: {views: 45232}                                  │
│ );                                                          │
│                                                             │
│ STEP 2: Nala Revenue Recording                              │
│ ─────────────────────────────────────────────────────────── │
│ INSERT INTO revenue (                                       │
│   campaign_id: 'c456',                                      │
│   video_id: 'v123',                                         │
│   amount: 45.23,                                            │
│   type: 'markup',                                           │
│   views_count: 45232                                        │
│ );                                                          │
│                                                             │
│ // Funds stay in platform Stripe account                    │
│                                                             │
│ STEP 3: Calculate Campaign-Level Refund                     │
│ ─────────────────────────────────────────────────────────── │
│ // After ALL 5 videos are locked, calculate total refund    │
│                                                             │
│ Total Performance Budget: $625.00                           │
│ Total Performance Cost (all videos): $450.00                │
│ Refund Amount: $625.00 - $450.00 = $175.00                  │
│                                                             │
│ POST /v1/refunds                                            │
│ {                                                           │
│   payment_intent: "pi_founder123",                          │
│   amount: 17500, // $175 in cents                           │
│   reason: "requested_by_customer",                          │
│   metadata: {                                               │
│     campaign_id: "c456",                                    │
│     refund_type: "unspent_performance_budget",              │
│     original_budget: 625.00,                                │
│     actual_cost: 450.00                                     │
│   }                                                         │
│ }                                                           │
│                                                             │
│ Response: { id: "re_refund789", status: "succeeded" }       │
│                                                             │
│ INSERT INTO payments (                                      │
│   campaign_id: 'c456',                                      │
│   recipient_id: mike.id,                                    │
│   amount: 175.00,                                           │
│   type: 'refund',                                           │
│   status: 'completed',                                      │
│   stripe_refund_id: 're_refund789'                          │
│ );                                                          │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ PHASE 2D: FINALIZATION                                      │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ UPDATE campaigns                                            │
│ SET                                                         │
│   status = 'completed',                                     │
│   completed_at = NOW(),                                     │
│   final_views_total = 226160, // Sum of all videos          │
│   total_paid_to_creator = 555.93, // Base + Performance     │
│   total_refunded_to_founder = 175.00,                       │
│   platform_revenue = 226.16 // Nala markup                  │
│ WHERE id = 'c456';                                          │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ PHASE 2E: NOTIFICATIONS & REPORTING                         │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ To Creator (Mary):                                          │
│ ───────────────────────────────────────────────────────────│
│ Subject: Campaign Complete - $180.93 Bonus Paid!            │
│                                                             │
│ Your Q4 Product Launch campaign has ended!                  │
│                                                             │
│ Final Performance:                                          │
│ • Video 1: 45,232 views                                     │
│ • Performance Bonus: $180.93                                │
│ • Total Earned: $255.93 ($75 base + $180.93 bonus)         │
│                                                             │
│ Payment sent to your account.                               │
│                                                             │
│ [View Campaign Report] [Leave Review for Client]            │
│                                                             │
│ ───────────────────────────────────────────────────────────│
│                                                             │
│ To Founder (Mike):                                          │
│ ───────────────────────────────────────────────────────────│
│ Subject: Campaign Complete - $175 Refund Processed          │
│                                                             │
│ Your Q4 Product Launch campaign has concluded!              │
│                                                             │
│ Campaign Performance:                                       │
│ • Total Views: 226,160                                      │
│ • Videos Delivered: 5/5                                     │
│ • Total Spent: $825.00                                      │
│ • Refund Issued: $175.00                                    │
│                                                             │
│ Your refund will appear in 5-7 business days.               │
│                                                             │
│ [Download Performance Report] [Leave Review# Nala Platform - Detailed User Flows

## Table of Contents
1. [Creator Onboarding Flow](#1-creator-onboarding-flow)
2. [Founder Campaign Creation Flow](#2-founder-campaign-creation-flow)
3. [Content Creation & Review Flow](#3-content-creation--review-flow)
4. [Payment Processing Flow](#4-payment-processing-flow)
5. [Performance Tracking Flow](#5-performance-tracking-flow)
6. [Dispute Resolution Flow](#6-dispute-resolution-flow)

---

## 1. Creator Onboarding Flow

### 1.1 Account Registration

**Entry Point:** Landing page → "Sign Up as Creator" button

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Basic Information                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Creator enters:                                             │
│  • Full Name                                                │
│  • Email Address                                            │
│  • Password (8+ chars, 1 number, 1 special)                │
│  • Confirm Password                                         │
│                                                             │
│ [Checkbox] I agree to Terms of Service & Privacy Policy    │
│                                                             │
│ [Continue →]                                                │
│                                                             │
│ System Actions:                                             │
│  1. Validate email format and uniqueness                    │
│  2. Hash password (bcrypt)                                  │
│  3. Create user record (role: 'creator')                    │
│  4. Send verification email                                 │
│  5. Create empty creator_profile record                     │
│  6. Generate session token                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Email Verification                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Screen: "Check your email"                                  │
│  📧 We sent a verification link to mary@email.com          │
│                                                             │
│ Creator clicks link in email →                              │
│                                                             │
│ System Actions:                                             │
│  1. Verify token from email link                            │
│  2. Update user.email_verified = true                       │
│  3. Redirect to platform onboarding                         │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Social Media Account Connection

**Critical Path:** This determines creator eligibility

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Connect Your Platforms                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "Connect your social accounts to start earning"             │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 🎵 TikTok         [Connect Account]   Not Connected │   │
│ │    Minimum: 10,000 followers                        │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 📸 Instagram      [Connect Account]   Not Connected │   │
│ │    Minimum: 5,000 followers                         │   │
│ │    ⚠️ Requires Business Account                     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 👍 Facebook       [Connect Account]   Not Connected │   │
│ │    Minimum: 5,000 followers                         │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Note: Connect at least one platform to continue            │
│                                                             │
│ [Skip for now]  [Continue]  ← Disabled until 1 connected   │
└─────────────────────────────────────────────────────────────┘
```

#### 1.2.1 TikTok Connection Sub-Flow

```
Creator clicks "Connect Account" on TikTok
                ↓
┌─────────────────────────────────────────────────────────────┐
│ POPUP: TikTok OAuth                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ System Actions:                                             │
│  1. Generate OAuth state token (CSRF protection)            │
│  2. Redirect to TikTok Login Kit:                           │
│     https://www.tiktok.com/auth/authorize/                  │
│     ?client_key={CLIENT_KEY}                                │
│     &scope=user.info.basic,video.list,video.insights        │
│     &response_type=code                                     │
│     &redirect_uri={CALLBACK_URL}                            │
│     &state={STATE_TOKEN}                                    │
│                                                             │
│ Creator sees TikTok login screen →                          │
│  • Logs into TikTok (if not already)                        │
│  • Reviews permissions request                              │
│  • Clicks "Authorize"                                       │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ CALLBACK: TikTok Returns to Nala                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ System Actions:                                             │
│  1. Receive authorization code                              │
│  2. Verify state token (prevent CSRF)                       │
│  3. Exchange code for access token:                         │
│     POST https://open-api.tiktok.com/oauth/access_token/    │
│  4. Fetch user profile:                                     │
│     GET /v2/user/info/                                      │
│  5. Extract: username, follower_count, user_id              │
│                                                             │
│  6. Validate eligibility:                                   │
│     IF follower_count < 10,000:                             │
│       ❌ Show error: "Minimum 10K followers required"       │
│       STOP                                                  │
│                                                             │
│  7. Store in database:                                      │
│     INSERT INTO social_accounts (                           │
│       creator_id, platform, platform_user_id,               │
│       username, follower_count,                             │
│       access_token [ENCRYPTED], refresh_token [ENCRYPTED],  │
│       token_expires_at, verified_at                         │
│     )                                                       │
│                                                             │
│  8. Update creator_profile.verification_status = 'verified' │
│  9. Show success message                                    │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ SUCCESS SCREEN                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ✅ TikTok Connected Successfully!                           │
│                                                             │
│ @marythcreator                                              │
│ 47,234 followers                                            │
│                                                             │
│ [Connect Another Platform]  [Continue →]                    │
└─────────────────────────────────────────────────────────────┘
```

#### 1.2.2 Instagram Connection Sub-Flow

**Note:** More complex due to Business Account requirement

```
Creator clicks "Connect Account" on Instagram
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Check Account Type                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "Do you have an Instagram Business or Creator Account?"     │
│                                                             │
│ [Yes, I have a Business Account] → Continue to OAuth        │
│ [No, I have a Personal Account] → Show conversion guide     │
│                                                             │
│ IF "No" selected:                                           │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ ℹ️  How to Convert to Business Account:            │   │
│ │                                                     │   │
│ │ 1. Open Instagram app                              │   │
│ │ 2. Go to Settings → Account                        │   │
│ │ 3. Select "Switch to Professional Account"         │   │
│ │ 4. Choose "Business"                               │   │
│ │ 5. Connect to Facebook Page                        │   │
│ │                                                     │   │
│ │ [Watch Video Tutorial]  [I've Converted]           │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Facebook Login (Required for Instagram)             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ System Actions:                                             │
│  1. Redirect to Facebook OAuth:                             │
│     https://www.facebook.com/v18.0/dialog/oauth             │
│     ?client_id={APP_ID}                                     │
│     &redirect_uri={CALLBACK}                                │
│     &scope=instagram_basic,instagram_manage_insights,       │
│             pages_read_engagement                           │
│                                                             │
│ Creator:                                                    │
│  • Logs into Facebook                                       │
│  • Selects connected Instagram Business Account            │
│  • Grants permissions                                       │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Fetch Instagram Data                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ System Actions:                                             │
│  1. Exchange code for access token                          │
│  2. Get Instagram Business Account ID:                      │
│     GET /{facebook-page-id}?fields=instagram_business_accou │
│     nt                                                      │
│  3. Get Instagram profile data:                             │
│     GET /{ig-user-id}?fields=username,followers_count       │
│                                                             │
│  4. Validate:                                               │
│     IF followers_count < 5,000:                             │
│       ❌ Error: "Minimum 5K followers required"             │
│     IF account_type != 'BUSINESS':                          │
│       ❌ Error: "Business account required"                 │
│                                                             │
│  5. Store data (same as TikTok flow)                        │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Profile Setup

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Set Your Rates                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "How much do you charge per video?"                         │
│                                                             │
│ TikTok Base Fee:                                            │
│ [$75] ◄────●────────────────► [$500]                       │
│  $50                                  Max                   │
│                                                             │
│ 💡 Most creators charge: $75-$150                           │
│ 📊 Your potential earnings for 100K views:                  │
│     Base Fee: $75 + Performance: $400 = $475 total          │
│                                                             │
│ Instagram Base Fee:                                         │
│ [$75] ◄────●────────────────► [$500]                       │
│                                                             │
│ Facebook Base Fee:                                          │
│ [$75] ◄────●────────────────► [$500]                       │
│                                                             │
│ [Continue →]                                                │
│                                                             │
│ System Actions:                                             │
│  • Update creator_profile with base fees                    │
│  • Calculate average fee for matching algorithm             │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Build Your Portfolio                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "Upload 3-10 sample videos to showcase your style"          │
│                                                             │
│ [Drag & Drop Videos Here]                                   │
│  or [Browse Files]                                          │
│                                                             │
│ Uploaded (2/10):                                            │
│ ┌─────────┐  ┌─────────┐                                   │
│ │ [Video] │  │ [Video] │  [+ Add More]                     │
│ │  30s    │  │  45s    │                                   │
│ └─────────┘  └─────────┘                                   │
│                                                             │
│ For each video:                                             │
│  • Title: [Product Review - SaaS Tool]                      │
│  • Platform: [TikTok ▼]                                     │
│                                                             │
│ [Skip for now]  [Continue →]                                │
│                                                             │
│ System Actions:                                             │
│  1. Upload to S3 (max 500MB per video)                      │
│  2. Generate thumbnail (frame at 2s)                        │
│  3. Transcode to web format (H.264, 720p)                   │
│  4. Store metadata in creator_profile.portfolio_videos      │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Category & Bio                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ What niches do you specialize in? (Select all that apply)   │
│                                                             │
│ ☑ SaaS & Software    ☐ E-commerce     ☐ Health & Fitness   │
│ ☑ B2B Tech           ☐ Beauty         ☐ Food & Beverage    │
│ ☐ Finance            ☐ Fashion        ☐ Gaming             │
│                                                             │
│ Tell brands about yourself: (500 char max)                  │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Hi! I'm Mary, a tech enthusiast who creates          │   │
│ │ engaging video reviews for SaaS products. My         │   │
│ │ audience loves honest, detailed breakdowns...        │   │
│ │                                                      │   │
│ │ 347/500 characters                                   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ [Back]  [Complete Setup →]                                  │
│                                                             │
│ System Actions:                                             │
│  • Update creator_profile.categories                        │
│  • Update creator_profile.bio                               │
│  • Set profile_completed = true                             │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Payment Setup (Stripe Connect)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "Last step: Set up payouts"                                 │
│                                                             │
│ Nala uses Stripe to send you payments securely.             │
│                                                             │
│ [Connect Stripe Account]                                    │
│                                                             │
│ System Actions:                                             │
│  1. Create Stripe Connect Express account link:             │
│     POST /v1/account_links                                  │
│     type: 'account_onboarding'                              │
│  2. Redirect creator to Stripe hosted onboarding            │
│                                                             │
│ Creator completes on Stripe:                                │
│  • Personal information (name, DOB, SSN)                    │
│  • Business details (if applicable)                         │
│  • Bank account for deposits                                │
│  • Identity verification (photo ID)                         │
│                                                             │
│ Stripe redirects back to Nala with account_id               │
│                                                             │
│ System Actions:                                             │
│  1. Store stripe_account_id in users table                  │
│  2. Verify account capabilities:                            │
│     - transfers: 'active'                                   │
│     - card_payments: 'active' (if needed)                   │
│  3. Mark creator as payment_ready = true                    │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ 🎉 SUCCESS: You're All Set!                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Your creator profile is live!                               │
│                                                             │
│ ✅ TikTok connected (47K followers)                         │
│ ✅ Base fee set ($75/video)                                 │
│ ✅ Portfolio added (2 videos)                               │
│ ✅ Payments ready                                           │
│                                                             │
│ Next steps:                                                 │
│ • Brands will discover your profile                         │
│ • You'll receive brief invitations                          │
│ • Start earning with performance-based pay!                 │
│                                                             │
│ [Go to Dashboard →]                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Founder Campaign Creation Flow

### 2.1 Campaign Initiation

**Entry Point:** Dashboard → "Create Campaign" button

```
┌─────────────────────────────────────────────────────────────┐
│ Create New Campaign                     [Save Draft] [Exit] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Progress: ●──○──○──○──○──○  Step 1 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 1: Campaign Basics                                     │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ Campaign Name: *                                            │
│ [Q4 Product Launch Campaign                              ] │
│                                                             │
│ What are you promoting?                                     │
│ [ProductivityPro - AI-powered task management SaaS       ] │
│                                                             │
│ Target Audience:                                            │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Professionals aged 25-40, interested in              │   │
│ │ productivity tools, remote workers, small business   │   │
│ │ owners.                                              │   │
│ │                                                      │   │
│ │ 178/500 characters                                   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Campaign Goal:                                              │
│ ○ Brand Awareness    ● Website Traffic    ○ Signups        │
│ ○ Sales              ○ App Downloads                        │
│                                                             │
│ [Continue →]                                                │
│                                                             │
│ System Actions:                                             │
│  • Auto-save every 30 seconds                               │
│  • Create draft campaign record                             │
│  • Status: 'draft'                                          │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ Progress: ●──●──○──○──○──○  Step 2 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 2: Content Requirements                                │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ How many videos do you need?                                │
│ [5▼] videos                                                 │
│  (Min: 1, Max: 10 per campaign)                             │
│                                                             │
│ Preferred video length:                                     │
│ ○ 15 seconds     ● 30 seconds                               │
│ ○ 60 seconds     ○ Creator's choice                         │
│                                                             │
│ Which platforms? (Select all that apply)                    │
│ ☑ TikTok    ☑ Instagram Reels    ☐ Facebook Reels          │
│                                                             │
│ Video style preference:                                     │
│ ☑ Product Tutorial    ☐ Unboxing    ☐ Testimonial          │
│ ☐ Behind the Scenes   ☐ Comparison                          │
│                                                             │
│ [← Back]  [Continue →]                                      │
│                                                             │
│ System Actions:                                             │
│  • Update campaign.videos_requested = 5                     │
│  • Store platform preferences in brief_data JSONB           │
│  • Calculate estimated budget preview                       │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ Progress: ●──●──●──○──○──○  Step 3 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 3: Creative Brief                                      │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ Key Talking Points: (What should the creator highlight?)    │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ • AI-powered task prioritization                    │   │
│ │ • Integrates with 50+ tools (Slack, Gmail, etc)     │   │
│ │ • Saves 2 hours per day on average                  │   │
│ │ • Free 14-day trial available                       │   │
│ │                                                      │   │
│ │ [+ Add Point]                                        │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Brand Guidelines: (Upload PDF, images, or describe)         │
│ [📄 Brand_Guidelines.pdf] [✓ Uploaded]  [Remove]           │
│ [+ Upload Assets] (Logo, product images, etc.)              │
│                                                             │
│ Do's:                          │ Don'ts:                    │
│ • Be authentic                 │ • Compare to competitors   │
│ • Show real use cases          │ • Make health claims       │
│ • Use trending audio           │ • Show competitor logos    │
│ [+ Add]                        │ [+ Add]                    │
│                                                             │
│ Required Hashtags/Mentions:                                 │
│ [#ProductivityPro #AItools @productivitypro_official     ] │
│                                                             │
│ Reference Videos: (Optional - paste URLs)                   │
│ [https://tiktok.com/@competitor/video/123                ] │
│ [+ Add Another]                                             │
│                                                             │
│ [← Back]  [Continue →]                                      │
│                                                             │
│ System Actions:                                             │
│  • Store all data in campaign.brief_data (JSONB)            │
│  • Upload brand assets to S3                                │
│  • Generate brief preview PDF                               │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Posting Schedule & Budget Configuration

```
┌─────────────────────────────────────────────────────────────┐
│ Progress: ●──●──●──●──○──○  Step 4 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 4: Posting Schedule                                    │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ When should the first video go live?                        │
│ [Nov 25, 2025 ▼]  📅                                        │
│  (Minimum 5 days from today for creator prep)               │
│                                                             │
│ How often should videos be posted?                          │
│ ● One per day           ○ Every other day                   │
│ ○ Every 3 days          ○ Weekly                            │
│ ○ Custom schedule                                           │
│                                                             │
│ 📅 Your Posting Calendar:                                   │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Video 1:  Nov 25 (Mon) 📱 TikTok                    │   │
│ │ Video 2:  Nov 26 (Tue) 📱 TikTok                    │   │
│ │ Video 3:  Nov 27 (Wed) 📸 Instagram                 │   │
│ │ Video 4:  Nov 28 (Thu) 📸 Instagram                 │   │
│ │ Video 5:  Nov 29 (Fri) 📱 TikTok                    │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Preferred posting time: (Optional)                          │
│ [09:00 AM ▼]  [EST ▼]                                       │
│                                                             │
│ [← Back]  [Continue →]                                      │
│                                                             │
│ System Actions:                                             │
│  • Calculate posting dates                                  │
│  • Store in campaign.start_date, posting_frequency          │
│  • Validate timeline (min 5 days buffer)                    │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ Progress: ●──●──●──●──●──○  Step 5 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 5: Budget Configuration                                │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ 💰 Set Your Total Budget                                    │
│                                                             │
│ Total Campaign Budget:                                      │
│ $ [1000.00]                                                 │
│   (Minimum: $500 | Maximum: $50,000)                        │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 📊 BUDGET BREAKDOWN                                  │   │
│ │                                                      │   │
│ │ Fixed Production Costs:         $250.00 (25%)       │   │
│ │ └─ 5 videos × $50 base fee                          │   │
│ │                                                      │   │
│ │ Variable Performance Budget:    $750.00 (75%)       │   │
│ │ └─ Pays for actual views achieved                   │   │
│ │                                                      │   │
│ │ ─────────────────────────────────────────────────   │   │
│ │                                                      │   │
│ │ Maximum Views You Can Purchase:                     │   │
│ │ 150,000 views @ $5.00 per 1,000                     │   │
│ │                                                      │   │
│ │ ═════════════════════════════════════════════════   │   │
│ │                                                      │   │
│ │ 💡 How Performance Budget Works:                    │   │
│ │                                                      │   │
│ │ If videos achieve 120K views (80% of max):          │   │
│ │  • You pay: $250 + $600 = $850                      │   │
│ │  • You save: $150 (refunded automatically)          │   │
│ │                                                      │   │
│ │ If videos achieve 150K views (100% of max):         │   │
│ │  • You pay: $250 + $750 = $1,000 (full budget)      │   │
│ │  • You save: $0 (great performance!)                │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ☑ I understand that:                                        │
│    • Base fees are paid when I approve content              │
│    • Performance budget is charged based on actual views    │
│    • Unused budget is refunded automatically after 7 days   │
│                                                             │
│ [← Back]  [Continue to Creator Selection →]                 │
│                                                             │
│ System Actions:                                             │
│  • Validate budget (min $500)                               │
│  • Calculate: base_fee_budget, performance_budget           │
│  • Store in campaigns table                                 │
│  • Update max_views_purchasable                             │
└─────────────────────────────────────────────────────────────┘
│                                                             │
│ Next up: Video 2 (Due Nov 23)                               │
│                                                             │
│ [View All Briefs]  [Upload Next Video]                      │
└─────────────────────────────────────────────────────────────┘

### 3.3 Founder Content Review

**Trigger:** Founder receives notification of new draft
┌─────────────────────────────────────────────────────────────┐
│ FOUNDER DASHBOARD - Content Review Queue                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🔔 1 video ready for review                                 │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Q4 Product Launch Campaign                           │   │
│ │                                                      │   │
│ │ 🎥 Video 1 of 5 - TikTok                            │   │
│ │ Submitted by @marythcreator  |  2 hours ago         │   │
│ │                                                      │   │
│ │ [Review Now →]                                       │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
↓ (Founder clicks "Review Now")
┌─────────────────────────────────────────────────────────────┐
│ 📹 CONTENT REVIEW INTERFACE                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────┬───────────────────────────┐   │
│ │ 🎥 VIDEO PLAYER         │ 📋 BRIEF REQUIREMENTS     │   │
│ │                         │                           │   │
│ │  ┌─────────────────┐   │ ✓ 30 seconds              │   │
│ │  │                 │   │ ✓ Product tutorial style  │   │
│ │  │  [▶ Play]       │   │ ✓ #ProductivityPro used   │   │
│ │  │                 │   │                           │   │
│ │  │  Mary's Draft   │   │ Key Talking Points:       │   │
│ │  │  Video          │   │ • AI prioritization ✓     │   │
│ │  │                 │   │ • 50+ integrations ✓      │   │
│ │  │  0:15 / 0:30    │   │ • Free trial ✓            │   │
│ │  └─────────────────┘   │                           │   │
│ │                         │ Do's/Don'ts Check:        │   │
│ │  [0.5x] [1x] [2x]      │ ✓ Authentic               │   │
│ │  [Download]            │ ✓ Real use case shown     │   │
│ │                         │ ✓ No competitor mentions  │   │
│ └─────────────────────────┴───────────────────────────┘   │
│                                                             │
│ Creator's Notes:                                            │
│ "I focused on the AI prioritization feature as requested.   │
│  Used trending audio 'That's Crazy'."                       │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ YOUR FEEDBACK                                               │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ Add Comments: (Timestamped annotations)                     │
│ [Click on video timeline to add feedback at specific times] │
│                                                             │
│ ┌─ Annotations ───────────────────────────────────────┐   │
│ │ 0:05 - "Love the opening hook!" - You                │   │
│ │ 0:15 - "Can you show the UI here?" - You             │   │
│ │ [+ Add Comment]                                      │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ DECISION                                                    │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ [✅ Approve]   [📝 Request Revision]   [❌ Reject]          │
│                                                             │
│ ⚠️ Important: Approving will trigger payment of $75 to      │
│    creator. This cannot be undone.                          │
└─────────────────────────────────────────────────────────────┘

#### 3.3.1 Approval Flow
Founder clicks "✅ Approve"
↓
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ CONFIRM APPROVAL                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ You are about to approve Video 1                            │
│                                                             │
│ This will:                                                  │
│ ✓ Authorize creator to post on Nov 25                       │
│ ✓ Release $75 payment to @marythcreator                     │
│ ✓ Grant you perpetual content usage rights                  │
│                                                             │
│ ⚠️ This action cannot be undone                             │
│                                                             │
│ [Cancel]  [Confirm Approval]                                │
│                                                             │
│ System Actions (Confirm):                                   │
│  1. Update video.status = 'approved'                        │
│  2. Update video.approved_at = NOW()                        │
│  3. Trigger Phase 1 Payment (T-305):                        │
│     a. Verify escrow has sufficient funds                   │
│     b. Create Stripe transfer:                              │
│        POST /v1/transfers                                   │
│        {                                                    │
│          amount: 7500, // $75 in cents                      │
│          currency: 'usd',                                   │
│          destination: mary.stripe_account_id,               │
│          transfer_group: campaign.id,                       │
│          metadata: {                                        │
│            campaign_id, video_id,                           │
│            payment_type: 'base_fee'                         │
│          }                                                  │
│        }                                                    │
│     c. Create payment record in database                    │
│     d. Update video.base_fee_paid = true                    │
│  4. Send notifications:                                     │
│     • Creator: "Payment sent! $75 on the way"               │
│     • Founder: "Approval confirmed"                         │
│  5. Update campaign.videos_approved += 1                    │
│  6. Decrement escrow balance                                │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ ✅ VIDEO APPROVED                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Video 1 has been approved!                                  │
│                                                             │
│ ✓ $75 payment sent to @marythcreator                        │
│ ✓ Creator authorized to post on Nov 25                      │
│                                                             │
│ Next: Wait for creator to post and track performance        │
│                                                             │
│ [View Campaign Dashboard]  [Review Next Video]              │
└─────────────────────────────────────────────────────────────┘

#### 3.3.2 Revision Request Flow
Founder clicks "📝 Request Revision"
↓
┌─────────────────────────────────────────────────────────────┐
│ 📝 REQUEST REVISION                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ What needs to be changed?                                   │
│ (Be specific to help the creator deliver what you need)     │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Please make the following changes:                   │   │
│ │                                                      │   │
│ │ 1. At 0:15, show the actual ProductivityPro UI       │   │
│ │    instead of generic screenshots                    │   │
│ │                                                      │   │
│ │ 2. Add more emphasis on the "2 hours saved" stat    │   │
│ │                                                      │   │
│ │ 3. Include a call-to-action to try the free trial   │   │
│ │                                                      │   │
│ │ 187/1000 characters                                  │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Revision deadline:                                          │
│ [48 hours ▼]  from now (Nov 21 at 2:00 PM)                 │
│                                                             │
│ Priority:                                                   │
│ ○ Minor tweaks     ● Significant changes     ○ Major rework│
│                                                             │
│ ☑ Allow creator to ask clarifying questions                │
│                                                             │
│ [Cancel]  [Send Revision Request]                           │
│                                                             │
│ System Actions (Send):                                      │
│  1. Update video.status = 'revision_requested'              │
│  2. Create revision record:                                 │
│     INSERT INTO revisions (                                 │
│       video_id, requested_by, feedback,                     │
│       deadline, priority, iteration_number                  │
│     )                                                       │
│  3. Send notification to creator (high priority)            │
│  4. Email with full feedback                                │
│  5. Create task in creator dashboard                        │
│  6. Set reminder 12 hours before deadline                   │
└─────────────────────────────────────────────────────────────┘

### 3.4 Video Posting & URL Submission
┌─────────────────────────────────────────────────────────────┐
│ CREATOR - Post-Approval Phase                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🎉 Video 1 Approved!                                        │
│                                                             │
│ ✓ $75 payment sent (check your wallet)                      │
│ ✓ Ready to post on Nov 25                                   │
│                                                             │
│ ⚠️ Important Reminder:                                      │
│ • Post exactly on Nov 25                                    │
│ • Use hashtags: #ProductivityPro                            │
│ • After posting, submit the live URL here immediately       │
│                                                             │
│ [I've Posted - Submit URL]  [View Posting Instructions]     │
└─────────────────────────────────────────────────────────────┘
↓ (After posting on TikTok/Instagram)
┌─────────────────────────────────────────────────────────────┐
│ 🔗 SUBMIT POST URL                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Video 1 - TikTok Post                                       │
│                                                             │
│ Paste your live post URL:                                   │
│ [https://tiktok.com/@marythcreator/video/7298547382...  ]  │
│                                                             │
│ Posting Date/Time:                                          │
│ [Nov 25, 2025]  [09:30 AM]  [EST ▼]                        │
│                                                             │
│ Screenshot (Optional but recommended):                      │
│ [Upload screenshot showing post is live]                    │
│                                                             │
│ [Cancel]  [Submit & Start Tracking]                         │
│                                                             │
│ System Actions (Submit):                                    │
│  1. Validate URL format (TikTok/Instagram domain)           │
│  2. Extract post ID from URL                                │
│  3. Verify post exists via API (optional check)             │
│  4. Update video record:                                    │
│     • status = 'posted'                                     │
│     • final_post_url = submitted_url                        │
│     • posted_at = submitted_datetime                        │
│  5. Calculate 7-day lock time:                              │
│     lock_at = posted_at + INTERVAL '7 days'                 │
│  6. Add to view polling queue (T-302)                       │
│  7. Send confirmation to founder                            │
│  8. Initialize first view count snapshot (within 1 hour)    │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ ✅ POST URL SUBMITTED                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Your post is now being tracked!                             │
│                                                             │
│ 📊 Performance tracking started                             │
│ 🕐 7-day window: Nov 25 - Dec 2                             │
│                                                             │
│ What happens next:                                          │
│ • Views are updated daily at 12:00 AM EST                   │
│ • Your performance bonus accumulates in real-time           │
│ • On Dec 2, final views are locked                          │
│ • Your bonus is paid automatically within 24 hours          │
│                                                             │
│ Current performance:                                        │
│ Views: 1,247  |  Est. Bonus: $4.99                          │
│                                                             │
│ [View Live Performance]  [Continue to Next Video]           │
└─────────────────────────────────────────────────────────────┘

---

## 4. Payment Processing Flow

### 4.1 Phase 1: Base Fee Payment (Detailed)

**Trigger:** Founder approves content (see 3.3.1)
┌─────────────────────────────────────────────────────────────┐
│ SYSTEM: Phase 1 Payment Processor                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Event: video.approved (video_id: v123, campaign_id: c456)   │
│                                                             │
│ STEP 1: Pre-Flight Validation                               │
│ ─────────────────────────────────────────────────────────── │
│ ✓ Check campaign has sufficient escrow balance              │
│   Current escrow: $1,000                                    │
│   Required: $75                                             │
│   Remaining after: $925                                     │
│                                                             │
│ ✓ Verify creator Stripe account is active                   │
│   stripe_account_id: acct_mary123                           │
│   capabilities.transfers: 'active'                          │
│                                                             │
│ ✓ Check for duplicate payment (idempotency)                 │
│   Query: SELECT * FROM payments                             │
│          WHERE video_id='v123' AND type='base_fee'          │
│   Result: No existing payment found ✓                       │
│                                                             │
│ STEP 2: Create Database Payment Record (Pending)            │
│ ─────────────────────────────────────────────────────────── │
│ INSERT INTO payments (                                      │
│   id: 'pay_abc123',                                         │
│   campaign_id: 'c456',                                      │
│   video_id: 'v123',                                         │
│   recipient_id: mary.id,                                    │
│   amount: 75.00,                                            │
│   type: 'base_fee',                                         │
│   status: 'pending',                                        │
│   created_at: NOW()                                         │
│ )                                                           │
│                                                             │
│ STEP 3: Stripe API Call (With Idempotency Key)              │
│ ─────────────────────────────────────────────────────────── │
│ POST https://api.stripe.com/v1/transfers                    │
│ Headers:                                                    │
│   Authorization: Bearer sk_live_xxx                         │
│   Idempotency-Key: c456_v123_base_fee_1732012800           │
│                                                             │
│ Body:                                                       │
│ {                                                           │
│   amount: 7500,                                             │
│   currency: "usd",                                          │
│   destination: "acct_mary123",                              │
│   transfer_group: "c456",                                   │
│   description: "Base fee - Video 1 approval",               │
│   metadata: {                                               │
│     campaign_id: "c456",                                    │
│     video_id: "v123",                                       │
│     payment_type: "base_fee",                               │
│     founder_id: "mike.id",                                  │
│     creator_id: "mary.id"                                   │
│   }                                                         │
│ }                                                           │
│                                                             │
│ Response: (Success)                                         │
│ {                                                           │
│   id: "tr_stripe789",                                       │
│   object: "transfer",                                       │
│   amount: 7500,                                             │
│   created: 1732012800,                                      │
│   destination: "acct_mary123",                              │
│   status: "paid"                                            │
│ }                                                           │
│                                                             │
│ STEP 4: Update Database (Success State)                     │
│ ─────────────────────────────────────────────────────────── │
│ UPDATE payments                                             │
│ SET                                                         │
│   status = 'completed',                                     │
│   stripe_transfer_id = 'tr_stripe789',                      │
│   processed_at = NOW()                                      │
│ WHERE id = 'pay_abc123';                                    │
│                                                             │
│ UPDATE videos                                               │
│ SET base_fee_paid = true                                    │
│ WHERE id = 'v123';                                          │
│                                                             │
│ UPDATE campaigns                                            │
│ SET escrow_balance = escrow_balance - 75.00                 │
│ WHERE id = 'c456';                                          │
│                                                             │
│ STEP 5: Notifications & Webhooks                            │
│ ─────────────────────────────────────────────────────────── │
│ • Send email to creator: "Payment sent: $75"                │
│ • Push notification to creator app                          │
│ • Update creator wallet balance (live)                      │
│ • Send confirmation to founder                              │
│ • Log event to analytics                                    │
│                                                             │
│ ✅ Phase 1 Payment Complete                                 │
└─────────────────────────────────────────────────────────────┘

### 4.2 Phase 2: Performance Bonus & Refund (7-Day Settlement)

**Trigger:** Automated cron job detects video.posted_at >= 168 hours ago
┌─────────────────────────────────────────────────────────────┐
│ SYSTEM: 7-Day Metric Lock & Settlement Processor            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Cron Job: Daily at 12:05 AM EST                             │
│ Query: SELECT * FROM videos                                 │
│        WHERE status = 'posted'                              │
│        AND posted_at <= NOW() - INTERVAL '168 hours'        │
│        AND status != 'locked'                               │
│                                                             │
│ Result: video_id 'v123' eligible for lock                   │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ PHASE 2A: METRIC LOCK                                       │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ STEP 1: Final View Count Fetch                              │
│ ─────────────────────────────────────────────────────────── │
│ • Platform: TikTok                                          │
│ • Post URL: https://tiktok.com/@marythcreator/video/729... │
│                                                             │
│ API Call: GET /v2/video/query/                              │
│ {                                                           │
│   video_id: "7298547382..."                                 │
│ }                                                           │
│                                                             │
│ Response:                                                   │
│ {                                                           │
│   data: {                                                   │
│     view_count: 45232,                                      │
│     like_count: 3421,                                       │
│     share_count: 287                                        │
│   }                                                         │
│ }                                                           │
│                                                             │
│ STEP 2: Lock View Count (Immutable)                         │
│ ─────────────────────────────────────────────────────────── │
│ BEGIN TRANSACTION;                                          │
│                                                             │
│ UPDATE videos                                               │
│ SET                                                         │
│   locked_view_count = 45232,                                │
│   locked_at = NOW(),                                        │
│   status = 'locked'                                         │
│ WHERE id = 'v123';                                          │
│                                                             │
│ INSERT INTO view_snapshots (                                │
│   video_id, view_count, snapshot_at, data_source            │
│ ) VALUES (                                                  │
│   'v123', 45232, NOW(), 'tiktok_api_final'                  │
│ );                                                          │
│                                                             │
│ COMMIT;                                                     │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ PHASE 2B: SETTLEMENT CALCULATION                            │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ Campaign Budget Overview:                                   │
│ • Total Budget: $1,000.00                                   │
│ • Base Fee Budget: $250.00 (5 videos × $50, but Mary gets  │
│   $75/video = $375 total)                                   │
│ • Performance Budget Available: $625.00                     │
│                                                             │
│ Final Views Achieved: 45,232 (across all 5 videos so far)   │
│ This specific video (v123): 45,232 views                    │
│                                                             │
│ Calculation for Video 1:                                    │
│ ───────────────────────────────────────────────────────────│
│ Views in thousands: 45232 / 1000 = 45.232                   │
│                                                             │
│ Creator Performance Bonus:                                  │
│   45.232 × $4.00 = $180.93                                  │
│                                                             │
│ Nala Revenue (Markup):                                      │
│   45.232 × $1.00 = $45.23                                   │
│                                                             │
│ Total Performance Cost:                                     │
│   45.232 × $5.00 = $226.16                                  │
│                                                             │
│ [Stored in settlement record]                               │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ PHASE 2C: PAYMENT EXECUTION                                 │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ STEP 1: Creator Performance Bonus Transfer                  │
│ ─────────────────────────────────────────────────────────── │
│ POST /v1/transfers                                          │
│ {                                                           │
│   amount: 18093, // $180.93 in cents                        │
│   currency: "usd",                                          │
│   destination: "acct_mary123",                              │
│   metadata: {                                               │
│     campaign_id: "c456",                                    │
│     video_id: "v123",                                       │
│     payment_type: "performance_bonus",                      │
│     views_achieved: 45232                                   │
│   }                                                         │
│ }                                                           │
│                                                             │
│ Response: { id: "tr_perf456", status: "paid" }              │
│                                                             │
│ INSERT INTO payments (                                      │
│   campaign_id: 'c456',                                      │
│   video_id: 'v123',                                         │
│   recipient_id: mary.id,                                    │
│   amount: 180.93,                                           │
│   type: 'performance_bonus',                                │
│   status: 'completed',                                      │
│   stripe_transfer_id: 'tr_perf456',                         │
│   metadata: {views: 45232}                                  │
│ );                                                          │
│                                                             │
│ STEP 2: Nala Revenue Recording                              │
│ ─────────────────────────────────────────────────────────── │
│ INSERT INTO revenue (                                       │
│   campaign_id: 'c456',                                      │
│   video_id: 'v123',                                         │
│   amount: 45.23,                                            │
│   type: 'markup',                                           │
│   views_count: 45232                                        │
│ );                                                          │
│                                                             │
│ // Funds stay in platform Stripe account                    │
│                                                             │
│ STEP 3: Calculate Campaign-Level Refund                     │
│ ─────────────────────────────────────────────────────────── │
│ // After ALL 5 videos are locked, calculate total refund    │
│                                                             │
│ Total Performance Budget: $625.00                           │
│ Total Performance Cost (all videos): $450.00                │
│ Refund Amount: $625.00 - $450.00 = $175.00                  │
│                                                             │
│ POST /v1/refunds                                            │
│ {                                                           │
│   payment_intent: "pi_founder123",                          │
│   amount: 17500, // $175 in cents                           │
│   reason: "requested_by_customer",                          │
│   metadata: {                                               │
│     campaign_id: "c456",                                    │
│     refund_type: "unspent_performance_budget",              │
│     original_budget: 625.00,                                │
│     actual_cost: 450.00                                     │
│   }                                                         │
│ }                                                           │
│                                                             │
│ Response: { id: "re_refund789", status: "succeeded" }       │
│                                                             │
│ INSERT INTO payments (                                      │
│   campaign_id: 'c456',                                      │
│   recipient_id: mike.id,                                    │
│   amount: 175.00,                                           │
│   type: 'refund',                                           │
│   status: 'completed',                                      │
│   stripe_refund_id: 're_refund789'                          │
│ );                                                          │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ PHASE 2D: FINALIZATION                                      │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ UPDATE campaigns                                            │
│ SET                                                         │
│   status = 'completed',                                     │
│   completed_at = NOW(),                                     │
│   final_views_total = 226160, // Sum of all videos          │
│   total_paid_to_creator = 555.93, // Base + Performance     │
│   total_refunded_to_founder = 175.00,                       │
│   platform_revenue = 226.16 // Nala markup                  │
│ WHERE id = 'c456';                                          │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ PHASE 2E: NOTIFICATIONS & REPORTING                         │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ To Creator (Mary):                                          │
│ ───────────────────────────────────────────────────────────│
│ Subject: Campaign Complete - $180.93 Bonus Paid!            │
│                                                             │
│ Your Q4 Product Launch campaign has ended!                  │
│                                                             │
│ Final Performance:                                          │
│ • Video 1: 45,232 views                                     │
│ • Performance Bonus: $180.93                                │
│ • Total Earned: $255.93 ($75 base + $180.93 bonus)         │
│                                                             │
│ Payment sent to your account.                               │
│                                                             │
│ [View Campaign Report] [Leave Review for Client]            │
│                                                             │
│ ───────────────────────────────────────────────────────────│
│                                                             │
│ To Founder (Mike):                                          │
│ ───────────────────────────────────────────────────────────│
│ Subject: Campaign Complete - $175 Refund Processed          │
│                                                             │
│ Your Q4 Product Launch campaign has concluded!              │
│                                                             │
│ Campaign Performance:                                       │
│ • Total Views: 226,160                                      │
│ • Videos Delivered: 5/5                                     │
│ • Total Spent: $825.00                                      │
│ • Refund Issued: $175.00                                    │
│                                                             │
│ Your refund will appear in 5-7 business days.               │
│                                                             │
│ [Download Performance Report] [Leave Review# Nala Platform - Detailed User Flows
Table of Contents

Creator Onboarding Flow
Founder Campaign Creation Flow
Content Creation & Review Flow
Payment Processing Flow
Performance Tracking Flow
Dispute Resolution Flow


1. Creator Onboarding Flow
1.1 Account Registration
Entry Point: Landing page → "Sign Up as Creator" button
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Basic Information                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Creator enters:                                             │
│  • Full Name                                                │
│  • Email Address                                            │
│  • Password (8+ chars, 1 number, 1 special)                │
│  • Confirm Password                                         │
│                                                             │
│ [Checkbox] I agree to Terms of Service & Privacy Policy    │
│                                                             │
│ [Continue →]                                                │
│                                                             │
│ System Actions:                                             │
│  1. Validate email format and uniqueness                    │
│  2. Hash password (bcrypt)                                  │
│  3. Create user record (role: 'creator')                    │
│  4. Send verification email                                 │
│  5. Create empty creator_profile record                     │
│  6. Generate session token                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Email Verification                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Screen: "Check your email"                                  │
│  📧 We sent a verification link to mary@email.com          │
│                                                             │
│ Creator clicks link in email →                              │
│                                                             │
│ System Actions:                                             │
│  1. Verify token from email link                            │
│  2. Update user.email_verified = true                       │
│  3. Redirect to platform onboarding                         │
└─────────────────────────────────────────────────────────────┘
1.2 Social Media Account Connection
Critical Path: This determines creator eligibility
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Connect Your Platforms                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "Connect your social accounts to start earning"             │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 🎵 TikTok         [Connect Account]   Not Connected │   │
│ │    Minimum: 10,000 followers                        │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 📸 Instagram      [Connect Account]   Not Connected │   │
│ │    Minimum: 5,000 followers                         │   │
│ │    ⚠️ Requires Business Account                     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 👍 Facebook       [Connect Account]   Not Connected │   │
│ │    Minimum: 5,000 followers                         │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Note: Connect at least one platform to continue            │
│                                                             │
│ [Skip for now]  [Continue]  ← Disabled until 1 connected   │
└─────────────────────────────────────────────────────────────┘
1.2.1 TikTok Connection Sub-Flow
Creator clicks "Connect Account" on TikTok
                ↓
┌─────────────────────────────────────────────────────────────┐
│ POPUP: TikTok OAuth                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ System Actions:                                             │
│  1. Generate OAuth state token (CSRF protection)            │
│  2. Redirect to TikTok Login Kit:                           │
│     https://www.tiktok.com/auth/authorize/                  │
│     ?client_key={CLIENT_KEY}                                │
│     &scope=user.info.basic,video.list,video.insights        │
│     &response_type=code                                     │
│     &redirect_uri={CALLBACK_URL}                            │
│     &state={STATE_TOKEN}                                    │
│                                                             │
│ Creator sees TikTok login screen →                          │
│  • Logs into TikTok (if not already)                        │
│  • Reviews permissions request                              │
│  • Clicks "Authorize"                                       │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ CALLBACK: TikTok Returns to Nala                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ System Actions:                                             │
│  1. Receive authorization code                              │
│  2. Verify state token (prevent CSRF)                       │
│  3. Exchange code for access token:                         │
│     POST https://open-api.tiktok.com/oauth/access_token/    │
│  4. Fetch user profile:                                     │
│     GET /v2/user/info/                                      │
│  5. Extract: username, follower_count, user_id              │
│                                                             │
│  6. Validate eligibility:                                   │
│     IF follower_count < 10,000:                             │
│       ❌ Show error: "Minimum 10K followers required"       │
│       STOP                                                  │
│                                                             │
│  7. Store in database:                                      │
│     INSERT INTO social_accounts (                           │
│       creator_id, platform, platform_user_id,               │
│       username, follower_count,                             │
│       access_token [ENCRYPTED], refresh_token [ENCRYPTED],  │
│       token_expires_at, verified_at                         │
│     )                                                       │
│                                                             │
│  8. Update creator_profile.verification_status = 'verified' │
│  9. Show success message                                    │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ SUCCESS SCREEN                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ✅ TikTok Connected Successfully!                           │
│                                                             │
│ @marythcreator                                              │
│ 47,234 followers                                            │
│                                                             │
│ [Connect Another Platform]  [Continue →]                    │
└─────────────────────────────────────────────────────────────┘
1.2.2 Instagram Connection Sub-Flow
Note: More complex due to Business Account requirement
Creator clicks "Connect Account" on Instagram
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Check Account Type                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "Do you have an Instagram Business or Creator Account?"     │
│                                                             │
│ [Yes, I have a Business Account] → Continue to OAuth        │
│ [No, I have a Personal Account] → Show conversion guide     │
│                                                             │
│ IF "No" selected:                                           │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ ℹ️  How to Convert to Business Account:            │   │
│ │                                                     │   │
│ │ 1. Open Instagram app                              │   │
│ │ 2. Go to Settings → Account                        │   │
│ │ 3. Select "Switch to Professional Account"         │   │
│ │ 4. Choose "Business"                               │   │
│ │ 5. Connect to Facebook Page                        │   │
│ │                                                     │   │
│ │ [Watch Video Tutorial]  [I've Converted]           │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Facebook Login (Required for Instagram)             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ System Actions:                                             │
│  1. Redirect to Facebook OAuth:                             │
│     https://www.facebook.com/v18.0/dialog/oauth             │
│     ?client_id={APP_ID}                                     │
│     &redirect_uri={CALLBACK}                                │
│     &scope=instagram_basic,instagram_manage_insights,       │
│             pages_read_engagement                           │
│                                                             │
│ Creator:                                                    │
│  • Logs into Facebook                                       │
│  • Selects connected Instagram Business Account            │
│  • Grants permissions                                       │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Fetch Instagram Data                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ System Actions:                                             │
│  1. Exchange code for access token                          │
│  2. Get Instagram Business Account ID:                      │
│     GET /{facebook-page-id}?fields=instagram_business_accou │
│     nt                                                      │
│  3. Get Instagram profile data:                             │
│     GET /{ig-user-id}?fields=username,followers_count       │
│                                                             │
│  4. Validate:                                               │
│     IF followers_count < 5,000:                             │
│       ❌ Error: "Minimum 5K followers required"             │
│     IF account_type != 'BUSINESS':                          │
│       ❌ Error: "Business account required"                 │
│                                                             │
│  5. Store data (same as TikTok flow)                        │
└─────────────────────────────────────────────────────────────┘
1.3 Profile Setup
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Set Your Rates                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "How much do you charge per video?"                         │
│                                                             │
│ TikTok Base Fee:                                            │
│ [$75] ◄────●────────────────► [$500]                       │
│  $50                                  Max                   │
│                                                             │
│ 💡 Most creators charge: $75-$150                           │
│ 📊 Your potential earnings for 100K views:                  │
│     Base Fee: $75 + Performance: $400 = $475 total          │
│                                                             │
│ Instagram Base Fee:                                         │
│ [$75] ◄────●────────────────► [$500]                       │
│                                                             │
│ Facebook Base Fee:                                          │
│ [$75] ◄────●────────────────► [$500]                       │
│                                                             │
│ [Continue →]                                                │
│                                                             │
│ System Actions:                                             │
│  • Update creator_profile with base fees                    │
│  • Calculate average fee for matching algorithm             │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Build Your Portfolio                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "Upload 3-10 sample videos to showcase your style"          │
│                                                             │
│ [Drag & Drop Videos Here]                                   │
│  or [Browse Files]                                          │
│                                                             │
│ Uploaded (2/10):                                            │
│ ┌─────────┐  ┌─────────┐                                   │
│ │ [Video] │  │ [Video] │  [+ Add More]                     │
│ │  30s    │  │  45s    │                                   │
│ └─────────┘  └─────────┘                                   │
│                                                             │
│ For each video:                                             │
│  • Title: [Product Review - SaaS Tool]                      │
│  • Platform: [TikTok ▼]                                     │
│                                                             │
│ [Skip for now]  [Continue →]                                │
│                                                             │
│ System Actions:                                             │
│  1. Upload to S3 (max 500MB per video)                      │
│  2. Generate thumbnail (frame at 2s)                        │
│  3. Transcode to web format (H.264, 720p)                   │
│  4. Store metadata in creator_profile.portfolio_videos      │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Category & Bio                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ What niches do you specialize in? (Select all that apply)   │
│                                                             │
│ ☑ SaaS & Software    ☐ E-commerce     ☐ Health & Fitness   │
│ ☑ B2B Tech           ☐ Beauty         ☐ Food & Beverage    │
│ ☐ Finance            ☐ Fashion        ☐ Gaming             │
│                                                             │
│ Tell brands about yourself: (500 char max)                  │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Hi! I'm Mary, a tech enthusiast who creates          │   │
│ │ engaging video reviews for SaaS products. My         │   │
│ │ audience loves honest, detailed breakdowns...        │   │
│ │                                                      │   │
│ │ 347/500 characters                                   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ [Back]  [Complete Setup →]                                  │
│                                                             │
│ System Actions:                                             │
│  • Update creator_profile.categories                        │
│  • Update creator_profile.bio                               │
│  • Set profile_completed = true                             │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Payment Setup (Stripe Connect)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "Last step: Set up payouts"                                 │
│                                                             │
│ Nala uses Stripe to send you payments securely.             │
│                                                             │
│ [Connect Stripe Account]                                    │
│                                                             │
│ System Actions:                                             │
│  1. Create Stripe Connect Express account link:             │
│     POST /v1/account_links                                  │
│     type: 'account_onboarding'                              │
│  2. Redirect creator to Stripe hosted onboarding            │
│                                                             │
│ Creator completes on Stripe:                                │
│  • Personal information (name, DOB, SSN)                    │
│  • Business details (if applicable)                         │
│  • Bank account for deposits                                │
│  • Identity verification (photo ID)                         │
│                                                             │
│ Stripe redirects back to Nala with account_id               │
│                                                             │
│ System Actions:                                             │
│  1. Store stripe_account_id in users table                  │
│  2. Verify account capabilities:                            │
│     - transfers: 'active'                                   │
│     - card_payments: 'active' (if needed)                   │
│  3. Mark creator as payment_ready = true                    │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ 🎉 SUCCESS: You're All Set!                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Your creator profile is live!                               │
│                                                             │
│ ✅ TikTok connected (47K followers)                         │
│ ✅ Base fee set ($75/video)                                 │
│ ✅ Portfolio added (2 videos)                               │
│ ✅ Payments ready                                           │
│                                                             │
│ Next steps:                                                 │
│ • Brands will discover your profile                         │
│ • You'll receive brief invitations                          │
│ • Start earning with performance-based pay!                 │
│                                                             │
│ [Go to Dashboard →]                                         │
└─────────────────────────────────────────────────────────────┘

2. Founder Campaign Creation Flow
2.1 Campaign Initiation
Entry Point: Dashboard → "Create Campaign" button
┌─────────────────────────────────────────────────────────────┐
│ Create New Campaign                     [Save Draft] [Exit] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Progress: ●──○──○──○──○──○  Step 1 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 1: Campaign Basics                                     │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ Campaign Name: *                                            │
│ [Q4 Product Launch Campaign                              ] │
│                                                             │
│ What are you promoting?                                     │
│ [ProductivityPro - AI-powered task management SaaS       ] │
│                                                             │
│ Target Audience:                                            │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Professionals aged 25-40, interested in              │   │
│ │ productivity tools, remote workers, small business   │   │
│ │ owners.                                              │   │
│ │                                                      │   │
│ │ 178/500 characters                                   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Campaign Goal:                                              │
│ ○ Brand Awareness    ● Website Traffic    ○ Signups        │
│ ○ Sales              ○ App Downloads                        │
│                                                             │
│ [Continue →]                                                │
│                                                             │
│ System Actions:                                             │
│  • Auto-save every 30 seconds                               │
│  • Create draft campaign record                             │
│  • Status: 'draft'                                          │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ Progress: ●──●──○──○──○──○  Step 2 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 2: Content Requirements                                │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ How many videos do you need?                                │
│ [5▼] videos                                                 │
│  (Min: 1, Max: 10 per campaign)                             │
│                                                             │
│ Preferred video length:                                     │
│ ○ 15 seconds     ● 30 seconds                               │
│ ○ 60 seconds     ○ Creator's choice                         │
│                                                             │
│ Which platforms? (Select all that apply)                    │
│ ☑ TikTok    ☑ Instagram Reels    ☐ Facebook Reels          │
│                                                             │
│ Video style preference:                                     │
│ ☑ Product Tutorial    ☐ Unboxing    ☐ Testimonial          │
│ ☐ Behind the Scenes   ☐ Comparison                          │
│                                                             │
│ [← Back]  [Continue →]                                      │
│                                                             │
│ System Actions:                                             │
│  • Update campaign.videos_requested = 5                     │
│  • Store platform preferences in brief_data JSONB           │
│  • Calculate estimated budget preview                       │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ Progress: ●──●──●──○──○──○  Step 3 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 3: Creative Brief                                      │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ Key Talking Points: (What should the creator highlight?)    │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ • AI-powered task prioritization                    │   │
│ │ • Integrates with 50+ tools (Slack, Gmail, etc)     │   │
│ │ • Saves 2 hours per day on average                  │   │
│ │ • Free 14-day trial available                       │   │
│ │                                                      │   │
│ │ [+ Add Point]                                        │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Brand Guidelines: (Upload PDF, images, or describe)         │
│ [📄 Brand_Guidelines.pdf] [✓ Uploaded]  [Remove]           │
│ [+ Upload Assets] (Logo, product images, etc.)              │
│                                                             │
│ Do's:                          │ Don'ts:                    │
│ • Be authentic                 │ • Compare to competitors   │
│ • Show real use cases          │ • Make health claims       │
│ • Use trending audio           │ • Show competitor logos    │
│ [+ Add]                        │ [+ Add]                    │
│                                                             │
│ Required Hashtags/Mentions:                                 │
│ [#ProductivityPro #AItools @productivitypro_official     ] │
│                                                             │
│ Reference Videos: (Optional - paste URLs)                   │
│ [https://tiktok.com/@competitor/video/123                ] │
│ [+ Add Another]                                             │
│                                                             │
│ [← Back]  [Continue →]                                      │
│                                                             │
│ System Actions:                                             │
│  • Store all data in campaign.brief_data (JSONB)            │
│  • Upload brand assets to S3                                │
│  • Generate brief preview PDF                               │
└─────────────────────────────────────────────────────────────┘
2.2 Posting Schedule & Budget Configuration
┌─────────────────────────────────────────────────────────────┐
│ Progress: ●──●──●──●──○──○  Step 4 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 4: Posting Schedule                                    │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ When should the first video go live?                        │
│ [Nov 25, 2025 ▼]  📅                                        │
│  (Minimum 5 days from today for creator prep)               │
│                                                             │
│ How often should videos be posted?                          │
│ ● One per day           ○ Every other day                   │
│ ○ Every 3 days          ○ Weekly                            │
│ ○ Custom schedule                                           │
│                                                             │
│ 📅 Your Posting Calendar:                                   │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Video 1:  Nov 25 (Mon) 📱 TikTok                    │   │
│ │ Video 2:  Nov 26 (Tue) 📱 TikTok                    │   │
│ │ Video 3:  Nov 27 (Wed) 📸 Instagram                 │   │
│ │ Video 4:  Nov 28 (Thu) 📸 Instagram                 │   │
│ │ Video 5:  Nov 29 (Fri) 📱 TikTok                    │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Preferred posting time: (Optional)                          │
│ [09:00 AM ▼]  [EST ▼]                                       │
│                                                             │
│ [← Back]  [Continue →]                                      │
│                                                             │
│ System Actions:                                             │
│  • Calculate posting dates                                  │
│  • Store in campaign.start_date, posting_frequency          │
│  • Validate timeline (min 5 days buffer)                    │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ Progress: ●──●──●──●──●──○  Step 5 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 5: Budget Configuration                                │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ 💰 Set Your Total Budget                                    │
│                                                             │
│ Total Campaign Budget:                                      │
│ $ [1000.00]                                                 │
│   (Minimum: $500 | Maximum: $50,000)                        │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 📊 BUDGET BREAKDOWN                                  │   │
│ │                                                      │   │
│ │ Fixed Production Costs:         $250.00 (25%)       │   │
│ │ └─ 5 videos × $50 base fee                          │   │
│ │                                                      │   │
│ │ Variable Performance Budget:    $750.00 (75%)       │   │
│ │ └─ Pays for actual views achieved                   │   │
│ │                                                      │   │
│ │ ─────────────────────────────────────────────────   │   │
│ │                                                      │   │
│ │ Maximum Views You Can Purchase:                     │   │
│ │ 150,000 views @ $5.00 per 1,000                     │   │
│ │                                                      │   │
│ │ ═════════════════════════════════════════════════   │   │
│ │                                                      │   │
│ │ 💡 How Performance Budget Works:                    │   │
│ │                                                      │   │
│ │ If videos achieve 120K views (80% of max):          │   │
│ │  • You pay: $250 + $600 = $850                      │   │
│ │  • You save: $150 (refunded automatically)          │   │
│ │                                                      │   │
│ │ If videos achieve 150K views (100% of max):         │   │
│ │  • You pay: $250 + $750 = $1,000 (full budget)      │   │
│ │  • You save: $0 (great performance!)                │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ☑ I understand that:                                        │
│    • Base fees are paid when I approve content              │
│    • Performance budget is charged based on actual views    │
│    • Unused budget is refunded automatically after 7 days   │
│                                                             │
│ [← Back]  [Continue to Creator Selection →]                 │
│                                                             │
│ System Actions:                                             │
│  • Validate budget (min $500)                               │
│  • Calculate: base_fee_budget, performance_budget           │
│  • Store in campaigns table                                 │
│  • Update max_views_purchasable                             │
└─────────────────────────────────────────────────────────────┘
│                                                             │
│ Next up: Video 2 (Due Nov 23)                               │
│                                                             │
│ [View All Briefs]  [Upload Next Video]                      │
└─────────────────────────────────────────────────────────────┘

### 3.3 Founder Content Review

**Trigger:** Founder receives notification of new draft
┌─────────────────────────────────────────────────────────────┐
│ FOUNDER DASHBOARD - Content Review Queue                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🔔 1 video ready for review                                 │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Q4 Product Launch Campaign                           │   │
│ │                                                      │   │
│ │ 🎥 Video 1 of 5 - TikTok                            │   │
│ │ Submitted by @marythcreator  |  2 hours ago         │   │
│ │                                                      │   │
│ │ [Review Now →]                                       │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
↓ (Founder clicks "Review Now")
┌─────────────────────────────────────────────────────────────┐
│ 📹 CONTENT REVIEW INTERFACE                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────┬───────────────────────────┐   │
│ │ 🎥 VIDEO PLAYER         │ 📋 BRIEF REQUIREMENTS     │   │
│ │                         │                           │   │
│ │  ┌─────────────────┐   │ ✓ 30 seconds              │   │
│ │  │                 │   │ ✓ Product tutorial style  │   │
│ │  │  [▶ Play]       │   │ ✓ #ProductivityPro used   │   │
│ │  │                 │   │                           │   │
│ │  │  Mary's Draft   │   │ Key Talking Points:       │   │
│ │  │  Video          │   │ • AI prioritization ✓     │   │
│ │  │                 │   │ • 50+ integrations ✓      │   │
│ │  │  0:15 / 0:30    │   │ • Free trial ✓            │   │
│ │  └─────────────────┘   │                           │   │
│ │                         │ Do's/Don'ts Check:        │   │
│ │  [0.5x] [1x] [2x]      │ ✓ Authentic               │   │
│ │  [Download]            │ ✓ Real use case shown     │   │
│ │                         │ ✓ No competitor mentions  │   │
│ └─────────────────────────┴───────────────────────────┘   │
│                                                             │
│ Creator's Notes:                                            │
│ "I focused on the AI prioritization feature as requested.   │
│  Used trending audio 'That's Crazy'."                       │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ YOUR FEEDBACK                                               │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ Add Comments: (Timestamped annotations)                     │
│ [Click on video timeline to add feedback at specific times] │
│                                                             │
│ ┌─ Annotations ───────────────────────────────────────┐   │
│ │ 0:05 - "Love the opening hook!" - You                │   │
│ │ 0:15 - "Can you show the UI here?" - You             │   │
│ │ [+ Add Comment]                                      │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ DECISION                                                    │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ [✅ Approve]   [📝 Request Revision]   [❌ Reject]          │
│                                                             │
│ ⚠️ Important: Approving will trigger payment of $75 to      │
│    creator. This cannot be undone.                          │
└─────────────────────────────────────────────────────────────┘

#### 3.3.1 Approval Flow
Founder clicks "✅ Approve"
↓
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ CONFIRM APPROVAL                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ You are about to approve Video 1                            │
│                                                             │
│ This will:                                                  │
│ ✓ Authorize creator to post on Nov 25                       │
│ ✓ Release $75 payment to @marythcreator                     │
│ ✓ Grant you perpetual content usage rights                  │
│                                                             │
│ ⚠️ This action cannot be undone                             │
│                                                             │
│ [Cancel]  [Confirm Approval]                                │
│                                                             │
│ System Actions (Confirm):                                   │
│  1. Update video.status = 'approved'                        │
│  2. Update video.approved_at = NOW()                        │
│  3. Trigger Phase 1 Payment (T-305):                        │
│     a. Verify escrow has sufficient funds                   │
│     b. Create Stripe transfer:                              │
│        POST /v1/transfers                                   │
│        {                                                    │
│          amount: 7500, // $75 in cents                      │
│          currency: 'usd',                                   │
│          destination: mary.stripe_account_id,               │
│          transfer_group: campaign.id,                       │
│          metadata: {                                        │
│            campaign_id, video_id,                           │
│            payment_type: 'base_fee'                         │
│          }                                                  │
│        }                                                    │
│     c. Create payment record in database                    │
│     d. Update video.base_fee_paid = true                    │
│  4. Send notifications:                                     │
│     • Creator: "Payment sent! $75 on the way"               │
│     • Founder: "Approval confirmed"                         │
│  5. Update campaign.videos_approved += 1                    │
│  6. Decrement escrow balance                                │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ ✅ VIDEO APPROVED                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Video 1 has been approved!                                  │
│                                                             │
│ ✓ $75 payment sent to @marythcreator                        │
│ ✓ Creator authorized to post on Nov 25                      │
│                                                             │
│ Next: Wait for creator to post and track performance        │
│                                                             │
│ [View Campaign Dashboard]  [Review Next Video]              │
└─────────────────────────────────────────────────────────────┘

#### 3.3.2 Revision Request Flow
Founder clicks "📝 Request Revision"
↓
┌─────────────────────────────────────────────────────────────┐
│ 📝 REQUEST REVISION                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ What needs to be changed?                                   │
│ (Be specific to help the creator deliver what you need)     │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Please make the following changes:                   │   │
│ │                                                      │   │
│ │ 1. At 0:15, show the actual ProductivityPro UI       │   │
│ │    instead of generic screenshots                    │   │
│ │                                                      │   │
│ │ 2. Add more emphasis on the "2 hours saved" stat    │   │
│ │                                                      │   │
│ │ 3. Include a call-to-action to try the free trial   │   │
│ │                                                      │   │
│ │ 187/1000 characters                                  │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Revision deadline:                                          │
│ [48 hours ▼]  from now (Nov 21 at 2:00 PM)                 │
│                                                             │
│ Priority:                                                   │
│ ○ Minor tweaks     ● Significant changes     ○ Major rework│
│                                                             │
│ ☑ Allow creator to ask clarifying questions                │
│                                                             │
│ [Cancel]  [Send Revision Request]                           │
│                                                             │
│ System Actions (Send):                                      │
│  1. Update video.status = 'revision_requested'              │
│  2. Create revision record:                                 │
│     INSERT INTO revisions (                                 │
│       video_id, requested_by, feedback,                     │
│       deadline, priority, iteration_number                  │
│     )                                                       │
│  3. Send notification to creator (high priority)            │
│  4. Email with full feedback                                │
│  5. Create task in creator dashboard                        │
│  6. Set reminder 12 hours before deadline                   │
└─────────────────────────────────────────────────────────────┘

### 3.4 Video Posting & URL Submission
┌─────────────────────────────────────────────────────────────┐
│ CREATOR - Post-Approval Phase                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🎉 Video 1 Approved!                                        │
│                                                             │
│ ✓ $75 payment sent (check your wallet)                      │
│ ✓ Ready to post on Nov 25                                   │
│                                                             │
│ ⚠️ Important Reminder:                                      │
│ • Post exactly on Nov 25                                    │
│ • Use hashtags: #ProductivityPro                            │
│ • After posting, submit the live URL here immediately       │
│                                                             │
│ [I've Posted - Submit URL]  [View Posting Instructions]     │
└─────────────────────────────────────────────────────────────┘
↓ (After posting on TikTok/Instagram)
┌─────────────────────────────────────────────────────────────┐
│ 🔗 SUBMIT POST URL                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Video 1 - TikTok Post                                       │
│                                                             │
│ Paste your live post URL:                                   │
│ [https://tiktok.com/@marythcreator/video/7298547382...  ]  │
│                                                             │
│ Posting Date/Time:                                          │
│ [Nov 25, 2025]  [09:30 AM]  [EST ▼]                        │
│                                                             │
│ Screenshot (Optional but recommended):                      │
│ [Upload screenshot showing post is live]                    │
│                                                             │
│ [Cancel]  [Submit & Start Tracking]                         │
│                                                             │
│ System Actions (Submit):                                    │
│  1. Validate URL format (TikTok/Instagram domain)           │
│  2. Extract post ID from URL                                │
│  3. Verify post exists via API (optional check)             │
│  4. Update video record:                                    │
│     • status = 'posted'                                     │
│     • final_post_url = submitted_url                        │
│     • posted_at = submitted_datetime                        │
│  5. Calculate 7-day lock time:                              │
│     lock_at = posted_at + INTERVAL '7 days'                 │
│  6. Add to view polling queue (T-302)                       │
│  7. Send confirmation to founder                            │
│  8. Initialize first view count snapshot (within 1 hour)    │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ ✅ POST URL SUBMITTED                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Your post is now being tracked!                             │
│                                                             │
│ 📊 Performance tracking started                             │
│ 🕐 7-day window: Nov 25 - Dec 2                             │
│                                                             │
│ What happens next:                                          │
│ • Views are updated daily at 12:00 AM EST                   │
│ • Your performance bonus accumulates in real-time           │
│ • On Dec 2, final views are locked                          │
│ • Your bonus is paid automatically within 24 hours          │
│                                                             │
│ Current performance:                                        │
│ Views: 1,247  |  Est. Bonus: $4.99                          │
│                                                             │
│ [View Live Performance]  [Continue to Next Video]           │
└─────────────────────────────────────────────────────────────┘

---

## 4. Payment Processing Flow

### 4.1 Phase 1: Base Fee Payment (Detailed)

**Trigger:** Founder approves content (see 3.3.1)
┌─────────────────────────────────────────────────────────────┐
│ SYSTEM: Phase 1 Payment Processor                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Event: video.approved (video_id: v123, campaign_id: c456)   │
│                                                             │
│ STEP 1: Pre-Flight Validation                               │
│ ─────────────────────────────────────────────────────────── │
│ ✓ Check campaign has sufficient escrow balance              │
│   Current escrow: $1,000                                    │
│   Required: $75                                             │
│   Remaining after: $925                                     │
│                                                             │
│ ✓ Verify creator Stripe account is active                   │
│   stripe_account_id: acct_mary123                           │
│   capabilities.transfers: 'active'                          │
│                                                             │
│ ✓ Check for duplicate payment (idempotency)                 │
│   Query: SELECT * FROM payments                             │
│          WHERE video_id='v123' AND type='base_fee'          │
│   Result: No existing payment found ✓                       │
│                                                             │
│ STEP 2: Create Database Payment Record (Pending)            │
│ ─────────────────────────────────────────────────────────── │
│ INSERT INTO payments (                                      │
│   id: 'pay_abc123',                                         │
│   campaign_id: 'c456',                                      │
│   video_id: 'v123',                                         │
│   recipient_id: mary.id,                                    │
│   amount: 75.00,                                            │
│   type: 'base_fee',                                         │
│   status: 'pending',                                        │
│   created_at: NOW()                                         │
│ )                                                           │
│                                                             │
│ STEP 3: Stripe API Call (With Idempotency Key)              │
│ ─────────────────────────────────────────────────────────── │
│ POST https://api.stripe.com/v1/transfers                    │
│ Headers:                                                    │
│   Authorization: Bearer sk_live_xxx                         │
│   Idempotency-Key: c456_v123_base_fee_1732012800           │
│                                                             │
│ Body:                                                       │
│ {                                                           │
│   amount: 7500,                                             │
│   currency: "usd",                                          │
│   destination: "acct_mary123",                              │
│   transfer_group: "c456",                                   │
│   description: "Base fee - Video 1 approval",               │
│   metadata: {                                               │
│     campaign_id: "c456",                                    │
│     video_id: "v123",                                       │
│     payment_type: "base_fee",                               │
│     founder_id: "mike.id",                                  │
│     creator_id: "mary.id"                                   │
│   }                                                         │
│ }                                                           │
│                                                             │
│ Response: (Success)                                         │
│ {                                                           │
│   id: "tr_stripe789",                                       │
│   object: "transfer",                                       │
│   amount: 7500,                                             │
│   created: 1732012800,                                      │
│   destination: "acct_mary123",                              │
│   status: "paid"                                            │
│ }                                                           │
│                                                             │
│ STEP 4: Update Database (Success State)                     │
│ ─────────────────────────────────────────────────────────── │
│ UPDATE payments                                             │
│ SET                                                         │
│   status = 'completed',                                     │
│   stripe_transfer_id = 'tr_stripe789',                      │
│   processed_at = NOW()                                      │
│ WHERE id = 'pay_abc123';                                    │
│                                                             │
│ UPDATE videos                                               │
│ SET base_fee_paid = true                                    │
│ WHERE id = 'v123';                                          │
│                                                             │
│ UPDATE campaigns                                            │
│ SET escrow_balance = escrow_balance - 75.00                 │
│ WHERE id = 'c456';                                          │
│                                                             │
│ STEP 5: Notifications & Webhooks                            │
│ ─────────────────────────────────────────────────────────── │
│ • Send email to creator: "Payment sent: $75"                │
│ • Push notification to creator app                          │
│ • Update creator wallet balance (live)                      │
│ • Send confirmation to founder                              │
│ • Log event to analytics                                    │
│                                                             │
│ ✅ Phase 1 Payment Complete                                 │
└─────────────────────────────────────────────────────────────┘

### 4.2 Phase 2: Performance Bonus & Refund (7-Day Settlement)

**Trigger:** Automated cron job detects video.posted_at >= 168 hours ago
┌─────────────────────────────────────────────────────────────┐
│ SYSTEM: 7-Day Metric Lock & Settlement Processor            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Cron Job: Daily at 12:05 AM EST                             │
│ Query: SELECT * FROM videos                                 │
│        WHERE status = 'posted'                              │
│        AND posted_at <= NOW() - INTERVAL '168 hours'        │
│        AND status != 'locked'                               │
│                                                             │
│ Result: video_id 'v123' eligible for lock                   │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ PHASE 2A: METRIC LOCK                                       │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ STEP 1: Final View Count Fetch                              │
│ ─────────────────────────────────────────────────────────── │
│ • Platform: TikTok                                          │
│ • Post URL: https://tiktok.com/@marythcreator/video/729... │
│                                                             │
│ API Call: GET /v2/video/query/                              │
│ {                                                           │
│   video_id: "7298547382..."                                 │
│ }                                                           │
│                                                             │
│ Response:                                                   │
│ {                                                           │
│   data: {                                                   │
│     view_count: 45232,                                      │
│     like_count: 3421,                                       │
│     share_count: 287                                        │
│   }                                                         │
│ }                                                           │
│                                                             │
│ STEP 2: Lock View Count (Immutable)                         │
│ ─────────────────────────────────────────────────────────── │
│ BEGIN TRANSACTION;                                          │
│                                                             │
│ UPDATE videos                                               │
│ SET                                                         │
│   locked_view_count = 45232,                                │
│   locked_at = NOW(),                                        │
│   status = 'locked'                                         │
│ WHERE id = 'v123';                                          │
│                                                             │
│ INSERT INTO view_snapshots (                                │
│   video_id, view_count, snapshot_at, data_source            │
│ ) VALUES (                                                  │
│   'v123', 45232, NOW(), 'tiktok_api_final'                  │
│ );                                                          │
│                                                             │
│ COMMIT;                                                     │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ PHASE 2B: SETTLEMENT CALCULATION                            │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ Campaign Budget Overview:                                   │
│ • Total Budget: $1,000.00                                   │
│ • Base Fee Budget: $250.00 (5 videos × $50, but Mary gets  │
│   $75/video = $375 total)                                   │
│ • Performance Budget Available: $625.00                     │
│                                                             │
│ Final Views Achieved: 45,232 (across all 5 videos so far)   │
│ This specific video (v123): 45,232 views                    │
│                                                             │
│ Calculation for Video 1:                                    │
│ ───────────────────────────────────────────────────────────│
│ Views in thousands: 45232 / 1000 = 45.232                   │
│                                                             │
│ Creator Performance Bonus:                                  │
│   45.232 × $4.00 = $180.93                                  │
│                                                             │
│ Nala Revenue (Markup):                                      │
│   45.232 × $1.00 = $45.23                                   │
│                                                             │
│ Total Performance Cost:                                     │
│   45.232 × $5.00 = $226.16                                  │
│                                                             │
│ [Stored in settlement record]                               │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ PHASE 2C: PAYMENT EXECUTION                                 │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ STEP 1: Creator Performance Bonus Transfer                  │
│ ─────────────────────────────────────────────────────────── │
│ POST /v1/transfers                                          │
│ {                                                           │
│   amount: 18093, // $180.93 in cents                        │
│   currency: "usd",                                          │
│   destination: "acct_mary123",                              │
│   metadata: {                                               │
│     campaign_id: "c456",                                    │
│     video_id: "v123",                                       │
│     payment_type: "performance_bonus",                      │
│     views_achieved: 45232                                   │
│   }                                                         │
│ }                                                           │
│                                                             │
│ Response: { id: "tr_perf456", status: "paid" }              │
│                                                             │
│ INSERT INTO payments (                                      │
│   campaign_id: 'c456',                                      │
│   video_id: 'v123',                                         │
│   recipient_id: mary.id,                                    │
│   amount: 180.93,                                           │
│   type: 'performance_bonus',                                │
│   status: 'completed',                                      │
│   stripe_transfer_id: 'tr_perf456',                         │
│   metadata: {views: 45232}                                  │
│ );                                                          │
│                                                             │
│ STEP 2: Nala Revenue Recording                              │
│ ─────────────────────────────────────────────────────────── │
│ INSERT INTO revenue (                                       │
│   campaign_id: 'c456',                                      │
│   video_id: 'v123',                                         │
│   amount: 45.23,                                            │
│   type: 'markup',                                           │
│   views_count: 45232                                        │
│ );                                                          │
│                                                             │
│ // Funds stay in platform Stripe account                    │
│                                                             │
│ STEP 3: Calculate Campaign-Level Refund                     │
│ ─────────────────────────────────────────────────────────── │
│ // After ALL 5 videos are locked, calculate total refund    │
│                                                             │
│ Total Performance Budget: $625.00                           │
│ Total Performance Cost (all videos): $450.00                │
│ Refund Amount: $625.00 - $450.00 = $175.00                  │
│                                                             │
│ POST /v1/refunds                                            │
│ {                                                           │
│   payment_intent: "pi_founder123",                          │
│   amount: 17500, // $175 in cents                           │
│   reason: "requested_by_customer",                          │
│   metadata: {                                               │
│     campaign_id: "c456",                                    │
│     refund_type: "unspent_performance_budget",              │
│     original_budget: 625.00,                                │
│     actual_cost: 450.00                                     │
│   }                                                         │
│ }                                                           │
│                                                             │
│ Response: { id: "re_refund789", status: "succeeded" }       │
│                                                             │
│ INSERT INTO payments (                                      │
│   campaign_id: 'c456',                                      │
│   recipient_id: mike.id,                                    │
│   amount: 175.00,                                           │
│   type: 'refund',                                           │
│   status: 'completed',                                      │
│   stripe_refund_id: 're_refund789'                          │
│ );                                                          │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ PHASE 2D: FINALIZATION                                      │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ UPDATE campaigns                                            │
│ SET                                                         │
│   status = 'completed',                                     │
│   completed_at = NOW(),                                     │
│   final_views_total = 226160, // Sum of all videos          │
│   total_paid_to_creator = 555.93, // Base + Performance     │
│   total_refunded_to_founder = 175.00,                       │
│   platform_revenue = 226.16 // Nala markup                  │
│ WHERE id = 'c456';                                          │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ PHASE 2E: NOTIFICATIONS & REPORTING                         │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ To Creator (Mary):                                          │
│ ───────────────────────────────────────────────────────────│
│ Subject: Campaign Complete - $180.93 Bonus Paid!            │
│                                                             │
│ Your Q4 Product Launch campaign has ended!                  │
│                                                             │
│ Final Performance:                                          │
│ • Video 1: 45,232 views                                     │
│ • Performance Bonus: $180.93                                │
│ • Total Earned: $255.93 ($75 base + $180.93 bonus)         │
│                                                             │
│ Payment sent to your account.                               │
│                                                             │
│ [View Campaign Report] [Leave Review for Client]            │
│                                                             │
│ ───────────────────────────────────────────────────────────│
│                                                             │
│ To Founder (Mike):                                          │
│ ───────────────────────────────────────────────────────────│
│ Subject: Campaign Complete - $175 Refund Processed          │
│                                                             │
│ Your Q4 Product Launch campaign has concluded!              │
│                                                             │
│ Campaign Performance:                                       │
│ • Total Views: 226,160                                      │
│ • Videos Delivered: 5/5                                     │
│ • Total Spent: $825.00                                      │
│ • Refund Issued: $175.00                                    │
│                                                             │
│ Your refund will appear in 5-7 business days.               │
│                                                             │
│ [Download Performance Report] [Leave Review for Creator]     │
│                                                             │
│ ✅ Phase 2 Settlement Complete                              │
└─────────────────────────────────────────────────────────────┘

### 4.3 Error Handling & Recovery Flows
┌─────────────────────────────────────────────────────────────┐
│ ERROR SCENARIO 1: Stripe Transfer Fails                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Stripe API Response (Error):                                │
│ {                                                           │
│   error: {                                                  │
│     type: "invalid_request_error",                          │
│     code: "account_invalid",                                │
│     message: "The destination account is not active"        │
│   }                                                         │
│ }                                                           │
│                                                             │
│ System Recovery Actions:                                    │
│ ───────────────────────────────────────────────────────────│
│ 1. Update payment status to 'failed'                        │
│ 2. Add to retry queue with exponential backoff:             │
│    • Retry 1: 1 minute later                                │
│    • Retry 2: 5 minutes later                               │
│    • Retry 3: 15 minutes later                              │
│ 3. If all retries fail:                                     │
│    • Flag for manual review                                 │
│    • Alert admin dashboard                                  │
│    • Notify creator: "Payment delayed - we're fixing it"    │
│ 4. Admin manually resolves:                                 │
│    • Contact creator to update Stripe account               │
│    • Process payment manually once fixed                    │
│    • Log resolution in audit trail                          │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ ERROR SCENARIO 2: API View Count Unavailable                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ TikTok API Response (Error):                                │
│ {                                                           │
│   error: {                                                  │
│     code: 10000,                                            │
│     message: "Server internal error"                        │
│   }                                                         │
│ }                                                           │
│                                                             │
│ System Recovery Actions:                                    │
│ ───────────────────────────────────────────────────────────│
│ 1. Use last known view count from database:                 │
│    SELECT view_count FROM view_snapshots                    │
│    WHERE video_id = 'v123'                                  │
│    ORDER BY snapshot_at DESC LIMIT 1                        │
│                                                             │
│ 2. Lock with last known count + flag:                       │
│    locked_view_count = 43180 (last snapshot)                │
│    locked_with_api_error = true                             │
│                                                             │
│ 3. Send notification to admin:                              │
│    "Video v123 locked with API error - manual review needed"│
│                                                             │
│ 4. Admin Dashboard shows flagged video:                     │
│    [Review] button allows manual view count adjustment      │
│                                                             │
│ 5. Process settlement with adjusted count if needed         │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ ERROR SCENARIO 3: Insufficient Escrow Balance               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Scenario: Founder's payment method declined after deposit   │
│                                                             │
│ Pre-Flight Check Result:                                    │
│ Campaign escrow: $50 (should be $1,000)                     │
│ Required for approval: $75                                  │
│ ❌ Insufficient funds                                       │
│                                                             │
│ System Actions:                                             │
│ ───────────────────────────────────────────────────────────│
│ 1. Block approval action:                                   │
│    Show founder: "⚠️ Insufficient campaign funds"           │
│                                                             │
│ 2. Request additional funding:                              │
│    ┌─────────────────────────────────────────────────┐     │
│    │ Your campaign requires additional funding       │     │
│    │                                                 │     │
│    │ Current Balance: $50.00                         │     │
│    │ Required: $75.00                                │     │
│    │ Amount Needed: $25.00                           │     │
│    │                                                 │     │
│    │ [Add Funds] [Pause Campaign]                    │     │
│    └─────────────────────────────────────────────────┘     │
│                                                             │
│ 3. Notify creator of delay (transparent communication)      │
│                                                             │
│ 4. Pause campaign until refunded                            │
└─────────────────────────────────────────────────────────────┘

---

## 5. Performance Tracking Flow

### 5.1 Daily View Count Updates
┌─────────────────────────────────────────────────────────────┐
│ AUTOMATED: Daily View Polling Job (T-302)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Cron Schedule: Every day at 12:00 AM EST                    │
│                                                             │
│ STEP 1: Query Active Posts                                  │
│ ─────────────────────────────────────────────────────────── │
│ SELECT * FROM videos                                        │
│ WHERE status = 'posted'                                     │
│   AND posted_at > NOW() - INTERVAL '7 days'                 │
│   AND status != 'locked'                                    │
│ ORDER BY posted_at ASC;                                     │
│                                                             │
│ Results: 347 active videos across 89 campaigns              │
│                                                             │
│ STEP 2: Group by Platform & Batch Process                   │
│ ─────────────────────────────────────────────────────────── │
│ TikTok Batch (198 videos):                                  │
│ • Extract video IDs                                         │
│ • Batch into groups of 50 (API limit)                       │
│ • Process batches sequentially                              │
│                                                             │
│ Instagram Batch (114 videos):                               │
│ • Extract media IDs                                         │
│ • Fetch insights for each                                   │
│                                                             │
│ Facebook Batch (35 videos):                                 │
│ • Similar to Instagram process                              │
│                                                             │
│ STEP 3: API Calls with Rate Limit Management                │
│ ─────────────────────────────────────────────────────────── │
│ For each batch:                                             │
│                                                             │
│ TRY:                                                        │
│   response = await tiktokAPI.getVideoData({                 │
│     video_ids: batch_of_50,                                 │
│     fields: ['view_count', 'like_count']                    │
│   })                                                        │
│                                                             │
│   FOR each video in response:                               │
│     • Parse view_count                                      │
│     • Compare to last snapshot                              │
│     • Calculate delta (new_views - old_views)               │
│                                                             │
│     UPDATE videos                                           │
│     SET                                                     │
│       current_view_count = new_views,                       │
│       last_view_update = NOW()                              │
│     WHERE id = video_id;                                    │
│                                                             │
│     INSERT INTO view_snapshots (                            │
│       video_id, view_count, snapshot_at                     │
│     ) VALUES (video_id, new_views, NOW());                  │
│                                                             │
│ CATCH RateLimitError:                                       │
│   • Wait exponentially (60s, 120s, 240s)                    │
│   • Retry batch                                             │
│   • Log to monitoring                                       │
│                                                             │
│ CATCH APIError:                                             │
│   • Log error details                                       │
│   • Continue to next batch                                  │
│   • Flag for manual review if persistent                    │
│                                                             │
│ STEP 4: Update Creator Wallets (Real-Time Calculations)     │
│ ─────────────────────────────────────────────────────────── │
│ FOR each updated video:                                     │
│   new_performance_bonus = (current_view_count / 1000) * 4.00│
│                                                             │
│   UPDATE creator_wallets                                    │
│   SET pending_performance_bonus = new_performance_bonus     │
│   WHERE video_id = video_id;                                │
│                                                             │
│   // Trigger WebSocket update to live dashboards            │
│   websocket.emit('wallet_update', {                         │
│     creator_id: creator_id,                                 │
│     video_id: video_id,                                     │
│     new_bonus: new_performance_bonus                        │
│   });                                                       │
│                                                             │
│ STEP 5: Check for 7-Day Lock Eligibility                    │
│ ─────────────────────────────────────────────────────────── │
│ SELECT * FROM videos                                        │
│ WHERE status = 'posted'                                     │
│   AND posted_at <= NOW() - INTERVAL '168 hours'             │
│   AND status != 'locked';                                   │
│                                                             │
│ FOR each eligible video:                                    │
│   • Trigger Phase 2 settlement (See 4.2)                    │
│                                                             │
│ STEP 6: Monitoring & Alerting                               │
│ ─────────────────────────────────────────────────────────── │
│ Log metrics:                                                │
│ • Total videos processed: 347                               │
│ • Successful updates: 342 (98.6%)                           │
│ • API errors: 5 (1.4%)                                      │
│ • Processing time: 8.3 minutes                              │
│ • Rate limit hits: 0                                        │
│                                                             │
│ IF error_rate > 10%:                                        │
│   ALERT ops_team via PagerDuty                              │
│                                                             │
│ ✅ Daily Polling Complete                                   │
└─────────────────────────────────────────────────────────────┘

### 5.2 Creator Live Performance Dashboard
┌─────────────────────────────────────────────────────────────┐
│ CREATOR DASHBOARD - Live Performance View                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 💰 Wallet                                                   │
│ ───────────────────────────────────────────────────────────│
│ Available Balance:        $342.50                           │
│ Pending Performance:      $127.80  ⏱️ Updates daily         │
│ Lifetime Earnings:        $8,945.00                         │
│                                                             │
│ [Instant Payout] [View History]                             │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ 📊 ACTIVE CAMPAIGNS (2)                                     │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 📹 Q4 Product Launch                                 │   │
│ │ ────────────────────────────────────────────────────│   │
│ │                                                      │   │
│ │ Video 1/5 - TikTok  🟢 LIVE                         │   │
│ │ Posted: Nov 25, 9:30 AM                             │   │
│ │                                                      │   │
│ │ ┌──────────────────────────────────────────────┐   │   │
│ │ │ 👁️ 45,232 views                                │   │   │
│ │ │ ████████████████░░░░  Day 3/7                  │   │   │
│ │ │                                                │   │   │
│ │ │ Performance Bonus (Live):                      │   │   │
│ │ │ $180.93  (+$24.50 since yesterday)            │   │   │
│ │ │                                                │   │   │
│ │ │ Projected Final (if current pace continues):   │   │   │
│ │ │ ~65K views → ~$260 bonus                       │   │   │
│ │ │                                                │   │   │
│ │ │ Locks in: 4 days, 14 hours                     │   │   │
│ │ └──────────────────────────────────────────────┘   │   │
│ │                                                      │   │
│ │ [View Post] [View Analytics]                         │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 📹 Video 2/5 - TikTok  🟡 Pending Approval          │   │
│ │ Submitted: 2 hours ago                               │   │
│ │ Base Fee: $75 (paid on approval)                     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ 📈 PERFORMANCE INSIGHTS                                     │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ This Week:                                                  │
│ • Average views per video: 42,340                           │
│ • Best performing platform: TikTok (avg 48K views)          │
│ • Total performance bonus: $507.60                          │
│                                                             │
│ Tips to Boost Performance:                                  │
│ • Post between 7-9 AM EST for maximum reach                 │
│ • Use trending sounds (currently: "That's Crazy")           │
│ • Add captions for accessibility (+15% engagement avg)      │
│                                                             │
│ Last updated: 2 minutes ago  [Refresh]                      │
└─────────────────────────────────────────────────────────────┘

### 5.3 Founder Performance Dashboard
┌─────────────────────────────────────────────────────────────┐
│ FOUNDER DASHBOARD - Campaign Performance                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 📊 Q4 Product Launch Campaign                               │
│                                                             │
│ Status: Active  |  Creator: @marythcreator                  │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ 💰 BUDGET OVERVIEW                                          │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ Total Budget:           $1,000.00                           │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Spent:     $255.93  █████░░░░░░░░░  25.6%          │   │
│ │ Reserved:  $445.00  █████████░░░░░  44.5%          │   │
│ │ Available: $299.07  ██████░░░░░░░░  29.9%          │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Breakdown:                                                  │
│ • Base Fees Paid:        $75.00  (1/5 videos)              │
│ • Performance Cost:      $180.93 (45.2K views)              │
│ • Projected Refund:      $299.07 (if pace continues)        │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ 📹 VIDEO PERFORMANCE                                        │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ ┌────────────────────────────────────────────────────┐    │
│ │ Video 1 - TikTok                🟢 LIVE            │    │
│ │ Posted: Nov 25, 9:30 AM                            │    │
│ │                                                     │    │
│ │ 👁️ 45,232 views  ████████░░  Day 3/7              │    │
│ │                                                     │    │
│ │ Performance vs. Target:                             │    │
│ │ Target: 25,000 views (avg for similar campaigns)    │    │
│ │ Actual: 45,232 views (+80.9% above target!) 🎉     │    │
│ │                                                     │    │
│ │ Cost for this video so far: $75 + $226 = $301      │    │
│ │                                                     │    │
│ │ Engagement:                                         │    │
│ │ • Likes: 3,421  (7.6% rate)                        │    │
│ │ • Shares: 287   (0.6% rate)                        │    │
│ │ • Comments: 156                                     │    │
│ │                                                     │    │
│ │ 🔗 Watch Post: [Open TikTok →]                     │    │
│ │                                                     │    │
│ │ Locks in: 4 days, 14 hours                          │    │
│ └────────────────────────────────────────────────────┘    │
│                                                             │
│ ┌────────────────────────────────────────────────────┐    │
│ │ Video 2 - TikTok                🟡 In Review        │    │
│ │ Submitted: 2 hours ago                              │    │
│ │ [Review Content →]                                  │    │
│ └────────────────────────────────────────────────────┘    │
│                                                             │
│ ┌────────────────────────────────────────────────────┐    │
│ │ Video 3-5                       ⏳ In Progress      │    │
│ │ Expected delivery: Nov 23-26                        │    │
│ └────────────────────────────────────────────────────┘    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ 📈 CAMPAIGN INSIGHTS                                        │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ ROI Projection:                                             │
│ If current pace continues across all 5 videos:              │
│ • Total Views: ~226K                                        │
│ • Total Cost: ~$825                                         │
│ • Cost per 1,000 views: $3.65 ✅ (Industry avg: $5-8)      │
│                                                             │
│ Benchmarks vs. Similar Campaigns:                           │
│ • Views: Top 15% 🏆                                         │
│ • Engagement: Top 20% 📈                                    │
│ • Cost efficiency: Top 10% 💰                               │
│                                                             │
│ [Download Report (PDF)] [Export Data (CSV)]                 │
│                                                             │
│ Last updated: 1 minute ago  [Refresh]                       │
└─────────────────────────────────────────────────────────────┘

---

## 6. Dispute Resolution Flow

### 6.1 View Count Dispute (Founder-Initiated)
┌─────────────────────────────────────────────────────────────┐
│ SCENARIO: Founder Disputes View Count                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Founder believes reported views are inaccurate              │
│                                                             │
│ Entry Point: Campaign Dashboard → "Report Issue"            │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 🚨 Report an Issue                                   │   │
│ │                                                      │   │
│ │ Video: Video 1 - TikTok                              │   │
│ │ Current Views: 45,232                                │   │
│ │                                                      │   │
│ │ Issue Type:                                          │   │
│ │ ● View count inaccurate                              │   │
│ │ ○ Content doesn't match brief                        │   │
│ │ ○ Posting schedule violation                         │   │
│ │ ○ Other                                              │   │
│ │                                                      │   │
│ │ Description:                                         │   │
│ │ ┌──────────────────────────────────────────────┐   │   │
│ │ │ When I check the video directly on TikTok,   │   │   │
│ │ │ it shows 48,500 views, not 45,232. Please    │   │   │
│ │ │ verify the correct count.                    │   │   │
│ │ │                                              │   │   │
│ │ │ 124/1000 characters                          │   │   │
│ │ └──────────────────────────────────────────────┘   │   │
│ │                                                      │   │
│ │ Screenshot (Optional):                               │   │
│ │ [Upload screenshot of TikTok analytics]              │   │
│ │                                                      │   │
│ │ [Cancel] [Submit Dispute]                            │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ System Actions:                                             │
│ ───────────────────────────────────────────────────────────│
│ 1. Create dispute record:                                   │
│    INSERT INTO disputes (                                   │
│      campaign_id, video_id, reported_by: 'founder',         │
│      type: 'view_count', status: 'pending',                 │
│      description, evidence_url                              │
│    )                                                        │
│                                                             │
│ 2. Pause 7-day lock for this video (if not locked yet)      │
│    UPDATE videos                                            │
│    SET lock_paused = true                                   │
│    WHERE id = video_id;                                     │
│                                                             │
│ 3. Alert admin team (high priority)                         │
│                                                             │
│ 4. Notify creator of dispute                                │
│                                                             │
│ 5. Route to Admin Dispute Queue                             │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ ADMIN DISPUTE RESOLUTION DASHBOARD                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🚨 Active Disputes (3)                                      │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Dispute #D-1847                     🟡 PENDING       │   │
│ │                                                      │   │
│ │ Type: View Count Discrepancy                         │   │
│ │ Campaign: Q4 Product Launch (#c456)                  │   │
│ │ Video: Video 1 - TikTok (#v123)                      │   │
│ │                                                      │   │
│ │ Reported by: @mikethfounder                          │   │
│ │ Reported: 1 hour ago                                 │   │
│ │                                                      │   │
│ │ Details:                                             │   │
│ │ "When I check the video directly on TikTok, it      │   │
│ │  shows 48,500 views, not 45,232."                    │   │
│ │                                                      │   │
│ │ Evidence: [screenshot_tiktok.png]                    │   │
│ │                                                      │   │
│ │ Current Data:                                        │   │
│ │ • Platform Reported: 45,232 views                    │   │
│ │ • Founder Claims: 48,500 views                       │   │
│ │ • Difference: +3,268 views (+7.2%)                   │   │
│ │ • Last API sync: 6 hours ago                         │   │
│ │                                                      │   │
│ │ [Investigate] [View Full Thread]                     │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
↓ (Admin clicks "Investigate")
┌─────────────────────────────────────────────────────────────┐
│ ADMIN INVESTIGATION TOOLS                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ STEP 1: Re-fetch Live Data from TikTok API                  │
│ ───────────────────────────────────────────────────────────│
│ [Fetch Latest View Count]  ← Manual API call               │
│                                                             │
│ Result:                                                     │
│ ✅ API Response: 48,412 views (as of now)                   │
│                                                             │
│ Analysis:                                                   │
│ • Our last sync: 45,232 (6 hours ago)                       │
│ • Current actual: 48,412                                    │
│ • Founder's claim: 48,500 (close match ✓)                   │
│                                                             │
│ Conclusion: Sync delay caused discrepancy. Founder correct. │
│                                                             │
│ STEP 2: View History Audit                                  │
│ ───────────────────────────────────────────────────────────│
│ View Snapshot History:                                      │
│ │ Nov 25, 12:00 AM: 1,247 views                            │
│ │ Nov 26, 12:00 AM: 12,450 views (+11,203)                 │
│ │ Nov 27, 12:00 AM: 28,910 views (+16,460)                 │
│ │ Nov 28, 12:00 AM: 45,232 views (+16,322) ← Last sync     │
│ │ Nov 28, 10:45 AM: 48,412 views (+3,180)  ← Manual check  │
│                                                             │
│ Growth rate: Normal. No anomalies detected.                 │
│                                                             │
│ STEP 3: Resolution Options                                  │
│ ───────────────────────────────────────────────────────────│
│ ● Update to correct count (48,412)                          │
│ ○ Maintain original count (dispute invalid)                 │
│ ○ Average the two values (compromise)                       │
│ ○ Escalate for further investigation                        │
│                                                             │
│ Adjustment Impact:                                          │
│ • Old view count: 45,232                                    │
│ • New view count: 48,412                                    │
│ • Difference: +3,180 views                                  │
│                                                             │
│ Payment Impact:                                             │
│ • Additional creator bonus: +$12.72                         │
│ • Additional Nala revenue: +$3.18                           │
│ • Reduced founder refund: -$15.90                           │
│                                                             │
│ Notes for Parties:                                          │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Investigation confirmed the view count was outdated  │   │
│ │ due to sync timing. Updated to current accurate      │   │
│ │ count of 48,412. Thank you for reporting this!       │   │
│ │                                                      │   │
│ │ 168/500 characters                                   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ [Cancel] [Resolve Dispute & Apply Changes]                  │
│                                                             │
│ System Actions (Resolve):                                   │
│ ───────────────────────────────────────────────────────────│
│ 1. Update video.current_view_count = 48412                  │
│ 2. Create correction snapshot                               │
│ 3. Recalculate performance bonus                            │
│ 4. Update dispute status = 'resolved'                       │
│ 5. Notify both parties with resolution details              │
│ 6. Resume 7-day lock countdown                              │
│ 7. Log audit trail                                          │
└─────────────────────────────────────────────────────────────┘

### 6.2 Content Quality Dispute (Post-Approval)
┌─────────────────────────────────────────────────────────────┐
│ RARE SCENARIO: Founder Disputes After Approval              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Note: This is discouraged as approval triggers payment.     │
│ Only valid for severe violations (fraud, brand damage).     │
│                                                             │
│ Founder submits dispute:                                    │
│ "Creator posted content that violates brand guidelines      │
│  despite my approval. The video includes competitor logo."  │
│                                                             │
│# Nala Platform - Detailed User Flows
Table of Contents

Creator Onboarding Flow
Founder Campaign Creation Flow
Content Creation & Review Flow
Payment Processing Flow
Performance Tracking Flow
Dispute Resolution Flow


1. Creator Onboarding Flow
1.1 Account Registration
Entry Point: Landing page → "Sign Up as Creator" button
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Basic Information                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Creator enters:                                             │
│  • Full Name                                                │
│  • Email Address                                            │
│  • Password (8+ chars, 1 number, 1 special)                │
│  • Confirm Password                                         │
│                                                             │
│ [Checkbox] I agree to Terms of Service & Privacy Policy    │
│                                                             │
│ [Continue →]                                                │
│                                                             │
│ System Actions:                                             │
│  1. Validate email format and uniqueness                    │
│  2. Hash password (bcrypt)                                  │
│  3. Create user record (role: 'creator')                    │
│  4. Send verification email                                 │
│  5. Create empty creator_profile record                     │
│  6. Generate session token                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Email Verification                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Screen: "Check your email"                                  │
│  📧 We sent a verification link to mary@email.com          │
│                                                             │
│ Creator clicks link in email →                              │
│                                                             │
│ System Actions:                                             │
│  1. Verify token from email link                            │
│  2. Update user.email_verified = true                       │
│  3. Redirect to platform onboarding                         │
└─────────────────────────────────────────────────────────────┘
1.2 Social Media Account Connection
Critical Path: This determines creator eligibility
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Connect Your Platforms                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "Connect your social accounts to start earning"             │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 🎵 TikTok         [Connect Account]   Not Connected │   │
│ │    Minimum: 10,000 followers                        │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 📸 Instagram      [Connect Account]   Not Connected │   │
│ │    Minimum: 5,000 followers                         │   │
│ │    ⚠️ Requires Business Account                     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 👍 Facebook       [Connect Account]   Not Connected │   │
│ │    Minimum: 5,000 followers                         │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Note: Connect at least one platform to continue            │
│                                                             │
│ [Skip for now]  [Continue]  ← Disabled until 1 connected   │
└─────────────────────────────────────────────────────────────┘
1.2.1 TikTok Connection Sub-Flow
Creator clicks "Connect Account" on TikTok
                ↓
┌─────────────────────────────────────────────────────────────┐
│ POPUP: TikTok OAuth                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ System Actions:                                             │
│  1. Generate OAuth state token (CSRF protection)            │
│  2. Redirect to TikTok Login Kit:                           │
│     https://www.tiktok.com/auth/authorize/                  │
│     ?client_key={CLIENT_KEY}                                │
│     &scope=user.info.basic,video.list,video.insights        │
│     &response_type=code                                     │
│     &redirect_uri={CALLBACK_URL}                            │
│     &state={STATE_TOKEN}                                    │
│                                                             │
│ Creator sees TikTok login screen →                          │
│  • Logs into TikTok (if not already)                        │
│  • Reviews permissions request                              │
│  • Clicks "Authorize"                                       │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ CALLBACK: TikTok Returns to Nala                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ System Actions:                                             │
│  1. Receive authorization code                              │
│  2. Verify state token (prevent CSRF)                       │
│  3. Exchange code for access token:                         │
│     POST https://open-api.tiktok.com/oauth/access_token/    │
│  4. Fetch user profile:                                     │
│     GET /v2/user/info/                                      │
│  5. Extract: username, follower_count, user_id              │
│                                                             │
│  6. Validate eligibility:                                   │
│     IF follower_count < 10,000:                             │
│       ❌ Show error: "Minimum 10K followers required"       │
│       STOP                                                  │
│                                                             │
│  7. Store in database:                                      │
│     INSERT INTO social_accounts (                           │
│       creator_id, platform, platform_user_id,               │
│       username, follower_count,                             │
│       access_token [ENCRYPTED], refresh_token [ENCRYPTED],  │
│       token_expires_at, verified_at                         │
│     )                                                       │
│                                                             │
│  8. Update creator_profile.verification_status = 'verified' │
│  9. Show success message                                    │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ SUCCESS SCREEN                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ✅ TikTok Connected Successfully!                           │
│                                                             │
│ @marythcreator                                              │
│ 47,234 followers                                            │
│                                                             │
│ [Connect Another Platform]  [Continue →]                    │
└─────────────────────────────────────────────────────────────┘
1.2.2 Instagram Connection Sub-Flow
Note: More complex due to Business Account requirement
Creator clicks "Connect Account" on Instagram
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Check Account Type                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "Do you have an Instagram Business or Creator Account?"     │
│                                                             │
│ [Yes, I have a Business Account] → Continue to OAuth        │
│ [No, I have a Personal Account] → Show conversion guide     │
│                                                             │
│ IF "No" selected:                                           │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ ℹ️  How to Convert to Business Account:            │   │
│ │                                                     │   │
│ │ 1. Open Instagram app                              │   │
│ │ 2. Go to Settings → Account                        │   │
│ │ 3. Select "Switch to Professional Account"         │   │
│ │ 4. Choose "Business"                               │   │
│ │ 5. Connect to Facebook Page                        │   │
│ │                                                     │   │
│ │ [Watch Video Tutorial]  [I've Converted]           │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Facebook Login (Required for Instagram)             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ System Actions:                                             │
│  1. Redirect to Facebook OAuth:                             │
│     https://www.facebook.com/v18.0/dialog/oauth             │
│     ?client_id={APP_ID}                                     │
│     &redirect_uri={CALLBACK}                                │
│     &scope=instagram_basic,instagram_manage_insights,       │
│             pages_read_engagement                           │
│                                                             │
│ Creator:                                                    │
│  • Logs into Facebook                                       │
│  • Selects connected Instagram Business Account            │
│  • Grants permissions                                       │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Fetch Instagram Data                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ System Actions:                                             │
│  1. Exchange code for access token                          │
│  2. Get Instagram Business Account ID:                      │
│     GET /{facebook-page-id}?fields=instagram_business_accou │
│     nt                                                      │
│  3. Get Instagram profile data:                             │
│     GET /{ig-user-id}?fields=username,followers_count       │
│                                                             │
│  4. Validate:                                               │
│     IF followers_count < 5,000:                             │
│       ❌ Error: "Minimum 5K followers required"             │
│     IF account_type != 'BUSINESS':                          │
│       ❌ Error: "Business account required"                 │
│                                                             │
│  5. Store data (same as TikTok flow)                        │
└─────────────────────────────────────────────────────────────┘
1.3 Profile Setup
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Set Your Rates                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "How much do you charge per video?"                         │
│                                                             │
│ TikTok Base Fee:                                            │
│ [$75] ◄────●────────────────► [$500]                       │
│  $50                                  Max                   │
│                                                             │
│ 💡 Most creators charge: $75-$150                           │
│ 📊 Your potential earnings for 100K views:                  │
│     Base Fee: $75 + Performance: $400 = $475 total          │
│                                                             │
│ Instagram Base Fee:                                         │
│ [$75] ◄────●────────────────► [$500]                       │
│                                                             │
│ Facebook Base Fee:                                          │
│ [$75] ◄────●────────────────► [$500]                       │
│                                                             │
│ [Continue →]                                                │
│                                                             │
│ System Actions:                                             │
│  • Update creator_profile with base fees                    │
│  • Calculate average fee for matching algorithm             │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Build Your Portfolio                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "Upload 3-10 sample videos to showcase your style"          │
│                                                             │
│ [Drag & Drop Videos Here]                                   │
│  or [Browse Files]                                          │
│                                                             │
│ Uploaded (2/10):                                            │
│ ┌─────────┐  ┌─────────┐                                   │
│ │ [Video] │  │ [Video] │  [+ Add More]                     │
│ │  30s    │  │  45s    │                                   │
│ └─────────┘  └─────────┘                                   │
│                                                             │
│ For each video:                                             │
│  • Title: [Product Review - SaaS Tool]                      │
│  • Platform: [TikTok ▼]                                     │
│                                                             │
│ [Skip for now]  [Continue →]                                │
│                                                             │
│ System Actions:                                             │
│  1. Upload to S3 (max 500MB per video)                      │
│  2. Generate thumbnail (frame at 2s)                        │
│  3. Transcode to web format (H.264, 720p)                   │
│  4. Store metadata in creator_profile.portfolio_videos      │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Category & Bio                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ What niches do you specialize in? (Select all that apply)   │
│                                                             │
│ ☑ SaaS & Software    ☐ E-commerce     ☐ Health & Fitness   │
│ ☑ B2B Tech           ☐ Beauty         ☐ Food & Beverage    │
│ ☐ Finance            ☐ Fashion        ☐ Gaming             │
│                                                             │
│ Tell brands about yourself: (500 char max)                  │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Hi! I'm Mary, a tech enthusiast who creates          │   │
│ │ engaging video reviews for SaaS products. My         │   │
│ │ audience loves honest, detailed breakdowns...        │   │
│ │                                                      │   │
│ │ 347/500 characters                                   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ [Back]  [Complete Setup →]                                  │
│                                                             │
│ System Actions:                                             │
│  • Update creator_profile.categories                        │
│  • Update creator_profile.bio                               │
│  • Set profile_completed = true                             │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Payment Setup (Stripe Connect)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "Last step: Set up payouts"                                 │
│                                                             │
│ Nala uses Stripe to send you payments securely.             │
│                                                             │
│ [Connect Stripe Account]                                    │
│                                                             │
│ System Actions:                                             │
│  1. Create Stripe Connect Express account link:             │
│     POST /v1/account_links                                  │
│     type: 'account_onboarding'                              │
│  2. Redirect creator to Stripe hosted onboarding            │
│                                                             │
│ Creator completes on Stripe:                                │
│  • Personal information (name, DOB, SSN)                    │
│  • Business details (if applicable)                         │
│  • Bank account for deposits                                │
│  • Identity verification (photo ID)                         │
│                                                             │
│ Stripe redirects back to Nala with account_id               │
│                                                             │
│ System Actions:                                             │
│  1. Store stripe_account_id in users table                  │
│  2. Verify account capabilities:                            │
│     - transfers: 'active'                                   │
│     - card_payments: 'active' (if needed)                   │
│  3. Mark creator as payment_ready = true                    │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ 🎉 SUCCESS: You're All Set!                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Your creator profile is live!                               │
│                                                             │
│ ✅ TikTok connected (47K followers)                         │
│ ✅ Base fee set ($75/video)                                 │
│ ✅ Portfolio added (2 videos)                               │
│ ✅ Payments ready                                           │
│                                                             │
│ Next steps:                                                 │
│ • Brands will discover your profile                         │
│ • You'll receive brief invitations                          │
│ • Start earning with performance-based pay!                 │
│                                                             │
│ [Go to Dashboard →]                                         │
└─────────────────────────────────────────────────────────────┘

2. Founder Campaign Creation Flow
2.1 Campaign Initiation
Entry Point: Dashboard → "Create Campaign" button
┌─────────────────────────────────────────────────────────────┐
│ Create New Campaign                     [Save Draft] [Exit] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Progress: ●──○──○──○──○──○  Step 1 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 1: Campaign Basics                                     │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ Campaign Name: *                                            │
│ [Q4 Product Launch Campaign                              ] │
│                                                             │
│ What are you promoting?                                     │
│ [ProductivityPro - AI-powered task management SaaS       ] │
│                                                             │
│ Target Audience:                                            │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Professionals aged 25-40, interested in              │   │
│ │ productivity tools, remote workers, small business   │   │
│ │ owners.                                              │   │
│ │                                                      │   │
│ │ 178/500 characters                                   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Campaign Goal:                                              │
│ ○ Brand Awareness    ● Website Traffic    ○ Signups        │
│ ○ Sales              ○ App Downloads                        │
│                                                             │
│ [Continue →]                                                │
│                                                             │
│ System Actions:                                             │
│  • Auto-save every 30 seconds                               │
│  • Create draft campaign record                             │
│  • Status: 'draft'                                          │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ Progress: ●──●──○──○──○──○  Step 2 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 2: Content Requirements                                │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ How many videos do you need?                                │
│ [5▼] videos                                                 │
│  (Min: 1, Max: 10 per campaign)                             │
│                                                             │
│ Preferred video length:                                     │
│ ○ 15 seconds     ● 30 seconds                               │
│ ○ 60 seconds     ○ Creator's choice                         │
│                                                             │
│ Which platforms? (Select all that apply)                    │
│ ☑ TikTok    ☑ Instagram Reels    ☐ Facebook Reels          │
│                                                             │
│ Video style preference:                                     │
│ ☑ Product Tutorial    ☐ Unboxing    ☐ Testimonial          │
│ ☐ Behind the Scenes   ☐ Comparison                          │
│                                                             │
│ [← Back]  [Continue →]                                      │
│                                                             │
│ System Actions:                                             │
│  • Update campaign.videos_requested = 5                     │
│  • Store platform preferences in brief_data JSONB           │
│  • Calculate estimated budget preview                       │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ Progress: ●──●──●──○──○──○  Step 3 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 3: Creative Brief                                      │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ Key Talking Points: (What should the creator highlight?)    │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ • AI-powered task prioritization                    │   │
│ │ • Integrates with 50+ tools (Slack, Gmail, etc)     │   │
│ │ • Saves 2 hours per day on average                  │   │
│ │ • Free 14-day trial available                       │   │
│ │                                                      │   │
│ │ [+ Add Point]                                        │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Brand Guidelines: (Upload PDF, images, or describe)         │
│ [📄 Brand_Guidelines.pdf] [✓ Uploaded]  [Remove]           │
│ [+ Upload Assets] (Logo, product images, etc.)              │
│                                                             │
│ Do's:                          │ Don'ts:                    │
│ • Be authentic                 │ • Compare to competitors   │
│ • Show real use cases          │ • Make health claims       │
│ • Use trending audio           │ • Show competitor logos    │
│ [+ Add]                        │ [+ Add]                    │
│                                                             │
│ Required Hashtags/Mentions:                                 │
│ [#ProductivityPro #AItools @productivitypro_official     ] │
│                                                             │
│ Reference Videos: (Optional - paste URLs)                   │
│ [https://tiktok.com/@competitor/video/123                ] │
│ [+ Add Another]                                             │
│                                                             │
│ [← Back]  [Continue →]                                      │
│                                                             │
│ System Actions:                                             │
│  • Store all data in campaign.brief_data (JSONB)            │
│  • Upload brand assets to S3                                │
│  • Generate brief preview PDF                               │
└─────────────────────────────────────────────────────────────┘
2.2 Posting Schedule & Budget Configuration
┌─────────────────────────────────────────────────────────────┐
│ Progress: ●──●──●──●──○──○  Step 4 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 4: Posting Schedule                                    │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ When should the first video go live?                        │
│ [Nov 25, 2025 ▼]  📅                                        │
│  (Minimum 5 days from today for creator prep)               │
│                                                             │
│ How often should videos be posted?                          │
│ ● One per day           ○ Every other day                   │
│ ○ Every 3 days          ○ Weekly                            │
│ ○ Custom schedule                                           │
│                                                             │
│ 📅 Your Posting Calendar:                                   │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Video 1:  Nov 25 (Mon) 📱 TikTok                    │   │
│ │ Video 2:  Nov 26 (Tue) 📱 TikTok                    │   │
│ │ Video 3:  Nov 27 (Wed) 📸 Instagram                 │   │
│ │ Video 4:  Nov 28 (Thu) 📸 Instagram                 │   │
│ │ Video 5:  Nov 29 (Fri) 📱 TikTok                    │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Preferred posting time: (Optional)                          │
│ [09:00 AM ▼]  [EST ▼]                                       │
│                                                             │
│ [← Back]  [Continue →]                                      │
│                                                             │
│ System Actions:                                             │
│  • Calculate posting dates                                  │
│  • Store in campaign.start_date, posting_frequency          │
│  • Validate timeline (min 5 days buffer)                    │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ Progress: ●──●──●──●──●──○  Step 5 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 5: Budget Configuration                                │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ 💰 Set Your Total Budget                                    │
│                                                             │
│ Total Campaign Budget:                                      │
│ $ [1000.00]                                                 │
│   (Minimum: $500 | Maximum: $50,000)                        │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 📊 BUDGET BREAKDOWN                                  │   │
│ │                                                      │   │
│ │ Fixed Production Costs:         $250.00 (25%)       │   │
│ │ └─ 5 videos × $50 base fee                          │   │
│ │                                                      │   │
│ │ Variable Performance Budget:    $750.00 (75%)       │   │
│ │ └─ Pays for actual views achieved                   │   │
│ │                                                      │   │
│ │ ─────────────────────────────────────────────────   │   │
│ │                                                      │   │
│ │ Maximum Views You Can Purchase:                     │   │
│ │ 150,000 views @ $5.00 per 1,000                     │   │
│ │                                                      │   │
│ │ ═════════════════════════════════════════════════   │   │
│ │                                                      │   │
│ │ 💡 How Performance Budget Works:                    │   │
│ │                                                      │   │
│ │ If videos achieve 120K views (80% of max):          │   │
│ │  • You pay: $250 + $600 = $850                      │   │
│ │  • You save: $150 (refunded automatically)          │   │
│ │                                                      │   │
│ │ If videos achieve 150K views (100% of max):         │   │
│ │  • You pay: $250 + $750 = $1,000 (full budget)      │   │
│ │  • You save: $0 (great performance!)                │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ☑ I understand that:                                        │
│    • Base fees are paid when I approve content              │
│    • Performance budget is charged based on actual views    │
│    • Unused budget is refunded automatically after 7 days   │
│                                                             │
│ [← Back]  [Continue to Creator Selection →]                 │
│                                                             │
│ System Actions:                                             │
│  • Validate budget (min $500)                               │
│  • Calculate: base_fee_budget, performance_budget           │
│  • Store in campaigns table                                 │
│  • Update max_views_purchasable                             │
└─────────────────────────────────────────────────────────────┘
│                                                             │
│ Next up: Video 2 (Due Nov 23)                               │
│                                                             │
│ [View All Briefs]  [Upload Next Video]                      │
└─────────────────────────────────────────────────────────────┘

### 3.3 Founder Content Review

**Trigger:** Founder receives notification of new draft
┌─────────────────────────────────────────────────────────────┐
│ FOUNDER DASHBOARD - Content Review Queue                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🔔 1 video ready for review                                 │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Q4 Product Launch Campaign                           │   │
│ │                                                      │   │
│ │ 🎥 Video 1 of 5 - TikTok                            │   │
│ │ Submitted by @marythcreator  |  2 hours ago         │   │
│ │                                                      │   │
│ │ [Review Now →]                                       │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
↓ (Founder clicks "Review Now")
┌─────────────────────────────────────────────────────────────┐
│ 📹 CONTENT REVIEW INTERFACE                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────┬───────────────────────────┐   │
│ │ 🎥 VIDEO PLAYER         │ 📋 BRIEF REQUIREMENTS     │   │
│ │                         │                           │   │
│ │  ┌─────────────────┐   │ ✓ 30 seconds              │   │
│ │  │                 │   │ ✓ Product tutorial style  │   │
│ │  │  [▶ Play]       │   │ ✓ #ProductivityPro used   │   │
│ │  │                 │   │                           │   │
│ │  │  Mary's Draft   │   │ Key Talking Points:       │   │
│ │  │  Video          │   │ • AI prioritization ✓     │   │
│ │  │                 │   │ • 50+ integrations ✓      │   │
│ │  │  0:15 / 0:30    │   │ • Free trial ✓            │   │
│ │  └─────────────────┘   │                           │   │
│ │                         │ Do's/Don'ts Check:        │   │
│ │  [0.5x] [1x] [2x]      │ ✓ Authentic               │   │
│ │  [Download]            │ ✓ Real use case shown     │   │
│ │                         │ ✓ No competitor mentions  │   │
│ └─────────────────────────┴───────────────────────────┘   │
│                                                             │
│ Creator's Notes:                                            │
│ "I focused on the AI prioritization feature as requested.   │
│  Used trending audio 'That's Crazy'."                       │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ YOUR FEEDBACK                                               │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ Add Comments: (Timestamped annotations)                     │
│ [Click on video timeline to add feedback at specific times] │
│                                                             │
│ ┌─ Annotations ───────────────────────────────────────┐   │
│ │ 0:05 - "Love the opening hook!" - You                │   │
│ │ 0:15 - "Can you show the UI here?" - You             │   │
│ │ [+ Add Comment]                                      │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ DECISION                                                    │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ [✅ Approve]   [📝 Request Revision]   [❌ Reject]          │
│                                                             │
│ ⚠️ Important: Approving will trigger payment of $75 to      │
│    creator. This cannot be undone.                          │
└─────────────────────────────────────────────────────────────┘

#### 3.3.1 Approval Flow
Founder clicks "✅ Approve"
↓
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ CONFIRM APPROVAL                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ You are about to approve Video 1                            │
│                                                             │
│ This will:                                                  │
│ ✓ Authorize creator to post on Nov 25                       │
│ ✓ Release $75 payment to @marythcreator                     │
│ ✓ Grant you perpetual content usage rights                  │
│                                                             │
│ ⚠️ This action cannot be undone                             │
│                                                             │
│ [Cancel]  [Confirm Approval]                                │
│                                                             │
│ System Actions (Confirm):                                   │
│  1. Update video.status = 'approved'                        │
│  2. Update video.approved_at = NOW()                        │
│  3. Trigger Phase 1 Payment (T-305):                        │
│     a. Verify escrow has sufficient funds                   │
│     b. Create Stripe transfer:                              │
│        POST /v1/transfers                                   │
│        {                                                    │
│          amount: 7500, // $75 in cents                      │
│          currency: 'usd',                                   │
│          destination: mary.stripe_account_id,               │
│          transfer_group: campaign.id,                       │
│          metadata: {                                        │
│            campaign_id, video_id,                           │
│            payment_type: 'base_fee'                         │
│          }                                                  │
│        }                                                    │
│     c. Create payment record in database                    │
│     d. Update video.base_fee_paid = true                    │
│  4. Send notifications:                                     │
│     • Creator: "Payment sent! $75 on the way"               │
│     • Founder: "Approval confirmed"                         │
│  5. Update campaign.videos_approved += 1                    │
│  6. Decrement escrow balance                                │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ ✅ VIDEO APPROVED                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Video 1 has been approved!                                  │
│                                                             │
│ ✓ $75 payment sent to @marythcreator                        │
│ ✓ Creator authorized to post on Nov 25                      │
│                                                             │
│ Next: Wait for creator to post and track performance        │
│                                                             │
│ [View Campaign Dashboard]  [Review Next Video]              │
└─────────────────────────────────────────────────────────────┘

#### 3.3.2 Revision Request Flow
Founder clicks "📝 Request Revision"
↓
┌─────────────────────────────────────────────────────────────┐
│ 📝 REQUEST REVISION                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ What needs to be changed?                                   │
│ (Be specific to help the creator deliver what you need)     │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Please make the following changes:                   │   │
│ │                                                      │   │
│ │ 1. At 0:15, show the actual ProductivityPro UI       │   │
│ │    instead of generic screenshots                    │   │
│ │                                                      │   │
│ │ 2. Add more emphasis on the "2 hours saved" stat    │   │
│ │                                                      │   │
│ │ 3. Include a call-to-action to try the free trial   │   │
│ │                                                      │   │
│ │ 187/1000 characters                                  │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Revision deadline:                                          │
│ [48 hours ▼]  from now (Nov 21 at 2:00 PM)                 │
│                                                             │
│ Priority:                                                   │
│ ○ Minor tweaks     ● Significant changes     ○ Major rework│
│                                                             │
│ ☑ Allow creator to ask clarifying questions                │
│                                                             │
│ [Cancel]  [Send Revision Request]                           │
│                                                             │
│ System Actions (Send):                                      │
│  1. Update video.status = 'revision_requested'              │
│  2. Create revision record:                                 │
│     INSERT INTO revisions (                                 │
│       video_id, requested_by, feedback,                     │
│       deadline, priority, iteration_number                  │
│     )                                                       │
│  3. Send notification to creator (high priority)            │
│  4. Email with full feedback                                │
│  5. Create task in creator dashboard                        │
│  6. Set reminder 12 hours before deadline                   │
└─────────────────────────────────────────────────────────────┘

### 3.4 Video Posting & URL Submission
┌─────────────────────────────────────────────────────────────┐
│ CREATOR - Post-Approval Phase                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🎉 Video 1 Approved!                                        │
│                                                             │
│ ✓ $75 payment sent (check your wallet)                      │
│ ✓ Ready to post on Nov 25                                   │
│                                                             │
│ ⚠️ Important Reminder:                                      │
│ • Post exactly on Nov 25                                    │
│ • Use hashtags: #ProductivityPro                            │
│ • After posting, submit the live URL here immediately       │
│                                                             │
│ [I've Posted - Submit URL]  [View Posting Instructions]     │
└─────────────────────────────────────────────────────────────┘
↓ (After posting on TikTok/Instagram)
┌─────────────────────────────────────────────────────────────┐
│ 🔗 SUBMIT POST URL                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Video 1 - TikTok Post                                       │
│                                                             │
│ Paste your live post URL:                                   │
│ [https://tiktok.com/@marythcreator/video/7298547382...  ]  │
│                                                             │
│ Posting Date/Time:                                          │
│ [Nov 25, 2025]  [09:30 AM]  [EST ▼]                        │
│                                                             │
│ Screenshot (Optional but recommended):                      │
│ [Upload screenshot showing post is live]                    │
│                                                             │
│ [Cancel]  [Submit & Start Tracking]                         │
│                                                             │
│ System Actions (Submit):                                    │
│  1. Validate URL format (TikTok/Instagram domain)           │
│  2. Extract post ID from URL                                │
│  3. Verify post exists via API (optional check)             │
│  4. Update video record:                                    │
│     • status = 'posted'                                     │
│     • final_post_url = submitted_url                        │
│     • posted_at = submitted_datetime                        │
│  5. Calculate 7-day lock time:                              │
│     lock_at = posted_at + INTERVAL '7 days'                 │
│  6. Add to view polling queue (T-302)                       │
│  7. Send confirmation to founder                            │
│  8. Initialize first view count snapshot (within 1 hour)    │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ ✅ POST URL SUBMITTED                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Your post is now being tracked!                             │
│                                                             │
│ 📊 Performance tracking started                             │
│ 🕐 7-day window: Nov 25 - Dec 2                             │
│                                                             │
│ What happens next:                                          │
│ • Views are updated daily at 12:00 AM EST                   │
│ • Your performance bonus accumulates in real-time           │
│ • On Dec 2, final views are locked                          │
│ • Your bonus is paid automatically within 24 hours          │
│                                                             │
│ Current performance:                                        │
│ Views: 1,247  |  Est. Bonus: $4.99                          │
│                                                             │
│ [View Live Performance]  [Continue to Next Video]           │
└─────────────────────────────────────────────────────────────┘

---

## 4. Payment Processing Flow

### 4.1 Phase 1: Base Fee Payment (Detailed)

**Trigger:** Founder approves content (see 3.3.1)
┌─────────────────────────────────────────────────────────────┐
│ SYSTEM: Phase 1 Payment Processor                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Event: video.approved (video_id: v123, campaign_id: c456)   │
│                                                             │
│ STEP 1: Pre-Flight Validation                               │
│ ─────────────────────────────────────────────────────────── │
│ ✓ Check campaign has sufficient escrow balance              │
│   Current escrow: $1,000                                    │
│   Required: $75                                             │
│   Remaining after: $925                                     │
│                                                             │
│ ✓ Verify creator Stripe account is active                   │
│   stripe_account_id: acct_mary123                           │
│   capabilities.transfers: 'active'                          │
│                                                             │
│ ✓ Check for duplicate payment (idempotency)                 │
│   Query: SELECT * FROM payments                             │
│          WHERE video_id='v123' AND type='base_fee'          │
│   Result: No existing payment found ✓                       │
│                                                             │
│ STEP 2: Create Database Payment Record (Pending)            │
│ ─────────────────────────────────────────────────────────── │
│ INSERT INTO payments (                                      │
│   id: 'pay_abc123',                                         │
│   campaign_id: 'c456',                                      │
│   video_id: 'v123',                                         │
│   recipient_id: mary.id,                                    │
│   amount: 75.00,                                            │
│   type: 'base_fee',                                         │
│   status: 'pending',                                        │
│   created_at: NOW()                                         │
│ )                                                           │
│                                                             │
│ STEP 3: Stripe API Call (With Idempotency Key)              │
│ ─────────────────────────────────────────────────────────── │
│ POST https://api.stripe.com/v1/transfers                    │
│ Headers:                                                    │
│   Authorization: Bearer sk_live_xxx                         │
│   Idempotency-Key: c456_v123_base_fee_1732012800           │
│                                                             │
│ Body:                                                       │
│ {                                                           │
│   amount: 7500,                                             │
│   currency: "usd",                                          │
│   destination: "acct_mary123",                              │
│   transfer_group: "c456",                                   │
│   description: "Base fee - Video 1 approval",               │
│   metadata: {                                               │
│     campaign_id: "c456",                                    │
│     video_id: "v123",                                       │
│     payment_type: "base_fee",                               │
│     founder_id: "mike.id",                                  │
│     creator_id: "mary.id"                                   │
│   }                                                         │
│ }                                                           │
│                                                             │
│ Response: (Success)                                         │
│ {                                                           │
│   id: "tr_stripe789",                                       │
│   object: "transfer",                                       │
│   amount: 7500,                                             │
│   created: 1732012800,                                      │
│   destination: "acct_mary123",                              │
│   status: "paid"                                            │
│ }                                                           │
│                                                             │
│ STEP 4: Update Database (Success State)                     │
│ ─────────────────────────────────────────────────────────── │
│ UPDATE payments                                             │
│ SET                                                         │
│   status = 'completed',                                     │
│   stripe_transfer_id = 'tr_stripe789',                      │
│   processed_at = NOW()                                      │
│ WHERE id = 'pay_abc123';                                    │
│                                                             │
│ UPDATE videos                                               │
│ SET base_fee_paid = true                                    │
│ WHERE id = 'v123';                                          │
│                                                             │
│ UPDATE campaigns                                            │
│ SET escrow_balance = escrow_balance - 75.00                 │
│ WHERE id = 'c456';                                          │
│                                                             │
│ STEP 5: Notifications & Webhooks                            │
│ ─────────────────────────────────────────────────────────── │
│ • Send email to creator: "Payment sent: $75"                │
│ • Push notification to creator app                          │
│ • Update creator wallet balance (live)                      │
│ • Send confirmation to founder                              │
│ • Log event to analytics                                    │
│                                                             │
│ ✅ Phase 1 Payment Complete                                 │
└─────────────────────────────────────────────────────────────┘

### 4.2 Phase 2: Performance Bonus & Refund (7-Day Settlement)

**Trigger:** Automated cron job detects video.posted_at >= 168 hours ago
┌─────────────────────────────────────────────────────────────┐
│ SYSTEM: 7-Day Metric Lock & Settlement Processor            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Cron Job: Daily at 12:05 AM EST                             │
│ Query: SELECT * FROM videos                                 │
│        WHERE status = 'posted'                              │
│        AND posted_at <= NOW() - INTERVAL '168 hours'        │
│        AND status != 'locked'                               │
│                                                             │
│ Result: video_id 'v123' eligible for lock                   │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ PHASE 2A: METRIC LOCK                                       │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ STEP 1: Final View Count Fetch                              │
│ ─────────────────────────────────────────────────────────── │
│ • Platform: TikTok                                          │
│ • Post URL: https://tiktok.com/@marythcreator/video/729... │
│                                                             │
│ API Call: GET /v2/video/query/                              │
│ {                                                           │
│   video_id: "7298547382..."                                 │
│ }                                                           │
│                                                             │
│ Response:                                                   │
│ {                                                           │
│   data: {                                                   │
│     view_count: 45232,                                      │
│     like_count: 3421,                                       │
│     share_count: 287                                        │
│   }                                                         │
│ }                                                           │
│                                                             │
│ STEP 2: Lock View Count (Immutable)                         │
│ ─────────────────────────────────────────────────────────── │
│ BEGIN TRANSACTION;                                          │
│                                                             │
│ UPDATE videos                                               │
│ SET                                                         │
│   locked_view_count = 45232,                                │
│   locked_at = NOW(),                                        │
│   status = 'locked'                                         │
│ WHERE id = 'v123';                                          │
│                                                             │
│ INSERT INTO view_snapshots (                                │
│   video_id, view_count, snapshot_at, data_source            │
│ ) VALUES (                                                  │
│   'v123', 45232, NOW(), 'tiktok_api_final'                  │
│ );                                                          │
│                                                             │
│ COMMIT;                                                     │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ PHASE 2B: SETTLEMENT CALCULATION                            │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ Campaign Budget Overview:                                   │
│ • Total Budget: $1,000.00                                   │
│ • Base Fee Budget: $250.00 (5 videos × $50, but Mary gets  │
│   $75/video = $375 total)                                   │
│ • Performance Budget Available: $625.00                     │
│                                                             │
│ Final Views Achieved: 45,232 (across all 5 videos so far)   │
│ This specific video (v123): 45,232 views                    │
│                                                             │
│ Calculation for Video 1:                                    │
│ ───────────────────────────────────────────────────────────│
│ Views in thousands: 45232 / 1000 = 45.232                   │
│                                                             │
│ Creator Performance Bonus:                                  │
│   45.232 × $4.00 = $180.93                                  │
│                                                             │
│ Nala Revenue (Markup):                                      │
│   45.232 × $1.00 = $45.23                                   │
│                                                             │
│ Total Performance Cost:                                     │
│   45.232 × $5.00 = $226.16                                  │
│                                                             │
│ [Stored in settlement record]                               │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ PHASE 2C: PAYMENT EXECUTION                                 │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ STEP 1: Creator Performance Bonus Transfer                  │
│ ─────────────────────────────────────────────────────────── │
│ POST /v1/transfers                                          │
│ {                                                           │
│   amount: 18093, // $180.93 in cents                        │
│   currency: "usd",                                          │
│   destination: "acct_mary123",                              │
│   metadata: {                                               │
│     campaign_id: "c456",                                    │
│     video_id: "v123",                                       │
│     payment_type: "performance_bonus",                      │
│     views_achieved: 45232                                   │
│   }                                                         │
│ }                                                           │
│                                                             │
│ Response: { id: "tr_perf456", status: "paid" }              │
│                                                             │
│ INSERT INTO payments (                                      │
│   campaign_id: 'c456',                                      │
│   video_id: 'v123',                                         │
│   recipient_id: mary.id,                                    │
│   amount: 180.93,                                           │
│   type: 'performance_bonus',                                │
│   status: 'completed',                                      │
│   stripe_transfer_id: 'tr_perf456',                         │
│   metadata: {views: 45232}                                  │
│ );                                                          │
│                                                             │
│ STEP 2: Nala Revenue Recording                              │
│ ─────────────────────────────────────────────────────────── │
│ INSERT INTO revenue (                                       │
│   campaign_id: 'c456',                                      │
│   video_id: 'v123',                                         │
│   amount: 45.23,                                            │
│   type: 'markup',                                           │
│   views_count: 45232                                        │
│ );                                                          │
│                                                             │
│ // Funds stay in platform Stripe account                    │
│                                                             │
│ STEP 3: Calculate Campaign-Level Refund                     │
│ ─────────────────────────────────────────────────────────── │
│ // After ALL 5 videos are locked, calculate total refund    │
│                                                             │
│ Total Performance Budget: $625.00                           │
│ Total Performance Cost (all videos): $450.00                │
│ Refund Amount: $625.00 - $450.00 = $175.00                  │
│                                                             │
│ POST /v1/refunds                                            │
│ {                                                           │
│   payment_intent: "pi_founder123",                          │
│   amount: 17500, // $175 in cents                           │
│   reason: "requested_by_customer",                          │
│   metadata: {                                               │
│     campaign_id: "c456",                                    │
│     refund_type: "unspent_performance_budget",              │
│     original_budget: 625.00,                                │
│     actual_cost: 450.00                                     │
│   }                                                         │
│ }                                                           │
│                                                             │
│ Response: { id: "re_refund789", status: "succeeded" }       │
│                                                             │
│ INSERT INTO payments (                                      │
│   campaign_id: 'c456',                                      │
│   recipient_id: mike.id,                                    │
│   amount: 175.00,                                           │
│   type: 'refund',                                           │
│   status: 'completed',                                      │
│   stripe_refund_id: 're_refund789'                          │
│ );                                                          │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ PHASE 2D: FINALIZATION                                      │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ UPDATE campaigns                                            │
│ SET                                                         │
│   status = 'completed',                                     │
│   completed_at = NOW(),                                     │
│   final_views_total = 226160, // Sum of all videos          │
│   total_paid_to_creator = 555.93, // Base + Performance     │
│   total_refunded_to_founder = 175.00,                       │
│   platform_revenue = 226.16 // Nala markup                  │
│ WHERE id = 'c456';                                          │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ PHASE 2E: NOTIFICATIONS & REPORTING                         │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ To Creator (Mary):                                          │
│ ───────────────────────────────────────────────────────────│
│ Subject: Campaign Complete - $180.93 Bonus Paid!            │
│                                                             │
│ Your Q4 Product Launch campaign has ended!                  │
│                                                             │
│ Final Performance:                                          │
│ • Video 1: 45,232 views                                     │
│ • Performance Bonus: $180.93                                │
│ • Total Earned: $255.93 ($75 base + $180.93 bonus)         │
│                                                             │
│ Payment sent to your account.                               │
│                                                             │
│ [View Campaign Report] [Leave Review for Client]            │
│                                                             │
│ ───────────────────────────────────────────────────────────│
│                                                             │
│ To Founder (Mike):                                          │
│ ───────────────────────────────────────────────────────────│
│ Subject: Campaign Complete - $175 Refund Processed          │
│                                                             │
│ Your Q4 Product Launch campaign has concluded!              │
│                                                             │
│ Campaign Performance:                                       │
│ • Total Views: 226,160                                      │
│ • Videos Delivered: 5/5                                     │
│ • Total Spent: $825.00                                      │
│ • Refund Issued: $175.00                                    │
│                                                             │
│ Your refund will appear in 5-7 business days.               │
│                                                             │
│ [Download Performance Report] [Leave Review for Creator]     │
│                                                             │
│ ✅ Phase 2 Settlement Complete                              │
└─────────────────────────────────────────────────────────────┘

### 4.3 Error Handling & Recovery Flows
┌─────────────────────────────────────────────────────────────┐
│ ERROR SCENARIO 1: Stripe Transfer Fails                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Stripe API Response (Error):                                │
│ {                                                           │
│   error: {                                                  │
│     type: "invalid_request_error",                          │
│     code: "account_invalid",                                │
│     message: "The destination account is not active"        │
│   }                                                         │
│ }                                                           │
│                                                             │
│ System Recovery Actions:                                    │
│ ───────────────────────────────────────────────────────────│
│ 1. Update payment status to 'failed'                        │
│ 2. Add to retry queue with exponential backoff:             │
│    • Retry 1: 1 minute later                                │
│    • Retry 2: 5 minutes later                               │
│    • Retry 3: 15 minutes later                              │
│ 3. If all retries fail:                                     │
│    • Flag for manual review                                 │
│    • Alert admin dashboard                                  │
│    • Notify creator: "Payment delayed - we're fixing it"    │
│ 4. Admin manually resolves:                                 │
│    • Contact creator to update Stripe account               │
│    • Process payment manually once fixed                    │
│    • Log resolution in audit trail                          │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ ERROR SCENARIO 2: API View Count Unavailable                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ TikTok API Response (Error):                                │
│ {                                                           │
│   error: {                                                  │
│     code: 10000,                                            │
│     message: "Server internal error"                        │
│   }                                                         │
│ }                                                           │
│                                                             │
│ System Recovery Actions:                                    │
│ ───────────────────────────────────────────────────────────│
│ 1. Use last known view count from database:                 │
│    SELECT view_count FROM view_snapshots                    │
│    WHERE video_id = 'v123'                                  │
│    ORDER BY snapshot_at DESC LIMIT 1                        │
│                                                             │
│ 2. Lock with last known count + flag:                       │
│    locked_view_count = 43180 (last snapshot)                │
│    locked_with_api_error = true                             │
│                                                             │
│ 3. Send notification to admin:                              │
│    "Video v123 locked with API error - manual review needed"│
│                                                             │
│ 4. Admin Dashboard shows flagged video:                     │
│    [Review] button allows manual view count adjustment      │
│                                                             │
│ 5. Process settlement with adjusted count if needed         │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ ERROR SCENARIO 3: Insufficient Escrow Balance               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Scenario: Founder's payment method declined after deposit   │
│                                                             │
│ Pre-Flight Check Result:                                    │
│ Campaign escrow: $50 (should be $1,000)                     │
│ Required for approval: $75                                  │
│ ❌ Insufficient funds                                       │
│                                                             │
│ System Actions:                                             │
│ ───────────────────────────────────────────────────────────│
│ 1. Block approval action:                                   │
│    Show founder: "⚠️ Insufficient campaign funds"           │
│                                                             │
│ 2. Request additional funding:                              │
│    ┌─────────────────────────────────────────────────┐     │
│    │ Your campaign requires additional funding       │     │
│    │                                                 │     │
│    │ Current Balance: $50.00                         │     │
│    │ Required: $75.00                                │     │
│    │ Amount Needed: $25.00                           │     │
│    │                                                 │     │
│    │ [Add Funds] [Pause Campaign]                    │     │
│    └─────────────────────────────────────────────────┘     │
│                                                             │
│ 3. Notify creator of delay (transparent communication)      │
│                                                             │
│ 4. Pause campaign until refunded                            │
└─────────────────────────────────────────────────────────────┘

---

## 5. Performance Tracking Flow

### 5.1 Daily View Count Updates
┌─────────────────────────────────────────────────────────────┐
│ AUTOMATED: Daily View Polling Job (T-302)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Cron Schedule: Every day at 12:00 AM EST                    │
│                                                             │
│ STEP 1: Query Active Posts                                  │
│ ─────────────────────────────────────────────────────────── │
│ SELECT * FROM videos                                        │
│ WHERE status = 'posted'                                     │
│   AND posted_at > NOW() - INTERVAL '7 days'                 │
│   AND status != 'locked'                                    │
│ ORDER BY posted_at ASC;                                     │
│                                                             │
│ Results: 347 active videos across 89 campaigns              │
│                                                             │
│ STEP 2: Group by Platform & Batch Process                   │
│ ─────────────────────────────────────────────────────────── │
│ TikTok Batch (198 videos):                                  │
│ • Extract video IDs                                         │
│ • Batch into groups of 50 (API limit)                       │
│ • Process batches sequentially                              │
│                                                             │
│ Instagram Batch (114 videos):                               │
│ • Extract media IDs                                         │
│ • Fetch insights for each                                   │
│                                                             │
│ Facebook Batch (35 videos):                                 │
│ • Similar to Instagram process                              │
│                                                             │
│ STEP 3: API Calls with Rate Limit Management                │
│ ─────────────────────────────────────────────────────────── │
│ For each batch:                                             │
│                                                             │
│ TRY:                                                        │
│   response = await tiktokAPI.getVideoData({                 │
│     video_ids: batch_of_50,                                 │
│     fields: ['view_count', 'like_count']                    │
│   })                                                        │
│                                                             │
│   FOR each video in response:                               │
│     • Parse view_count                                      │
│     • Compare to last snapshot                              │
│     • Calculate delta (new_views - old_views)               │
│                                                             │
│     UPDATE videos                                           │
│     SET                                                     │
│       current_view_count = new_views,                       │
│       last_view_update = NOW()                              │
│     WHERE id = video_id;                                    │
│                                                             │
│     INSERT INTO view_snapshots (                            │
│       video_id, view_count, snapshot_at                     │
│     ) VALUES (video_id, new_views, NOW());                  │
│                                                             │
│ CATCH RateLimitError:                                       │
│   • Wait exponentially (60s, 120s, 240s)                    │
│   • Retry batch                                             │
│   • Log to monitoring                                       │
│                                                             │
│ CATCH APIError:                                             │
│   • Log error details                                       │
│   • Continue to next batch                                  │
│   • Flag for manual review if persistent                    │
│                                                             │
│ STEP 4: Update Creator Wallets (Real-Time Calculations)     │
│ ─────────────────────────────────────────────────────────── │
│ FOR each updated video:                                     │
│   new_performance_bonus = (current_view_count / 1000) * 4.00│
│                                                             │
│   UPDATE creator_wallets                                    │
│   SET pending_performance_bonus = new_performance_bonus     │
│   WHERE video_id = video_id;                                │
│                                                             │
│   // Trigger WebSocket update to live dashboards            │
│   websocket.emit('wallet_update', {                         │
│     creator_id: creator_id,                                 │
│     video_id: video_id,                                     │
│     new_bonus: new_performance_bonus                        │
│   });                                                       │
│                                                             │
│ STEP 5: Check for 7-Day Lock Eligibility                    │
│ ─────────────────────────────────────────────────────────── │
│ SELECT * FROM videos                                        │
│ WHERE status = 'posted'                                     │
│   AND posted_at <= NOW() - INTERVAL '168 hours'             │
│   AND status != 'locked';                                   │
│                                                             │
│ FOR each eligible video:                                    │
│   • Trigger Phase 2 settlement (See 4.2)                    │
│                                                             │
│ STEP 6: Monitoring & Alerting                               │
│ ─────────────────────────────────────────────────────────── │
│ Log metrics:                                                │
│ • Total videos processed: 347                               │
│ • Successful updates: 342 (98.6%)                           │
│ • API errors: 5 (1.4%)                                      │
│ • Processing time: 8.3 minutes                              │
│ • Rate limit hits: 0                                        │
│                                                             │
│ IF error_rate > 10%:                                        │
│   ALERT ops_team via PagerDuty                              │
│                                                             │
│ ✅ Daily Polling Complete                                   │
└─────────────────────────────────────────────────────────────┘

### 5.2 Creator Live Performance Dashboard
┌─────────────────────────────────────────────────────────────┐
│ CREATOR DASHBOARD - Live Performance View                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 💰 Wallet                                                   │
│ ───────────────────────────────────────────────────────────│
│ Available Balance:        $342.50                           │
│ Pending Performance:      $127.80  ⏱️ Updates daily         │
│ Lifetime Earnings:        $8,945.00                         │
│                                                             │
│ [Instant Payout] [View History]                             │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ 📊 ACTIVE CAMPAIGNS (2)                                     │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 📹 Q4 Product Launch                                 │   │
│ │ ────────────────────────────────────────────────────│   │
│ │                                                      │   │
│ │ Video 1/5 - TikTok  🟢 LIVE                         │   │
│ │ Posted: Nov 25, 9:30 AM                             │   │
│ │                                                      │   │
│ │ ┌──────────────────────────────────────────────┐   │   │
│ │ │ 👁️ 45,232 views                                │   │   │
│ │ │ ████████████████░░░░  Day 3/7                  │   │   │
│ │ │                                                │   │   │
│ │ │ Performance Bonus (Live):                      │   │   │
│ │ │ $180.93  (+$24.50 since yesterday)            │   │   │
│ │ │                                                │   │   │
│ │ │ Projected Final (if current pace continues):   │   │   │
│ │ │ ~65K views → ~$260 bonus                       │   │   │
│ │ │                                                │   │   │
│ │ │ Locks in: 4 days, 14 hours                     │   │   │
│ │ └──────────────────────────────────────────────┘   │   │
│ │                                                      │   │
│ │ [View Post] [View Analytics]                         │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 📹 Video 2/5 - TikTok  🟡 Pending Approval          │   │
│ │ Submitted: 2 hours ago                               │   │
│ │ Base Fee: $75 (paid on approval)                     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ 📈 PERFORMANCE INSIGHTS                                     │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ This Week:                                                  │
│ • Average views per video: 42,340                           │
│ • Best performing platform: TikTok (avg 48K views)          │
│ • Total performance bonus: $507.60                          │
│                                                             │
│ Tips to Boost Performance:                                  │
│ • Post between 7-9 AM EST for maximum reach                 │
│ • Use trending sounds (currently: "That's Crazy")           │
│ • Add captions for accessibility (+15% engagement avg)      │
│                                                             │
│ Last updated: 2 minutes ago  [Refresh]                      │
└─────────────────────────────────────────────────────────────┘

### 5.3 Founder Performance Dashboard
┌─────────────────────────────────────────────────────────────┐
│ FOUNDER DASHBOARD - Campaign Performance                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 📊 Q4 Product Launch Campaign                               │
│                                                             │
│ Status: Active  |  Creator: @marythcreator                  │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ 💰 BUDGET OVERVIEW                                          │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ Total Budget:           $1,000.00                           │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Spent:     $255.93  █████░░░░░░░░░  25.6%          │   │
│ │ Reserved:  $445.00  █████████░░░░░  44.5%          │   │
│ │ Available: $299.07  ██████░░░░░░░░  29.9%          │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Breakdown:                                                  │
│ • Base Fees Paid:        $75.00  (1/5 videos)              │
│ • Performance Cost:      $180.93 (45.2K views)              │
│ • Projected Refund:      $299.07 (if pace continues)        │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ 📹 VIDEO PERFORMANCE                                        │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ ┌────────────────────────────────────────────────────┐    │
│ │ Video 1 - TikTok                🟢 LIVE            │    │
│ │ Posted: Nov 25, 9:30 AM                            │    │
│ │                                                     │    │
│ │ 👁️ 45,232 views  ████████░░  Day 3/7              │    │
│ │                                                     │    │
│ │ Performance vs. Target:                             │    │
│ │ Target: 25,000 views (avg for similar campaigns)    │    │
│ │ Actual: 45,232 views (+80.9% above target!) 🎉     │    │
│ │                                                     │    │
│ │ Cost for this video so far: $75 + $226 = $301      │    │
│ │                                                     │    │
│ │ Engagement:                                         │    │
│ │ • Likes: 3,421  (7.6% rate)                        │    │
│ │ • Shares: 287   (0.6% rate)                        │    │
│ │ • Comments: 156                                     │    │
│ │                                                     │    │
│ │ 🔗 Watch Post: [Open TikTok →]                     │    │
│ │                                                     │    │
│ │ Locks in: 4 days, 14 hours                          │    │
│ └────────────────────────────────────────────────────┘    │
│                                                             │
│ ┌────────────────────────────────────────────────────┐    │
│ │ Video 2 - TikTok                🟡 In Review        │    │
│ │ Submitted: 2 hours ago                              │    │
│ │ [Review Content →]                                  │    │
│ └────────────────────────────────────────────────────┘    │
│                                                             │
│ ┌────────────────────────────────────────────────────┐    │
│ │ Video 3-5                       ⏳ In Progress      │    │
│ │ Expected delivery: Nov 23-26                        │    │
│ └────────────────────────────────────────────────────┘    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ 📈 CAMPAIGN INSIGHTS                                        │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ ROI Projection:                                             │
│ If current pace continues across all 5 videos:              │
│ • Total Views: ~226K                                        │
│ • Total Cost: ~$825                                         │
│ • Cost per 1,000 views: $3.65 ✅ (Industry avg: $5-8)      │
│                                                             │
│ Benchmarks vs. Similar Campaigns:                           │
│ • Views: Top 15% 🏆                                         │
│ • Engagement: Top 20% 📈                                    │
│ • Cost efficiency: Top 10% 💰                               │
│                                                             │
│ [Download Report (PDF)] [Export Data (CSV)]                 │
│                                                             │
│ Last updated: 1 minute ago  [Refresh]                       │
└─────────────────────────────────────────────────────────────┘

---

## 6. Dispute Resolution Flow

### 6.1 View Count Dispute (Founder-Initiated)
┌─────────────────────────────────────────────────────────────┐
│ SCENARIO: Founder Disputes View Count                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Founder believes reported views are inaccurate              │
│                                                             │
│ Entry Point: Campaign Dashboard → "Report Issue"            │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 🚨 Report an Issue                                   │   │
│ │                                                      │   │
│ │ Video: Video 1 - TikTok                              │   │
│ │ Current Views: 45,232                                │   │
│ │                                                      │   │
│ │ Issue Type:                                          │   │
│ │ ● View count inaccurate                              │   │
│ │ ○ Content doesn't match brief                        │   │
│ │ ○ Posting schedule violation                         │   │
│ │ ○ Other                                              │   │
│ │                                                      │   │
│ │ Description:                                         │   │
│ │ ┌──────────────────────────────────────────────┐   │   │
│ │ │ When I check the video directly on TikTok,   │   │   │
│ │ │ it shows 48,500 views, not 45,232. Please    │   │   │
│ │ │ verify the correct count.                    │   │   │
│ │ │                                              │   │   │
│ │ │ 124/1000 characters                          │   │   │
│ │ └──────────────────────────────────────────────┘   │   │
│ │                                                      │   │
│ │ Screenshot (Optional):                               │   │
│ │ [Upload screenshot of TikTok analytics]              │   │
│ │                                                      │   │
│ │ [Cancel] [Submit Dispute]                            │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ System Actions:                                             │
│ ───────────────────────────────────────────────────────────│
│ 1. Create dispute record:                                   │
│    INSERT INTO disputes (                                   │
│      campaign_id, video_id, reported_by: 'founder',         │
│      type: 'view_count', status: 'pending',                 │
│      description, evidence_url                              │
│    )                                                        │
│                                                             │
│ 2. Pause 7-day lock for this video (if not locked yet)      │
│    UPDATE videos                                            │
│    SET lock_paused = true                                   │
│    WHERE id = video_id;                                     │
│                                                             │
│ 3. Alert admin team (high priority)                         │
│                                                             │
│ 4. Notify creator of dispute                                │
│                                                             │
│ 5. Route to Admin Dispute Queue                             │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ ADMIN DISPUTE RESOLUTION DASHBOARD                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🚨 Active Disputes (3)                                      │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Dispute #D-1847                     🟡 PENDING       │   │
│ │                                                      │   │
│ │ Type: View Count Discrepancy                         │   │
│ │ Campaign: Q4 Product Launch (#c456)                  │   │
│ │ Video: Video 1 - TikTok (#v123)                      │   │
│ │                                                      │   │
│ │ Reported by: @mikethfounder                          │   │
│ │ Reported: 1 hour ago                                 │   │
│ │                                                      │   │
│ │ Details:                                             │   │
│ │ "When I check the video directly on TikTok, it      │   │
│ │  shows 48,500 views, not 45,232."                    │   │
│ │                                                      │   │
│ │ Evidence: [screenshot_tiktok.png]                    │   │
│ │                                                      │   │
│ │ Current Data:                                        │   │
│ │ • Platform Reported: 45,232 views                    │   │
│ │ • Founder Claims: 48,500 views                       │   │
│ │ • Difference: +3,268 views (+7.2%)                   │   │
│ │ • Last API sync: 6 hours ago                         │   │
│ │                                                      │   │
│ │ [Investigate] [View Full Thread]                     │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
↓ (Admin clicks "Investigate")
┌─────────────────────────────────────────────────────────────┐
│ ADMIN INVESTIGATION TOOLS                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ STEP 1: Re-fetch Live Data from TikTok API                  │
│ ───────────────────────────────────────────────────────────│
│ [Fetch Latest View Count]  ← Manual API call               │
│                                                             │
│ Result:                                                     │
│ ✅ API Response: 48,412 views (as of now)                   │
│                                                             │
│ Analysis:                                                   │
│ • Our last sync: 45,232 (6 hours ago)                       │
│ • Current actual: 48,412                                    │
│ • Founder's claim: 48,500 (close match ✓)                   │
│                                                             │
│ Conclusion: Sync delay caused discrepancy. Founder correct. │
│                                                             │
│ STEP 2: View History Audit                                  │
│ ───────────────────────────────────────────────────────────│
│ View Snapshot History:                                      │
│ │ Nov 25, 12:00 AM: 1,247 views                            │
│ │ Nov 26, 12:00 AM: 12,450 views (+11,203)                 │
│ │ Nov 27, 12:00 AM: 28,910 views (+16,460)                 │
│ │ Nov 28, 12:00 AM: 45,232 views (+16,322) ← Last sync     │
│ │ Nov 28, 10:45 AM: 48,412 views (+3,180)  ← Manual check  │
│                                                             │
│ Growth rate: Normal. No anomalies detected.                 │
│                                                             │
│ STEP 3: Resolution Options                                  │
│ ───────────────────────────────────────────────────────────│
│ ● Update to correct count (48,412)                          │
│ ○ Maintain original count (dispute invalid)                 │
│ ○ Average the two values (compromise)                       │
│ ○ Escalate for further investigation                        │
│                                                             │
│ Adjustment Impact:                                          │
│ • Old view count: 45,232                                    │
│ • New view count: 48,412                                    │
│ • Difference: +3,180 views                                  │
│                                                             │
│ Payment Impact:                                             │
│ • Additional creator bonus: +$12.72                         │
│ • Additional Nala revenue: +$3.18                           │
│ • Reduced founder refund: -$15.90                           │
│                                                             │
│ Notes for Parties:                                          │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Investigation confirmed the view count was outdated  │   │
│ │ due to sync timing. Updated to current accurate      │   │
│ │ count of 48,412. Thank you for reporting this!       │   │
│ │                                                      │   │
│ │ 168/500 characters                                   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ [Cancel] [Resolve Dispute & Apply Changes]                  │
│                                                             │
│ System Actions (Resolve):                                   │
│ ───────────────────────────────────────────────────────────│
│ 1. Update video.current_view_count = 48412                  │
│ 2. Create correction snapshot                               │
│ 3. Recalculate performance bonus                            │
│ 4. Update dispute status = 'resolved'                       │
│ 5. Notify both parties with resolution details              │
│ 6. Resume 7-day lock countdown                              │
│ 7. Log audit trail                                          │
└─────────────────────────────────────────────────────────────┘

### 6.2 Content Quality Dispute (Post-Approval)
┌─────────────────────────────────────────────────────────────┐
│ RARE SCENARIO: Founder Disputes After Approval              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Note: This is discouraged as approval triggers payment.     │
│ Only valid for severe violations (fraud, brand damage).     │
│                                                             │
│ Founder submits dispute:                                    │
│ "Creator posted content that violates brand guidelines      │
│  despite my approval. The video includes competitor logo."  │
│                                                             │
│ Admin Review Process:                                       │
│ ───────────────────────────────────────────────────────────│
│ 1. Review approved draft vs. live post                      │
│    • Compare side-by-side                                   │
│    • Check for material differences                         │
│                                                             │
│ 2. Determine if violation occurred:                         │
│    ✓ Material Change: Draft didn't show competitor logo,    │
│      but live post does                                     │
│    → Creator violated agreement                             │
│                                                             │
│ 3. Resolution Options:                                      │
│    a) Full Refund to Founder:                               │
│       • Return base fee ($75)                               │
│       • Cancel performance tracking                         │
│       • Terminate creator from platform (strike system)     │
│                                                             │
│    b) Partial Refund:                                       │
│       • Return 50% of base fee                              │
│       • Performance tracking continues                      │
│       • Issue warning to creator                            │
│                                                             │
│    c) No Action (Dispute Invalid):                          │
│       • Founder approved content as-is                      │
│       • No material changes in live version                 │
│       • Maintain original agreement                         │
│                                                             │
│ 4. Implement decision and notify both parties               │
│                                                             │
│ ⚠️ Post-approval disputes require strong evidence           │
│    Admin reviews on case-by-case basis                      │
└─────────────────────────────────────────────────────────────┘

### 6.3 Posting Schedule Violation
┌─────────────────────────────────────────────────────────────┐
│ AUTOMATED: Posting Schedule Monitor                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Daily Check: Compare actual vs. scheduled post times        │
│                                                             │
│ DETECTED VIOLATION:                                         │
│ ───────────────────────────────────────────────────────────│
│ Campaign: Q4 Product Launch (#c456)                         │
│ Video 2: Expected Nov 26, 9:00 AM EST                       │
│ Actual: Nov 27, 2:30 PM EST                                 │
│ Delay: 29.5 hours (MAJOR violation)                         │
│                                                             │
│ Automatic Actions:                                          │
│ ───────────────────────────────────────────────────────────│
│ 1. Flag campaign for admin review                           │
│ 2. Send alert to creator:                                   │
│    "⚠️ You posted 29 hours late. This may affect campaign." │
│ 3. Notify founder:                                          │
│    "Video 2 was posted late. You may request adjustment."   │
│ 4. Add note to campaign record                              │
│                                                             │
│ Admin Dashboard View:                                       │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ ⚠️ Schedule Violation - Campaign #c456              │   │
│ │                                                      │   │
│ │ Severity: MAJOR (24+ hours late)                     │   │
│ │                                                      │   │
│ │ Options:                                             │   │
│ │ 1. [No Action] - Minor impact, let it slide          │   │
│ │ 2. [Issue Warning] - Notify creator formally         │   │
│ │ 3. [Apply Penalty] - Reduce payment by X%            │   │
│ │ 4. [Cancel Video] - Remove from campaign             │   │
│ │                                                      │   │
│ │ Founder's Preference:                                │   │
│ │ ○ I'm fine with the delay                            │   │
│ │ ○ I want compensation (partial refund)               │   │
│ │ ● I want to cancel this video                        │   │
│ │                                                      │   │
│ │ [Make Decision]                                      │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Resolution Flow:                                            │
│ ───────────────────────────────────────────────────────────│
│ IF Founder requests cancellation:                           │
│   1. Remove video from campaign                             │
│   2. Refund base fee to founder (if already paid)           │
│   3. Do not count toward performance metrics                │
│   4. Issue strike to creator account                        │
│                                                             │
│ IF Founder accepts delay:                                   │
│   1. Continue tracking as normal                            │
│   2. Update posting calendar                                │
│   3. Close violation report                                 │
└─────────────────────────────────────────────────────────────┘

---

## Summary: Complete User Journey Map
┌─────────────────────────────────────────────────────────────┐
│                    NALA PLATFORM                            │
│              COMPLETE USER JOURNEY MAP                      │
└─────────────────────────────────────────────────────────────┘
CREATOR JOURNEY:
═══════════════════════════════════════════════════════════════

Sign Up & Onboarding (30 mins)
├─ Email registration
├─ Connect social accounts (TikTok/Instagram/Facebook)
├─ Set base fees ($50-500/video)
├─ Build portfolio (3-10 sample videos)
├─ Write bio & select niches
└─ Connect Stripe for payouts
Receive Campaign Invitation (< 1 min)
├─ Email + in-app notification
├─ Review brief details
└─ Accept or decline
Content Creation Phase (3-5 days)
├─ Review campaign brief thoroughly
├─ Download brand assets
├─ Create video content
├─ Upload draft for review
└─ Wait for founder approval/feedback
Revision Handling (if needed) (1-2 days)
├─ Receive revision requests
├─ Make requested changes
└─ Resubmit updated draft
Post-Approval Phase (< 1 hour)
├─ Receive approval notification
├─ Base fee payment received ($75)
├─ Post video on scheduled date
└─ Submit live post URL
Performance Tracking (7 days)
├─ Monitor views daily
├─ Watch performance bonus accumulate
├─ Track projections
└─ Receive final bonus on day 7
Campaign Completion (Day 8)
├─ Final views locked
├─ Performance bonus paid automatically
├─ Leave review for founder
└─ View campaign report

TOTAL CREATOR TIME: ~2-3 hours active work per campaign
TOTAL CREATOR EARNINGS: $75-$975 per video (avg ~$200-400)
FOUNDER JOURNEY:
═══════════════════════════════════════════════════════════════

Sign Up & Quick Onboarding (10 mins)
├─ Email registration
├─ Company information
└─ Add payment method
Campaign Creation (20-30 mins)
├─ STEP 1: Campaign basics (product, audience, goal)
├─ STEP 2: Content requirements (5 videos, 30s, platforms)
├─ STEP 3: Creative brief (talking points, do's/don'ts)
├─ STEP 4: Posting schedule (daily, starting Nov 25)
├─ STEP 5: Budget allocation ($1,000 total)
└─ STEP 6: Select creator from marketplace
Payment & Launch (5 mins)
├─ Review campaign summary
├─ Deposit funds to escrow ($1,000)
├─ Campaign goes live
└─ Wait for creator acceptance
Content Review Phase (Per video: 10-15 mins)
├─ Receive draft notification
├─ Review video content
├─ Check against brief requirements
└─ Approve or request revision
Active Campaign Monitoring (Daily: 2-5 mins)
├─ Check performance dashboard
├─ Track view counts
├─ Monitor budget spend
└─ View projected refund
Campaign Completion (Day 8 after last post)
├─ All videos locked at 7-day mark
├─ Final settlement processed
├─ Unused budget refunded automatically
├─ Download performance report
└─ Leave review for creator

TOTAL FOUNDER TIME: ~1-2 hours total for 5-video campaign
TOTAL FOUNDER COST: $500-$1,000 (only pay for actual views)
AVERAGE REFUND: 15-30% of performance budget
ADMIN JOURNEY:
═══════════════════════════════════════════════════════════════

Platform Monitoring (Ongoing)
├─ Monitor API health (TikTok, Meta, Stripe)
├─ Review payment processing queue
├─ Check daily polling job success rate
└─ Track platform metrics (GMV, campaigns, users)
Creator Verification (Per creator: 10 mins)
├─ Review application
├─ Verify social account authenticity
├─ Check follower count accuracy
└─ Approve or reject
Dispute Resolution (Per dispute: 30-60 mins)
├─ Review dispute details
├─ Investigate with tools (API checks, audit logs)
├─ Communicate with both parties
├─ Make fair decision
└─ Implement resolution (refund, adjustment, etc.)
Posting Schedule Violations (Per incident: 5-10 mins)
├─ Review flagged violation
├─ Assess severity
├─ Get founder preference
└─ Apply appropriate action
Payment Failures (Per failure: 15-30 mins)
├─ Investigate root cause
├─ Contact affected party (creator or founder)
├─ Manually process payment if needed
└─ Update system to prevent recurrence

SYSTEM AUTOMATED PROCESSES:
═══════════════════════════════════════════════════════════════

Daily View Polling (12:00 AM EST)
├─ Query all active posts (< 7 days old)
├─ Batch API calls to TikTok, Meta
├─ Update view counts in database
├─ Calculate performance bonuses
└─ Update creator wallets (live)
7-Day Metric Lock (Continuous check)
├─ Identify posts >= 168 hours old
├─ Lock final view count (immutable)
├─ Calculate settlement breakdown
├─ Process Phase 2 payments
└─ Send notifications
Payment Processing (Real-time)
├─ Phase 1: Base fee on approval
├─ Phase 2: Performance bonus + refund
├─ Error handling & retries
└─ Audit logging
Notifications (Real-time & scheduled)
├─ Email notifications
├─ In-app push notifications
├─ SMS for critical actions (optional)
└─ Webhook events for integrations
Deadline Reminders (Scheduled)
├─ Draft due reminders (3 days, 1 day, 6 hours before)
├─ Posting reminders (1 day, 3 hours before)
├─ Review reminders for founders
└─ Payment due alerts

KEY METRICS & MONITORING:
═══════════════════════════════════════════════════════════════
Platform Health:
├─ API Uptime: 99.9% target
├─ Payment Success Rate: 99.5% target
├─ View Polling Accuracy: 98%+ target
└─ Average Response Time: < 2s
Business Metrics:
├─ GMV (Gross Merchandise Volume): Total $ processed
├─ Take Rate: 20% (Nala revenue / Total performance budget)
├─ Campaign Completion Rate: 90%+ target
└─ User Satisfaction: 4.5+ stars (creators & founders)
User Engagement:
├─ Creator Repeat Rate: 70%+ target
├─ Founder Repeat Rate: 50%+ target
├─ Average Campaign Size: $1,000-$5,000
└─ Videos per Campaign: 3-7 average
EDGE CASES & SPECIAL SCENARIOS:
═══════════════════════════════════════════════════════════════

Zero Views Achieved
└─ Creator still receives base fee, full performance budget refunded
Viral Video (Views Exceed Budget)
└─ Cap payment at maximum views purchasable, creator earns max bonus
Creator Account Suspended Mid-Campaign
└─ Pause campaign, founder gets full refund, find replacement creator
Founder Payment Method Fails
└─ Pause campaign, notify founder, block approvals until funded
API Data Unavailable at Lock Time
└─ Use last known count, flag for manual admin review
Posting on Wrong Platform
└─ Admin review, founder decides: accept or reject
Content Violates Platform Guidelines (removed)
└─ Founder gets refund, creator may face penalty/termination

SECURITY & COMPLIANCE:
═══════════════════════════════════════════════════════════════
├─ PCI DSS Compliance (via Stripe)
├─ GDPR & CCPA Compliance (data privacy)
├─ SOC 2 Type II (future goal)
├─ Encryption: AES-256 at rest, TLS 1.3 in transit
├─ 2FA for high-value transactions
└─ Regular security audits
This comprehensive flow ensures:
✓ Clear expectations for all parties
✓ Automated processes reduce manual work
✓ Fair dispute resolution mechanisms
✓ Transparent payment tracking
✓ Minimal time investment for users
✓ High trust through escrow & verification
✓ Scalable architecture for growth

---

## Appendix: Quick Reference Tables

### A. User Actions & System Responses

| User Action | System Response Time | Notifications Sent |
|------------|---------------------|-------------------|
| Sign up | Immediate | Email verification |
| Connect social account | 2-5 seconds | Success confirmation |
| Submit draft | < 30 seconds (upload) | Founder notified |
| Approve content | < 2 minutes | Creator + payment |
| Post video + submit URL | < 10 seconds | Founder notified |
| Daily view update | 12:00 AM EST daily | Real-time dashboard |
| 7-day lock | Within 5 minutes | Both parties emailed |
| Refund processing | 5-7 business days | Email confirmation |

### B. Payment Timeline

| Event | Timing | Amount | Recipient |
|-------|--------|--------|----------|
| Campaign funding | At launch | $1,000 | Escrow |
| Base fee payment | On approval | $75/video | Creator |
| Performance bonus | 7 days post-publish | $4/1k views | Creator |
| Nala markup | 7 days post-publish | $1/1k views | Nala |
| Founder refund | 7 days post-publish | Unused budget | Founder |

### C. Support Response Times (SLA)

| Issue Severity | First Response | Resolution Target |
|---------------|---------------|------------------|
| Critical (payment failure) | 15 minutes | 2 hours |
| High (dispute) | 1 hour | 24 hours |
| Medium (technical issue) | 4 hours | 48 hours |
| Low (general question) | 24 hours | 5 business days |

---

**End of Detailed User Flows Document**

*This document should be used in conjunction with the Product Requirements Document (PRD) for complete platform understanding.*
│# Nala Platform - Detailed User Flows

## Table of Contents
1. [Creator Onboarding Flow](#1-creator-onboarding-flow)
2. [Founder Campaign Creation Flow](#2-founder-campaign-creation-flow)
3. [Content Creation & Review Flow](#3-content-creation--review-flow)
4. [Payment Processing Flow](#4-payment-processing-flow)
5. [Performance Tracking Flow](#5-performance-tracking-flow)
6. [Dispute Resolution Flow](#6-dispute-resolution-flow)

---

## 1. Creator Onboarding Flow

### 1.1 Account Registration

**Entry Point:** Landing page → "Sign Up as Creator" button
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Basic Information                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Creator enters:                                             │
│  • Full Name                                                │
│  • Email Address                                            │
│  • Password (8+ chars, 1 number, 1 special)                │
│  • Confirm Password                                         │
│                                                             │
│ [Checkbox] I agree to Terms of Service & Privacy Policy    │
│                                                             │
│ [Continue →]                                                │
│                                                             │
│ System Actions:                                             │
│  1. Validate email format and uniqueness                    │
│  2. Hash password (bcrypt)                                  │
│  3. Create user record (role: 'creator')                    │
│  4. Send verification email                                 │
│  5. Create empty creator_profile record                     │
│  6. Generate session token                                  │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Email Verification                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Screen: "Check your email"                                  │
│  📧 We sent a verification link to mary@email.com          │
│                                                             │
│ Creator clicks link in email →                              │
│                                                             │
│ System Actions:                                             │
│  1. Verify token from email link                            │
│  2. Update user.email_verified = true                       │
│  3. Redirect to platform onboarding                         │
└─────────────────────────────────────────────────────────────┘

### 1.2 Social Media Account Connection

**Critical Path:** This determines creator eligibility
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Connect Your Platforms                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "Connect your social accounts to start earning"             │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 🎵 TikTok         [Connect Account]   Not Connected │   │
│ │    Minimum: 10,000 followers                        │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 📸 Instagram      [Connect Account]   Not Connected │   │
│ │    Minimum: 5,000 followers                         │   │
│ │    ⚠️ Requires Business Account                     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 👍 Facebook       [Connect Account]   Not Connected │   │
│ │    Minimum: 5,000 followers                         │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Note: Connect at least one platform to continue            │
│                                                             │
│ [Skip for now]  [Continue]  ← Disabled until 1 connected   │
└─────────────────────────────────────────────────────────────┘

#### 1.2.1 TikTok Connection Sub-Flow
Creator clicks "Connect Account" on TikTok
↓
┌─────────────────────────────────────────────────────────────┐
│ POPUP: TikTok OAuth                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ System Actions:                                             │
│  1. Generate OAuth state token (CSRF protection)            │
│  2. Redirect to TikTok Login Kit:                           │
│     https://www.tiktok.com/auth/authorize/                  │
│     ?client_key={CLIENT_KEY}                                │
│     &scope=user.info.basic,video.list,video.insights        │
│     &response_type=code                                     │
│     &redirect_uri={CALLBACK_URL}                            │
│     &state={STATE_TOKEN}                                    │
│                                                             │
│ Creator sees TikTok login screen →                          │
│  • Logs into TikTok (if not already)                        │
│  • Reviews permissions request                              │
│  • Clicks "Authorize"                                       │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ CALLBACK: TikTok Returns to Nala                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ System Actions:                                             │
│  1. Receive authorization code                              │
│  2. Verify state token (prevent CSRF)                       │
│  3. Exchange code for access token:                         │
│     POST https://open-api.tiktok.com/oauth/access_token/    │
│  4. Fetch user profile:                                     │
│     GET /v2/user/info/                                      │
│  5. Extract: username, follower_count, user_id              │
│                                                             │
│  6. Validate eligibility:                                   │
│     IF follower_count < 10,000:                             │
│       ❌ Show error: "Minimum 10K followers required"       │
│       STOP                                                  │
│                                                             │
│  7. Store in database:                                      │
│     INSERT INTO social_accounts (                           │
│       creator_id, platform, platform_user_id,               │
│       username, follower_count,                             │
│       access_token [ENCRYPTED], refresh_token [ENCRYPTED],  │
│       token_expires_at, verified_at                         │
│     )                                                       │
│                                                             │
│  8. Update creator_profile.verification_status = 'verified' │
│  9. Show success message                                    │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ SUCCESS SCREEN                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ✅ TikTok Connected Successfully!                           │
│                                                             │
│ @marythcreator                                              │
│ 47,234 followers                                            │
│                                                             │
│ [Connect Another Platform]  [Continue →]                    │
└─────────────────────────────────────────────────────────────┘

#### 1.2.2 Instagram Connection Sub-Flow

**Note:** More complex due to Business Account requirement
Creator clicks "Connect Account" on Instagram
↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Check Account Type                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "Do you have an Instagram Business or Creator Account?"     │
│                                                             │
│ [Yes, I have a Business Account] → Continue to OAuth        │
│ [No, I have a Personal Account] → Show conversion guide     │
│                                                             │
│ IF "No" selected:                                           │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ ℹ️  How to Convert to Business Account:            │   │
│ │                                                     │   │
│ │ 1. Open Instagram app                              │   │
│ │ 2. Go to Settings → Account                        │   │
│ │ 3. Select "Switch to Professional Account"         │   │
│ │ 4. Choose "Business"                               │   │
│ │ 5. Connect to Facebook Page                        │   │
│ │                                                     │   │
│ │ [Watch Video Tutorial]  [I've Converted]           │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Facebook Login (Required for Instagram)             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ System Actions:                                             │
│  1. Redirect to Facebook OAuth:                             │
│     https://www.facebook.com/v18.0/dialog/oauth             │
│     ?client_id={APP_ID}                                     │
│     &redirect_uri={CALLBACK}                                │
│     &scope=instagram_basic,instagram_manage_insights,       │
│             pages_read_engagement                           │
│                                                             │
│ Creator:                                                    │
│  • Logs into Facebook                                       │
│  • Selects connected Instagram Business Account            │
│  • Grants permissions                                       │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Fetch Instagram Data                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ System Actions:                                             │
│  1. Exchange code for access token                          │
│  2. Get Instagram Business Account ID:                      │
│     GET /{facebook-page-id}?fields=instagram_business_accou │
│     nt                                                      │
│  3. Get Instagram profile data:                             │
│     GET /{ig-user-id}?fields=username,followers_count       │
│                                                             │
│  4. Validate:                                               │
│     IF followers_count < 5,000:                             │
│       ❌ Error: "Minimum 5K followers required"             │
│     IF account_type != 'BUSINESS':                          │
│       ❌ Error: "Business account required"                 │
│                                                             │
│  5. Store data (same as TikTok flow)                        │
└─────────────────────────────────────────────────────────────┘

### 1.3 Profile Setup
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Set Your Rates                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "How much do you charge per video?"                         │
│                                                             │
│ TikTok Base Fee:                                            │
│ [$75] ◄────●────────────────► [$500]                       │
│  $50                                  Max                   │
│                                                             │
│ 💡 Most creators charge: $75-$150                           │
│ 📊 Your potential earnings for 100K views:                  │
│     Base Fee: $75 + Performance: $400 = $475 total          │
│                                                             │
│ Instagram Base Fee:                                         │
│ [$75] ◄────●────────────────► [$500]                       │
│                                                             │
│ Facebook Base Fee:                                          │
│ [$75] ◄────●────────────────► [$500]                       │
│                                                             │
│ [Continue →]                                                │
│                                                             │
│ System Actions:                                             │
│  • Update creator_profile with base fees                    │
│  • Calculate average fee for matching algorithm             │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Build Your Portfolio                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "Upload 3-10 sample videos to showcase your style"          │
│                                                             │
│ [Drag & Drop Videos Here]                                   │
│  or [Browse Files]                                          │
│                                                             │
│ Uploaded (2/10):                                            │
│ ┌─────────┐  ┌─────────┐                                   │
│ │ [Video] │  │ [Video] │  [+ Add More]                     │
│ │  30s    │  │  45s    │                                   │
│ └─────────┘  └─────────┘                                   │
│                                                             │
│ For each video:                                             │
│  • Title: [Product Review - SaaS Tool]                      │
│  • Platform: [TikTok ▼]                                     │
│                                                             │
│ [Skip for now]  [Continue →]                                │
│                                                             │
│ System Actions:                                             │
│  1. Upload to S3 (max 500MB per video)                      │
│  2. Generate thumbnail (frame at 2s)                        │
│  3. Transcode to web format (H.264, 720p)                   │
│  4. Store metadata in creator_profile.portfolio_videos      │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Category & Bio                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ What niches do you specialize in? (Select all that apply)   │
│                                                             │
│ ☑ SaaS & Software    ☐ E-commerce     ☐ Health & Fitness   │
│ ☑ B2B Tech           ☐ Beauty         ☐ Food & Beverage    │
│ ☐ Finance            ☐ Fashion        ☐ Gaming             │
│                                                             │
│ Tell brands about yourself: (500 char max)                  │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Hi! I'm Mary, a tech enthusiast who creates          │   │
│ │ engaging video reviews for SaaS products. My         │   │
│ │ audience loves honest, detailed breakdowns...        │   │
│ │                                                      │   │
│ │ 347/500 characters                                   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ [Back]  [Complete Setup →]                                  │
│                                                             │
│ System Actions:                                             │
│  • Update creator_profile.categories                        │
│  • Update creator_profile.bio                               │
│  • Set profile_completed = true                             │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Payment Setup (Stripe Connect)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "Last step: Set up payouts"                                 │
│                                                             │
│ Nala uses Stripe to send you payments securely.             │
│                                                             │
│ [Connect Stripe Account]                                    │
│                                                             │
│ System Actions:                                             │
│  1. Create Stripe Connect Express account link:             │
│     POST /v1/account_links                                  │
│     type: 'account_onboarding'                              │
│  2. Redirect creator to Stripe hosted onboarding            │
│                                                             │
│ Creator completes on Stripe:                                │
│  • Personal information (name, DOB, SSN)                    │
│  • Business details (if applicable)                         │
│  • Bank account for deposits                                │
│  • Identity verification (photo ID)                         │
│                                                             │
│ Stripe redirects back to Nala with account_id               │
│                                                             │
│ System Actions:                                             │
│  1. Store stripe_account_id in users table                  │
│  2. Verify account capabilities:                            │
│     - transfers: 'active'                                   │
│     - card_payments: 'active' (if needed)                   │
│  3. Mark creator as payment_ready = true                    │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ 🎉 SUCCESS: You're All Set!                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Your creator profile is live!                               │
│                                                             │
│ ✅ TikTok connected (47K followers)                         │
│ ✅ Base fee set ($75/video)                                 │
│ ✅ Portfolio added (2 videos)                               │
│ ✅ Payments ready                                           │
│                                                             │
│ Next steps:                                                 │
│ • Brands will discover your profile                         │
│ • You'll receive brief invitations                          │
│ • Start earning with performance-based pay!                 │
│                                                             │
│ [Go to Dashboard →]                                         │
└─────────────────────────────────────────────────────────────┘

---

## 2. Founder Campaign Creation Flow

### 2.1 Campaign Initiation

**Entry Point:** Dashboard → "Create Campaign" button
┌─────────────────────────────────────────────────────────────┐
│ Create New Campaign                     [Save Draft] [Exit] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Progress: ●──○──○──○──○──○  Step 1 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 1: Campaign Basics                                     │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ Campaign Name: *                                            │
│ [Q4 Product Launch Campaign                              ] │
│                                                             │
│ What are you promoting?                                     │
│ [ProductivityPro - AI-powered task management SaaS       ] │
│                                                             │
│ Target Audience:                                            │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Professionals aged 25-40, interested in              │   │
│ │ productivity tools, remote workers, small business   │   │
│ │ owners.                                              │   │
│ │                                                      │   │
│ │ 178/500 characters                                   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Campaign Goal:                                              │
│ ○ Brand Awareness    ● Website Traffic    ○ Signups        │
│ ○ Sales              ○ App Downloads                        │
│                                                             │
│ [Continue →]                                                │
│                                                             │
│ System Actions:                                             │
│  • Auto-save every 30 seconds                               │
│  • Create draft campaign record                             │
│  • Status: 'draft'                                          │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ Progress: ●──●──○──○──○──○  Step 2 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 2: Content Requirements                                │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ How many videos do you need?                                │
│ [5▼] videos                                                 │
│  (Min: 1, Max: 10 per campaign)                             │
│                                                             │
│ Preferred video length:                                     │
│ ○ 15 seconds     ● 30 seconds                               │
│ ○ 60 seconds     ○ Creator's choice                         │
│                                                             │
│ Which platforms? (Select all that apply)                    │
│ ☑ TikTok    ☑ Instagram Reels    ☐ Facebook Reels          │
│                                                             │
│ Video style preference:                                     │
│ ☑ Product Tutorial    ☐ Unboxing    ☐ Testimonial          │
│ ☐ Behind the Scenes   ☐ Comparison                          │
│                                                             │
│ [← Back]  [Continue →]                                      │
│                                                             │
│ System Actions:                                             │
│  • Update campaign.videos_requested = 5                     │
│  • Store platform preferences in brief_data JSONB           │
│  • Calculate estimated budget preview                       │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ Progress: ●──●──●──○──○──○  Step 3 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 3: Creative Brief                                      │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ Key Talking Points: (What should the creator highlight?)    │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ • AI-powered task prioritization                    │   │
│ │ • Integrates with 50+ tools (Slack, Gmail, etc)     │   │
│ │ • Saves 2 hours per day on average                  │   │
│ │ • Free 14-day trial available                       │   │
│ │                                                      │   │
│ │ [+ Add Point]                                        │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Brand Guidelines: (Upload PDF, images, or describe)         │
│ [📄 Brand_Guidelines.pdf] [✓ Uploaded]  [Remove]           │
│ [+ Upload Assets] (Logo, product images, etc.)              │
│                                                             │
│ Do's:                          │ Don'ts:                    │
│ • Be authentic                 │ • Compare to competitors   │
│ • Show real use cases          │ • Make health claims       │
│ • Use trending audio           │ • Show competitor logos    │
│ [+ Add]                        │ [+ Add]                    │
│                                                             │
│ Required Hashtags/Mentions:                                 │
│ [#ProductivityPro #AItools @productivitypro_official     ] │
│                                                             │
│ Reference Videos: (Optional - paste URLs)                   │
│ [https://tiktok.com/@competitor/video/123                ] │
│ [+ Add Another]                                             │
│                                                             │
│ [← Back]  [Continue →]                                      │
│                                                             │
│ System Actions:                                             │
│  • Store all data in campaign.brief_data (JSONB)            │
│  • Upload brand assets to S3                                │
│  • Generate brief preview PDF                               │
└─────────────────────────────────────────────────────────────┘

### 2.2 Posting Schedule & Budget Configuration
┌─────────────────────────────────────────────────────────────┐
│ Progress: ●──●──●──●──○──○  Step 4 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 4: Posting Schedule                                    │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ When should the first video go live?                        │
│ [Nov 25, 2025 ▼]  📅                                        │
│  (Minimum 5 days from today for creator prep)               │
│                                                             │
│ How often should videos be posted?                          │
│ ● One per day           ○ Every other day                   │
│ ○ Every 3 days          ○ Weekly                            │
│ ○ Custom schedule                                           │
│                                                             │
│ 📅 Your Posting Calendar:                                   │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Video 1:  Nov 25 (Mon) 📱 TikTok                    │   │
│ │ Video 2:  Nov 26 (Tue) 📱 TikTok                    │   │
│ │ Video 3:  Nov 27 (Wed) 📸 Instagram                 │   │
│ │ Video 4:  Nov 28 (Thu) 📸 Instagram                 │   │
│ │ Video 5:  Nov 29 (Fri) 📱 TikTok                    │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Preferred posting time: (Optional)                          │
│ [09:00 AM ▼]  [EST ▼]                                       │
│                                                             │
│ [← Back]  [Continue →]                                      │
│                                                             │
│ System Actions:                                             │
│  • Calculate posting dates                                  │
│  • Store in campaign.start_date, posting_frequency          │
│  • Validate timeline (min 5 days buffer)                    │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ Progress: ●──●──●──●──●──○  Step 5 of 6                    │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ STEP 5: Budget Configuration                                │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ 💰 Set Your Total Budget                                    │
│                                                             │
│ Total Campaign Budget:                                      │
│ $ [1000.00]                                                 │
│   (Minimum: $500 | Maximum: $50,000)                        │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 📊 BUDGET BREAKDOWN                                  │   │
│ │                                                      │   │
│ │ Fixed Production Costs:         $250.00 (25%)       │   │
│ │ └─ 5 videos × $50 base fee                          │   │
│ │                                                      │   │
│ │ Variable Performance Budget:    $750.00 (75%)       │   │
│ │ └─ Pays for actual views achieved                   │   │
│ │                                                      │   │
│ │ ─────────────────────────────────────────────────   │   │
│ │                                                      │   │
│ │ Maximum Views You Can Purchase:                     │   │
│ │ 150,000 views @ $5.00 per 1,000                     │   │
│ │                                                      │   │
│ │ ═════════════════════════════════════════════════   │   │
│ │                                                      │   │
│ │ 💡 How Performance Budget Works:                    │   │
│ │                                                      │   │
│ │ If videos achieve 120K views (80% of max):          │   │
│ │  • You pay: $250 + $600 = $850                      │   │
│ │  • You save: $150 (refunded automatically)          │   │
│ │                                                      │   │
│ │ If videos achieve 150K views (100% of max):         │   │
│ │  • You pay: $250 + $750 = $1,000 (full budget)      │   │
│ │  • You save: $0 (great performance!)                │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ☑ I understand that:                                        │
│    • Base fees are paid when I approve content              │
│    • Performance budget is charged based on actual views    │
│    • Unused budget is refunded automatically after 7 days   │
│                                                             │
│ [← Back]  [Continue to Creator Selection →]                 │
│                                                             │
│ System Actions:                                             │
│  • Validate budget (min $500)                               │
│  • Calculate: base_fee_budget, performance_budget           │
│  • Store in campaigns table                                 │
│  • Update max_views_purchasable                             │
└─────────────────────────────────────────────────────────────┘



