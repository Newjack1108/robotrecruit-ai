# Stripe Setup Instructions for RobotRecruit AI

## Step 1: Create Stripe Account

1. Visit https://stripe.com and click "Sign up"
2. Choose "Start now" for businesses
3. Complete your business information
4. Verify your email address

## Step 2: Get Your API Keys

### For Testing (Development):

1. Go to https://dashboard.stripe.com/test/apikeys
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - Click "Reveal test key"
3. Copy both keys

### For Production (Later):

1. Go to https://dashboard.stripe.com/apikeys
2. Get your live keys (starts with `pk_live_` and `sk_live_`)
3. **Important**: Only use live keys when you're ready to accept real payments!

## Step 3: Create Your Products & Prices

### Create Pro Plan:

1. Go to https://dashboard.stripe.com/test/products
2. Click "+ Add product"
3. Fill in:
   - **Name**: `RobotRecruit Pro Plan`
   - **Description**: `Pro tier with 5 bots and advanced features`
   - **Pricing Model**: `Standard pricing`
   - **Price**: `9.99` (or your chosen price)
   - **Currency**: `GBP` (or USD/EUR)
   - **Billing period**: `Monthly`
4. Click "Add product"
5. **Copy the Price ID** (starts with `price_`) - You'll need this!

### Create Premium Plan:

1. Click "+ Add product" again
2. Fill in:
   - **Name**: `RobotRecruit Premium Plan`
   - **Description**: `Premium tier with unlimited bots and all features`
   - **Pricing Model**: `Standard pricing`
   - **Price**: `19.99` (or your chosen price)
   - **Currency**: `GBP` (or USD/EUR)
   - **Billing period**: `Monthly`
3. Click "Add product"
4. **Copy the Price ID** (starts with `price_`) - You'll need this!

## Step 4: Configure Webhooks

Webhooks allow Stripe to notify your app when events happen (like successful payments).

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "+ Add endpoint"
3. **Endpoint URL**: Enter your app URL + `/api/webhooks/stripe`
   - **Local development**: `http://localhost:3000/api/webhooks/stripe`
   - **Production**: `https://yourdomain.com/api/webhooks/stripe`
   
4. **Events to send**: Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Click "Add endpoint"
6. **Copy the Signing secret** (starts with `whsec_`) - You'll need this!

### Important for Local Development:

For testing webhooks locally, you need the Stripe CLI:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe login`
3. Run: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. This will give you a webhook signing secret for local testing

## Step 5: Update Your Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Test Keys (for development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_YOUR_PRO_PRICE_ID_HERE
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_YOUR_PREMIUM_PRICE_ID_HERE

# Admin Email (for admin panel access)
ADMIN_EMAILS=your-email@example.com
```

## Step 6: Restart Your Application

After updating `.env.local`:

```bash
# Stop your dev server (Ctrl+C)
# Then restart it:
npm run dev
```

## Step 7: Test the Integration

1. Visit your admin panel: http://localhost:3000/admin/integrations
2. Check that Stripe shows as "Configured" ✅
3. Visit: http://localhost:3000/admin/stripe
4. Click "Test Stripe Connection" to verify your keys work

## Step 8: Test a Subscription

1. Go to: http://localhost:3000/subscription
2. Click "Upgrade to Pro"
3. Use Stripe test card: `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g., 12/34)
   - **CVC**: Any 3 digits (e.g., 123)
   - **ZIP**: Any 5 digits (e.g., 12345)
4. Complete the checkout
5. You should be redirected back and see your Pro tier activated!

## Stripe Test Cards

Use these for testing different scenarios:

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires Authentication (3D Secure)**: `4000 0025 0000 3155`
- **Insufficient Funds**: `4000 0000 0000 9995`

Full list: https://stripe.com/docs/testing

## Step 9: Going Live (Production)

When you're ready to accept real payments:

1. Complete Stripe account verification
2. Get your **live** API keys from https://dashboard.stripe.com/apikeys
3. Create live products & prices
4. Update webhook endpoint to your production URL
5. Update `.env.local` with live keys (or set in Vercel environment variables)
6. **Test thoroughly** before announcing!

## Troubleshooting

### Issue: "Stripe keys not configured"
- Check that all environment variables are set correctly
- Ensure no extra spaces or quotes
- Restart your dev server after changes

### Issue: "Webhook signature verification failed"
- Make sure you're using the webhook secret from the correct endpoint
- For local dev, use the Stripe CLI webhook secret
- Check that your endpoint URL matches exactly

### Issue: "Price not found"
- Verify your Price IDs are correct
- Make sure you're using test price IDs with test keys
- Check currency matches (GBP vs USD)

### Issue: Payments not updating user tier
- Check webhook is properly configured
- View webhook logs in Stripe dashboard
- Check your server logs for errors
- Verify the webhook secret is correct

## Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Stripe Support**: https://support.stripe.com
- **Test Mode vs Live Mode**: Always use test mode until ready!

---

## Quick Checklist

- [ ] Created Stripe account
- [ ] Got API keys (publishable & secret)
- [ ] Created Pro product & copied price ID
- [ ] Created Premium product & copied price ID
- [ ] Set up webhook endpoint
- [ ] Copied webhook signing secret
- [ ] Added all keys to `.env.local`
- [ ] Restarted dev server
- [ ] Tested connection in admin panel
- [ ] Tested subscription with test card
- [ ] Verified webhook is receiving events

Once all checked, you're ready to go! 🚀

