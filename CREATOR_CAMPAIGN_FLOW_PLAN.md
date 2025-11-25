# Creator Campaign Flow - Implementation Plan

## Overview
Implement the complete creator-side campaign workflow from discovering briefs to receiving payments, following the user flow specification.

## Creator Journey Phases

### Phase 2: Campaign Discovery & Application
- [x] Browse available campaigns
- [x] View campaign details/brief
- [x] Apply for campaigns
- [x] Track application status

### Phase 3: Content Production
- [x] View assigned tasks
- [x] Upload draft videos
- [x] Track submission status
- [x] Receive feedback

### Phase 4: Content Revision
- [x] View revision requests
- [x] Resubmit revised content
- [x] Track approval status

### Phase 5: Video Posting
- [x] Submit posting URL
- [x] Track view counts
- [x] Monitor performance bonus
- [x] View earnings dashboard

### Phase 6: Settlement
- [x] View final metrics
- [x] Confirm payment receipt
- [x] Download earnings report

## Pages to Implement

### 1. Creator Dashboard (`/creator/dashboard`)
- Available campaigns feed
- Active tasks
- Earnings summary
- Performance stats

### 2. Campaign Browse (`/creator/campaigns`)
- List of available campaigns
- Filter by category, platform, budget
- Search functionality
- Quick apply

### 3. Campaign Detail/Brief (`/creator/campaigns/[id]`)
- Full campaign brief
- Requirements
- Budget breakdown
- Apply button
- Application status

### 4. Task Dashboard (`/creator/tasks`)
- Assigned campaigns
- Upload draft interface
- Revision requests
- Posting URL submission
- Status tracking

### 5. Earnings Dashboard (`/creator/earnings`)
- Total earnings
- Per-campaign breakdown
- Performance bonuses
- Payment history
- Payout schedule

### 6. Video Upload (`/creator/tasks/[id]/upload`)
- File upload interface
- Video preview
- Title/description
- Submit for review

## Data Flow

```
1. Creator browses available campaigns
2. Clicks "Apply" → Application created
3. Founder reviews → Assignment created
4. Creator uploads draft → Status: SUBMITTED
5. Founder reviews → Approve or Revision
6. If approved → Base fee paid
7. Creator posts video → Submits URL
8. System tracks views → Daily updates
9. After 7 days → Metric lock
10. Performance bonus calculated → Paid
11. Campaign complete → Earnings finalized
```

## Implementation Priority

### P0 (Critical) - Now:
1. Creator Dashboard (campaign feed)
2. Campaign Detail/Brief page
3. Application system
4. Task Dashboard
5. Video upload interface

### P1 (High) - Next:
6. Earnings dashboard
7. Performance tracking
8. Posting URL submission
9. Revision handling

### P2 (Medium) - Later:
10. Advanced filters
11. Portfolio management
12. Analytics deep-dive
13. Notification center

## Timeline
- Phase 1 (P0): 4-5 hours
- Phase 2 (P1): 3-4 hours
- Phase 3 (P2): 2-3 hours
- **Total**: 9-12 hours
