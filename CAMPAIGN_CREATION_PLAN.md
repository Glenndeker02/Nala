# Campaign Creation Enhancement - Implementation Plan

## Overview
Enhance the campaign creation wizard to match F-201 specifications with 6 comprehensive steps, AI integration, draft saving, and real-time calculations.

## Current State
- Basic 5-step wizard exists
- Missing: Creator filters, preview mode, draft saving, detailed budget breakdown, AI enhancements
- Needs: Better UX, more detailed forms, validation, auto-save

## Implementation Steps

### Phase 1: Enhanced Form Structure
1. **Expand to 6 Steps**
   - Step 1: Campaign Basics (enhanced)
   - Step 2: Content Requirements (enhanced)
   - Step 3: Posting Schedule (with calendar)
   - Step 4: Budget Configuration (detailed breakdown)
   - Step 5: Creator Filters (NEW)
   - Step 6: Review & Confirm (enhanced)

2. **Add Draft Saving**
   - Auto-save every 30 seconds
   - Manual "Save Draft" button
   - Resume from saved drafts
   - API endpoint: `/api/campaigns/draft`

3. **Add Preview Mode**
   - Show how brief appears to creators
   - Modal/side panel view
   - Real-time updates

### Phase 2: Step-by-Step Enhancements

#### Step 1: Campaign Basics
- [x] Campaign Title (50-200 chars)
- [x] Description (500-2000 chars)
- [ ] Product Category dropdown
- [x] Product Link with AI auto-fill
- [ ] Campaign Duration (7-60 days)
- [ ] Primary Goal selection
- [ ] Title uniqueness validation
- [ ] Auto-save functionality

#### Step 2: Content Requirements
- [x] Number of videos (1-10)
- [x] Platforms multi-select
- [x] Content tone
- [x] Key talking points (3-5)
- [ ] Must-Haves requirements
- [ ] Don'ts exclusions
- [ ] Video length preference
- [ ] Demo/Product info upload
- [ ] Estimated creator availability display
- [ ] Platform best practices tips

#### Step 3: Posting Schedule
- [x] Start date picker
- [x] Posting frequency
- [ ] Visual calendar display
- [ ] Custom schedule option
- [ ] Preferred posting time
- [ ] Timeline preview
- [ ] Spacing recommendations
- [ ] Verification requirements explanation

#### Step 4: Budget Configuration
- [x] Total budget input
- [x] Budget breakdown display
- [ ] Interactive slider for variable budget
- [ ] Real-time max views calculation
- [ ] ROI scenario display (30k, 100k, 150k views)
- [ ] Creator/Nala earnings breakdown
- [ ] Refund policy explanation
- [ ] Visual budget allocation bar

#### Step 5: Creator Filters (NEW)
- [ ] Minimum rating filter
- [ ] Minimum experience filter
- [ ] Platform expertise filter
- [ ] Geographic location filter
- [ ] Industry experience filter
- [ ] Language preference
- [ ] Live creator count matching criteria
- [ ] Average base rate display

#### Step 6: Review & Confirm
- [x] Campaign summary
- [ ] Detailed breakdown card
- [ ] Terms checkboxes
- [ ] Edit any step functionality
- [ ] Preview brief button
- [ ] Payment confirmation
- [ ] Escrow explanation

### Phase 3: Advanced Features

#### AI Integration
- [x] Auto-fill from product URL
- [ ] Suggest talking points
- [ ] Recommend budget based on goals
- [ ] Suggest optimal posting schedule
- [ ] Match with creator profiles

#### Real-time Calculations
- [x] Budget breakdown
- [x] Max views calculation
- [ ] Estimated reach
- [ ] Creator availability count
- [ ] Average creator rating
- [ ] ROI projections

#### Validation & UX
- [ ] Step-by-step validation
- [ ] Prevent next if incomplete
- [ ] Inline error messages
- [ ] Character counters
- [ ] Helpful tooltips
- [ ] Progress persistence

## API Endpoints Needed

### Existing
- `POST /api/campaigns/create` - Create campaign
- `POST /api/ai/generate-brief` - AI auto-fill

### New
- `POST /api/campaigns/draft/save` - Save draft
- `GET /api/campaigns/draft/:id` - Load draft
- `GET /api/creators/availability` - Check matching creators
- `GET /api/creators/filters` - Get filter options
- `POST /api/campaigns/preview` - Generate preview

## Database Schema Updates

```sql
-- Add draft support
ALTER TABLE campaigns ADD COLUMN is_draft BOOLEAN DEFAULT true;
ALTER TABLE campaigns ADD COLUMN draft_step INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN auto_saved_at TIMESTAMP;

-- Add creator filter preferences
ALTER TABLE campaigns ADD COLUMN creator_filters JSONB DEFAULT '{}'::jsonb;

-- Add more brief data fields
ALTER TABLE campaigns ADD COLUMN must_haves TEXT[];
ALTER TABLE campaigns ADD COLUMN dont_wants TEXT[];
ALTER TABLE campaigns ADD COLUMN video_length_preference VARCHAR(50);
ALTER TABLE campaigns ADD COLUMN product_category VARCHAR(100);
ALTER TABLE campaigns ADD COLUMN campaign_duration_days INTEGER;
```

## UI Components to Create

1. **BudgetBreakdownCard** - Visual budget display
2. **CalendarView** - Posting schedule calendar
3. **CreatorFilterPanel** - Filter interface
4. **BriefPreviewModal** - Preview how brief looks
5. **ROIScenarioCard** - Show potential outcomes
6. **ProgressStepper** - Enhanced step indicator
7. **AutoSaveIndicator** - Show save status

## Timeline
- Phase 1: 2-3 hours (structure & draft saving)
- Phase 2: 4-5 hours (step enhancements)
- Phase 3: 2-3 hours (advanced features)
- **Total: 8-11 hours**

## Priority Order
1. **P0 (Critical)**: Steps 1-4 enhancements, draft saving
2. **P1 (High)**: Step 5 creator filters, Step 6 review
3. **P2 (Medium)**: AI enhancements, preview mode
4. **P3 (Nice-to-have)**: Advanced analytics, recommendations
