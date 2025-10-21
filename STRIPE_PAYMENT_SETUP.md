# Stripe Payment System Setup Guide

## 🎉 **Stripe Integration Complete!**

Your Robot Recruit AI platform now has a fully functional Stripe payment system for subscription management!

---

## 📋 **What's Been Built:**

### **1. Database Schema**
- ✅ Added subscription tracking fields to User model:
  - `stripeSubscriptionId` - Stripe subscription ID
  - `subscriptionStatus` - active, canceled, past_due, etc.
  - `subscriptionEndDate` - When subscription ends (for canceled)

### **2. API Routes Created**

#### **Checkout Session** (`/api/stripe/create-checkout-session`)
- Creates Stripe checkout session for new subscriptions
- Handles Pro (£9.99) and Premium (£19.99) plans
- Redirects to subscription page on success/cancel

#### **Customer Portal** (`/api/stripe/create-portal-session`)
- Opens Stripe customer portal for subscription management
- Users can update payment methods, cancel, view invoices

#### **Webhook Handler** (`/api/stripe/webhook`)
- Handles real-time Stripe events:
  - `checkout.session.completed` - New subscription created
  - `customer.subscription.updated` - Subscription changed
  - `customer.subscription.deleted` - Subscription canceled
  - `invoice.payment_succeeded` - Successful payment
  - `invoice.payment_failed` - Failed payment

### **3. Subscription Plans Component**
- Beautiful pricing cards with futuristic design
- Real-time checkout flow
- Manage subscription button
- Trust badges (Cancel Anytime, Secure Payment, Instant Access)

### **4. Updated Subscription Page**
- Success/cancel messages after checkout
- Current plan indication
- Promo code redemption
- Manage subscription functionality

---

## 🔧 **Setup Instructions:**

### **Step 1: Create Stripe Account**

1. Go to https://stripe.com
2. Sign up for a Stripe account
3. Complete your business profile
4. Add your bank account details (required for payouts)

---

### **Step 2: Get Stripe API Keys**

1. Go to https://dashboard.stripe.com/apikeys
2. You'll see two types of keys:
   - **Test Mode Keys** - Use these for development
   - **Live Mode Keys** - Use these when you go live

3. Copy your keys and add them to `.env.local`:

```env
# Stripe Keys (Test Mode for development)
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe Webhook Secret (you'll get this in step 4)
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXX
```

---

### **Step 3: Create Subscription Products**

#### **3.1 Create Pro Plan:**

1. Go to https://dashboard.stripe.com/products
2. Click "Add product"
3. Fill in:
   - **Name:** Pro Plan
   - **Description:** Perfect for professionals
   - **Pricing:** £9.99 GBP / month (recurring)
   - **Billing period:** Monthly
4. Click "Save product"
5. **Copy the Price ID** (starts with `price_`)
6. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_XXXXXXXXXXXXXXXXXXXX
   ```

#### **3.2 Create Premium Plan:**

1. Click "Add product" again
2. Fill in:
   - **Name:** Premium Plan
   - **Description:** Ultimate power and flexibility
   - **Pricing:** £19.99 GBP / month (recurring)
   - **Billing period:** Monthly
3. Click "Save product"
4. **Copy the Price ID**
5. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_XXXXXXXXXXXXXXXXXXXX
   ```

---

### **Step 4: Set Up Stripe Webhook**

#### **For Local Development (using Stripe CLI):**

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Copy the webhook signing secret (starts with `whsec_`)
5. Add to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXX
   ```

#### **For Production:**

1. Go to https://dashboard.stripe.com/webhooks
2. Click "+ Add endpoint"
3. Enter your webhook URL:
   ```
   https://yourdomain.com/api/stripe/webhook
   ```
4. Select events to listen to:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Click "Add endpoint"
6. **Copy the Signing Secret**
7. Add to your production environment variables

---

### **Step 5: Run Database Migration**

The subscription fields need to be added to your database:

```bash
# Generate Prisma client
npx prisma generate

# Create and run migration (when Prisma CLI is interactive)
npx prisma migrate dev --name add_subscription_fields

# Or push schema directly (for development)
npx prisma db push
```

**Note:** The schema changes are already in `prisma/schema.prisma`. You just need to apply them to your database.

---

### **Step 6: Configure Stripe Customer Portal**

1. Go to https://dashboard.stripe.com/settings/billing/portal
2. Configure:
   - ✅ **Allow customers to cancel subscriptions**
   - ✅ **Allow customers to update payment methods**
   - ✅ **Allow customers to view invoices**
   - ✅ **Allow customers to switch plans** (optional)
3. Set **Return URL:** `https://yourdomain.com/subscription`
4. Click "Save"

---

## 📝 **Environment Variables Checklist:**

Make sure you have all these in your `.env.local`:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_XXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_XXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXX

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🧪 **Testing the Payment Flow:**

### **1. Test Subscription Purchase:**

1. Visit `/subscription` page
2. Click "Upgrade to Pro" or "Upgrade to Premium"
3. You'll be redirected to Stripe Checkout
4. Use test card:
   - **Card Number:** `4242 4242 4242 4242`
   - **Expiry:** Any future date
   - **CVC:** Any 3 digits
   - **ZIP:** Any 5 digits
5. Complete checkout
6. You should be redirected back with success message
7. Your tier should be updated in the database

### **2. Test Subscription Management:**

1. After subscribing, click "Manage Subscription"
2. You'll be redirected to Stripe Customer Portal
3. Test:
   - Update payment method
   - Cancel subscription
   - View invoices

### **3. Test Webhook Events:**

With Stripe CLI running:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

You should see webhook events logged when you:
- Complete a checkout
- Cancel a subscription
- Payment succeeds/fails

---

## 💳 **Stripe Test Cards:**

Use these test cards for different scenarios:

| Card Number | Scenario |
|------------|----------|
| `4242 4242 4242 4242` | Success |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |
| `4000 0000 0000 9995` | Payment declined |
| `4000 0000 0000 0341` | Charge succeeded but card will be declined on next payment |

Full list: https://stripe.com/docs/testing#cards

---

## 🚀 **Going Live:**

### **1. Activate Your Stripe Account:**
- Complete Stripe's verification process
- Add your business details
- Connect your bank account

### **2. Switch to Live Mode:**
1. Toggle to "Live mode" in Stripe Dashboard
2. Get your **live API keys**
3. Update production environment variables
4. Create **live webhook endpoint**
5. **IMPORTANT:** Update price IDs to live price IDs

### **3. Test in Production:**
- Make a real $1 test purchase
- Verify webhook events fire correctly
- Test subscription cancellation
- Verify tier upgrades work

### **4. Security Checklist:**
- ✅ Never commit API keys to git
- ✅ Use environment variables
- ✅ Webhook secret is configured
- ✅ HTTPS enabled for production
- ✅ Customer portal is configured

---

## 🎨 **Subscription Plans Summary:**

### **Free Tier (Tier 1)**
- Price: £0
- Features:
  - Access to Boss Bot
  - Access to 1 specialty bot
  - Basic conversation features
  - Community support

### **Pro Tier (Tier 2)**
- Price: £9.99/month
- Features:
  - Unlimited bot conversations
  - Create up to 3 custom bots
  - File uploads (up to 10MB per bot)
  - Voice input recognition
  - Priority support
  - No ads

### **Premium Tier (Tier 3)**
- Price: £19.99/month
- Features:
  - Everything in Pro
  - Unlimited custom bots
  - File uploads (up to 50MB per bot)
  - Image recognition
  - Web search integration
  - Export conversation data
  - Advanced bot scheduling
  - Premium support

---

## 📞 **Support & Resources:**

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Test Your Integration:** https://stripe.com/docs/testing
- **Webhook Testing:** https://stripe.com/docs/webhooks/test

---

## ✅ **Launch Checklist:**

- [ ] Stripe account created and verified
- [ ] Test mode API keys added to `.env.local`
- [ ] Pro plan product created (£9.99/month)
- [ ] Premium plan product created (£19.99/month)
- [ ] Price IDs added to environment variables
- [ ] Stripe CLI installed (for local testing)
- [ ] Webhook forwarding working locally
- [ ] Database migration run (`prisma db push`)
- [ ] Test checkout flow working
- [ ] Customer portal configured
- [ ] Webhook signing secret configured
- [ ] Test cards working
- [ ] Subscription upgrade working
- [ ] Tier changes reflected in database
- [ ] Cancel subscription working
- [ ] Live mode API keys ready (for production)
- [ ] Live webhook endpoint configured (for production)

---

## 🎉 **You're Ready to Accept Payments!**

Your Stripe integration is complete and ready to use. Start testing with test cards, and when you're ready, switch to live mode!

**Need Help?**
- Check Stripe Dashboard for logs
- View webhook events in Stripe Dashboard
- Check your application logs for `[STRIPE_WEBHOOK]` messages
- Stripe support is available 24/7 at https://support.stripe.com

