13.2 Admin Dashboard - Main Overview
Feature A-101: Admin Dashboard Home (Overview)
Priority: P0 (Critical)
Description: Executive dashboard showing platform health, key metrics, and quick-action items for admin.
Acceptance Criteria:
✓ Real-time metrics displayed (auto-refresh every 60 seconds)
✓ Platform health status indicators (API, DB, Stripe, view sync)
✓ Today's GMV (Gross Merchandise Volume) displayed prominently
✓ Active campaigns counter + breakdown by status
✓ New creator applications (verification queue)
✓ Pending disputes + resolution needed count
✓ Failed payments + manual interventions needed
✓ Alerts widget (critical issues highlighted in red)
✓ Quick actions: Create announcement, broadcast email, system status
✓ Search bar: Find user, campaign, transaction by ID
✓ Date range selector for all metrics (default: today, last 7 days, last 30 days)
Dashboard Layout:
┌─────────────────────────────────────────────────────────────────┐
│ NALA ADMIN DASHBOARD                                       🔔 🔧│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 📊 KEY METRICS (Live)              ⚙️ SYSTEM STATUS              │
│ ├─ Today's GMV: $47,230            ├─ API: ✅ Healthy           │
│ ├─ Active Campaigns: 142            ├─ Database: ✅ Healthy      │
│ ├─ Creators Online: 312             ├─ Stripe: ✅ Connected      │
│ ├─ Founders Online: 48              ├─ View Sync: ✅ Last run 30m│
│ └─ Payouts Processed Today: $12,450 └─ All Systems: GO ✅        │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ⚠️ URGENT ALERTS (4 items need attention)                        │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ 🔴 Payment Processing Error (3 payouts failed)              ││
│ │    Amount: $2,340 | Creators: John Smith, Mary Jane, ...   ││
│ │    Action: [Investigate] [Manual Payout] [Email Creators]  ││
│ │                                                              ││
│ │ 🟡 KYC Verification Pending (127 creators waiting)          ││
│ │    Oldest: 8 days pending                                  ││
│ │    Action: [Batch Review] [Auto-Approve] [Send Reminders]  ││
│ │                                                              ││
│ │ 🟡 Open Disputes (5 active)                                 ││
│ │    Latest: Creator vs Founder payment mismatch              ││
│ │    Action: [Review] [Escalate] [Auto-Resolve]              ││
│ │                                                              ││
│ │ 🔴 Potential Fraud Alert                                    ││
│ │    Creator "UserXYZ123" posted 50 videos in 4 hours         ││
│ │    Action: [Review] [Suspend] [Investigate]                ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 📈 CAMPAIGN ACTIVITY (Last 7 Days)                              │
│ ├─ Launched: 34 campaigns                                      │
│ ├─ Completed: 28 campaigns                                     │
│ ├─ Avg Budget: $1,245                                          │
│ └─ Refund Rate: 34% (trending up ⚠️)                            │
│                                                                  │
│ 👥 CREATOR ACTIVITY (Live)                                      │
│ ├─ New Signups Today: 12                                       │
│ ├─ KYC Verified: 8                                             │
│ ├─ Suspended: 0                                                │
│ ├─ Avg Base Fee: $52                                           │
│ └─ Top Earner Today: Mary (+$4,200 in bonuses)                │
│                                                                  │
│ 💰 FINANCIAL SUMMARY (Last 30 Days)                             │
│ ├─ Total GMV: $1,243,500                                       │
│ ├─ Nala Revenue: $12,435                                       │
│ ├─ Creator Payouts: $742,000                                   │
│ ├─ Founder Refunds: $380,200                                   │
│ └─ Platform Fee %: 1.00% ✅                                     │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ [Quick Actions]                                                  │
│ [📢 Broadcast Message] [⚙️ System Config] [📊 Reports] [🔍 Audit]│
└─────────────────────────────────────────────────────────────────┘
Data Model:
admin_dashboard_metrics (Cached in Redis, updated every 60s)
├─ todays_gmv: decimal
├─ active_campaigns: integer
├─ creators_online: integer
├─ founders_online: integer
├─ payouts_processed_today: decimal
├─ system_status: object {api, db, stripe, view_sync}
├─ alerts: array [{severity, type, count, action_items}]
├─ campaign_activity: object {launched, completed, avg_budget}
├─ creator_activity: object {new_signups, kyc_verified, suspended}
└─ financial_summary: object {gmv, revenue, payouts, refunds}

Feature A-102: Creator Management Console
Priority: P0 (Critical)
Description: Comprehensive creator account management, verification, and compliance monitoring.
Acceptance Criteria:
✓ View all creators with sortable columns (name, email, rating, status, earnings)
✓ Filter by: verification status (pending, verified, rejected), platform, location
✓ Search by: creator name, email, creator_id
✓ View creator details: Profile, social accounts, bank info, KYC docs, campaigns
✓ Batch actions: Approve KYC, Reject, Suspend, Ban, Email, Export
✓ Inline KYC approval/rejection
✓ Suspend creator (temporary, campaigns paused, earnings frozen)
✓ Ban creator (permanent, all campaigns closed, refund issued)
✓ View creator's earning history + timeline
✓ See all campaigns creator participated in
✓ Manual earnings adjustment (with audit trail + reason)
✓ Activity log per creator (last 30 days)
✓ Export creator data (CSV) for reporting
Creator Management Interface:
┌─────────────────────────────────────────────────────────────────┐
│ CREATOR MANAGEMENT                              Filter  Search  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Filters: [All Status ▼] [All Platforms ▼] [All Locations ▼]   │
│ KYC Status: [PENDING: 47] [VERIFIED: 312] [REJECTED: 8] [BANNED: 3]
│                                                                  │
│ CREATOR LIST:                                                    │
│ ┌────┬──────────────┬─────────────────┬────────┬────────┬──────┐│
│ │ID  │ Name         │ Email           │ Rating │ Status │ Earn ││
│ ├────┼──────────────┼─────────────────┼────────┼────────┼──────┤│
│ │1   │ Mary Johnson │ mary@email.com  │ 4.8★   │ ✅VER  │ $12k││
│ │    │              │                 │        │        │      ││
│ │    │ TikTok: 45K followers | Instagram: 28K followers       ││
│ │    │ Campaigns: 23 | Completion Rate: 95%                   ││
│ │    │ [View Details] [Suspend] [Ban] [Earnings History]      ││
│ │    │                                                          ││
│ ├────┼──────────────┼─────────────────┼────────┼────────┼──────┤│
│ │2   │ John Smith   │ john@email.com  │ 4.5★   │ ⏳PEND │ $450││
│ │    │              │                 │        │        │      ││
│ │    │ TikTok: 12K followers | Instagram: 5.2K followers     ││
│ │    │ Campaigns: 3 | Completion Rate: 100%                  ││
│ │    │ KYC Documents: [View] [Approve] [Reject]              ││
│ │    │ [View Details] [Suspend] [Ban] [Earnings History]     ││
│ │    │                                                          ││
│ ├────┼──────────────┼─────────────────┼────────┼────────┼──────┤│
│ │3   │ Sarah Chen   │ sarah@email.com │ 4.2★   │ ⛔SUSP │ $8.3k││
│ │    │              │                 │        │        │      ││
│ │    │ TikTok: 8.5K followers | Instagram: 12K followers     ││
│ │    │ Campaigns: 5 | Completion Rate: 80%                   ││
│ │    │ Suspended Since: Nov 10 (Reason: Multiple late posts)  ││
│ │    │ [View Details] [Reactivate] [Ban] [Earnings History]  ││
│ │    │                                                          ││
│ └────┴──────────────┴─────────────────┴────────┴────────┴──────┘│
│                                                                  │
│ [✓ Batch Actions] ▼ For Selected (2 creators):                 │
│ [Approve KYC] [Reject KYC] [Suspend All] [Ban All] [Email All]│
│                                                                  │
│ [Showing 1-10 of 328] [< Previous] [Next >]                    │
│ [Export CSV] [Export PDF]                                      │
└─────────────────────────────────────────────────────────────────┘
Creator Detail View:
┌─────────────────────────────────────────────────────────────────┐
│ CREATOR DETAILS: Mary Johnson                             [< Back]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ PROFILE INFORMATION                                              │
│ ├─ Creator ID: uuid-12345                                       │
│ ├─ Email: mary@email.com                                        │
│ ├─ Name: Mary Johnson                                           │
│ ├─ Phone: +1-555-0123                                           │
│ ├─ Joined: Nov 10, 2024                                         │
│ ├─ Status: ✅ VERIFIED                                          │
│ ├─ Overall Rating: 4.8/5.0 (23 campaigns)                      │
│ └─ Profile Completeness: 100%                                   │
│                                                                  │
│ KYC VERIFICATION                                                 │
│ ├─ Identity Verified: ✅ Yes                                    │
│ │  └─ ID Type: US Passport | Verified: Nov 12, 2024           │
│ ├─ Address Verified: ✅ Yes                                     │
│ │  └─ Address: 123 Main St, Los Angeles, CA 90210             │
│ ├─ Sanction Check: ✅ Clear (SDN list)                          │
│ ├─ Status: VERIFIED (Nov 12, 2024)                              │
│ └─ [Re-Verify] [Reject] [Flag for Review]                      │
│                                                                  │
│ SOCIAL ACCOUNTS                                                  │
│ ├─ TikTok: @maryj | Followers: 45K | Verified: ✅              │
│ ├─ Instagram: @maryj123 | Followers: 28K | Verified: ✅        │
│ └─ Facebook: /maryj | Followers: 12K | Verified: ✅            │
│                                                                  │
│ BANK ACCOUNT (via Stripe Connect)                               │
│ ├─ Stripe Account ID: acct_xxx...xxx                            │
│ ├─ Account Holder: Mary Johnson                                 │
│ ├─ Status: ✅ Active                                            │
│ ├─ Bank: Chase Bank (ending: 4532)                              │
│ └─ [Update] [Verify] [Disconnect]                              │
│                                                                  │
│ EARNINGS SUMMARY                                                 │
│ ├─ Total Earnings: $12,450.50                                   │
│ ├─ Lifetime Base Fees: $1,150                                   │
│ ├─ Lifetime Bonuses: $11,300.50                                 │
│ ├─ Available Balance: $245.75                                   │
│ ├─ Pending (< 7 days): $0                                       │
│ ├─ Last Payout: $2,345 on Nov 15, 2024                         │
│ └─ [Adjust Earnings] [Force Payout] [View Transaction History] │
│                                                                  │
│ CAMPAIGN HISTORY                                                 │
│ ├─ Total Campaigns: 23                                          │
│ ├─ Completion Rate: 95%                                         │
│ ├─ Avg Views per Video: 52,340                                 │
│ ├─ Avg Base Fee: $50                                            │
│ └─ [View All Campaigns] [View Details]                         │
│                                                                  │
│ PERFORMANCE METRICS                                              │
│ ├─ Avg Rating from Founders: 4.9/5.0                            │
│ ├─ Content Approval Rate: 98% (first draft approved)            │
│ ├─ On-Time Posting Rate: 100%                                   │
│ ├─ Late Post Incidents: 0                                       │
│ └─ Dispute Count: 0                                             │
│                                                                  │
│ ACTIVITY LOG (Last 30 Days)                                      │
│ ├─ Nov 20: Posted video for Campaign XYZ (26.5k views)         │
│ ├─ Nov 19: Draft approved for Campaign ABC                      │
│ ├─ Nov 18: Submitted draft for Campaign ABC                     │
│ ├─ Nov 15: Payout $2,345 processed (Stripe)                    │
│ ├─ Nov 14: Applied for Campaign XYZ                             │
│ └─ [View Full Activity] [Export Log]                           │
│                                                                  │
│ ADMIN ACTIONS                                                    │
│ ├─ [✅ Suspend] [❌ Ban] [⚙️ Edit] [📧 Email] [📋 Notes]         │
│ │                                                                │
│ │ Internal Notes:                                               │
│ │ ┌─────────────────────────────────────────────────────────┐  │
│ │ │ Top performer. Consistent quality. Monitor for new...  │  │
│ │ │ [Save Notes]                                            │  │
│ │ └─────────────────────────────────────────────────────────┘  │
│ │                                                                │
│ └─ [Restrict Platforms] [Change Base Rate Limit] [Manual Verify]
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
Data Model:
creator_details_view:
├─ creator_id: UUID
├─ user_info: {email, name, phone, joined_date, status}
├─ kyc_verification: {identity, address, sanction_check, status}
├─ social_accounts: array [{platform, username, followers, verified}]
├─ stripe_connect: {account_id, holder_name, status, bank_info}
├─ earnings: {total, base_fees, bonuses, available, pending, last_payout}
├─ campaigns: {total, completion_rate, avg_views, avg_fee}
├─ performance: {avg_rating, approval_rate, on_time_rate, disputes}
├─ activity_log: array [{timestamp, action, details}]
└─ admin_notes: text

Feature A-103: Founder Management Console
Priority: P0 (Critical)
Description: Founder account management, campaign oversight, and dispute handling.
Acceptance Criteria:
✓ View all founders with sortable columns (name, company, campaigns, spend)
✓ Filter by: status (active, suspended, banned), spend tier, location
✓ Search by: founder name, email, company name
✓ View founder details: Profile, campaigns, spending history, payment methods
✓ View founder's campaigns: List with status, budget, performance
✓ Suspend founder (temporary, cannot create campaigns, refund pending)
✓ Ban founder (permanent, all campaigns refunded, accounts frozen)
✓ Manual refund processing (if payment failed)
✓ Contact founder: Email, SMS notifications
✓ Activity log per founder (last 30 days)
✓ Spending analytics: Budget allocation, refund rates, campaign success
✓ Export founder data (CSV) for reporting
Founder Management Interface:
┌─────────────────────────────────────────────────────────────────┐
│ FOUNDER MANAGEMENT                              Filter  Search  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Filters: [All Status ▼] [All Tiers ▼] [All Regions ▼]          │
│ Status: [ACTIVE: 156] [SUSPENDED: 3] [BANNED: 1]               │
│                                                                  │
│ FOUNDER LIST:                                                    │
│ ┌────┬──────────────┬─────────────────┬─────────┬──────────────┐│
│ │ID  │ Name         │ Company         │ Spend   │ Campaigns    ││
│ ├────┼──────────────┼─────────────────┼─────────┼──────────────┤│
│ │1   │ Mike Chen    │ Acme SaaS       │ $24.5k  │ 12 completed ││
│ │    │              │                 │         │  2 active    ││
│ │    │ Email: mike@acme.com                                    ││
│ │    │ Joined: Aug 2024 | Status: ✅ ACTIVE | Tier: Gold      ││
│ │    │ Avg Budget: $2,145 | Total Refunds: $3,240 (13%)       ││
│ │    │ [View Details] [Campaigns] [Payment Methods] [Suspend] ││
│ │    │                                                          ││
│ ├────┼──────────────┼─────────────────┼─────────┼──────────────┤│
│ │2   │ Sarah Khan   │ TechStartup     │ $8,340  │ 5 completed  ││
│ │    │              │                 │         │  1 active    ││
│ │    │ Email: sarah@tech.io                                    ││
│ │    │ Joined: Sep 2024 | Status: ✅ ACTIVE | Tier: Silver    ││
│ │    │ Avg Budget: $1,668 | Total Refunds: $540 (6%)          ││
│ │    │ [View Details] [Campaigns] [Payment Methods] [Suspend] ││
│ │    │                                                          ││
│ ├────┼──────────────┼─────────────────┼─────────┼──────────────┤│
│ │3   │ John Patel   │ Innovation Co   │ $1,200  │ 1 active     ││
│ │    │              │                 │         │              ││
│ │    │ Email: john@innovation.com                              ││
│ │    │ Joined: Oct 2024 | Status: ⛔ SUSPENDED | Reason: Late ││
│ │    │                                        Payments         ││
│ │    │ Avg Budget: $1,200 | Total Refunds: $0                 ││
│ │    │ [View Details] [Campaigns] [Payment Methods] [Reactivate]
│ │    │                                                          ││
│ └────┴──────────────┴─────────────────┴─────────┴──────────────┘│
│                                                                  │
│ [✓ Batch Actions] ▼ For Selected (1 founder):                  │
│ [Email] [Suspend] [Ban] [Force Refund] [Restrict Budget]       │
│                                                                  │
│ [Showing 1-10 of 160] [< Previous] [Next >]                    │
│ [Export CSV] [Export PDF]                                      │
└─────────────────────────────────────────────────────────────────┘
Founder Detail View:
┌─────────────────────────────────────────────────────────────────┐
│ FOUNDER DETAILS: Mike Chen (Acme SaaS)                    [< Back]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ PROFILE INFORMATION                                              │
│ ├─ Founder ID: uuid-54321                                       │
│ ├─ Name: Mike Chen                                              │
│ ├─ Email: mike@acme.com                                         │
│ ├─ Phone: +1-555-0456                                           │
│ ├─ Company: Acme SaaS Inc.                                      │
│ ├─ Company Website: www.acme.com                                │
│ ├─ Joined: Aug 15, 2024                                         │
│ ├─ Status: ✅ ACTIVE                                            │
│ ├─ Tier: GOLD (High-Value Customer)                             │
│ └─ Account Manager: Sarah (sarah@nala.io)                      │
│                                                                  │
│ SPENDING OVERVIEW                                                │
│ ├─ Total Spent (All-Time): $24,540                              │
│ ├─ Monthly Average: $6,135                                      │
│ ├─ Largest Campaign: $5,200                                     │
│ ├─ Total Refunds Issued: $3,240 (13%)                           │
│ ├─ Estimated LTV: $45,000+ (projected over 24 months)          │
│ └─ Refund Trend: Decreasing ✅ (was 18% → now 13%)             │
│                                                                  │
│ PAYMENT METHODS                                                  │
│ ├─ Preferred Card: Visa ending 4242                             │
│ │  └─ Status: ✅ Valid | Exp: 12/2026                           │
│ ├─ Backup Card: Amex ending 3782                                │
│ │  └─ Status: ✅ Valid | Exp: 08/2025                           │
│ ├─ Bank Transfer: Available (Jack's Bank)                       │
│ └─ [Update Methods] [Add New] [Remove]                         │
│                                                                  │
│ CAMPAIGN HISTORY                                                 │
│ ├─ Total Campaigns: 14 (12 completed, 2 active)                │
│ ├─ Completion Rate: 86%                                         │
│ ├─ Avg Budget: $1,753                                           │
│ ├─ Avg Campaign Duration: 7.2 days                              │
│ ├─ Total Views Generated: 890,450                               │
│ ├─ Avg ROI (based on refunds): 87%                              │
│ └─ [View All Campaigns]                                        │
│                                                                  │
│ RECENT CAMPAIGNS:                                                │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Campaign: Acme Product Launch (Nov 25-Dec 2)              │  │
│ │ Status: ✅ COMPLETED | Videos: 5 | Budget: $1,250        │  │
│ │ Total Views: 87,450 | Refund Issued: $312.75 ✓           │  │
│ │ Creators: 5 (Mary, John, Lisa, Sarah, Tom)                │  │
│ │ [View Details] [Re-Launch Similar]                        │  │
│ │                                                              │  │
│ │ Campaign: Summer Features Demo (Nov 18-25)                │  │
│ │ Status: ✅ COMPLETED | Videos: 3 | Budget: $800          │  │
│ │ Total Views: 45,230 | Refund Issued: $120 ✓              │  │
│ │ Creators: 3                                                 │  │
│ │ [View Details]                                             │  │
│ │                                                              │  │
│ │ Campaign: Black Friday Special (ACTIVE)                    │  │
│ │ Status: 🔵 LIVE | Videos: 4 | Budget: $1,500            │  │
│ │ Current Views: 145,670 | Projected Refund: $145          │  │
│ │ Days Remaining: 2 (Metric lock Nov 28)                    │  │
│ │ [View Details] [Pause] [Cancel]                           │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ CREATOR RELATIONSHIPS                                            │
│ ├─ Favorite Creators: Mary (5 campaigns), John (3 campaigns)   │
│ ├─ Avg Content Approval Time: 18 hours                          │
│ ├─ Disputes with Creators: 0                                   │
│ └─ Creator Satisfaction: Excellent (no complaints)             │
│                                                                  │
│ ACTIVITY LOG (Last 30 Days)                                      │
│ ├─ Nov 25: Campaign "Acme Launch" completed + refund processed │
│ ├─ Nov 25: Approved content from creators (5 videos)           │
│ ├─ Nov 24: Created new campaign "Black Friday Special"         │
│ ├─ Nov 24: Paid $1,500 escrow for new campaign                │
│ ├─ Nov 20: Viewed campaign performance dashboard               │
│ └─ [View Full Activity] [Export Log]                           │
│                                                                  │
│ ADMIN ACTIONS                                                    │
│ ├─ [📧 Email] [⏸️ Suspend] [❌ Ban] [✏️ Edit] [💰 Manual Refund]│
│ │                                                                │
│ │ Internal Notes:                                               │
│ │ ┌─────────────────────────────────────────────────────────┐  │
│ │ │ Excellent customer. High repeat rate. Strong content │  │
│ │ │ approval rates. Consider for priority support tier. │  │
│ │ │ [Save Notes]                                         │  │
│ │ └─────────────────────────────────────────────────────────┘  │
│ │                                                                │
│ └─ [Restrict Campaign Budget] [Whitelist for Beta] [VIP Status]
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Feature A-104: Dispute Management & Resolution
Priority: P0 (Critical)
Description: Comprehensive dispute handling system for founder-creator conflicts, payment issues, and quality concerns.
Acceptance Criteria:
✓ View all disputes with filters: status (open, in_review, resolved, closed)
✓ Dispute types: Payment mismatch, Content quality, Late posting, Fraud, Other
✓ Display: Campaign info, parties involved, issue description, timestamp
✓ Escalation levels: AUTO (system resolution), MANUAL (admin review), LEGAL (lawyer)
✓ Resolution options: Auto-refund, Manual adjustment, Mediation, System ruling
✓ Chat/communication thread with both parties within dispute
✓ Attach evidence: Screenshots, video links, payment proofs
✓ Manual payout/refund override (with audit trail)
✓ Mediation: Proposed resolution, acceptance from both parties
✓ Close dispute with resolution notes
✓ Export dispute report for legal review
✓ Analytics: Dispute rate trends, common issues, resolution times
Dispute Management Interface:
┌─────────────────────────────────────────────────────────────────┐
│ DISPUTE MANAGEMENT                              Filter  Search  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Filters: [All Status ▼] [All Types ▼] [Date Range ▼]           │
│ Status: [OPEN: 5] [IN_REVIEW: 3] [RESOLVED: 12] [CLOSED: 28]  │
│                                                                  │
│ OPEN DISPUTES (Requiring Action):
│ ┌────┬──────────────┬────────────┬──────────┬────────────┬────────┐│
│ │ID  │ Campaign     │ Type       │ Parties  │ Opened     │ Action ││
│ ├────┼──────────────┼────────────┼──────────┼────────────┼────────┤│
│ │D1  │ Acme Launch  │ Payment ❌  │ Mike vs  │ Nov 20     │ 🔴     ││
│ │    │              │ Mismatch   │ Mary     │ (5 days)   │ URGENT ││
│ │    │                                                              ││
│ │    │ Issue: Creator claims bonus not calculated correctly       ││
│ │    │ Creator Claim: Should be $106, showing $106 (actually OK)  ││
│ │    │ Status: Awaiting founder response                           ││
│ │    │ [View Details] [Respond] [Auto-Resolve] [Escalate]        ││
│ │    │                                                              ││
│ ├────┼──────────────┼────────────┼──────────┼────────────┼────────┤│
│ │D2  │ Summer Demo  │ Quality ⚠️  │ Sarah vs │ Nov 18     │ 🟡     ││
│ │    │              │ (Late Post) │ John     │ (7 days)   │ REVIEW ││
│ │    │                                                              ││
│ │    │ Issue: Creator posted video 2 days late                    ││
│ │    │ Founder Claim: Lost engagement, fewer views expected       ││
│ │    │ Status: Awaiting creator explanation                        ││
│ │    │ [View Details] [Respond] [Award Partial Refund] [Resolve] ││
│ │    │                                                              ││
│ ├────┼──────────────┼────────────┼──────────┼────────────┼────────┤│
│ │D3  │ Beta Content │ Fraud Alert│ System vs│ Nov 22     │ 🔴     ││
│ │    │              │ (Spam)     │ UserXYZ  │ (3 days)   │ URGENT ││
│ │    │                                                              ││
│ │    │ Issue: Creator uploaded 50 videos in 4 hours (spam detected)
│ │    │ System Flag: Potential platform abuse                       ││
│ │    │ Status: Account suspended pending review                    ││
│ │    │ [View Details] [Investigate] [Approve] [Ban Creator]      ││
│ │    │                                                              ││
│ └────┴──────────────┴────────────┴──────────┴────────────┴────────┘│
│                                                                  │
│ HISTORICAL DISPUTES (Recent):                                   │
│ ├─ D4: Settlement Success (Nov 15) - Resolved: Manual refund    │
│ ├─ D5: Auto-Resolved (Nov 12) - Founder withdrew complaint      │
│ ├─ D6: Escalated to Legal (Oct 28) - Pending attorney review    │
│ └─ [View All Historical] [Export for Legal]                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
Dispute Detail & Resolution View:
┌─────────────────────────────────────────────────────────────────┐
│ DISPUTE DETAILS: D1 - Payment Mismatch                    [< Back]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ STATUS: 🔴 OPEN - URGENT (5 days pending)                       │
│                                                                  │
│ DISPUTE INFORMATION                                              │
│ ├─ Dispute ID: D1-uuid-12345                                    │
│ ├─ Campaign: Acme Product Launch                                │
│ ├─ Campaign ID: camp-uuid-xyz                                   │
│ ├─ Type: PAYMENT_MISMATCH                                        │
│ ├─ Severity: 🔴 HIGH (affects payment integrity)                │
│ ├─ Opened: Nov 20, 2024 at 2:15 PM UTC                         │
│ ├─ Reporter: Mary Johnson (Creator)                             │
│ ├─ Respondent: Mike Chen (Founder)                              │
│ └─ Video: Mary's Video 1 (26,500 views claimed)                │
│                                                                  │
│ PARTIES INVOLVED                                                 │
│ ┌───────────────────────────────┬───────────────────────────────┐│
│ │ CREATOR: Mary Johnson         │ FOUNDER: Mike Chen            ││
│ │ ├─ Rating: 4.8/5.0            │ ├─ Tier: Gold                 ││
│ │ ├─ Campaigns: 23              │ ├─ Total Spent: $24.5k        ││
│ │ ├─ Disputes: 0 (First time)   │ ├─ Disputes: 0 (First time)   ││
│ │ ├─ Email: mary@email.com      │ ├─ Email: mike@acme.com       ││
│ │ └─ [Email] [Suspend] [Ban]    │ └─ [Email] [Suspend] [Ban]    ││
│ └───────────────────────────────┴───────────────────────────────┘│
│                                                                  │
│ ISSUE SUMMARY                                                    │
│ ├─ Creator's Claim: "My bonus is wrong"                         │
│ ├─ Description:                                                  │
│ │  "I posted the video with 26,500 views. I should get $106    │
│ │   bonus (26,500 × $4 per 1k). But the system shows $106. This
│ │   seems right but I wanted to verify the calculation."       │
│ │                                                                │
│ │  [Note: Creator's concern is clarified - calculation correct] │
│ │                                                                │
│ └─ Dispute Status: Possible FALSE ALARM (creator may be confused)
│                                                                  │
│ CAMPAIGN DETAILS                                                 │
│ ├─ Campaign: Acme Product Launch                                │
│ ├─ Founder: Mike Chen                                           │
│ ├─ Duration: Nov 22-29, 2024                                    │
│ ├─ Total Budget: $1,250                                         │
│ ├─ Status: COMPLETED                                            │
│ ├─ Settlement Date: Nov 29, 2024 (locked)                       │
│ ├─ Total Views (All Videos): 87,450                             │
│ └─ [View Campaign Details]                                      │
│                                                                  │
│ PAYMENT CALCULATION BREAKDOWN                                    │
│ ├─ Video Posted: Nov 22, 2024                                   │
│ ├─ Views Achieved: 26,500                                       │
│ ├─ Base Fee (Approved Nov 21): $50.00 ✓ PAID                   │
│ ├─ Bonus Calculation: 26,500 × $4.00/1k = $106.00 ✓ CORRECT   │
│ ├─ Total Owed: $156.00                                          │
│ ├─ Total Paid (Nov 29): $156.00 ✓ CORRECT                      │
│ │                                                                │
│ │ ✅ PAYMENT IS CORRECT - System working as designed           │
│ │                                                                │
│ └─ [View Payment Proof] [View Stripe Records]                   │
│                                                                  │
│ COMMUNICATION THREAD                                             │
│ ├─ Nov 20, 2:15 PM: Mary opened dispute                         │
│ │  "Is my bonus correct? Let me verify..."                      │
│ │                                                                │
│ ├─ Nov 20, 2:30 PM: System auto-response                        │
│ │  "We've received your dispute. Our team will review within    │
│ │   24 hours. Payment details confirmed as correct."            │
│ │                                                                │
│ ├─ Nov 20, 4:00 PM: Admin message (optional)                   │
│ │  "Hi Mary, I've reviewed your payment. The bonus is correct:  │
│ │   26,500 views × $4/1k = $106. You received $156 total       │
│ │   ($50 base + $106 bonus). Does this help clarify?"          │
│ │                                                                │
│ ├─ Nov 20, 4:30 PM: Mary's reply (awaiting)                    │
│ │  [Pending response from creator]                              │
│ │                                                                │
│ └─ [Send Message] [Flag Abusive] [Close Thread]                │
│                                                                  │
│ RESOLUTION OPTIONS                                               │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ ⭐ RECOMMENDED: AUTO-RESOLVE (Clarification Provided)        │
│ │   Status: Payment is correct. Creator likely confused.        │
│ │   Action: Send explanation email + close dispute.             │
│ │   Outcome: Creator satisfaction + resolve in 10 seconds.     │
│ │                                                                │
│ │   [✓ Auto-Resolve] [Manual Review] [Escalate]               │
│ │                                                                │
│ │ Option 2: MANUAL MEDIATION                                   │
│ │   Admin steps in to clarify with both parties                │
│ │   Timeline: 2-3 hours                                        │
│ │   [Send Mediation Proposal] [Get Both to Agree]             │
│ │                                                                │
│ │ Option 3: MANUAL PAYOUT OVERRIDE (If justified)              │
│ │   Award additional $X to creator (track as goodwill)         │
│ │   Amount: $ [______] Reason: [_________________]             │
│ │   [Override Payout] [Requires Approval]                      │
│ │                                                                │
│ │ Option 4: ESCALATE TO LEGAL                                  │
│ │   Complex issue requiring legal interpretation                │
│ │   Assign to: [Legal Team]                                    │
│ │   [Escalate Now]                                             │
│ │                                                                │
│ └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│ RESOLUTION NOTES (For Admin)                                     │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ [Textarea for admin notes before resolving]                  │
│ │                                                                │
│ │ [Save as Draft] [Resolve Dispute] [Close Without Action]     │
│ │                                                                │
│ └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│ AUDIT TRAIL                                                      │
│ ├─ Nov 20 2:15 PM: Dispute opened by creator                   │
│ ├─ Nov 20 2:16 PM: Auto-assigned to queue                      │
│ ├─ Nov 20 2:30 PM: Auto-response email sent                    │
│ └─ Nov 20 X:XX PM: [Admin resolution logged]                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
Data Model:
disputes:
├─ dispute_id: UUID
├─ campaign_id: UUID
├─ reporter_id: UUID (creator or founder)
├─ respondent_id: UUID
├─ issue_type: enum (PAYMENT_MISMATCH, QUALITY, LATE_POSTING, FRAUD, OTHER)
├─ description: text
├─ status: enum (OPEN, IN_REVIEW, MEDIATION, RESOLVED, CLOSED)
├─ severity: enum (LOW, MEDIUM, HIGH, CRITICAL)
├─ created_at: timestamp
├─ assigned_to_admin: UUID (null = unassigned)
├─ resolution: text
├─ resolution_type: enum (AUTO_RESOLVED, MANUAL_ADJUSTMENT, REFUND, LEGAL_ESCALATION)
├─ resolved_at: timestamp
├─ evidence: array [{type, url, description}]
├─ communication_thread: array [{sender, message, timestamp}]
└─ audit_trail: array [{action, admin_id, timestamp, notes}]

Feature A-105: Campaign Oversight & Intervention
Priority: P1 (High)
Description: Real-time monitoring of active campaigns with admin intervention capabilities.
Acceptance Criteria:
✓ View all campaigns with status indicators (live, completed, paused, cancelled)
✓ Real-time view count tracking per video
✓ Flag campaigns with anomalies: (very low views, suspicious URLs, late posting)
✓ Manual intervention: Pause campaign, cancel campaign, force settlement
✓ Campaign details: Budget, creators, performance, timeline
✓ Content review override: Admin can approve/reject if founder absent
✓ Creator performance within campaign: Ranking by views
✓ Refund tracking: Manual vs. automatic refunds
✓ Campaign search: By founder, creator, title, date range
✓ Export campaign report (PDF)
Campaign Oversight Interface:
┌─────────────────────────────────────────────────────────────────┐
│ CAMPAIGN OVERSIGHT                              Filter  Search  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Status Filter: [All: 287] [🔵 LIVE: 42] [✅ COMPLETED: 198]    │
│              [⏸️ PAUSED: 3] [❌ CANCELLED: 44]                   │
│                                                                  │
│ ACTIVE CAMPAIGNS (Real-Time Monitoring):                         │
│ ┌────┬──────────────┬───────────┬────────────┬──────────┬───────┐│
│ │ID  │ Campaign     │ Founder   │ Status     │ Views    │ Alert ││
│ ├────┼──────────────┼───────────┼────────────┼──────────┼───────┤│
│ │C1  │Acme Launch   │ Mike Chen │ 🟢 POSTING │ 87.4k/   │  ✅   ││
│ │    │ (5 videos)   │           │            │ 200k     │       ││
│ │    │              │           │ Days: 2-9 of 7-day lock
│ │    │              │           │ Settlement: Nov 29 00:00 UTC   ││
│ │    │              │           │ Projected Refund: $312.75      ││
│ │    │ Creators: Mary (26.5k), John (21.2k), Lisa (18.9k)...    ││
│ │    │ [View Details] [Pause] [Force Settlement] [Intervention] ││
│ │    │                                                            ││
│ ├────┼──────────────┼───────────┼────────────┼──────────┼───────┤│
│ │C2  │Black Friday  │ Sarah K   │ 🟡 REVIEW  │ 5.2k/    │ ⚠️   ││
│ │    │ (3 videos)   │           │            │ 150k     │       ││
│ │    │              │           │ Videos pending approval (1 late)
│ │    │              │           │ Admin Action Needed!            ││
│ │    │ Creators: Tom (3 videos pending), ...                    ││
│ │    │ Issue: Tom hasn't uploaded draft (deadline PASSED)       ││
│ │    │ [View Details] [Approve Draft] [Auto-Extend] [Cancel]   ││
│ │    │                                                            ││
│ ├────┼──────────────┼───────────┼────────────┼──────────┼───────┤│
│ │C3  │Summer Promo  │ John P    │ 🔴 ERROR   │ 0/       │ 🔴   ││
│ │    │ (2 videos)   │           │            │ 50k      │       ││
│ │    │              │           │ Posted URLs unresponsive!      ││
│ │    │ Creators: Sarah (URL 404), Jennifer (URL 404)            ││
│ │    │ Issue: Videos may have been deleted from TikTok          ││
│ │    │ Action: Contact creators, check for platform violations  ││
│ │    │ [View Details] [Investigate] [Manual Review]             ││
│ │    │                                                            ││
│ └────┴──────────────┴───────────┴────────────┴──────────┴───────┘│
│                                                                  │
│ [✓ Batch Actions] ▼ For Selected (0 campaigns):                 │
│ [Pause] [Resume] [Force Settlement] [Cancel] [Email All]        │
│                                                                  │
│ [Showing 1-10 of 42 live] [< Previous] [Next >]                 │
└─────────────────────────────────────────────────────────────────┘

Feature A-106: Revenue & Financial Analytics
Priority: P1 (High)
Description: Comprehensive financial dashboard for monitoring platform revenue, payouts, and profitability.
Acceptance Criteria:
✓ GMV tracking: Daily, weekly, monthly totals
✓ Revenue breakdown: Nala markup by campaign
✓ Creator payouts: Total, by creator, trends
✓ Founder refunds: Total, by reason, trends
✓ Payment success rate: % of successful vs. failed payouts
✓ Stripe fee tracking: Calculate net revenue after Stripe fees
✓ Profitability analysis: Revenue - Stripe fees - infrastructure costs
✓ Cash flow: Incoming (founder payments) vs. outgoing (creator payouts)
✓ Revenue forecasting: Projected monthly revenue (based on trend)
✓ Tax reporting: Tax-reportable data for 1099 generation
✓ Export financial reports (PDF)
Financial Analytics Dashboard:
┌─────────────────────────────────────────────────────────────────┐
│ FINANCIAL ANALYTICS                    [Date Range] [Last 30 Days]
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ KEY FINANCIAL METRICS                                            │
│ ┌────────────────────┬────────────────┬────────────────┐         │
│ │ GMV (Total Spend)  │ Nala Revenue   │ Net Profit     │         │
│ │ $1,243,500         │ $12,435        │ $8,942 (72%)   │         │
│ │ ↑ 18% vs prev mo   │ ↑ 18% vs prev  │ ↑ 16% vs prev  │         │
│ └────────────────────┴────────────────┴────────────────┘         │
│                                                                  │
│ REVENUE BREAKDOWN                                                │
│ ├─ Nala Markup (1% of GMV): $12,435                              │
│ │  ├─ From TikTok views: $7,200 (58%)                            │
│ │  ├─ From Instagram views: $3,800 (31%)                        │
│ │  └─ From Facebook views: $1,435 (11%)                         │
│ │                                                                │
│ ├─ Creator Payouts: $742,000 (60% of GMV)                       │
│ │  ├─ Base Fees: $245,000                                       │
│ │  ├─ Performance Bonuses: $497,000                             │
│ │  └─ [View Payout Breakdown]                                   │
│ │                                                                │
│ ├─ Founder Refunds: $380,200 (31% of GMV)                       │
│ │  ├─ Unspent Variable Budget: $320,000 (84%)                  │
│ │  ├─ Failed Campaigns: $45,000 (12%)                           │
│ │  └─ Dispute Resolutions: $15,200 (4%)                        │
│ │                                                                │
│ ├─ Stripe Processing Fees: $3,371 (0.27% of GMV)               │
│ │  ├─ Card payment fees: $2,100                                │
│ │  ├─ Transfer fees: $1,271                                    │
│ │  └─ [View Breakdown by Transaction Type]                    │
│ │                                                                │
│ └─ Platform Costs (Estimated): $150/day infrastructure          │
│    └─ Est. Monthly: $4,500 (0.36% of GMV)                      │
│                                                                  │
│ CASH FLOW ANALYSIS                                               │
│ ┌─ November 2024 Cash Flow ──────────────────────────────────┐  │
│ │                                                             │  │
│ │ INFLOWS (Founder Payments):                               │  │
│ │  $1,243,500 (received from founders via Stripe)           │  │
│ │                                                             │  │
│ │ OUTFLOWS:                                                  │  │
│ │  Creator Payouts:    $742,000  ↓                          │  │
│ │  Founder Refunds:    $380,200  ↓                          │  │
│ │  Stripe Fees:        $3,371   ↓                          │  │
│ │  Infrastructure:     $4,500   ↓                          │  │
│ │  ─────────────────────────────                            │  │
│ │  Total Outflows:    $1,130,071                            │  │
│ │                                                             │  │
│ │ NET CASH (Retained):  $113,429 (for growth/operations)   │  │
│ │                                                             │  │
│ └─────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ PROFITABILITY TRENDS (Last 6 Months)                             │
│ Gross Profit Margin: 1.00% (target maintained)                  │
│ Net Profit Margin: 0.72% (after all costs)                      │
│                                                                  │
│ Chart: Revenue (green), Payouts (red), Profit (blue)            │
│ [Chart Visualization - Monthly bars]                            │
│                                                                  │
│ PAYMENT SUCCESS METRICS                                          │
│ ├─ Total Transactions: 2,847                                    │
│ ├─ Successful: 2,834 (99.54%)                                   │
│ ├─ Failed: 13 (0.46%)                                           │
│ ├─ Retry Successful: 12 of 13 (92%)                             │
│ ├─ Manual Intervention Needed: 1 (8%)                           │
│ └─ Avg Settlement Time: 1.3 days (Stripe ACH)                  │
│                                                                  │
│ PAYOUT PROCESSING                                                │
│ ├─ This Month: $742,000 to 312 creators ✓                      │
│ ├─ Avg Payout per Creator: $2,379                               │
│ ├─ Largest Payout: $8,450 (Mary Johnson)                        │
│ ├─ Smallest Payout: $10.00 (minimum threshold)                  │
│ └─ Processing Delay: 1-3 business days (Stripe ACH)             │
│                                                                  │
│ REFUND ANALYSIS                                                  │
│ ├─ Refund Rate: 31% of GMV (target: 25-35%)                    │
│ ├─ Auto-Refunds: $365,000 (96% - unspent budget) ✓             │
│ ├─ Manual Refunds: $15,200 (4% - disputes/issues)              │
│ ├─ Failed Refunds: $0 (100% success rate)                       │
│ └─ Refund Trend: Stable (Q1: 30%, Q2: 31%, Q3: 31%)            │
│                                                                  │
│ FORECASTING & PROJECTIONS                                        │
│ ├─ Projected Monthly GMV (Dec): $1,450,000 (↑ 16%)             │
│ ├─ Projected Revenue (Dec): $14,500 (↑ 16%)                     │
│ ├─ Projected Net Profit (Dec): $10,440 (↑ 16%)                 │
│ └─ Year-to-Date Projection: $145,000 (on track)                │
│                                                                  │
│ [Export Financial Report] [Tax Reconciliation] [View Invoices]  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

13.3 ADMIN USER FLOWS
Flow 1: Creator KYC Verification & Approval
SCENARIO: Sarah (Admin) reviews pending creator applications

STEP 1: Navigate to Creator Management
├─ Sarah logs into Nala admin dashboard
├─ Clicks: "Creator Management" in left sidebar
├─ Sees: List of all creators, filtered by KYC Status
├─ Filter Applied: [KYC Status: PENDING]
├─ Results: 47 creators awaiting verification
└─ Sorted by: Oldest first (FIFO)

STEP 2: Review Creator #1 (John Smith)
├─ Clicks: John's row or "View Details"
├─ Dashboard shows:
│  ├─ Personal info (name, email, phone, DOB)
│  ├─ Social accounts (TikTok 12K followers, Instagram 5.2K)
│  ├─ KYC Documents:
│  │  ├─ Government ID: ✅ Uploaded (US Passport)
│  │  ├─ Address Verification: ✅ Uploaded (utility bill)
│  │  ├─ Sanction Check: ✅ Clear (not on SDN list)
│  │  └─ Profile Completeness: 100%
│  │
│  ├─ Risk Assessment:
│  │  ├─ All documents valid
│  │  ├─ No red flags
│  │  ├─ Platforms legitimate
│  │  └─ Recommendation: APPROVE
│  │
│  └─ [View Documents] [Reject] [Flag for Manual Review]

STEP 3: Approve Creator
├─ Sarah: Clicks [APPROVE KYC]
├─ System: Opens confirmation dialog
├─ Dialog asks:
│  "Approve KYC for John Smith? This will:"
│  "✓ Mark as KYC_VERIFIED"
│  "✓ Allow brief applications"
│  "✓ Activate for campaigns"
│  "✓ Enable bank account access"
│  ""
│  "☑ Notify creator via email"
│  ""
│  "[Cancel] [Approve KYC]"
│
├─ Sarah: Clicks [Approve KYC]
├─ System:
│  ├─ Updates: creator.kyc_status = VERIFIED
│  ├─ Sends email to John: "You're Verified! Start Applying"
│  ├─ Logs: Audit trail entry
│  ├─ Updates dashboard: Moves to VERIFIED count
│  └─ Shows: Green success banner "Creator Approved ✓"

STEP 4: Continue to Next Creator
├─ Sarah: Clicks [Next] or scrolls to next creator
├─ Process repeats for remaining 46 creators
├─ Can batch-approve similar creators

RESULT:
├─ Creators now active on platform
├─ Can apply for briefs
├─ Account fully functional
└─ Email confirmation sent
Flow 2: Dispute Resolution (Payment Mismatch)
SCENARIO: Sarah resolves a creator-founder payment dispute

STEP 1: Identify Dispute in Dashboard
├─ Sarah logs in, sees: "⚠️ ALERTS: 5 disputes pending"
├─ Clicks: "Dispute Management"
├─ Sees: List of open disputes
├─ Dispute D1: "Payment Mismatch - Mary vs Mike" (5 days old, URGENT)
├─ Clicks: To view dispute details

STEP 2: Review Dispute Details
├─ System shows:
│  ├─ Creator Claim: "My bonus wasn't calculated correctly"
│  ├─ Campaign: Acme Launch (26,500 views)
│  ├─ Expected Bonus: Creator claims $106
│  ├─ Received Bonus: $106 (actually correct!)
│  ├─ Status: Creator seems confused, not an actual issue
│  │
│  ├─ Payment Records:
│  │  ├─ Base Fee Paid: $50 ✓
│  │  ├─ Bonus Calculation: 26,500 × $4/1k = $106 ✓
│  │  ├─ Total Paid: $156 ✓
│  │  └─ All correct!
│  │
│  └─ Communication Thread:
│     ├─ Mary (Nov 20): "Is my bonus correct?"
│     └─ System: Auto-response (verification pending)

STEP 3: Investigate & Clarify
├─ Sarah: Clicks [Send Message]
├─ Types response:
│  "Hi Mary,
│   
│   I've reviewed your payment and everything is correct:
│   - 26,500 views achieved
│   - Your rate: $4.00 per 1,000 views
│   - Bonus calculation: 26,500 ÷ 1,000 × $4 = $106
│   
│   You received:
│   • Base Fee: $50 (for creating video)
│   • Performance Bonus: $106 (for views earned)
│   • Total: $156
│   
│   This was deposited to your account on Nov 29. If you still
│   have questions, please let me know. Great work on the video!
│   
│   Best, Nala Team"
│
├─ Clicks: [Send Message]
├─ Message posted to dispute thread

STEP 4: Auto-Resolve Dispute
├─ Sarah: Reviews resolution options
├─ Selects: "AUTO-RESOLVE (Clarification Provided)"
├─ Enters resolution notes:
│  "Payment verified as correct. Creator likely confused on
│   calculation. Sent detailed explanation. No further action needed."
│
├─ Clicks: [Resolve Dispute]
├─ System:
│  ├─ Updates: dispute.status = RESOLVED
│  ├─ Records: resolution_type = AUTO_RESOLVED
│  ├─ Sends email to Mary: "Your dispute is resolved"
│  ├─ Sends email to Mike: "Dispute resolved (no action needed)"
│  ├─ Logs: Audit trail with timestamp + Sarah's ID
│  └─ Shows: Green success "Dispute Resolved ✓"

RESULT:
├─ Dispute closed in 10 seconds
├─ Both parties notified
├─ Payment integrity confirmed
├─ Relationship maintained
└─ No manual payout needed
Flow 3: Suspicious Campaign Intervention
SCENARIO: Admin detects fraud activity and intervenes

STEP 1: Alert Triggered
├─ System detects: Creator "UserXYZ123" posted 50 videos in 4 hours
├─ Alert escalates to admin dashboard (red flag)
├─ Sarah sees: "🔴 FRAUD ALERT - Possible spam/bot activity"
├─ Clicks: To investigate

STEP 2: Campaign Review
├─ Campaign details show:
│  ├─ Campaigns Created: 50 (today, simultaneously)
│  ├─ Budget Total: $2,500
│  ├─ All to different founders (red flag: spread across accounts)
│  ├─ All videos: Uploaded but NOT posted yet
│  ├─ Content: Generic spam (same 10 second clip, repeated)
│  └─ Status: SUBMITTED_FOR_REVIEW on all campaigns
│
├─ Creator Profile:
│  ├─ Joined: Today (brand new account)
│  ├─ No social followers (or fake followers)
│  ├─ Name: Suspicious (random alphanumerics)
│  └─ Email: Free Gmail with random address

STEP 3: Take Action
├─ Sarah: Clicks [Investigate] → Opens creator record
├─ Clicks: [Suspend Creator]
├─ System opens dialog:
│  "SUSPEND CREATOR: UserXYZ123?"
│  "Reason: [Select: Spam / Fraud / Bot Activity / Policy Violation]"
│  "Selected: Bot Activity - Mass Upload Spam"
│  "Suspension Type: [Temporary / Permanent]"
│  "Affect active campaigns: [Pause All / Refund / Keep]"
│  ""
│  "☑ Send notification to creator"
│  "☑ Alert affected founders"
│  ""
│  "[Cancel] [Suspend]"
│
├─ Sarah selects: "Permanent Ban"
├─ Sarah selects: "Refund all affected founders"
├─ Clicks: [Suspend]
├─ System:
│  ├─ creator.status = BANNED
│  ├─ All 50 campaigns: status = CANCELLED, refund issued
│  ├─ Sends email to creator: "Account banned for policy violation"
│  ├─ Sends emails to 50 affected founders: "Campaign cancelled - refund issued"
│  ├─ Issues 50 refunds via Stripe: Total $2,500
│  ├─ Logs: Detailed audit trail
│  └─ Shows: Green success "Creator Banned ✓"

STEP 4: Follow-up
├─ Sarah: Adds notes to creator record:
│  "Suspected bot/spam activity. Banned permanently. 50 fake
│   campaigns created. All founders refunded. No further action."
│
├─ Flag account for further investigation (potential legal team)
├─ Document in compliance database

RESULT:
├─ Fraud prevented
├─ Platform protected
├─ Founders refunded ($2,500)
├─ Creator banned
├─ Audit trail complete
└─ No manual payouts needed
Flow 4: Campaign Performance Monitoring & Intervention
SCENARIO: Admin notices underperforming campaign and intervenes

STEP 1: Identify Campaign Issue
├─ Sarah: Views Campaign Oversight dashboard
├─ Sees: Campaign "BlackFriday-Special" (Sarah Khan - founder)
├─ Status: 🟡 IN_REVIEW (content pending founder approval)
├─ Issue: 3 of 4 videos still not approved (2 days past deadline)
├─ Alert: "⚠️ Approval delay - creators waiting"
├─ Clicks: To view campaign

STEP 2: Investigate Campaign
├─ Campaign shows:
│  ├─ Videos Assigned: 4 creators
│  ├─ Status Breakdown:
│  │  ├─ Video 1 (Tom): ✅ APPROVED (posted, 5.2k views)
│  │  ├─ Video 2 (Sarah): ⏳ PENDING (draft submitted 2 days ago)
│  │  ├─ Video 3 (Jennifer): ⏳ PENDING (draft submitted 2 days ago)
│  │  └─ Video 4 (Mike): ⏳ PENDING (draft submitted 2 days ago)
│  │
│  ├─ Founder Notes: "No response from Sarah (founder)"
│  ├─ Last Founder Activity: 48 hours ago (dashboard view)
│  └─ Contact Status: Sarah hasn't responded to platform emails

STEP 3: Admin Contact Attempt
├─ Sarah (admin): Sends direct email to founder:
│  Subject: "Your Campaign Needs Attention - Action Required"
│  Body:
│   "Hi Sarah,
│   
│    We noticed your campaign "BlackFriday-Special" has 3 videos
│    waiting for your approval. Your creators have been waiting
│    48+ hours and are ready to post!
│    
│    Please review and approve the drafts here: [Link]
│    
│    If you need help, reply to this email or contact support.
│    
│    - Nala Team"
│
├─ Waits: 2 hours for response

STEP 4: Admin Override (If Needed)
├─ If founder doesn't respond within 2 hours:
│  ├─ Sarah: Can click [Auto-Approve Content]
│  ├─ System asks: "Auto-approve 3 drafts for Sarah Khan?"
│  │  "This will:"
│  │  "✓ Approve all pending videos"
│  │  "✓ Trigger base fee payouts ($50 × 3 = $150)"
│  │  "✓ Allow creators to post"
│  │  "✓ Notify founder of auto-approval"
│  │  ""
│  │  "Reason: [Founder unresponsive / Technical issue / Other]"
│  │  ""
│  │  "[Cancel] [Auto-Approve]"
│  │
│  ├─ Selects: "Founder unresponsive"
│  ├─ Clicks: [Auto-Approve]
│  ├─ System:
│  │  ├─ All 3 videos: status = APPROVED
│  │  ├─ Triggers Phase 1 payout: $150 to creators
│  │  ├─ Notifies creators: "Approved! Ready to post"
│  │  ├─ Notifies founder: "Videos auto-approved due to inactivity"
│  │  ├─ Logs: Detailed audit entry
│  │  └─ Shows: Green success "Content Approved ✓"

STEP 5: Campaign Continues
├─ Creators post videos within 24 hours
├─ Views start accruing
├─ Campaign proceeds to metric lock after 7 days
├─ All parties happy (founder gets content, creators get paid)

RESULT:
├─ Campaign momentum maintained
├─ Creators not blocked (satisfied)
├─ Founder still gets content
├─ Founders unresponsiveness doesn't break platform
└─ Admin ensures smooth operations
Flow 5: Manual Financial Adjustment & Override
SCENARIO: Admin discovers payment processing error and manually corrects

STEP 1: Identify Payment Issue
├─ Sarah: Receives support email from creator Mary
├─ Complaint: "I should have received $1,500 bonus but got $1,200"
├─ Mary's campaign: 375,000 views (375,000 × $4/1k = $1,500 expected)
├─ Views on platform show: 375,000 ✓ (correct)
├─ Payout amount: $1,200 (ERROR - should be $1,500)
├─ Missing: $300
├─ Sarah escalates to admin for investigation

STEP 2: Investigate Issue
├─ Sarah: Navigates to creator detail view
├─ Views campaign performance:
│  ├─ Video Views: 375,000 ✓
│  ├─ Rate: $4/1k ✓
│  ├─ Expected Bonus: $1,500 ✓
│  ├─ Actual Payout: $1,200 ✗ (ERROR)
│  └─ Discrepancy: $300 missing
│
├─ Sarah: Checks Stripe payment records
├─ Finds: Transfer sent $1,200 instead of $1,500
├─ Root cause: Manual data entry error during Phase 2 settlement
├─ Determination: Platform error (not creator's fault)

STEP 3: Manual Adjustment
├─ Sarah: Opens creator earning adjustment form
├─ Fields:
│  ├─ Creator: Mary Johnson
│  ├─ Campaign: XYZ-123
│  ├─ Current Payout: $1,200
│  ├─ Adjustment Reason: "Payout processing error - views counted correctly"
│  ├─ Adjustment Amount: $300 (to make total $1,500)
│  ├─ Type: [Select: Error Correction / Dispute Resolution / Compensation]
│  ├─ Selected: Error Correction
│  │
│  └─ Requires Approval: ☑ (amounts > $100 need approval)
│
├─ Clicks: [Request Approval]
├─ Notifies: Finance lead "Manual adjustment pending ($300)"

STEP 4: Approval & Payment
├─ Finance lead: Reviews adjustment details
├─ Sees: Error log, creator record, full justification
├─ Clicks: [Approve Adjustment]
├─ System:
│  ├─ Updates: performance_bonuses.bonus_amount = $1,500
│  ├─ Initiates Stripe transfer: $300 to Mary
│  ├─ Updates wallet: balance += $300
│  ├─ Sends email to Mary:
│  │  "We discovered a processing error on your recent payout.
│  │   We're sending you the missing $300 immediately.
│  │   Sorry for the inconvenience!"
│  ├─ Logs: Detailed audit trail with reason + approver
│  └─ Shows: Green success "Adjustment Applied ✓"

STEP 5: Creator Receives Payment
├─ Stripe transfer processes (1-3 business days)
├─ Mary receives $300 in bank account
├─ Issue resolved
├─ Creator satisfaction maintained

RESULT:
├─ Error corrected
├─ Creator compensated
├─ Platform credibility maintained
├─ Audit trail complete
└─ No future disputes

13.4 Admin Features Data Models
sql-- ADMIN USERS TABLE
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id),
  admin_level ENUM ('JUNIOR', 'SENIOR', 'MANAGER', 'DIRECTOR') DEFAULT 'JUNIOR',
  permissions JSONB NOT NULL, -- {creator_verify, dispute_resolve, payment_override, ban_users, etc}
  assigned_queue ENUM ('CREATOR_KYC', 'DISPUTES', 'CAMPAIGNS', 'SUPPORT', 'COMPLIANCE') DEFAULT 'CREATOR_KYC',
  max_manual_override_amount DECIMAL(12,2), -- $5k for junior, $50k for director
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (admin_level),
  INDEX (assigned_queue)
);

-- ADMIN ACTIONS & AUDIT LOG
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id),
  action_type ENUM ('CREATOR_VERIFY', 'CREATOR_BAN', 'CREATOR_SUSPEND', 'DISPUTE_RESOLVE', 'PAYMENT_OVERRIDE', 'CAMPAIGN_PAUSE', 'CAMPAIGN_CANCEL', 'EMAIL_BROADCAST', 'SYSTEM_CONFIG') NOT NULL,
  resource_type VARCHAR(50), -- CREATOR, FOUNDER, CAMPAIGN, DISPUTE
  resource_id UUID,
  details JSONB, -- {reason, amount, before_state, after_state, etc}
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (admin_id),
  INDEX (action_type),
  INDEX (resource_type),
  INDEX (created_at)
);

-- ADMIN DASHBOARD CACHE
CREATE TABLE admin_dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(100) NOT NULL, -- gmv, revenue, payouts, etc
  metric_value JSONB NOT NULL,
  date_range ENUM ('TODAY', 'WEEK', 'MONTH', 'YEAR') DEFAULT 'TODAY',
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP, -- Cache expiry (60s for real-time metrics)
  UNIQUE (metric_type, date_range),
  INDEX (metric_type),
  INDEX (expires_at)
);

-- DISPUTES TABLE (referenced earlier, included for completeness)
-- Already defined in section 7.3

13.5 Admin Dashboard API Endpoints
ADMIN AUTHENTICATION & AUTHORIZATION
═══════════════════════════════════════════════════════════════

POST /api/v1/admin/login
  Purpose: Admin login with elevated security
  Request: { email: string, password: string, totp_token?: string }
  Response: { auth_token: JWT, admin_level: enum, permissions: array }
  Notes: Requires 2FA (TOTP) for all admins
  Status: 200 OK | 401 Unauthorized | 403 MFA Required

POST /api/v1/admin/enable-2fa
  Purpose: Setup two-factor authentication
  Response: { secret: string, qr_code_url: string }
  Status: 200 OK

─────────────────────────────────────────────────────────────────

CREATOR MANAGEMENT ENDPOINTS
═════════════════════════════════════════════════════════════════

GET /api/v1/admin/creators
  Purpose: List all creators with filters
  Query: {
    kyc_status?: enum (PENDING, VERIFIED, REJECTED),
    platform?: enum,
    rating_min?: decimal,
    sort_by?: enum (earnings, rating, joined_date),
    limit?: integer (default 20),
    offset?: integer (default 0)
  }
  Response: {
    creators: array [{
      creator_id: UUID,
      name: string,
      email: string,
      rating: decimal,
      kyc_status: enum,
      total_earnings: decimal,
      campaigns_completed: integer,
      joined_date: timestamp
    }],
    total_count: integer,
    has_more: boolean
  }
  Status: 200 OK | 403 Forbidden

GET /api/v1/admin/creators/{creator_id}
  Purpose: Get detailed creator profile for admin
  Response: {
    creator_id: UUID,
    user_info: object,
    kyc_verification: object,
    social_accounts: array,
    stripe_connect: object,
    earnings: object,
    campaigns: array,
    performance_metrics: object,
    activity_log: array [{timestamp, action, details}],
    admin_notes: string
  }
  Status: 200 OK | 404 Not Found

POST /api/v1/admin/creators/{creator_id}/verify-kyc
  Purpose: Approve KYC verification
  Request: { approval_status: enum (APPROVED, REJECTED), reason?: string }
  Response: { creator_id: UUID, kyc_status: enum, verified_at: timestamp }
  Status: 200 OK | 400 Bad Request

POST /api/v1/admin/creators/{creator_id}/suspend
  Purpose: Temporarily suspend creator account
  Request: { reason: string, duration_days?: integer (null = indefinite) }
  Response: { creator_id: UUID, status: SUSPENDED, suspended_until: timestamp }
  Status: 200 OK

POST /api/v1/admin/creators/{creator_id}/ban
  Purpose: Permanently ban creator (nuclear option)
  Request: { reason: string, refund_pending_earnings?: boolean }
  Response: { creator_id: UUID, status: BANNED, refunds_processed: array }
  Status: 200 OK | 400 Bad Request (reason required)

POST /api/v1/admin/creators/{creator_id}/adjust-earnings
  Purpose: Manually adjust creator earnings (for error correction)
  Request: {
    adjustment_amount: decimal,
    reason: enum (ERROR_CORRECTION, DISPUTE_RESOLUTION, COMPENSATION),
    notes: string
  }
  Response: {
    adjustment_id: UUID,
    creator_id: UUID,
    amount: decimal,
    status: enum (PENDING_APPROVAL, APPROVED, PROCESSED),
    created_at: timestamp
  }
  Status: 201 Created | 400 Bad Request

POST /api/v1/admin/creators/{creator_id}/force-payout
  Purpose: Force immediate payout (bypasses normal schedule)
  Request: { amount?: decimal (null = all available), reason: string }
  Response: {
    payout_id: UUID,
    amount: decimal,
    stripe_transfer_id: string,
    status: enum (PROCESSING),
    estimated_arrival: timestamp
  }
  Status: 201 Created

─────────────────────────────────────────────────────────────────

FOUNDER MANAGEMENT ENDPOINTS
═════════════════════════════════════════════════════════════════

GET /api/v1/admin/founders
  Purpose: List all founders with filters
  Query: {
    status?: enum (ACTIVE, SUSPENDED, BANNED),
    tier?: enum (SILVER, GOLD, PLATINUM),
    sort_by?: enum (spending, campaigns, joined_date),
    limit?: integer (default 20),
    offset?: integer (default 0)
  }
  Response: {
    founders: array [{
      founder_id: UUID,
      name: string,
      company: string,
      status: enum,
      total_spent: decimal,
      campaigns: integer,
      tier: enum
    }],
    total_count: integer,
    has_more: boolean
  }
  Status: 200 OK

GET /api/v1/admin/founders/{founder_id}
  Purpose: Get detailed founder profile for admin
  Response: {
    founder_id: UUID,
    user_info: object,
    spending_overview: object,
    payment_methods: array,
    campaign_history: array,
    performance_metrics: object,
    activity_log: array,
    admin_notes: string
  }
  Status: 200 OK

POST /api/v1/admin/founders/{founder_id}/suspend
  Purpose: Suspend founder (cannot create campaigns)
  Request: { reason: string }
  Response: { founder_id: UUID, status: SUSPENDED }
  Status: 200 OK

POST /api/v1/admin/founders/{founder_id}/ban
  Purpose: Ban founder (permanent)
  Request: { reason: string, refund_all_active_campaigns?: boolean }
  Response: { founder_id: UUID, status: BANNED, refunds_issued: array }
  Status: 200 OK

POST /api/v1/admin/founders/{founder_id}/force-refund
  Purpose: Manually process refund (for payment errors)
  Request: {
    campaign_id?: UUID (null = all campaigns),
    amount: decimal,
    reason: string
  }
  Response: {
    refund_id: UUID,
    stripe_refund_id: string,
    amount: decimal,
    status: enum (PROCESSING),
    estimated_arrival: timestamp
  }
  Status: 201 Created

─────────────────────────────────────────────────────────────────

DISPUTE MANAGEMENT ENDPOINTS
═════════════════════════════════════════════════════════════════

GET /api/v1/admin/disputes
  Purpose: List all disputes with filters
  Query: {
    status?: enum (OPEN, IN_REVIEW, MEDIATION, RESOLVED, CLOSED),
    issue_type?: enum (PAYMENT, QUALITY, LATE_POSTING, FRAUD, OTHER),
    severity?: enum (LOW, MEDIUM, HIGH, CRITICAL),
    sort_by?: enum (created_at, severity),
    limit?: integer (default 20),
    offset?: integer (default 0)
  }
  Response: {
    disputes: array [{
      dispute_id: UUID,
      campaign_id: UUID,
      reporter_name: string,
      respondent_name: string,
      issue_type: enum,
      status: enum,
      severity: enum,
      created_at: timestamp,
      days_open: integer
    }],
    total_count: integer,
    open_count: integer
  }
  Status: 200 OK

GET /api/v1/admin/disputes/{dispute_id}
  Purpose: Get detailed dispute information
  Response: {
    dispute_id: UUID,
    campaign_id: UUID,
    parties: {reporter, respondent},
    issue_type: enum,
    description: text,
    status: enum,
    communication_thread: array,
    evidence: array,
    resolution_options: array,
    audit_trail: array
  }
  Status: 200 OK

POST /api/v1/admin/disputes/{dispute_id}/message
  Purpose: Send message in dispute thread
  Request: { message_text: string }
  Response: { message_id: UUID, sent_at: timestamp }
  Status: 201 Created

POST /api/v1/admin/disputes/{dispute_id}/resolve
  Purpose: Resolve dispute with final decision
  Request: {
    resolution_type: enum (AUTO_RESOLVED, MANUAL_ADJUSTMENT, REFUND, LEGAL_ESCALATION),
    adjustment_amount?: decimal (if MANUAL_ADJUSTMENT),
    recipient?: enum (CREATOR, FOUNDER),
    notes: string
  }
  Response: {
    dispute_id: UUID,
    status: enum (RESOLVED),
    resolution_type: enum,
    resolved_at: timestamp,
    payout_initiated?: {payout_id, amount, recipient}
  }
  Status: 200 OK | 400 Bad Request

POST /api/v1/admin/disputes/{dispute_id}/escalate
  Purpose: Escalate to legal team
  Request: { reason: string, assign_to?: string (email) }
  Response: { dispute_id: UUID, status: enum (ESCALATED), assigned_to: string }
  Status: 200 OK

─────────────────────────────────────────────────────────────────

CAMPAIGN OVERSIGHT ENDPOINTS
═════════════════════════════════════════════════════════════════

GET /api/v1/admin/campaigns
  Purpose: List all campaigns for monitoring
  Query: {
    status?: enum (DRAFT, LIVE, COMPLETED, CANCELLED),
    sort_by?: enum (created_at, views),
    has_alerts?: boolean,
    limit?: integer (default 20),
    offset?: integer (default 0)
  }
  Response: {
    campaigns: array [{
      campaign_id: UUID,
      title: string,
      founder_name: string,
      status: enum,
      total_views: integer,
      budget: decimal,
      alert_status: enum (NONE, WARNING, CRITICAL)
    }],
    total_count: integer
  }
  Status: 200 OK

POST /api/v1/admin/campaigns/{campaign_id}/pause
  Purpose: Pause campaign temporarily
  Request: { reason: string }
  Response: { campaign_id: UUID, status: PAUSED, paused_at: timestamp }
  Status: 200 OK

POST /api/v1/admin/campaigns/{campaign_id}/cancel
  Purpose: Cancel campaign and issue refunds
  Request: { reason: string, refund_all?: boolean (default true) }
  Response: {
    campaign_id: UUID,
    status: CANCELLED,
    refund_issued: decimal,
    creators_affected: integer
  }
  Status: 200 OK

POST /api/v1/admin/campaigns/{campaign_id}/force-settlement
  Purpose: Force 7-day metric lock (trigger payment settlement)
  Request: { reason: string }
  Response: {
    campaign_id: UUID,
    status: METRIC_LOCKED,
    settlement_initiated: boolean,
    payout_details: {...}
  }
  Status: 200 OK

─────────────────────────────────────────────────────────────────

ADMIN DASHBOARD ENDPOINTS
═════════════════════════════════════════════════════════════════

GET /api/v1/admin/dashboard/overview
  Purpose: Get main dashboard metrics
  Response: {
    today_gmv: decimal,
    active_campaigns: integer,
    creators_online: integer,
    founders_online: integer,
    payouts_today: decimal,
    system_status: object,
    alerts: array [{severity, type, count}],
    campaign_activity: object,
    creator_activity: object,
    financial_summary: object
  }
  Status: 200 OK

GET /api/v1/admin/analytics/revenue
  Purpose: Get financial analytics
  Query: { date_range: enum (TODAY, WEEK, MONTH, YEAR) }
  Response: {
    gmv: decimal,
    nala_revenue: decimal,
    creator_payouts: decimal,
    founder_refunds: decimal,
    stripe_fees: decimal,
    net_profit: decimal,
    cash_flow: object,
    trends: array
  }
  Status: 200 OK

POST /api/v1/admin/broadcast-email
  Purpose: Send bulk email to creators/founders
  Request: {
    recipient_type: enum (ALL_CREATORS, ALL_FOUNDERS, CUSTOM_LIST),
    recipient_ids?: array (for CUSTOM_LIST),
    subject: string,
    body_html: string,
    schedule?: timestamp (for future send)
  }
  Response: {
    broadcast_id: UUID,
    recipients_count: integer,
    status: enum (SCHEDULED, PROCESSING, COMPLETED),
    scheduled_for?: timestamp
  }
  Status: 201 Created

─────────────────────────────────────────────────────────────────

ADMIN AUDIT & COMPLIANCE ENDPOINTS
═════════════════════════════════════════════════════════════════

GET /api/v1/admin/audit-logs
  Purpose: Get platform audit trail
  Query: {
    action_type?: string,
    resource_type?: string,
    admin_id?: UUID,
    date_from?: timestamp,
    date_to?: timestamp,
    limit?: integer (default 50),
    offset?: integer (default 0)
  }
  Response: {
    logs: array [{
      log_id: UUID,
      admin_id: UUID,
      action_type: string,
      resource_type: string,
      resource_id: UUID,
      details: object,
      timestamp: timestamp,
      ip_address: string
    }],
    total_count: integer
  }
  Status: 200 OK

GET /api/v1/admin/reports/kyc-verification
  Purpose: Generate KYC verification report
  Query: { date_range: enum (DAY, WEEK, MONTH) }
  Response: {
    report_id: UUID,
    date_range: string,
    total_pending: integer,
    total_approved: integer,
    total_rejected: integer,
    avg_processing_time_hours: decimal,
    trend_data: array,
    pdf_url?: string (if export requested)
  }
  Status: 200 OK

GET /api/v1/admin/reports/disputes
  Purpose: Generate dispute resolution report
  Query: { date_range: enum (DAY, WEEK, MONTH) }
  Response: {
    report_id: UUID,
    date_range: string,
    total_disputes: integer,
    resolution_breakdown: {
      auto_resolved: integer,
      manual_adjusted: integer,
      escalated: integer
    },
    avg_resolution_time_hours: decimal,
    top_dispute_types: array,
    pdf_url?: string
  }
  Status: 200 OK

POST /api/v1/admin/export-data
  Purpose: Export platform data for backup/reporting
  Request: {
    data_type: enum (CREATORS, FOUNDERS, CAMPAIGNS, DISPUTES, TRANSACTIONS),
    date_range: object {from: timestamp, to: timestamp},
    format: enum (CSV, JSON, EXCEL)
  }
  Response: {
    export_id: UUID,
    file_url: string,
    file_size_mb: decimal,
    record_count: integer,
    created_at: timestamp,
    expires_at: timestamp (24 hours)
  }
  Status: 200 OK

13.6 Admin Dashboard Features Summary Table
FeaturePriorityComplexityEstimated HoursKey CapabilityA-101: Dashboard OverviewP0Medium16Real-time metrics, alerts systemA-102: Creator ManagementP0High32KYC verification, suspension, banningA-103: Founder ManagementP0High28Account management, spending trackingA-104: Dispute ManagementP0High40Resolution workflow, mediation, escalationA-105: Campaign OversightP1Medium24Real-time monitoring, intervention optionsA-106: Financial AnalyticsP1Medium20Revenue tracking, profitability, forecasting
Total Admin Module Estimated Development: 160 hours (4-5 weeks with team of 2)

13.7 Admin Onboarding & Permissions
ADMIN ROLE HIERARCHY
═════════════════════════════════════════════════════════════════

Role: JUNIOR ADMIN (Entry Level)
├─ KYC Verification: ✅ (review documents, approve/reject)
├─ Creator Suspension: ✅ (temporary, up to 30 days)
├─ Dispute Resolution: ✅ (auto-resolved, simple cases)
├─ Manual Override: ✅ (up to $100 per transaction)
├─ Campaign Oversight: ✅ (view only, report issues)
├─ Access Reports: ✅ (read-only analytics)
├─ Email Broadcast: ❌
├─ Creator Ban: ❌
└─ System Config: ❌

Role: SENIOR ADMIN (Experienced)
├─ KYC Verification: ✅ (all cases)
├─ Creator Suspension: ✅ (any duration)
├─ Creator Ban: ✅ (permanent removal)
├─ Dispute Resolution: ✅ (all types including complex)
├─ Manual Override: ✅ (up to $5,000 per transaction)
├─ Campaign Oversight: ✅ (pause, cancel, force settlement)
├─ Access Reports: ✅ (all analytics + export)
├─ Email Broadcast: ✅ (to all users)
├─ Founder Suspension/Ban: ✅
└─ System Config: ❌ (read-only)

Role: MANAGER (Supervisory)
├─ All Senior permissions: ✅
├─ Manual Override: ✅ (up to $25,000 per transaction)
├─ Approve Manual Adjustments: ✅ (from junior/senior)
├─ System Config: ✅ (limited - feature flags, feature toggles)
├─ Escalation Authority: ✅ (final decision on disputes)
├─ Team Management: ✅ (assign tickets, monitor queue)
└─ Legal Escalation: ✅ (disputes to legal team)

Role: DIRECTOR (Executive)
├─ All permissions: ✅ (unrestricted)
├─ Manual Override: ✅ (unlimited)
├─ System Config: ✅ (full access)
├─ Audit Access: ✅ (all logs, compliance)
├─ Report Generation: ✅ (for board/executives)
├─ Emergency Actions: ✅ (emergency pause, platform halt)
└─ Admin User Management: ✅ (hire/fire other admins)

PERMISSION MATRIX
═════════════════════════════════════════════════════════════════
Action                    Junior  Senior  Manager  Director
Creator Verify            ✅      ✅      ✅       ✅
Creator Suspend <30d      ✅      ✅      ✅       ✅
Creator Suspend >30d      ❌      ✅      ✅       ✅
Creator Ban               ❌      ✅      ✅       ✅
Founder Suspend           ❌      ✅      ✅       ✅
Founder Ban               ❌      ✅      ✅       ✅
Dispute Simple Resolve    ✅      ✅      ✅       ✅
Dispute Complex Resolve   ❌      ✅      ✅       ✅
Override Payment <$100    ✅      ✅      ✅       ✅
Override Payment <$5k     ❌      ✅      ✅       ✅
Override Payment <$25k    ❌      ❌      ✅       ✅
Override Payment >$25k    ❌      ❌      ❌       ✅
Approve Overrides         ❌      ❌      ✅       ✅
Campaign Pause            ❌      ✅      ✅       ✅
Campaign Cancel           ❌      ✅      ✅       ✅
Force Settlement          ❌      ✅      ✅       ✅
Email Broadcast           ❌      ✅      ✅       ✅
System Config             ❌      ❌      ✅       ✅
Full System Access        ❌      ❌      ❌       ✅
