# Phase 4-6: Real-Time, Content Management & Social Integration

## Overview

Implement three major feature sets to complete the Nala platform:
1. **Real-Time Features** - WebSockets, notifications, messaging, activity feeds
2. **Content Management** - Watermarking, approval workflow, revisions, assets, licenses
3. **Social Media Integration** - TikTok/Instagram APIs, auto-posting, analytics sync

---

## Phase 4: Real-Time Features

### 1. WebSocket Infrastructure

**Technology Stack:**
- Socket.IO for WebSocket management
- Redis adapter for multi-server support (optional for now)
- JWT authentication for socket connections

**Implementation:**
```typescript
// lib/socket/server.ts
- Initialize Socket.IO server
- Handle authentication
- Room management (user rooms, campaign rooms)
- Event broadcasting

// lib/socket/events.ts
- Define event types
- Event handlers
- Emit helpers
```

**Events to Support:**
- `notification:new` - New notification received
- `message:new` - New chat message
- `activity:update` - Activity feed update
- `campaign:update` - Campaign status change
- `video:status` - Video status change
- `payment:received` - Payment notification

### 2. Real-Time Notifications

**Database Schema:**
```prisma
model Notification {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  type        NotificationType
  title       String
  message     String
  data        Json?
  read        Boolean  @default(false)
  actionUrl   String?
  createdAt   DateTime @default(now())
  
  @@index([userId, read])
  @@index([createdAt])
}

enum NotificationType {
  CAMPAIGN_INVITE
  APPLICATION_STATUS
  VIDEO_APPROVED
  VIDEO_REJECTED
  PAYMENT_RECEIVED
  MESSAGE_RECEIVED
  DEADLINE_REMINDER
  SYSTEM_ALERT
}
```

**API Endpoints:**
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/[id]/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/[id]` - Delete notification

**Service:**
```typescript
// lib/services/notificationService.ts
- createNotification()
- sendToUser()
- markAsRead()
- getUnreadCount()
```

### 3. Live Chat/Messaging System

**Database Schema:**
```prisma
model Conversation {
  id            String    @id @default(uuid())
  campaignId    String?
  campaign      Campaign? @relation(fields: [campaignId], references: [id])
  participants  ConversationParticipant[]
  messages      Message[]
  lastMessageAt DateTime?
  createdAt     DateTime  @default(now())
  
  @@index([campaignId])
}

model ConversationParticipant {
  id              String       @id @default(uuid())
  conversationId  String
  conversation    Conversation @relation(fields: [conversationId], references: [id])
  userId          String
  user            User         @relation(fields: [userId], references: [id])
  lastReadAt      DateTime?
  joinedAt        DateTime     @default(now())
  
  @@unique([conversationId, userId])
  @@index([userId])
}

model Message {
  id              String       @id @default(uuid())
  conversationId  String
  conversation    Conversation @relation(fields: [conversationId], references: [id])
  senderId        String
  sender          User         @relation(fields: [senderId], references: [id])
  content         String
  attachments     Json?
  readBy          String[]     @default([])
  createdAt       DateTime     @default(now())
  
  @@index([conversationId, createdAt])
  @@index([senderId])
}
```

**API Endpoints:**
- `GET /api/conversations` - List user conversations
- `GET /api/conversations/[id]` - Get conversation details
- `GET /api/conversations/[id]/messages` - Get messages
- `POST /api/conversations` - Create conversation
- `POST /api/conversations/[id]/messages` - Send message
- `PATCH /api/conversations/[id]/read` - Mark as read

### 4. Activity Feeds

**Database Schema:**
```prisma
model Activity {
  id          String       @id @default(uuid())
  userId      String
  user        User         @relation(fields: [userId], references: [id])
  type        ActivityType
  entityType  String
  entityId    String
  title       String
  description String?
  metadata    Json?
  createdAt   DateTime     @default(now())
  
  @@index([userId, createdAt])
  @@index([entityType, entityId])
}

enum ActivityType {
  CAMPAIGN_CREATED
  VIDEO_SUBMITTED
  VIDEO_APPROVED
  PAYMENT_SENT
  APPLICATION_SUBMITTED
  MILESTONE_REACHED
}
```

**API Endpoints:**
- `GET /api/activity` - Get user activity feed
- `GET /api/activity/campaign/[id]` - Campaign activity

---

## Phase 5: Content Management

### 1. Video Watermarking System

**Technology:**
- FFmpeg for video processing
- AWS S3 for storage
- Background job queue for processing

**Implementation:**
```typescript
// lib/services/watermarkService.ts
- addWatermark(videoUrl, watermarkText)
- generateThumbnail(videoUrl)
- processVideo(videoId)

// lib/jobs/videoProcessingJob.ts
- Process uploaded videos
- Add watermark
- Generate thumbnail
- Update status
```

**Workflow:**
1. Creator uploads video → S3
2. Background job triggered
3. Download original video
4. Add watermark overlay
5. Upload watermarked version
6. Generate thumbnail
7. Update VideoSubmission record

### 2. Content Approval Workflow

**Enhanced Video Status:**
```typescript
enum VideoStatus {
  PENDING           // Awaiting creator submission
  DRAFT_SUBMITTED   // Creator submitted draft
  IN_REVIEW         // Founder reviewing
  REVISION_REQUESTED // Founder requested changes
  APPROVED          // Founder approved
  POSTED            // Posted to social media
  LOCKED            // Views locked for payment
}
```

**Revision Tracking:**
```prisma
model Revision {
  id              String    @id @default(uuid())
  videoId         String
  video           Video     @relation(fields: [videoId], references: [id])
  version         Int
  submittedBy     String
  submitter       User      @relation(fields: [submittedBy], references: [id])
  videoUrl        String
  thumbnailUrl    String?
  notes           String?
  status          RevisionStatus
  reviewedBy      String?
  reviewer        User?     @relation("ReviewedRevisions", fields: [reviewedBy], references: [id])
  reviewNotes     String?
  submittedAt     DateTime  @default(now())
  reviewedAt      DateTime?
  
  @@index([videoId, version])
}

enum RevisionStatus {
  PENDING
  APPROVED
  REJECTED
}
```

**API Endpoints:**
- `POST /api/videos/[id]/revisions` - Submit revision
- `GET /api/videos/[id]/revisions` - List revisions
- `PATCH /api/videos/[id]/revisions/[revisionId]/approve` - Approve
- `PATCH /api/videos/[id]/revisions/[revisionId]/reject` - Reject

### 3. Asset Management

**Database Schema:**
```prisma
model Asset {
  id          String     @id @default(uuid())
  userId      String
  user        User       @relation(fields: [userId], references: [id])
  type        AssetType
  name        String
  url         String
  thumbnailUrl String?
  fileSize    Int
  mimeType    String
  metadata    Json?
  tags        String[]
  campaignId  String?
  campaign    Campaign?  @relation(fields: [campaignId], references: [id])
  createdAt   DateTime   @default(now())
  
  @@index([userId, type])
  @@index([campaignId])
}

enum AssetType {
  VIDEO
  IMAGE
  DOCUMENT
  AUDIO
  OTHER
}
```

**API Endpoints:**
- `GET /api/assets` - List user assets
- `POST /api/assets/upload` - Upload asset
- `DELETE /api/assets/[id]` - Delete asset
- `GET /api/assets/[id]/download` - Download asset

### 4. License Management

**Enhanced License Model:**
```prisma
model License {
  id              String        @id @default(uuid())
  videoId         String
  video           Video         @relation(fields: [videoId], references: [id])
  type            LicenseType
  grantedTo       String
  grantee         User          @relation(fields: [grantedTo], references: [id])
  scope           LicenseScope
  platforms       Platform[]
  territory       String[]
  duration        Int?          // days
  exclusivity     Boolean       @default(false)
  price           Decimal       @db.Decimal(10, 2)
  terms           String?
  status          LicenseStatus
  grantedAt       DateTime      @default(now())
  expiresAt       DateTime?
  revokedAt       DateTime?
  
  @@index([videoId])
  @@index([grantedTo, status])
}

enum LicenseScope {
  ORGANIC_ONLY
  PAID_ADS
  FULL_RIGHTS
}
```

---

## Phase 6: Social Media Integration

### 1. Platform Authentication

**OAuth Flow:**
```typescript
// lib/services/socialAuth/
- tiktokAuth.ts
- instagramAuth.ts
- facebookAuth.ts

// API Routes:
- GET /api/social/tiktok/auth
- GET /api/social/tiktok/callback
- GET /api/social/instagram/auth
- GET /api/social/instagram/callback
```

**Database Schema:**
```prisma
model SocialAccount {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  platform        Platform
  platformUserId  String
  username        String
  accessToken     String    @db.Text
  refreshToken    String?   @db.Text
  tokenExpiresAt  DateTime?
  scope           String[]
  metadata        Json?
  isActive        Boolean   @default(true)
  connectedAt     DateTime  @default(now())
  lastSyncAt      DateTime?
  
  @@unique([userId, platform])
  @@index([platform, platformUserId])
}
```

### 2. TikTok API Integration

**Features:**
- Video upload
- Analytics fetch
- User profile sync
- Comment management

**Implementation:**
```typescript
// lib/services/social/tiktokService.ts
- uploadVideo(videoUrl, caption, hashtags)
- getVideoAnalytics(videoId)
- getUserProfile()
- getComments(videoId)
- postComment(videoId, text)
```

### 3. Instagram API Integration

**Features:**
- Reel upload
- Story posting
- Analytics fetch
- Insights retrieval

**Implementation:**
```typescript
// lib/services/social/instagramService.ts
- uploadReel(videoUrl, caption)
- postStory(videoUrl)
- getInsights(mediaId)
- getProfile()
```

### 4. Auto-Posting System

**Database Schema:**
```prisma
model ScheduledPost {
  id              String              @id @default(uuid())
  videoId         String
  video           Video               @relation(fields: [videoId], references: [id])
  platform        Platform
  scheduledFor    DateTime
  caption         String
  hashtags        String[]
  location        String?
  status          ScheduledPostStatus
  platformPostId  String?
  postedAt        DateTime?
  error           String?
  attempts        Int                 @default(0)
  createdAt       DateTime            @default(now())
  
  @@index([scheduledFor, status])
  @@index([videoId])
}

enum ScheduledPostStatus {
  PENDING
  PROCESSING
  PUBLISHED
  FAILED
  CANCELLED
}
```

**Background Job:**
```typescript
// lib/jobs/autoPostJob.ts
- Check scheduled posts
- Post to platforms
- Update status
- Handle errors
```

### 5. Social Analytics Sync

**Background Job:**
```typescript
// lib/jobs/socialSyncJob.ts
- Sync TikTok analytics
- Sync Instagram insights
- Update view counts
- Store in AnalyticsSnapshot
```

**Sync Schedule:**
- Every 15 minutes for recent posts
- Hourly for older posts
- Daily for archived content

---

## Implementation Priority

### Week 1: Real-Time Infrastructure
1. ✅ WebSocket setup with Socket.IO
2. ✅ Notification system
3. ✅ Basic messaging
4. ✅ Activity feeds

### Week 2: Content Management
1. ✅ Video watermarking
2. ✅ Revision tracking
3. ✅ Approval workflow
4. ✅ Asset management
5. ✅ License management

### Week 3: Social Integration
1. ✅ OAuth setup
2. ✅ TikTok integration
3. ✅ Instagram integration
4. ✅ Auto-posting
5. ✅ Analytics sync

---

## Technical Considerations

### Performance
- Use Redis for Socket.IO scaling
- Implement message pagination
- Cache social API responses
- Queue video processing jobs

### Security
- Encrypt social tokens
- Validate webhook signatures
- Rate limit API calls
- Sanitize user content

### Monitoring
- Track WebSocket connections
- Monitor job queue health
- Log social API errors
- Alert on failed posts

---

## Success Criteria

✅ Real-time notifications working  
✅ Chat system functional  
✅ Video watermarking automated  
✅ Approval workflow complete  
✅ TikTok posting working  
✅ Instagram posting working  
✅ Analytics syncing hourly  
✅ All features tested  

---

## Next Steps

1. Install dependencies (socket.io, ffmpeg, social SDKs)
2. Update database schema
3. Implement WebSocket server
4. Build notification system
5. Create messaging APIs
6. Implement watermarking
7. Build approval workflow
8. Integrate social platforms
9. Test end-to-end
10. Deploy and monitor
