# Trial System Testing Checklist

## ✅ Deployment Status

**Code Pushed**: ✅ Successfully pushed to GitHub
**Railway Status**: 🚀 Deploying now
**Migration**: Will run automatically during build

---

## 🧪 Testing Checklist

### **After Railway Deployment Completes (~2-3 minutes):**

#### **Test 1: Trial Banner Display**
- [ ] Visit https://www.robotrecruit.ai
- [ ] Sign in with a free account (tier 1)
- [ ] **Expected**: See trial banner at top of dashboard
  - Shows "Trial: X days left"
  - Shows "X messages remaining today"
  - Has "View Plans & Upgrade" button

#### **Test 2: Message Counting**
- [ ] Go to chat with any bot
- [ ] Send a message
- [ ] **Expected**: Banner updates showing one less message remaining
- [ ] Send 9 more messages (total of 10)
- [ ] **Expected**: Banner shows "0 messages remaining"

#### **Test 3: Daily Limit Modal**
- [ ] Try to send an 11th message
- [ ] **Expected**: Beautiful modal appears:
  - Title: "Daily Limit Reached"
  - Message explaining 10 message limit
  - "View Subscription Plans" button
  - "Close" button
  - Message is NOT sent

#### **Test 4: Trial Expiration (Database Test)**
- [ ] In Railway dashboard → PostgreSQL → Data tab
- [ ] Find your test user
- [ ] Manually set `trialEndsAt` to yesterday's date
- [ ] Try to send a message
- [ ] **Expected**: Modal appears:
  - Title: "Trial Expired"
  - Message about 7-day trial ending
  - Redirect to subscription page

#### **Test 5: Paid User (No Limits)**
- [ ] Upgrade a test account to paid tier
- [ ] **Expected**: Banner disappears
- [ ] Send 20+ messages
- [ ] **Expected**: No limit, all messages send successfully

#### **Test 6: Subscription Cancellation**
- [ ] Cancel a paid subscription
- [ ] **Expected**: User gets 7-day grace period
- [ ] Check database: `trialEndsAt` set to 7 days from cancellation
- [ ] `dailyMessageLimit` set back to 10

---

## 🔍 Monitoring Railway Deployment

### **Check Build Logs:**

1. Go to: https://railway.app/dashboard
2. Click "powerful-enthusiasm"
3. Click "robotrecruit-ai" service
4. Click "Deployments" tab
5. Click on the latest deployment

### **Look For These Lines in Build Logs:**

```
✅ Environment variables loaded from .env
✅ Prisma schema loaded from prisma/schema.prisma
✅ Running Prisma migrations...
✅ Applying migration `20251022000000_add_trial_and_message_limits`
✅ Migration applied successfully
✅ Generated Prisma Client
✅ Build successful
```

### **If Migration Fails:**

Check the logs for errors. Common issues:
- Database connection timeout → Retry deployment
- Migration already applied → Safe to ignore
- Syntax error → Check migration SQL file

---

## 📊 Database Verification

### **Check Migration Was Applied:**

In Railway PostgreSQL Data tab, run:

```sql
-- Check if columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'User'
  AND column_name IN ('trialEndsAt', 'messageCount', 'dailyMessageLimit', 'lastMessageReset');
```

**Expected Output**: 4 rows showing the new columns

### **Check Existing Users Got Trial Dates:**

```sql
SELECT 
  email,
  tier,
  trialEndsAt,
  messageCount,
  dailyMessageLimit,
  stripeCustomerId
FROM "User"
WHERE tier = 1
LIMIT 5;
```

**Expected**: Free users (tier 1, no stripeCustomerId) should have `trialEndsAt` set to 7 days from their `createdAt` date

---

## 🐛 Common Issues & Solutions

### **Banner Not Showing**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check user is tier 1 with no subscription
- Check browser console for errors

### **Limit Not Enforced**
- Verify migration ran successfully
- Check Railway deployment logs
- Verify Prisma client regenerated during build

### **TypeScript Errors Locally**
- Restart your editor (Cursor/VS Code)
- Run: `npx prisma generate`
- Press `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### **Modal Not Appearing**
- Check browser console for JavaScript errors
- Verify ChatInterface.tsx deployed correctly
- Check network tab for API response

---

## 🎉 Success Indicators

✅ **Deployment succeeded** (green checkmark in Railway)
✅ **Migration applied** (visible in build logs)
✅ **Banner shows on free accounts**
✅ **Message counter decrements**
✅ **Limit modal appears at 11th message**
✅ **Paid users have no limits**
✅ **Existing users have trial dates set**

---

## 📈 What Happens Next

### **Automatic Behaviors:**

1. **Every Midnight**: Message counters reset for all users
2. **On Subscription**: Trial cleared, unlimited messages granted
3. **On Cancellation**: 7-day grace period starts, back to 10 msgs/day after
4. **New Signups**: Automatically get 7-day trial from registration

### **User Journey:**

1. User signs up → 7-day trial starts
2. Sees banner with countdown
3. Sends messages, sees counter go down
4. Hits 10 message limit → Sees upgrade prompt
5. Either waits until tomorrow OR subscribes
6. After 7 days → Trial expires, must subscribe to continue

---

## 💡 Next Steps (Optional Enhancements)

- [ ] Email notifications when trial expires
- [ ] Weekly usage summary emails
- [ ] Admin dashboard to view trial statistics
- [ ] A/B test different limit amounts
- [ ] Referral system (earn extra messages)
- [ ] Progress bar showing trial/message usage

---

## 📝 Notes

- **Trial starts from account creation date**, not from feature deployment
- **Existing users** were given trials starting from their original signup date
- **Paid users** immediately get unlimited messages
- **Grace period** helps retain users who cancel subscriptions

---

Your trial and chat limits system is now live! 🚀

Monitor the first few users to ensure everything works as expected, and adjust limits in the schema if needed.

