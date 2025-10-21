# Power-Up Persistence Testing Guide

## Quick Test Instructions

### Test 1: First-Time Activation (Should Charge Credit)
1. Open Bee Bot chat (http://localhost:3000/chat?bot=bee-bot)
2. Check your power-up credits (should show X/10)
3. Click "File Upload" power-up button
4. **Expected**: 
   - Button glows/highlights (active state)
   - Credits decrease by 1
   - Console shows: `[POWER_UP] Added fileUpload to conversation ...`

### Test 2: Persistence After Refresh (Should NOT Charge)
1. With File Upload active, **refresh the page** (F5)
2. **Expected**:
   - File Upload button is still active/glowing
   - Credits remain the same (not charged again)
   - Console shows: `[POWER_UP] Loaded active power-ups for conversation: ["fileUpload"]`

### Test 3: Re-Clicking Active Power-Up (Should NOT Charge)
1. With File Upload active, click it again
2. **Expected**:
   - Button might toggle off/on (UI behavior)
   - Credits remain the same
   - Console shows: `[POWER_UP] fileUpload already activated for conversation ..., not charging credit`

### Test 4: Switching Conversations (Different Power-Ups)
1. With File Upload active in current conversation
2. Click "New Conversation" in sidebar
3. **Expected**:
   - File Upload button is now inactive/gray
   - Credits unchanged
4. Upload a file and activate File Upload in new conversation
5. **Expected**:
   - Credits decrease by 1 (first time in THIS conversation)
   - File Upload active in new conversation
6. Open conversation history sidebar
7. Click back to first conversation
8. **Expected**:
   - File Upload is still active (was saved)
   - Credits unchanged

### Test 5: Multiple Power-Ups (Tracking Per Conversation)
1. Start new conversation
2. Activate File Upload (charges 1 credit)
3. Activate Web Search (charges 1 credit)
4. Activate Data Export (charges 1 credit)
5. **Total**: 3 credits used
6. Refresh page
7. **Expected**: All 3 power-ups still active, no additional charges
8. Start new conversation
9. **Expected**: All power-ups inactive, need to be activated again

## Console Log Patterns

### When Loading a Conversation
```
[POWER_UP] Loaded active power-ups for conversation: ["fileUpload", "webSearch"]
```

### When Activating for First Time
```
[POWER_UP] Added fileUpload to conversation cmgt123...
```

### When Re-Activating (Already Active)
```
[POWER_UP] fileUpload already activated for conversation cmgt123..., not charging credit
```

## API Request/Response Examples

### Activating Power-Up (First Time)
**Request**:
```
POST /api/power-ups/activate
{
  "botId": "cmgkren3x0001u9k0f5r539pc",
  "powerUpType": "fileUpload",
  "conversationId": "cmgtll8lx001bu9g8ex8iczpr"
}
```

**Response**:
```json
{
  "success": true,
  "remaining": 9,
  "total": 10,
  "message": "fileUpload activated successfully!",
  "alreadyActive": false
}
```

### Activating Power-Up (Already Active)
**Request**: Same as above

**Response**:
```json
{
  "success": true,
  "remaining": 9,
  "total": 10,
  "message": "fileUpload already active for this conversation",
  "alreadyActive": true
}
```

### Loading Conversation Power-Ups
**Request**:
```
GET /api/conversations/cmgtll8lx001bu9g8ex8iczpr/powerups
```

**Response**:
```json
{
  "activePowerUps": ["fileUpload", "webSearch", "dataExport"]
}
```

## Database Verification

### Check Conversation Power-Ups
```sql
SELECT id, title, "activePowerUps" 
FROM "Conversation" 
WHERE id = 'cmgtll8lx001bu9g8ex8iczpr';
```

**Expected Result**:
```
id                        | title           | activePowerUps
--------------------------+-----------------+-------------------
cmgtll8lx001bu9g8ex8iczpr | what do bees... | ["fileUpload", "webSearch"]
```

### Check Power-Up Usage Records
```sql
SELECT "userId", "botId", "powerUpType", "conversationId", "usedAt"
FROM "PowerUpUsage"
WHERE "conversationId" = 'cmgtll8lx001bu9g8ex8iczpr'
ORDER BY "usedAt" DESC;
```

**Expected Result**: One record per unique power-up activation

### Check User Credits
```sql
SELECT "powerUpAllowance", "powerUpUsed", "allowanceResetAt"
FROM "User"
WHERE "clerkId" = 'user_...';
```

## Common Issues & Solutions

### Issue 1: Power-Ups Not Persisting
**Symptoms**: Power-ups reset on page refresh
**Check**: 
- Console for errors when calling `/api/conversations/:id/powerups`
- Database: conversation record has `activePowerUps` field
**Solution**: Make sure Prisma client was regenerated after schema change

### Issue 2: Credits Charged Multiple Times
**Symptoms**: Credits decrease every time you click a power-up
**Check**: Console for `[POWER_UP] already activated...` message
**Solution**: Verify conversation ID is being passed to activation API

### Issue 3: Power-Ups Not Loading
**Symptoms**: Blank state even though conversation has power-ups
**Check**: 
- Network tab for API call to `/powerups` endpoint
- Response data structure
**Solution**: Verify `loadConversationPowerUps()` is being called in useEffect

### Issue 4: Wrong Power-Ups Showing
**Symptoms**: Power-ups from one conversation appear in another
**Check**: Console for conversation ID being used in API calls
**Solution**: Verify `conversationId` state is updating correctly

## Expected Behavior Summary

| Action | Credits Charged? | Power-Ups Persist? | Notes |
|--------|------------------|-------------------|-------|
| First activation in conversation | ✅ Yes (1 credit) | ✅ Yes | Saved to database |
| Page refresh | ❌ No | ✅ Yes | Loaded from database |
| Re-click active power-up | ❌ No | ✅ Yes | Already in database |
| Switch to different conversation | ❌ No | ❌ No | Different conversation |
| Activate in different conversation | ✅ Yes (1 credit) | ✅ Yes | New conversation record |
| New conversation | N/A | ❌ No | Clean slate |

## Success Criteria

✅ **Per-Conversation Persistence**: Power-ups stay active within their conversation
✅ **No Double Charging**: Only charged once per power-up per conversation  
✅ **Isolation**: Each conversation has independent power-up state
✅ **Page Refresh**: Power-ups reload correctly after refresh
✅ **Conversation Switching**: Correct power-ups show for each conversation
✅ **Credit Tracking**: User credits accurately reflect actual usage

## Quick Verification Checklist

- [ ] Activate power-up → Credits decrease
- [ ] Refresh page → Power-up still active, credits same
- [ ] Click power-up again → No credit charge
- [ ] New conversation → Power-ups inactive
- [ ] Switch back → Original power-ups still active
- [ ] Console logs show correct behavior
- [ ] Database records match UI state

