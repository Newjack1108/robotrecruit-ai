# Subscription Payment Testing Guide

## 🎯 Overview
Testing the subscription payment flow to ensure it properly upgrades user tiers and adds bonus power-up credits.

## 📋 What Subscriptions Include

### Pro Plan (£9.99/month) - Tier 2
- Unlimited messages (999,999/day)
- Access to all system bots
- +25 bonus power-up credits on signup
- Premium support

### Premium Plan (£19.99/month) - Tier 3
- Everything in Pro
- Access to custom bot creation
- +50 bonus power-up credits on signup
- Priority support

## 🔧 Prerequisites

### 1. Stripe Account Setup
Ensure you have:
- ✅ Stripe account created
- ✅ Test mode enabled (for testing)
- ✅ Price IDs created for Pro & Premium plans
- ✅ Environment variables set

### 2. Required Environment Variables
Check Railway has these set:
```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...  (or sk_live_... for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Price IDs
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_...

# Webhook Secret (IMPORTANT!)
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=https://your-railway-domain.up.railway.app
```

### 3. Webhook Configuration
**CRITICAL**: The subscription webhook MUST be configured in Stripe!

#### Go to: https://dashboard.stripe.com/webhooks

#### Check if you have a webhook endpoint:
- **URL**: `https://your-railway-domain.up.railway.app/api/stripe/webhook`
- **Events**: 
  - ✅ `checkout.session.completed`
  - ✅ `customer.subscription.created`
  - ✅ `customer.subscription.updated`
  - ✅ `customer.subscription.deleted`
  - ✅ `invoice.payment_succeeded`
  - ✅ `invoice.payment_failed`

#### If NOT configured:
1. Click **"+ Add endpoint"**
2. Enter the URL above
3. Select all the events listed
4. Copy the **Signing Secret** (starts with `whsec_...`)
5. Add to Railway as `STRIPE_WEBHOOK_SECRET`

## 🧪 Testing Steps

### Test 1: View Subscription Page
1. Go to: `/subscription`
2. **Expected**: Should see pricing cards for Pro & Premium plans
3. **Verify**: Current tier is displayed (should be "Free" initially)

### Test 2: Test Checkout Flow (Test Mode)
Use Stripe test cards for testing:

1. Click **"Upgrade to Pro"** or **"Upgrade to Premium"**
2. **Expected**: Redirects to Stripe checkout
3. **Use test card**: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
4. Complete checkout
5. **Expected**: Redirects back to `/subscription?success=true`

### Test 3: Verify Tier Upgrade
After successful checkout:

1. Check your user profile/dashboard
2. **Expected Changes**:
   - Tier upgraded (Free → Pro or Premium)
   - Daily message limit increased to 999,999
   - Trial ended (trialEndsAt set to null)
   - Bonus power-up credits added:
     - Pro: +25 credits
     - Premium: +50 credits

3. **Check Notifications**:
   - Visit notifications page
   - Should see: "🚀 Tier Upgraded!"

### Test 4: Verify Database Updates
Check your account using the admin tools:

```bash
# On Railway:
railway run npx tsx scripts/check-stripe-payments.ts your-email@example.com
```

**Expected Output**:
```
👤 User Info:
   Tier: 2 (or 3)
   Stripe Customer ID: cus_...
   
⚡ Power-Up Credits:
   Total Allowance: 25 (or 50)
   Used: 0
   Remaining: 25 (or 50)
```

### Test 5: Test Power-Ups Work
1. Go to chat with any bot
2. Click a power-up (e.g., Web Search)
3. **Expected**: Activates successfully (uses 1 credit)
4. **Verify**: Credit count decreases (24/25 remaining)

### Test 6: Manage Subscription
1. Go back to `/subscription`
2. Click **"Manage Subscription"** button
3. **Expected**: Opens Stripe Customer Portal
4. **Verify**: Can view invoice, update payment method, cancel subscription

## 🚨 Troubleshooting

### Issue: "Failed to create checkout session"
**Cause**: Missing or invalid Stripe keys
**Fix**: 
1. Check Railway environment variables
2. Verify Price IDs are correct
3. Check Stripe API keys are valid

### Issue: Checkout succeeds but tier doesn't upgrade
**Cause**: Webhook not configured or failing
**Fix**:
1. Go to Stripe Dashboard → Webhooks
2. Check if endpoint exists for `/api/stripe/webhook`
3. View recent events - look for failures (red X)
4. If webhook missing, configure as described above
5. Verify `STRIPE_WEBHOOK_SECRET` matches in Railway

### Issue: "No power-up credits added"
**Cause**: Webhook processed but credit logic failed
**Check**:
1. Stripe webhook logs (Dashboard → Webhooks → Event)
2. Railway logs: `railway logs | grep STRIPE_WEBHOOK`
3. Verify tier upgrade credits are configured in `/lib/powerup-credits.ts`

### Issue: Can't test with real card in test mode
**Solution**: 
- Test mode only accepts test cards
- Use: `4242 4242 4242 4242` (Visa)
- Or: `5555 5555 5555 4444` (Mastercard)
- Full list: https://stripe.com/docs/testing

## 📊 Monitoring Webhook Events

### In Stripe Dashboard:
1. Go to: Developers → Webhooks
2. Click on your webhook endpoint
3. View recent events
4. Click any event to see:
   - Request body
   - Response status
   - Retry attempts

### Success Indicators:
- ✅ Green checkmark = 200 response
- ⏱️ Clock = Processing
- ❌ Red X = Failed (click to see error)

## 🎉 Success Checklist

After testing, verify:
- [ ] Subscription checkout completes successfully
- [ ] User tier upgrades in database
- [ ] Bonus power-up credits added
- [ ] Message limit increased to 999,999
- [ ] Trial period cleared
- [ ] Notification created
- [ ] Can activate power-ups with credits
- [ ] Stripe Customer Portal accessible
- [ ] Can cancel subscription (tier downgrades)

## 💡 Tips

### For Test Mode:
- Always use test API keys (sk_test_, pk_test_)
- Use test cards only
- No real money charged
- Can create unlimited test subscriptions

### For Production:
- Switch to live API keys (sk_live_, pk_live_)
- Update webhook URL to production domain
- Create new webhook with live signing secret
- Real cards required
- Real charges occur!

## 🔐 Security Notes

- Never commit API keys to git
- Use environment variables only
- Webhook secret must match Stripe exactly
- Verify webhook signatures (already implemented)
- Use HTTPS for webhook endpoints (Railway provides this)

## 📞 Support

If subscriptions aren't working after following this guide:

1. **Check Stripe Dashboard**:
   - Recent payments
   - Webhook events
   - Customer list

2. **Check Railway Logs**:
   ```bash
   railway logs | grep -i stripe
   ```

3. **Test Webhook Manually**:
   - Stripe Dashboard → Webhooks → Send test webhook
   - Check response in Railway logs

4. **Use Admin Manual Credit** (temporary fix):
   - Go to `/admin/manual-credit`
   - Add credits manually while debugging webhook

