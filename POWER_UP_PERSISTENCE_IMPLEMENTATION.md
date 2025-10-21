# Power-Up Persistence Implementation

## Overview
Implemented per-conversation power-up persistence to ensure users are only charged once per power-up per conversation, and power-ups remain active when switching between conversations.

## Changes Made

### 1. Database Schema Update
**File**: `prisma/schema.prisma`

Added `activePowerUps` field to the `Conversation` model:
```prisma
model Conversation {
  id        String    @id @default(cuid())
  title     String?
  threadId  String?
  userId    String
  user      User      @relation(...)
  botId     String
  bot       Bot       @relation(...)
  messages  Message[]
  activePowerUps Json? @default("[]") // NEW: Array of active power-ups
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

**Migration**: `20251017080430_add_active_powerups_to_conversation`

### 2. Power-Up Activation API Update
**File**: `src/app/api/power-ups/activate/route.ts`

**Key Changes**:
- Check if power-up is already activated for the conversation
- Only charge credits on first activation per conversation
- Save activated power-ups to the conversation record
- Return `alreadyActive` flag in response

**Logic Flow**:
1. User clicks to activate a power-up
2. Check if this power-up is already in the conversation's `activePowerUps` array
3. **If already active**: Don't charge credit, return success with `alreadyActive: true`
4. **If not active**: 
   - Add to conversation's `activePowerUps` array
   - Charge 1 credit
   - Record usage in `PowerUpUsage` table

### 3. New API Endpoint for Loading Power-Ups
**File**: `src/app/api/conversations/[conversationId]/powerups/route.ts`

**Purpose**: Retrieve active power-ups for a specific conversation

**Endpoint**: `GET /api/conversations/:conversationId/powerups`

**Response**:
```json
{
  "activePowerUps": ["fileUpload", "webSearch", "dataExport"]
}
```

### 4. ChatInterface Component Updates
**File**: `src/components/chat/ChatInterface.tsx`

**New Function**: `loadConversationPowerUps()`
- Fetches active power-ups when conversation loads
- Restores UI state to show which power-ups are active
- Automatically called when conversation changes

**Modified Functions**:
- `useEffect()` for conversationId:
  - Loads messages AND power-ups when conversation is selected
  - Clears power-ups when starting new conversation
- `handleNewConversation()`:
  - Resets active power-ups to empty set

## How It Works

### Scenario 1: First Time Activating a Power-Up
```
User: Clicks "File Upload" power-up on Bee Bot conversation
1. Frontend calls /api/power-ups/activate
2. Backend checks conversation.activePowerUps → Empty array
3. Backend charges 1 credit (10 → 9 remaining)
4. Backend adds "fileUpload" to conversation.activePowerUps
5. Frontend shows power-up as active (glowing)
```

### Scenario 2: Page Refresh / Coming Back Later
```
User: Refreshes page or comes back tomorrow
1. Frontend loads conversation via URL param
2. Frontend calls /api/conversations/:id/powerups
3. Backend returns ["fileUpload"]
4. Frontend automatically activates File Upload button
5. No credit charged, power-up shows as active
```

### Scenario 3: Clicking Already Active Power-Up
```
User: Clicks "File Upload" again (already active in this conversation)
1. Frontend calls /api/power-ups/activate
2. Backend checks conversation.activePowerUps → Contains "fileUpload"
3. Backend does NOT charge credit
4. Backend returns { alreadyActive: true, remaining: 9 }
5. User keeps 9 credits
```

### Scenario 4: Switching Conversations
```
User: Has File Upload active in Conversation A
1. User clicks Conversation B in sidebar
2. Frontend loads Conversation B power-ups → Empty
3. File Upload button shows as inactive
4. User can activate it for Conversation B (charges 1 credit)
```

### Scenario 5: New Conversation
```
User: Clicks "New Conversation" button
1. Frontend clears activePowerUps state
2. All power-up buttons show as inactive
3. Clean slate for new conversation
```

## Benefits

✅ **No Double Charging**: Users only pay once per power-up per conversation
✅ **Persistence**: Power-ups remain active across page reloads and sessions
✅ **Per-Conversation Isolation**: Each conversation has its own set of active power-ups
✅ **Aligns with File Uploads**: Files are conversation-specific, power-ups are too
✅ **Clear UX**: Users understand "these power-ups are for THIS conversation"
✅ **Better Value**: Users get more value from their monthly credit allowance

## Database Structure

### Before (Old Behavior):
- Power-ups stored only in React state (lost on refresh)
- Every activation charged a credit
- No way to know which power-ups were used in past conversations

### After (New Behavior):
```
Conversation {
  id: "conv_123"
  threadId: "thread_abc"
  activePowerUps: ["fileUpload", "webSearch"]  // ← NEW
  messages: [...]
}
```

## Credit Tracking

### PowerUpUsage Table
Records when credits are actually charged:
```
{
  userId: "user_1"
  botId: "bee-bot"
  powerUpType: "fileUpload"
  conversationId: "conv_123"
  usedAt: "2024-10-17T08:00:00Z"
}
```

### User Table
Tracks monthly allowance:
```
{
  powerUpAllowance: 10  // Total credits per month
  powerUpUsed: 3        // Credits used this month
  allowanceResetAt: "2024-11-01"
}
```

## Testing Checklist

### Test 1: First Activation
- ✅ Start new conversation
- ✅ Activate File Upload power-up
- ✅ Verify credit deducted (10 → 9)
- ✅ Power-up shows as active

### Test 2: Persistence
- ✅ Activate power-up in conversation
- ✅ Refresh page
- ✅ Power-up still shows as active
- ✅ Credit count unchanged

### Test 3: No Double Charge
- ✅ Activate power-up
- ✅ Click it again (toggle off/on)
- ✅ Verify only 1 credit charged
- ✅ Console shows "already activated" message

### Test 4: Conversation Switching
- ✅ Activate power-up in Conversation A
- ✅ Switch to Conversation B
- ✅ Power-up shows as inactive in B
- ✅ Activate in B → charges 1 credit
- ✅ Switch back to A → still active

### Test 5: New Conversation
- ✅ Click "New Conversation"
- ✅ All power-ups inactive
- ✅ Previous conversation still has its power-ups

## Console Logs for Debugging

When power-ups are loaded:
```
[POWER_UP] Loaded active power-ups for conversation: ["fileUpload", "webSearch"]
```

When power-up is activated for first time:
```
[POWER_UP] Added fileUpload to conversation conv_123
```

When power-up is already active:
```
[POWER_UP] fileUpload already activated for conversation conv_123, not charging credit
```

## API Responses

### POST /api/power-ups/activate (First time)
```json
{
  "success": true,
  "remaining": 9,
  "total": 10,
  "message": "fileUpload activated successfully!",
  "alreadyActive": false
}
```

### POST /api/power-ups/activate (Already active)
```json
{
  "success": true,
  "remaining": 9,
  "total": 10,
  "message": "fileUpload already active for this conversation",
  "alreadyActive": true
}
```

### GET /api/conversations/:id/powerups
```json
{
  "activePowerUps": ["fileUpload", "webSearch", "dataExport"]
}
```

## Future Enhancements

Potential improvements:
1. **Visual Indicator**: Show which conversations have which power-ups in sidebar
2. **Power-Up Summary**: Display total power-ups used in conversation details
3. **Batch Activation**: Activate multiple power-ups at once
4. **Power-Up Presets**: Save favorite power-up combinations
5. **Usage Analytics**: Show user how they're using their credits
6. **Credit Warnings**: Alert when running low on credits
7. **Conversation Templates**: Start new conversations with pre-selected power-ups

## Migration Notes

- Existing conversations will have `activePowerUps` = `[]` (empty array)
- Users will need to re-activate power-ups for old conversations
- This will charge credits, but only once per conversation
- Previous `PowerUpUsage` records remain intact for historical tracking

