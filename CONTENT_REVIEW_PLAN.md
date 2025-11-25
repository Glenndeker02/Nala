# Content Review Tool - Implementation Plan

## Overview
Build a comprehensive video review portal for founders to review creator submissions, provide feedback, approve content, and manage revisions.

## Features to Implement

### F-203A: Review Dashboard Layout
- [x] Creator list with status indicators
- [x] Video player with controls
- [x] Revision history display
- [x] Feedback form
- [x] Approve/Revision buttons

### F-203B: Approve Action Flow
- [x] Validation before approval
- [x] Payment trigger notification
- [x] Status update to APPROVED
- [x] Creator notification

### F-203C: Revision Request Flow
- [x] Feedback text area (1000 char limit)
- [x] Revision deadline selector
- [x] Notification to creator
- [x] Revision tracking

### F-203D: Comparison Mode (Future)
- [ ] Side-by-side video comparison
- [ ] Sync playback
- [ ] Per-creator approval

## Component Structure

1. **Main Review Page** (`/founder/campaigns/[id]/review`)
   - Creator list sidebar
   - Video player section
   - Revision history
   - Feedback form
   - Action buttons

2. **Video Player Component**
   - HTML5 video with custom controls
   - Play/pause/fullscreen
   - Timeline scrubber
   - Volume control
   - Playback speed

3. **Creator List Component**
   - Status badges
   - Rating display
   - Selection state
   - Filter options

4. **Revision History Component**
   - Timeline view
   - Feedback display
   - Version comparison

5. **Feedback Form Component**
   - Text area with character counter
   - Deadline selector
   - Auto-approve toggle
   - Submit buttons

## Data Flow

```
1. Load campaign and assigned creators
2. Fetch video submissions for each creator
3. Display creator list with statuses
4. On creator selection:
   - Load video file
   - Load revision history
   - Display current status
5. On action (Approve/Revision):
   - Validate input
   - Update database
   - Trigger notifications
   - Update UI
```

## API Endpoints Needed

- `GET /api/campaigns/:id/submissions` - Get all submissions
- `GET /api/submissions/:id` - Get specific submission
- `POST /api/submissions/:id/approve` - Approve submission
- `POST /api/submissions/:id/request-revision` - Request revision
- `GET /api/submissions/:id/history` - Get revision history

## Implementation Priority

1. **P0 (Critical)**:
   - Creator list with status
   - Video player
   - Approve/Revision buttons
   - Basic feedback form

2. **P1 (High)**:
   - Revision history
   - Deadline selector
   - Auto-approve toggle
   - Notifications

3. **P2 (Medium)**:
   - Frame-by-frame controls
   - Advanced player features
   - Comparison mode

## Timeline
- Phase 1 (P0): 3-4 hours
- Phase 2 (P1): 2-3 hours
- Phase 3 (P2): 3-4 hours
- **Total**: 8-11 hours
