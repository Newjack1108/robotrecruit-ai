# Power-Up Credits Not Showing - Webhook Fix

## Problem
Purchased power-up credits but they're not appearing in the account.

## Root Cause
The power-up purchase webhook (`/api/stripe/webhook-powerup`) requires a **separate webhook secret** (`STRIPE_WEBHOOK_SECRET_POWERUP`) that isn't configured in Railway yet.

## Immediate Fix (Manual Credit)

First, let's manually credit your account while we fix the webhook:

```bash
# Run this locally (replace with your email):
npx tsx scripts/manual-credit-powerups.ts your-email@example.com 10

# Or on Railway:
railway run npx tsx scripts/manual-credit-powerups.ts your-email@example.com 10
```

## Permanent Fix (Configure Webhook)

### Step 1: Create Power-Up Webhook in Stripe

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"+ Add endpoint"**
3. Enter webhook URL:
   ```
   https://robotrecruit-ai-production.up.railway.app/api/stripe/webhook-powerup
   ```
   (Replace with your actual Railway domain)

4. Select **only this event**:
   - ✅ `checkout.session.completed`

5. Click **"Add endpoint"**

6. **Copy the Signing Secret** (starts with `whsec_...`)

### Step 2: Add Environment Variable to Railway

1. Go to Railway Dashboard → Your Project → Variables
2. Click **"+ New Variable"**
3. Add:
   ```
   Name: STRIPE_WEBHOOK_SECRET_POWERUP
   Value: whsec_YOUR_SIGNING_SECRET_HERE
   ```
4. Click **"Save"**
5. Railway will automatically redeploy

### Step 3: Verify Webhook Works

1. Make a test purchase (use Stripe test card if in test mode: `4242 4242 4242 4242`)
2. Check Stripe Dashboard → Webhooks → Your endpoint
3. You should see webhook events being sent
4. Click on an event to see if it succeeded (200 response) or failed

### Step 4: Test on Your Account

After the webhook is configured, test by:

1. Visit `/powerups/purchase`
2. Purchase the smallest package (£3.99)
3. Complete checkout
4. Credits should appear within seconds
5. Check notifications - you should see "Power-Up Credits Added! 🎉"

## Current Webhooks Status

You should have **TWO webhooks** in Stripe:

| Webhook | URL | Events | Secret Env Var |
|---------|-----|--------|----------------|
| Subscriptions | `/api/stripe/webhook` | `checkout.session.completed`, `customer.subscription.*`, `invoice.*` | `STRIPE_WEBHOOK_SECRET` |
| Power-ups | `/api/stripe/webhook-powerup` | `checkout.session.completed` | `STRIPE_WEBHOOK_SECRET_POWERUP` |

## Verification Script

Check your current power-up balance:

```bash
# Locally:
npx tsx scripts/check-stripe-payments.ts your-email@example.com

# On Railway:
railway run npx tsx scripts/check-stripe-payments.ts your-email@example.com
```

## If Payment Already Went Through

If Stripe already charged you but credits weren't added:

1. Check Stripe Dashboard → Payments to verify the payment succeeded
2. Run the manual credit script with the number of credits from your purchase
3. Configure the webhook so future purchases work automatically

## Credit Amounts by Package

- **Starter Pack**: £3.99 = 10 credits
- **Pro Pack**: £7.99 = 25 credits  
- **Power Pack**: £14.99 = 60 credits
- **Ultimate Pack**: £24.99 = 120 credits

## Support

If you need immediate help, provide:
1. Your email address
2. Stripe payment ID (from confirmation email)
3. Package purchased
4. Timestamp of purchase

I can manually credit your account while the webhook is being configured.

