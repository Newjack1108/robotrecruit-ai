# Stripe Pricing Update Guide

## ✅ Code Updated!

The following pricing has been updated in the codebase:

### Subscription Plans:
- **Pro**: ~~£9.99~~ → **£7.99/month**
- **Premium**: ~~£19.99~~ → **£16.99/month**

### Power-Up Packages:
- **Starter Pack** (10 credits): ~~£3.99~~ → **£2.99**
- **Popular Pack** (50 credits): ~~£15.99~~ → **£9.99**
- **Pro Pack** (100 credits): ~~£27.99~~ → **£17.99**
- **Enterprise Pack** (250 credits): ~~£63.99~~ → **£39.99**

---

## 🔧 What You Need to Change in Stripe

### Option 1: Update Existing Products (Recommended if you have customers)

#### A. Subscription Products

1. **Go to Stripe Dashboard** → https://dashboard.stripe.com/products

2. **Pro Plan**:
   - Find your "Pro Plan" product
   - Click on it
   - Click **"Add another price"**
   - Set amount to: **£7.99**
   - Set billing period: **Monthly**
   - Click **"Add price"**
   - Copy the new Price ID (starts with `price_...`)
   - Update your `.env` file:
     ```bash
     NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_NEW_ID_HERE
     ```

3. **Premium Plan**:
   - Find your "Premium Plan" product
   - Click on it
   - Click **"Add another price"**
   - Set amount to: **£16.99**
   - Set billing period: **Monthly**
   - Click **"Add price"**
   - Copy the new Price ID
   - Update your `.env` file:
     ```bash
     NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_NEW_ID_HERE
     ```

#### B. Power-Up Products

You'll need to create/update 4 one-time payment products:

**1. Starter Pack - 10 Credits (£2.99)**:
   - Go to Products → Click **"Add Product"**
   - Name: `Starter Pack - 10 Power-Up Credits`
   - Description: `Perfect for trying out power-ups`
   - Price: **£2.99**
   - One-time payment
   - Click **"Add product"**
   - Copy Price ID → Update `.env`:
     ```bash
     NEXT_PUBLIC_STRIPE_POWERUP_10_PRICE_ID=price_...
     ```

**2. Popular Pack - 50 Credits (£9.99)**:
   - Name: `Popular Pack - 50 Power-Up Credits`
   - Description: `Most popular choice for regular users`
   - Price: **£9.99**
   - One-time payment
   - Copy Price ID → Update `.env`:
     ```bash
     NEXT_PUBLIC_STRIPE_POWERUP_50_PRICE_ID=price_...
     ```

**3. Pro Pack - 100 Credits (£17.99)**:
   - Name: `Pro Pack - 100 Power-Up Credits`
   - Description: `Best value for power users`
   - Price: **£17.99**
   - One-time payment
   - Copy Price ID → Update `.env`:
     ```bash
     NEXT_PUBLIC_STRIPE_POWERUP_100_PRICE_ID=price_...
     ```

**4. Enterprise Pack - 250 Credits (£39.99)**:
   - Name: `Enterprise Pack - 250 Power-Up Credits`
   - Description: `Maximum credits for teams and heavy users`
   - Price: **£39.99**
   - One-time payment
   - Copy Price ID → Update `.env`:
     ```bash
     NEXT_PUBLIC_STRIPE_POWERUP_250_PRICE_ID=price_...
     ```

---

### Option 2: Create New Products from Scratch

If you're starting fresh or don't have customers yet:

1. **Delete or archive old products** in Stripe Dashboard

2. **Follow the steps in Option 1** to create all products at the new prices

---

## 📝 Environment Variables You'll Need

After creating products in Stripe, update your `.env.local` (local) and Railway/Vercel (production):

```bash
# Subscription Plans
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...        # £7.99/month
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_...    # £16.99/month

# Power-Up Packages  
NEXT_PUBLIC_STRIPE_POWERUP_10_PRICE_ID=price_... # £2.99 (10 credits)
NEXT_PUBLIC_STRIPE_POWERUP_50_PRICE_ID=price_... # £9.99 (50 credits)
NEXT_PUBLIC_STRIPE_POWERUP_100_PRICE_ID=price_...# £17.99 (100 credits)
NEXT_PUBLIC_STRIPE_POWERUP_250_PRICE_ID=price_...# £39.99 (250 credits)
```

---

## ✅ Quick Checklist

- [ ] Update Pro Plan price to £7.99 in Stripe
- [ ] Update Premium Plan price to £16.99 in Stripe
- [ ] Create/Update Starter Pack (£2.99) in Stripe
- [ ] Create/Update Popular Pack (£9.99) in Stripe
- [ ] Create/Update Pro Pack (£17.99) in Stripe
- [ ] Create/Update Enterprise Pack (£39.99) in Stripe
- [ ] Copy all 6 Price IDs
- [ ] Update `.env.local` with new Price IDs
- [ ] Update production environment variables (Railway/Vercel)
- [ ] Test checkout flow with test cards
- [ ] Verify prices display correctly on your site

---

## 🧪 Testing

Use Stripe test cards to verify:
- **Subscriptions**: `4242 4242 4242 4242`
- **One-time payments**: Same card
- All prices show correctly at checkout
- Webhooks receive correct amounts

---

## 💡 Pro Tips

1. **Keep old prices active** for a transition period if you have existing customers
2. **Use Stripe's "Archive" feature** instead of deleting old products
3. **Test in Stripe test mode** before going live
4. **Monitor the first few purchases** to ensure everything works
5. **Update your marketing materials** to reflect new pricing

---

## 📊 Expected Margins

With new pricing:

### Subscriptions:
- **Pro (£7.99)**: 40-90% profit margin
- **Premium (£16.99)**: 38-94% profit margin

### Power-Ups:
- **All packages**: 70-95% profit margin

### After Stripe Fees (2.9% + £0.30):
- **Starter (£2.99)**: £2.57 after fees
- **Popular (£9.99)**: £9.40 after fees
- **Pro Plan (£7.99)**: £7.52 after fees
- **Premium (£16.99)**: £16.40 after fees

All margins account for OpenAI costs!

---

## 🆘 Need Help?

- **Stripe Documentation**: https://stripe.com/docs/products-prices
- **Price Management**: https://stripe.com/docs/billing/prices-guide
- **Test Mode**: https://stripe.com/docs/testing

---

**Status**: ✅ Code updated, ready for Stripe configuration
**Time to Complete**: ~15 minutes for all products

