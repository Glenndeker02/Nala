# Performance Dashboard - Implementation Plan

## Overview
Build a comprehensive performance tracking dashboard showing real-time video metrics, cost calculations, ROI projections, and automated refund calculations.

## Features to Implement

### F-204A: Campaign-Level Overview
- [x] Aggregate metrics display
- [x] Total views vs maximum
- [x] Achievement percentage
- [x] Financial breakdown
- [x] Creator rankings
- [x] 7-day countdown timer
- [x] Refund projection

### F-204B: Video-Level Detail View
- [x] Individual video metrics
- [x] Payment calculations
- [x] Creator earnings breakdown
- [x] Nala revenue display
- [x] Timeline tracking
- [x] Export option

### F-204C: Real-Time Updates
- [ ] Daily sync process (backend)
- [x] Last updated timestamp
- [x] Manual refresh button
- [x] Update notifications

### F-204D: 7-Day Metric Lock
- [x] Lock countdown display
- [x] Lock status indicator
- [x] Final metrics display
- [ ] Auto-settlement (backend)
- [x] Settlement notifications

### F-204E: Export & Reporting
- [x] PDF export button
- [x] Performance report layout
- [ ] Email delivery (backend)
- [x] Shareable format

## Component Structure

1. **Performance Dashboard Page** (`/founder/campaigns/[id]/performance`)
   - Campaign overview section
   - Aggregate metrics cards
   - Financial breakdown
   - Creator rankings table
   - Countdown timer
   - Video list with performance

2. **Video Detail Modal/Page**
   - Individual video metrics
   - Payment breakdown
   - Timeline
   - Export options

3. **Metrics Cards Component**
   - Total views
   - Achievement %
   - ROI
   - Refund projection

4. **Creator Rankings Component**
   - Sortable table
   - Performance bars
   - Percentage display

5. **Countdown Timer Component**
   - Days/hours/minutes remaining
   - Progress bar
   - Lock status

## Data Flow

```
1. Load campaign data
2. Fetch video performance metrics
3. Calculate aggregates:
   - Total views
   - Total cost
   - Refund amount
4. Rank creators by performance
5. Calculate time remaining until lock
6. Display real-time updates
7. Handle export requests
```

## Calculations

### Performance Budget Spent
```
viewsAchieved × $0.005 = performanceCost
```

### Creator Bonus
```
viewsAchieved × $0.004 = creatorBonus
```

### Nala Revenue
```
viewsAchieved × $0.001 = nalaRevenue
```

### Refund Amount
```
performanceBudget - performanceCost = refund
```

### Achievement Percentage
```
(viewsAchieved / maxViews) × 100 = achievement%
```

## Timeline
- Phase 1 (P0): 3-4 hours
- Phase 2 (Backend): 2-3 hours
- Phase 3 (Polish): 1-2 hours
- **Total**: 6-9 hours
