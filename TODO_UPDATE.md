# Updated TODO List - Feature Gap Analysis

Based on a detailed comparison between `userflow.md` and the current codebase.

## 🔴 Critical Missing Features

### 1. Creator Onboarding Flow
- [ ] **Email Verification** (Userflow 1.1)
  - [ ] Send verification email upon registration (SendGrid/AWS SES)
  - [ ] Verification page/endpoint (`/verify-email`)
  - [ ] Block access until verified (middleware check)
- [ ] **Profile Setup Wizard** (Userflow 1.3)
  - [ ] **Step 4: Set Rates** (UI for TikTok/IG/FB base fees with sliders)
  - [ ] **Step 5: Portfolio** (Upload/Link sample videos, generate thumbnails)
  - [ ] **Step 6: Category & Bio** (Niche selection, bio text)
  - [ ] **Step 7: Payment Setup** (Stripe Connect onboarding)
  - [ ] **Redirect Logic**: Force new creators to this flow before Dashboard.

### 2. Payment Processing (Userflow 4.0)
- [ ] **Stripe Integration**
  - [ ] Stripe Connect for Creators (Express accounts)
  - [ ] Founder billing setup (Customer creation)
  - [ ] **Phase 1**: Escrow funding & Base fee payout triggers
  - [ ] **Phase 2**: Performance bonus calculation & payout
  - [ ] Refund logic for underperformance

### 3. Dispute Resolution (Userflow 6.0)
- [ ] **Dispute UI**
  - [ ] "Report Issue" button on video/payment
  - [ ] Dispute form (Reason, Evidence)
  - [ ] Admin dashboard for resolving disputes

### 4. Notifications
- [ ] **Email Notifications**
  - [ ] "New Brief Available"
  - [ ] "Application Accepted"
  - [ ] "Video Rejected/Approved"
  - [ ] "Payment Sent"
- [ ] **In-App Notification Center**

## 🟡 Partial / Needs Refinement

### 1. Founder Campaign Creation (Userflow 2.0)
- [ ] **Posting Schedule UI** (Userflow 2.2)
  - [ ] Implement specific frequency selectors (Daily, Every other day)
  - [ ] Auto-calculate posting dates based on frequency
- [ ] **Budget Configuration** (Userflow 2.2)
  - [ ] Visual breakdown of Fixed vs Variable budget
  - [ ] Max views calculator

### 2. Performance Dashboard (Userflow 5.0)
- [ ] **Advanced Metrics**
  - [ ] ROI Calculator
  - [ ] Refund amount projection (Real-time)
  - [ ] PDF Report generation

## 🟢 Completed Features
- ✅ Authentication (Login/Register)
- ✅ OAuth Integration (TikTok/Meta)
- ✅ Campaign Creation (Basic Wizard)
- ✅ Creator Discovery (Briefs)
- ✅ Application System
- ✅ Video Upload & Review
- ✅ Posting URL Submission
- ✅ View Tracking API & Automation

---

## 🚀 Next Action Plan
1. **Implement Creator Profile Setup Wizard** (Steps 4-6 of Userflow)
   - This is critical for the marketplace to function (matching creators to briefs).
2. **Implement Stripe Connect** (Step 7 of Userflow)
3. **Refine Campaign Creation** (Schedule/Budget)
