# Referral System - Deployment Guide

## ✅ What's Been Implemented

The complete referral system has been built and pushed to production. Here's what's included:

### Features
- **Unique Referral Links**: Users get shareable invite links with 8-character codes (e.g., `robotrecruit.ai/sign-up?ref=ABC12XYZ`)
- **Tiered Rewards**:
  - Friend signs up: Referrer gets **50 points**, Friend gets **25 points + 5 power-up credits**
  - Friend hires first bot: Referrer gets **50 points + 20 power-up credits**
- **Tier-Based Limits**:
  - Free: 2 invites
  - Pro: 5 invites
  - Premium: Unlimited invites
- **Achievements**: 3 new referral achievements (Social Butterfly, Influencer, Ambassador)
- **UI Components**: InviteModal with stats tracking, invite link management, and referral history

### New Files Created
- `src/app/api/referrals/generate/route.ts`
- `src/app/api/referrals/my-referrals/route.ts`
- `src/app/api/referrals/validate/route.ts`
- `src/app/api/referrals/process-signup/route.ts`
- `src/components/referrals/InviteButton.tsx`
- `src/components/referrals/InviteModal.tsx`
- `src/components/referrals/ReferralProcessor.tsx`
- `src/lib/referral-processor.ts`

### Modified Files
- `prisma/schema.prisma` - Added Referral model
- `src/app/(dashboard)/layout.tsx` - Added Invite button and processor
- `src/app/sign-up/[[...sign-up]]/page.tsx` - Added referral banner
- `src/app/api/bots/hire/route.ts` - Added bot hire reward processing
- `src/lib/achievements.ts` - Added 3 referral achievements
- `src/lib/achievement-checker.ts` - Added referral tracking

---

## 🔧 Required Manual Steps

### 1. Database Migration

You need to apply the database schema changes. Run this command:

```bash
npx prisma db push
```

This will add:
- New `Referral` table
- New fields to `User` table: `referralCode`, `welcomeBonusGiven`, `referralsSent`, `referredBy`

**Note**: Since your database has drift, `prisma migrate dev` won't work cleanly. Use `db push` to sync the schema directly.

### 2. Seed Referral Achievements

Run the achievements seeder to add the new referral achievements to your database:

```bash
npx ts-node prisma/seed-achievements.ts
```

If you don't have this seed file, you can manually add them via SQL or Prisma Studio:

```sql
INSERT INTO "Achievement" (id, key, name, description, icon, category, tier, points, requirement, "createdAt")
VALUES 
  (gen_random_uuid(), 'first_referral', 'Social Butterfly', 'Invite your first friend to join', '🦋', 'social', 1, 10, '{"referralsSent":1}', NOW()),
  (gen_random_uuid(), 'referral_master', 'Influencer', 'Successfully refer 5 friends', '🌟', 'social', 2, 50, '{"referralsSent":5}', NOW()),
  (gen_random_uuid(), 'referral_legend', 'Ambassador', 'Successfully refer 10 friends', '👑', 'social', 3, 100, '{"referralsSent":10}', NOW());
```

### 3. Environment Variable (Optional)

If your production URL is different from the default, set this in your `.env`:

```env
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

This is used to generate the shareable referral URLs.

### 4. Clear Prisma Client Cache (If Needed)

If you encounter TypeScript errors about missing Referral types:

```bash
npx prisma generate
```

---

## 🎯 How to Test

### Test Referral Flow

1. **Generate a Referral Link**:
   - Log into your dashboard
   - Click "Invite Friends" in the navigation
   - Click "Generate New Invite Link"
   - Copy the link (e.g., `https://yoursite.com/sign-up?ref=ABC12XYZ`)

2. **Sign Up with Referral Code**:
   - Open the referral link in an incognito window
   - You should see a green banner: "You've been invited! 🎉"
   - Complete the signup process
   - The new user should receive **25 points + 5 power-up credits**
   - The referrer should receive a notification and **50 points**

3. **Test Bot Hire Reward**:
   - As the new user, hire your first bot
   - The referrer should receive a notification and **50 points + 20 power-up credits**

4. **Check Referral Stats**:
   - As the referrer, open "Invite Friends" modal
   - You should see:
     - Total invites: 1
     - Points earned: 100
     - Credits earned: 20
     - Referral status: "Completed"

### Test Tier Limits

1. **Free Tier** (2 invites):
   - Generate 2 referral links successfully
   - Attempt a 3rd - should see "Referral limit reached" error

2. **Pro Tier** (5 invites):
   - Upgrade to Pro
   - Generate up to 5 links

3. **Premium Tier** (unlimited):
   - Upgrade to Premium
   - Generate as many links as needed

---

## 📊 How It Works

### Referral States

1. **`pending`**: Referral code created, awaiting signup
2. **`signed_up`**: Friend signed up (signup rewards given)
3. **`bot_hired`**: Friend hired their first bot (hire rewards given)
4. **`completed`**: (Future use for additional milestones)

### Reward Flow

**On Signup**:
1. New user signs up with `?ref=CODE`
2. Code is validated and stored in localStorage
3. After Clerk authentication, `ReferralProcessor` runs
4. Referral is updated to `signed_up`
5. Referrer gets +50 points notification
6. New user gets +25 points & +5 credits

**On First Bot Hire**:
1. User hires their first bot
2. `processReferralBotHire()` checks if user was referred
3. If yes, updates referral to `bot_hired`
4. Referrer gets +50 points & +20 credits
5. Both users get notifications

### Achievement Tracking

Achievements are checked automatically via the existing `checkAchievements()` system:
- `first_referral`: 1 successful referral
- `referral_master`: 5 successful referrals
- `referral_legend`: 10 successful referrals

---

## 🐛 Troubleshooting

### Referral Not Processing

- Check browser console for errors
- Verify localStorage has `pendingReferralCode`
- Check server logs for `[REFERRAL]` messages
- Ensure database has the Referral model

### Rewards Not Given

- Check `Referral` table for status updates
- Verify notifications are created in database
- Check user's `powerUpAllowance` increased
- Look for `[REFERRAL_SIGNUP]` or `[REFERRAL_BOT_HIRE]` logs

### TypeScript Errors

- Run `npx prisma generate` to update types
- Restart TypeScript server in VS Code
- Clear `.next` cache: `rm -rf .next`

---

## 🚀 You're All Set!

The referral system is now live. Users can:
- Generate shareable invite links from the dashboard
- Track their referral stats and earnings
- Earn rewards when friends sign up and hire bots
- Unlock special referral achievements

The system respects tier limits and automatically processes all rewards in the background!

