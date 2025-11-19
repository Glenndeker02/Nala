# Nala Platform - Performance-Based UGC Agency

Nala is a performance-based UGC (User-Generated Content) agency platform that creates a trust bridge between SaaS Founders and professional content creators through a hybrid payment model.

## 🚀 Features Implemented

### Core Platform
- ✅ Next.js 14 with TypeScript
- ✅ PostgreSQL database with Prisma ORM
- ✅ Comprehensive data models (users, campaigns, videos, payments, settlements)
- ✅ JWT-based authentication system
- ✅ Role-based access control (Founder, Creator, Admin)

### Payment System
- ✅ Stripe Connect integration for creator payouts
- ✅ Escrow system for campaign funding
- ✅ Phase 1 payments (base fee on content approval)
- ✅ Phase 2 payments (performance bonus after 7 days)
- ✅ Automatic refund processing for unspent budget
- ✅ Settlement calculation engine
- ✅ Webhook handling for Stripe events

### Content Workflow
- ✅ Campaign creation API
- ✅ Video submission system
- ✅ Content approval workflow
- ✅ Revision tracking

### Social Media Integration
- ✅ TikTok API integration for view tracking
- ✅ Meta API integration (Instagram/Facebook)
- ✅ Token encryption and secure storage
- ✅ View count polling system

### Background Jobs
- ✅ Daily view polling cron job
- ✅ 7-day metric lock and settlement system
- ✅ Automated payment processing
- ✅ Manual cron trigger API (for testing)

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Stripe account (with Connect enabled)
- TikTok Developer account
- Meta (Facebook) Developer account
- AWS S3 bucket (for video storage)
- Redis (for job queues and caching)

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd Nala
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in all required values:

```bash
cp .env.example .env
```

**Critical environment variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `TIKTOK_CLIENT_KEY` & `TIKTOK_CLIENT_SECRET` - TikTok API credentials
- `META_APP_ID` & `META_APP_SECRET` - Meta API credentials
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME` - AWS S3 credentials
- `ENCRYPTION_KEY` - 32-character key for encrypting sensitive data

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or run migrations (production)
npm run db:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (Founder or Creator)
- `POST /api/auth/login` - Login and get JWT tokens

### Campaigns
- `POST /api/campaigns/create` - Create new campaign (Founder only)

### Videos
- `POST /api/videos/submit` - Submit video draft (Creator only)
- `POST /api/videos/approve` - Approve video and trigger base fee payment (Founder only)

### Stripe
- `POST /api/stripe/connect/onboard` - Initiate Stripe Connect onboarding (Creator only)
- `POST /api/stripe/webhook` - Handle Stripe webhooks

### Cron Jobs
- `POST /api/cron/trigger` - Manually trigger cron jobs (requires CRON_SECRET)
  - Body: `{ "job": "view-polling" | "settlement" | "all" }`

## 💰 Payment Flow

### Phase 1: Base Fee Payment
1. Founder approves video content
2. System triggers Stripe transfer to creator
3. Base fee (e.g., $75) paid immediately
4. Video status updated to "APPROVED"

### Phase 2: Performance Settlement (7 days)
1. Video posted on social media
2. Daily cron job tracks view counts
3. After 7 days, view count is locked
4. Settlement calculated:
   - Creator performance bonus: views × $4.00 per 1k
   - Nala revenue: views × $1.00 per 1k
   - Founder refund: unspent budget
5. Payments and refunds processed automatically

## 🔒 Security Features

- Password hashing with bcrypt (cost factor 12)
- JWT tokens with 24-hour expiration
- Refresh tokens with 30-day expiration
- AES-256 encryption for sensitive data (API tokens)
- Stripe webhook signature verification
- Rate limiting on API endpoints
- Role-based access control

## 📖 Business Rules (from rules.md)

### Pricing Structure
- Creator rate: **$4.00 per 1,000 views**
- Nala markup: **$1.00 per 1,000 views**
- Founder rate: **$5.00 per 1,000 views**
- Base fee range: **$50 - $500 per video**

### Campaign Budget
- Minimum: **$500**
- Maximum: **$50,000**
- Can only increase during campaign (never decrease)

### Settlement Formula
```javascript
viewsInThousands = locked_view_count / 1000
creatorPerformanceBonus = viewsInThousands × 4.00
nalaRevenue = viewsInThousands × 1.00
totalPerformanceCost = viewsInThousands × 5.00
founderRefund = max(0, performanceBudget - totalPerformanceCost)
```

## 🎯 Next Steps (TODO)

See `TODO.md` for the complete development roadmap.

**High Priority:**
- [ ] Complete Creator and Founder UI dashboards
- [ ] Implement OAuth flows for TikTok and Meta
- [ ] Build video upload and management UI
- [ ] Implement email notification system
- [ ] Add comprehensive testing
- [ ] Security audit
- [ ] Production deployment

## 📝 Documentation

- `prd.md` - Complete Product Requirements Document
- `userflow.md` - Detailed user flows and workflows
- `rules.md` - Implementation rules and constraints extracted from PRD
- `TODO.md` - Complete development task breakdown

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend Layer                      │
│            (Next.js App Router + React)                 │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│                   API Layer (Next.js API Routes)        │
│     - Authentication Middleware                         │
│     - Role-based Access Control                         │
│     - Rate Limiting                                     │
└────────────────┬────────────────────────────────────────┘
                 │
     ┌───────────┴───────────┐
     │                       │
┌────▼─────────┐   ┌────────▼─────────┐
│   Business   │   │   Background     │
│    Logic     │   │   Cron Jobs      │
│              │   │  - View Polling  │
│              │   │  - Settlement    │
└────┬─────────┘   └────────┬─────────┘
     │                      │
     └──────┬───────────────┘
            │
    ┌───────▼────────┐
    │   PostgreSQL   │
    │   (Prisma ORM) │
    └────────────────┘

External Services:
├─ Stripe (Payments & Escrow)
├─ TikTok API (View Tracking)
├─ Meta API (Instagram/Facebook)
└─ AWS S3 (Video Storage)
```

## 📄 License

Proprietary - All rights reserved

## 🤝 Support

For issues and questions, please refer to the PRD and userflow documentation.

---

**Built with**: Next.js, TypeScript, Prisma, PostgreSQL, Stripe, TailwindCSS
