# Bot Tools Testing Guide

## Prerequisites
- Development server running (`npm run dev`)
- User account created
- Database synced with latest schema

## Test Scenarios

### 1. Chef Bot Tools

#### Test 1.1: Timers
1. Navigate to Chef Bot chat
2. Verify tools panel appears below chat
3. Click "Bot Tools" to expand if collapsed
4. **Timer 1:**
   - Enter "5" minutes in Timer 1
   - Click "Start"
   - Verify countdown displays (5:00, 4:59, 4:58...)
   - Click pause button - verify timer stops
   - Click play button - verify timer resumes
   - Click reset button - verify timer returns to 5:00
5. **Timer 2:**
   - Set Timer 2 to "10" minutes
   - Start Timer 2
   - Verify both timers run independently
6. **Notification:**
   - Set timer to 1 minute
   - Wait for completion
   - Verify browser notification appears

#### Test 1.2: Ingredients Board
1. In ingredients section, type "Tomatoes"
2. Press Enter or click "+"
3. Verify "Tomatoes" appears in list
4. Add multiple ingredients: "Garlic", "Olive Oil", "Pasta"
5. Click X button next to "Garlic"
6. Verify "Garlic" is removed
7. Refresh page and reopen conversation
8. Verify ingredients persist

#### Test 1.3: Recipe Notes
1. Type recipe instructions in "Recipe Notes" field
2. Add multiple lines of text
3. Close conversation
4. Reopen conversation
5. Verify recipe notes are saved

#### Test 1.4: AI Integration
1. Add ingredients: "Chicken", "Broccoli"
2. Send message: "Can you suggest a recipe using my ingredients?"
3. Verify AI mentions the ingredients in response

### 2. Fishing Bot Tools

#### Test 2.1: Venue Selection
1. Navigate to Fishing Bot chat
2. Expand Bot Tools
3. Enter venue name: "Lake Michigan"
4. Verify location displays

#### Test 2.2: Weather Widget
1. With venue set, click "Get Weather"
2. Wait for weather data to load
3. Verify displays:
   - Temperature
   - Weather condition
   - Air pressure
   - Humidity
   - Wind speed
4. Try different location: "Thames River"
5. Verify new weather data loads

#### Test 2.3: Catch Log
1. Click "Log Catch" button
2. Fill in form:
   - Species: "Bass"
   - Weight: "5 lbs"
   - Length: "18 inches"
   - Notes: "Caught on spinner bait"
3. Click "Save Catch"
4. Verify catch appears in log with:
   - Species name
   - Weight and length
   - Date and time
   - Notes
5. Add multiple catches
6. Verify all display in chronological order

#### Test 2.4: Data Persistence
1. Log 3 catches
2. Close conversation
3. Reopen conversation
4. Verify all catches still appear
5. Verify venue and weather persist

### 3. Bee Bot Tools

#### Test 3.1: Inspection Form
1. Navigate to Bee Bot chat
2. Click "New Inspection"
3. **Colony Strength:**
   - Click strength level 4
   - Verify button highlights
4. **Queen Spotted:**
   - Click "Yes"
   - Verify button turns green
5. **Brood Pattern:**
   - Select "Good"
   - Verify selection highlights
6. **Honey Stores:**
   - Select "Adequate"
7. **Pest Signs:**
   - Click "Yes"
   - Verify notes field appears
   - Type: "Varroa mites detected"
8. **Health Notes:**
   - Type: "Colony appears strong overall"
9. Click "Save Inspection"
10. Verify form closes

#### Test 3.2: Inspection History
1. After saving inspection, verify it appears in history
2. Check display shows:
   - Date and time
   - Health status indicator
   - Strength rating
   - Queen status
   - Brood pattern
   - Honey stores
   - Pest notes (if any)
   - Health notes
3. Create 3 more inspections with different values
4. Verify all appear in reverse chronological order
5. Verify health color changes based on scores:
   - Green for healthy (high scores)
   - Yellow for moderate
   - Red for concerning (low scores or pests)

### 4. Tools Panel Behavior

#### Test 4.1: Collapse/Expand
1. Click "Bot Tools" header
2. Verify panel collapses
3. Click header again
4. Verify panel expands

#### Test 4.2: Bot Detection
1. Chat with Boss Bot (no tools)
2. Verify tools panel doesn't appear
3. Switch to Chef Bot
4. Verify Chef tools appear
5. Switch to Fishing Bot
6. Verify Fishing tools appear

### 5. Conversation History

#### Test 5.1: Tool Indicators
1. Create conversation with Chef Bot
2. Use any tool (add ingredient)
3. Go back to dashboard
4. Open conversation history
5. Verify wrench icon and tool count appear

#### Test 5.2: Multiple Conversations
1. Create 3 conversations with Chef Bot
2. Use tools in 2 of them
3. Verify only 2 show tool indicators
4. Verify correct tool counts

### 6. Tools Dashboard

#### Test 6.1: Access Dashboard
1. Navigate to `/tools`
2. Verify page loads
3. Verify title: "Bot Tools Dashboard"

#### Test 6.2: Session Display
1. Create tool sessions with:
   - Chef Bot (timers, ingredients)
   - Fishing Bot (catches)
   - Bee Bot (inspections)
2. Visit `/tools` dashboard
3. Verify all 3 sessions appear
4. Check each card shows:
   - Bot avatar and name
   - Tool summary
   - Last updated date/time
   - Tool count badge

#### Test 6.3: Navigation
1. Click on a session card
2. Verify navigates to conversation
3. Verify conversation loads with tools
4. Verify tool data is present

#### Test 6.4: Empty State
1. Create new user account
2. Visit `/tools`
3. Verify empty state message
4. Verify "Start Chatting" button present

### 7. AI Context Integration

#### Test 7.1: Chef Bot Context
1. Set timer to 30 minutes
2. Add ingredients: "Rice", "Chicken", "Soy Sauce"
3. Ask: "What can you help me make?"
4. Verify AI mentions your ingredients
5. Ask: "How long until my timer is done?"
6. Verify AI references timer

#### Test 7.2: Fishing Bot Context
1. Set venue to "Colorado River"
2. Log catch: "Rainbow Trout, 2 lbs"
3. Ask: "What's the weather like?"
4. Verify AI references venue
5. Ask: "What have I caught so far?"
6. Verify AI mentions trout catch

#### Test 7.3: Bee Bot Context
1. Complete inspection with strength 5, queen spotted
2. Ask: "How is my hive doing?"
3. Verify AI references latest inspection
4. Complete second inspection with strength 2, no queen
5. Ask: "Should I be concerned?"
6. Verify AI references decline in condition

### 8. Edge Cases

#### Test 8.1: Concurrent Timers
1. Start Timer 1 at 10 minutes
2. Start Timer 2 at 5 minutes
3. Verify Timer 2 finishes first
4. Verify Timer 1 continues running
5. Verify correct notifications

#### Test 8.2: Long Content
1. **Ingredients:** Add 20+ ingredients
2. Verify scrolling works
3. **Recipe:** Add 1000+ characters
4. Verify saves and displays correctly
5. **Catches:** Log 10+ catches
6. Verify all display

#### Test 8.3: Special Characters
1. Add ingredient: "Oil & Vinegar"
2. Add catch notes: "Caught near bridge #5 @ 6:00 PM"
3. Add inspection notes with emojis: "Great day! 🐝✨"
4. Verify all save and display correctly

#### Test 8.4: Network Issues
1. Disconnect internet
2. Try to fetch weather
3. Verify error handling
4. Reconnect internet
5. Verify normal operation resumes

### 9. Mobile Responsiveness

#### Test 9.1: Mobile View
1. Open dev tools
2. Switch to mobile device view (iPhone/Android)
3. Test all tool components:
   - Timers display correctly
   - Ingredients list scrolls
   - Recipe textarea resizes
   - Inspection form buttons fit
4. Verify collapse/expand works on mobile

### 10. Performance

#### Test 10.1: Load Time
1. Create conversation with 100+ messages
2. Add 20+ tool items
3. Reopen conversation
4. Verify tools load within 2 seconds

#### Test 10.2: Timer Accuracy
1. Set timer for 10 minutes
2. Use stopwatch to verify accuracy
3. Verify completes within 1 second of target

## Expected Results

✅ All tools function without errors
✅ Data persists across sessions
✅ AI successfully references tool data
✅ UI is responsive and smooth
✅ No console errors
✅ No TypeScript errors
✅ Notifications work (with permission)
✅ Weather API responds correctly
✅ Dashboard displays all sessions
✅ Conversation history shows indicators

## Bug Report Template

If issues found:

```
**Bug**: [Brief description]
**Bot**: Chef Bot / Fishing Bot / Bee Bot
**Tool**: Timers / Ingredients / Weather / etc.
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected**: [What should happen]
**Actual**: [What actually happened]
**Console Errors**: [Any errors in browser console]
**Screenshots**: [If applicable]
```

## Success Criteria

- ✅ All test scenarios pass
- ✅ No critical bugs
- ✅ Performance acceptable
- ✅ UX smooth and intuitive
- ✅ Data integrity maintained
- ✅ AI integration working

