# Free Trial & Chat Limits Implementation Guide

## 🎉 Implementation Complete!

Your Robot Recruit AI platform now has a comprehensive free trial system with daily message limits to encourage subscriptions.

---

## 📋 What's Been Built

### **1. Database Schema Updates**

Added the following fields to the `User` model in `prisma/schema.prisma`:

```prisma
// Free Trial & Message Limits
trialEndsAt       DateTime?   // When 7-day trial expires (null = trial not started or subscribed)
messageCount      Int         @default(0) // Messages sent today
dailyMessageLimit Int         @default(10) // Free tier: 10 messages/day
lastMessageReset  DateTime?   // When daily counter was last reset
```

**Migration File Created:**
- `prisma/migrations/20251022000000_add_trial_and_message_limits/migration.sql`

### **2. Free Trial Rules**

#### For Free Users (Tier 1, no subscription):
- **7-day trial** from account creation
- **10 messages per day** limit
- Trial countdown shown in dashboard
- Messages remaining counter
- Limits reset at midnight each day

#### For Paid Users (Tier 2+):
- No trial restrictions
- Unlimited messages (daily limit set to 999999)
- Full access to all bots

### **3. API Routes Created/Updated**

#### **Chat API** (`/api/chat/route.ts`)
- Checks trial expiration before sending message
- Checks daily message limit
- Resets daily counter at midnight
- Increments message count for free users
- Returns detailed error messages for limits

#### **Trial Status API** (`/api/user/trial-status/route.ts`)
- Returns trial information (days left, expired status)
- Returns message limits (sent, remaining, limit)
- Used by UI components to display status

### **4. UI Components**

#### **Trial Status Banner** (`src/components/user/TrialStatusBanner.tsx`)
Features:
- Shows trial days remaining
- Shows messages remaining today
- Color-coded by urgency (blue → orange → red)
- Dismissible
- Only shows for free users
- Smart display (hides when plenty of messages/time left)
- Call-to-action button to subscription page

Added to: `src/app/(dashboard)/layout.tsx` - Shows on all dashboard pages

#### **Chat Interface Modal**
Features:
- Beautiful modal with gradient icons
- Shows when trial expires or daily limit reached
- Clear messaging about the issue
- Direct link to subscription page
- Prevents sending messages until limit resets or user subscribes

### **5. Stripe Webhook Updates** (`/api/stripe/webhook/route.ts`)

#### When User Subscribes:
- Clears `trialEndsAt` (no longer in trial)
- Sets `dailyMessageLimit` to 999999 (unlimited)
- Resets `messageCount`
- Upgrades tier

#### When Subscription Cancels:
- Gives 7-day grace period (new trial)
- Restores 10 messages/day limit
- Downgrades to tier 1
- Resets counters

---

## 🚀 Setup Instructions

### **Step 1: Run the Migration**

Since you can't connect to production database locally, you'll need to run the migration manually:

1. Go to your Railway dashboard
2. Navigate to your database
3. Open the PostgreSQL terminal or connect with a client
4. Run the SQL from: `prisma/migrations/20251022000000_add_trial_and_message_limits/migration.sql`

**OR** if you can connect temporarily:

```bash
npx prisma migrate deploy
```

### **Step 2: Regenerate Prisma Client**

After running the migration, regenerate the Prisma client to include the new fields:

```bash
npx prisma generate
```

This will resolve all the TypeScript linter errors.

### **Step 3: Restart Your Development Server**

```bash
npm run dev
```

### **Step 4: Test the System**

1. **Create a test account** (or use existing free account)
2. **Check trial status** - Should show 7 days remaining
3. **Send 10 messages** - Should hit daily limit
4. **Try sending 11th message** - Should show limit modal
5. **Wait until next day** (or manually reset in database) - Counter should reset
6. **Subscribe** - Limits should disappear

---

## 🎯 Key Features

### **For Users:**
- Clear trial countdown
- Real-time message counter
- Beautiful upgrade prompts
- Grace period when subscription cancels
- No surprise limits

### **For You:**
- Encourages subscriptions
- Prevents abuse of free tier
- Fair trial period
- Easy to modify limits
- Comprehensive error handling

---

## 🛠 Customization Options

### Change Trial Duration
In `prisma/schema.prisma` and all API files, find:
```typescript
7 * 24 * 60 * 60 * 1000  // 7 days in milliseconds
```

### Change Daily Message Limit
In `prisma/schema.prisma`:
```prisma
dailyMessageLimit Int @default(10)  // Change 10 to your desired limit
```

### Change Banner Display Logic
In `src/components/user/TrialStatusBanner.tsx`:
```typescript
// Line 53-56: Control when banner shows
if (trial.active && messages.remaining > 3 && trial.daysLeft > 2) {
  return null; // Adjust these numbers
}
```

### Adjust Urgency Colors
In `src/components/user/TrialStatusBanner.tsx`:
```typescript
// Lines 59-60: Control color transitions
const isUrgent = trial.daysLeft <= 1 || messages.remaining <= 2;
const isCritical = trial.expired || messages.remaining === 0;
```

---

## 📊 Database Management

### Check User's Trial Status
```sql
SELECT 
  email,
  tier,
  trialEndsAt,
  messageCount,
  dailyMessageLimit,
  lastMessageReset
FROM "User"
WHERE email = 'user@example.com';
```

### Manually Reset Daily Counter
```sql
UPDATE "User"
SET messageCount = 0,
    lastMessageReset = NOW()
WHERE email = 'user@example.com';
```

### Extend Trial Period
```sql
UPDATE "User"
SET trialEndsAt = NOW() + INTERVAL '7 days'
WHERE email = 'user@example.com';
```

### Give Unlimited Messages (Manual Override)
```sql
UPDATE "User"
SET dailyMessageLimit = 999999
WHERE email = 'user@example.com';
```

---

## 🔍 Testing Scenarios

### Scenario 1: New User
1. Create account → Trial starts automatically
2. `trialEndsAt` set to 7 days from `createdAt`
3. Can send 10 messages/day
4. Banner shows trial countdown

### Scenario 2: Trial Expiring Soon
1. Trial has 1 day left
2. Banner shows orange/urgent state
3. Messages still count down normally
4. Strong upgrade prompt

### Scenario 3: Trial Expired
1. User tries to send message
2. Modal appears: "Trial Expired"
3. Cannot send messages
4. Must subscribe to continue

### Scenario 4: Daily Limit Reached
1. User sends 10 messages today
2. Tries to send 11th message
3. Modal appears: "Daily Limit Reached"
4. Message shows trial days remaining
5. Counter resets at midnight

### Scenario 5: User Subscribes
1. User upgrades to paid plan
2. Webhook fires
3. Trial cleared, unlimited messages
4. Banner disappears
5. Full access

### Scenario 6: Subscription Cancels
1. User cancels subscription
2. Webhook fires
3. Gets 7-day grace period
4. Back to 10 messages/day after grace period
5. Banner reappears

---

## 🐛 Troubleshooting

### Banner Not Showing
- Check user is tier 1 with no subscription
- Check trial is active or limits are low
- Check dismissal state in browser

### Limits Not Working
- Verify migration ran successfully
- Check Prisma client regenerated
- Verify user is tier 1

### Midnight Reset Not Working
- Counter resets on next message send
- Check timezone alignment
- Verify `lastMessageReset` field

### Webhook Not Updating Limits
- Check Stripe webhook secret configured
- Verify webhook endpoint in Stripe dashboard
- Check Railway logs for webhook errors

---

## 📝 Important Notes

1. **Existing Users**: Trial period is set from account creation date, not from when this feature was deployed
2. **Timezone**: Midnight reset uses server timezone
3. **Grace Period**: Cancelled subscribers get a 7-day grace period before limits apply
4. **Power-ups**: Power-up limits are separate from message limits
5. **Premium Bots**: Tier-based bot access is separate from message limits

---

## 🎨 UI/UX Highlights

### Subtle & Non-Intrusive
- Banner only shows when relevant
- Dismissible for better UX
- Color-coded urgency
- Clean, modern design

### Clear Call-to-Actions
- "View Plans & Upgrade" button
- Direct link to subscription page
- Benefits clearly communicated

### Informative
- Days remaining counter
- Messages remaining counter
- Clear expiration dates
- Helpful error messages

---

## 🔒 Security Considerations

1. **Server-Side Validation**: All limits checked server-side (can't be bypassed)
2. **Atomic Updates**: Message counter uses atomic operations
3. **Webhook Verification**: Stripe webhooks verified with signature
4. **User Context**: All checks tied to authenticated user

---

## 📈 Future Enhancements (Optional)

- Weekly summary emails about trial/usage
- Admin dashboard to view trial statistics
- A/B testing different limit amounts
- Temporary limit increases for special events
- Referral rewards (extra messages/days)
- Progressive limits (more features as trial continues)

---

## ✅ Testing Checklist

- [ ] Migration applied to database
- [ ] Prisma client regenerated
- [ ] New users get 7-day trial automatically
- [ ] Existing users get trial from creation date
- [ ] Daily counter resets at midnight
- [ ] 10-message limit enforced
- [ ] Banner shows trial status
- [ ] Modal appears when limits hit
- [ ] Subscription removes limits
- [ ] Cancelled subscription restores limits
- [ ] Webhook handlers working correctly

---

## 🎉 You're All Set!

The free trial and chat limits system is now fully implemented. This will help:
- **Convert free users to paid** through clear value demonstration
- **Prevent abuse** of the free tier
- **Encourage engagement** within reasonable limits
- **Provide clear upgrade path** when users need more

Your users will have a fair trial period to explore the platform, with clear indication of their usage and benefits of upgrading!

