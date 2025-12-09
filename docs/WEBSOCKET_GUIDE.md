# WebSocket Integration Guide

## Overview
The Nala platform now includes real-time WebSocket support for live updates on campaigns, notifications, budget changes, and progress tracking.

## Server-Side Setup

### 1. WebSocket Server (`lib/websocket.ts`)
The WebSocket server is initialized with JWT authentication and room-based communication.

**Features**:
- JWT token authentication
- User-specific rooms: `user:{userId}`
- Campaign-specific rooms: `campaign:{campaignId}`
- Helper functions for emitting events

**Usage**:
```typescript
import { emitToUser, emitToCampaign } from '@/lib/websocket';

// Emit to specific user
emitToUser(userId, 'notification', { message: 'Hello!' });

// Emit to campaign room
emitToCampaign(campaignId, 'budget:updated', budgetData);
```

### 2. Notifications API (`app/api/notifications/send/route.ts`)
Internal API for sending notifications with database storage and WebSocket push.

**Usage**:
```typescript
import { sendNotification } from '@/lib/notifications';

await sendNotification({
    userId: creatorId,
    type: 'APPLICATION_ACCEPTED',
    message: 'Your application has been accepted!',
    actionRoute: `/creator/campaigns/${campaignId}`
});
```

### 3. Real-time Event Emitters (`lib/notifications.ts`)
Pre-defined event emitters for common scenarios.

**Available Events**:
- `budgetUpdated(campaignId, budgetData)`
- `progressUpdated(campaignId, progressData)`
- `applicationSubmitted(campaignId, founderId, data)`
- `applicationAccepted(creatorId, data)`
- `submissionUploaded(campaignId, founderId, data)`
- `submissionApproved(creatorId, data)`
- `revisionRequested(creatorId, data)`
- `paymentSent(userId, data)`
- `instructionCreated(campaignId, data)`

**Usage**:
```typescript
import { realtimeEvents } from '@/lib/notifications';

// After updating budget
realtimeEvents.budgetUpdated(campaignId, {
    totalBudget,
    spentVariable,
    remainingVariable
});
```

## Client-Side Integration

### 1. WebSocket Hook (`lib/hooks/useWebSocket.ts`)

**Basic Usage**:
```typescript
import { useWebSocket } from '@/lib/hooks/useWebSocket';

function MyComponent() {
    const { isConnected, notifications, joinCampaign, subscribe } = useWebSocket(token);

    useEffect(() => {
        // Join campaign room
        joinCampaign(campaignId);

        // Subscribe to events
        const unsubscribe = subscribe('budget:updated', (data) => {
            console.log('Budget updated:', data);
            // Update UI
        });

        return () => {
            unsubscribe();
        };
    }, [campaignId]);

    return (
        <div>
            Status: {isConnected ? 'Connected' : 'Disconnected'}
        </div>
    );
}
```

### 2. Campaign Real-time Hook

**Usage**:
```typescript
import { useCampaignRealtime } from '@/lib/hooks/useWebSocket';

function CampaignDetails({ campaignId, token }) {
    const { isConnected, budgetData, progressData } = useCampaignRealtime(campaignId, token);

    // budgetData and progressData automatically update in real-time
    return (
        <div>
            {budgetData && <BudgetCard data={budgetData} />}
            {progressData && <ProgressCard data={progressData} />}
        </div>
    );
}
```

## Integration Examples

### Example 1: Real-time Budget Updates

**Backend (after payment)**:
```typescript
// In approve submission endpoint
await prisma.payment.create({ ... });

// Emit real-time update
realtimeEvents.budgetUpdated(campaignId, {
    spentVariable: newSpentVariable,
    remainingVariable: newRemainingVariable,
    creatorPayoutTotal: newPayoutTotal
});
```

**Frontend**:
```typescript
const { budgetData } = useCampaignRealtime(campaignId, token);

// budgetData automatically updates when backend emits
```

### Example 2: Application Notifications

**Backend (when creator applies)**:
```typescript
// Create application
const application = await prisma.application.create({ ... });

// Send notification to founder
await sendNotification({
    userId: founderId,
    type: 'APPLICATION_SUBMITTED',
    message: `${creatorName} applied to your campaign`,
    actionRoute: `/founder/campaigns/${campaignId}/applications`
});

// Emit real-time event
realtimeEvents.applicationSubmitted(campaignId, founderId, {
    applicationId: application.id,
    creatorName
});
```

**Frontend**:
```typescript
const { notifications } = useWebSocket(token);

// New notifications appear in real-time
notifications.map(notif => (
    <NotificationToast key={notif.id} {...notif} />
))
```

### Example 3: Progress Tracking

**Backend (when video is posted)**:
```typescript
await prisma.video.update({
    where: { id: videoId },
    data: { status: 'POSTED', postedAt: new Date() }
});

// Emit progress update
realtimeEvents.progressUpdated(campaignId, {
    videosPosted: newPostedCount,
    viewsAchieved: totalViews,
    completionPercent: (totalViews / targetViews) * 100
});
```

**Frontend**:
```typescript
const { progressData } = useCampaignRealtime(campaignId, token);

// Progress bar updates in real-time
<ProgressBar percent={progressData?.completionPercent} />
```

## Event Types

### User Events (sent to `user:{userId}`)
- `notification` - New notification
- `application:accepted` - Application accepted
- `application:rejected` - Application rejected
- `submission:approved` - Video approved
- `revision:requested` - Revision requested
- `payment:sent` - Payment processed

### Campaign Events (sent to `campaign:{campaignId}`)
- `budget:updated` - Budget changed
- `progress:updated` - Progress changed
- `application:submitted` - New application
- `submission:uploaded` - New submission
- `instruction:created` - New instruction
- `instruction:updated` - Instruction updated
- `deadline:updated` - Deadline changed

## Security

- All WebSocket connections require JWT authentication
- Users can only join rooms they have access to
- Server validates campaign ownership before emitting to campaign rooms
- Notifications are stored in database even if WebSocket fails

## Testing

### Test WebSocket Connection
```typescript
// In browser console
const socket = io('http://localhost:3000', {
    path: '/api/socket',
    auth: { token: 'your-jwt-token' }
});

socket.on('connect', () => console.log('Connected!'));
socket.on('notification', (data) => console.log('Notification:', data));
```

### Test Notification Sending
```typescript
// Call internal API
await fetch('/api/notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        userId: 'user-id',
        type: 'TEST',
        message: 'Test notification',
        actionRoute: '/test'
    })
});
```

## Troubleshooting

**WebSocket not connecting**:
- Check JWT token is valid
- Verify NEXT_PUBLIC_APP_URL is set correctly
- Check browser console for errors

**Events not received**:
- Ensure you've joined the correct room (`joinCampaign`)
- Check server logs for emit errors
- Verify event name matches exactly

**Performance issues**:
- Limit number of subscriptions per component
- Unsubscribe when component unmounts
- Use debouncing for frequent updates

## Next Steps

1. Integrate `useWebSocket` hook in notification components
2. Add `useCampaignRealtime` to campaign details page
3. Implement toast notifications for real-time events
4. Add connection status indicator in UI
5. Test with multiple concurrent users
