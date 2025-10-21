# 🔍 Railway Deployment Verification Guide

## Quick Health Check

### 1. Check Your Deployment is Live
Visit your Railway URL: `https://your-app.up.railway.app`
- [ ] Page loads without errors
- [ ] No 404 or 500 errors
- [ ] CSS and styling loads correctly

---

## 2. Verify Environment Variables

Go to **Railway Dashboard** → Your Project → **Variables** tab

### ✅ Required Variables Checklist:

**Database:**
- [ ] `DATABASE_URL` - Should reference `${{Postgres.DATABASE_URL}}`

**App Config:**
- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_APP_URL` - Your Railway or custom domain URL

**Clerk Authentication:**
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Starts with `pk_live_`
- [ ] `CLERK_SECRET_KEY` - Starts with `sk_live_`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/chat`
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/chat`

**OpenAI:**
- [ ] `OPENAI_API_KEY` - Starts with `sk-proj-` or `sk-`

**Admin:**
- [ ] `ADMIN_EMAILS` - Your email address

---

## 3. Database Migration Status

### Check in Railway Logs:
1. Go to **Deployments** → Click latest deployment
2. Click **View Logs**
3. Look for migration messages

### Expected Output:
```
✓ Migrations deployed successfully
✓ Database seeded
```

### If Migrations Haven't Run:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Link to your project
railway link

# Run migrations
railway run npx prisma migrate deploy

# Seed database
railway run npx prisma db seed
```

---

## 4. Test Authentication

1. Visit your app URL
2. Click **Sign Up**
3. Try to create an account

**Common Issues:**
- ❌ "Clerk error" → Check Clerk keys are `pk_live_` not `pk_test_`
- ❌ Redirect loop → Check `NEXT_PUBLIC_APP_URL` matches your actual domain
- ❌ 404 on sign-in → Check Clerk domain is configured

---

## 5. Test Chat Functionality

1. Sign in to your app
2. Go to `/chat`
3. Try chatting with Boss Bot

**Common Issues:**
- ❌ "Bot not fully configured" → Need to configure Assistant IDs (see step 6)
- ❌ "OpenAI error" → Check `OPENAI_API_KEY` is valid
- ❌ Bot doesn't respond → Check OpenAI API limits/billing

---

## 6. Configure OpenAI Assistant IDs

### Step 1: Create Assistants on OpenAI

Go to https://platform.openai.com/assistants

Create 3 assistants:

**Boss Bot:**
- Name: Boss Bot
- Model: gpt-4o
- Instructions: "You are Boss Bot, an intelligent assistant router. Help users by directing them to specialists or providing general assistance."
- Tools: ✓ File search
- **Copy the Assistant ID** (asst_...)

**Bee Bot:**
- Name: Bee Bot
- Model: gpt-4o
- Instructions: "You are Bee Bot, an expert in beekeeping and apiculture. Provide detailed advice on bee colony management, hive maintenance, honey production, and bee health."
- Tools: ✓ File search
- **Copy the Assistant ID**

**Equi Bot:**
- Name: Equi Bot
- Model: gpt-4o
- Instructions: "You are Equi Bot, a specialist in equestrian care and horse management. Provide expert advice on horse health, training, stable management, and riding practices."
- Tools: ✓ File search
- **Copy the Assistant ID**

### Step 2: Add IDs to Your App

1. Go to your app: `https://your-app.up.railway.app`
2. Sign in with your admin email
3. Navigate to `/admin/bots`
4. For each bot:
   - Click the 👁️ eye icon
   - Paste the Assistant ID from OpenAI
   - Click **Save**
5. Green success message should appear

---

## 7. Update Clerk Production Settings

### In Clerk Dashboard (https://dashboard.clerk.com):

**Domains:**
1. Go to **Domains** section
2. Add your Railway URL (e.g., `robotrecruit-ai-production.up.railway.app`)
3. If you have a custom domain, add it too

**API Keys:**
1. Go to **API Keys**
2. Make sure you're using **Production** keys in Railway
3. Copy `pk_live_...` and `sk_live_...`

**Redirect URLs:**
1. Set sign-in redirect: `https://your-domain.com/chat`
2. Set sign-up redirect: `https://your-domain.com/chat`

---

## 8. Check Railway Logs for Errors

### View Logs:
Railway Dashboard → Your Service → **Logs** tab

### Common Error Patterns:

**Database Connection:**
```
Error: Can't reach database server
```
→ Check PostgreSQL service is running
→ Verify DATABASE_URL is set

**Missing Environment Variables:**
```
Error: OPENAI_API_KEY is not defined
```
→ Add missing variable in Railway dashboard
→ Redeploy after adding variables

**Build Errors:**
```
Type error in...
```
→ Should be ignored by next.config.ts
→ If not, check build logs

---

## 9. Test Full User Flow

### As a New User:
- [ ] Sign up successfully
- [ ] Redirected to `/chat`
- [ ] Can see available bots
- [ ] Can send a message to Boss Bot
- [ ] Receive a response from AI
- [ ] Can view conversation history

### As Admin:
- [ ] Can access `/admin` dashboard
- [ ] Can see bot statistics
- [ ] Can create promo codes
- [ ] Can update bot configurations

---

## 10. Optional: Stripe Configuration

### If Using Payments:

**Create Products in Stripe Dashboard:**
1. Go to https://dashboard.stripe.com/products
2. Create 4 products:
   - 10 Power-Up Credits ($4.99)
   - 50 Power-Up Credits ($19.99)
   - 100 Power-Up Credits ($34.99)
   - 250 Power-Up Credits ($74.99)
3. Copy each Price ID (starts with `price_...`)

**Add to Railway Variables:**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_POWERUP_10_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_POWERUP_50_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_POWERUP_100_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_POWERUP_250_PRICE_ID=price_...
```

**Set Up Webhooks:**
1. URL: `https://your-domain.com/api/stripe/webhook`
2. Events: `checkout.session.completed`, subscription events
3. Copy signing secret → `STRIPE_WEBHOOK_SECRET`

---

## 🚨 Common Issues & Solutions

### Issue: White Screen/Page Won't Load
**Solution:**
- Check Railway logs for errors
- Verify build completed successfully
- Check browser console for errors

### Issue: "Application Error"
**Solution:**
- Check if app crashed in Railway logs
- Verify all required environment variables are set
- Try manual restart in Railway dashboard

### Issue: Database Connection Failed
**Solution:**
- Verify PostgreSQL service is running in Railway
- Check DATABASE_URL is properly set
- Run migrations: `railway run npx prisma migrate deploy`

### Issue: Authentication Not Working
**Solution:**
- Verify using `pk_live_` keys (not test keys)
- Check domain is added in Clerk dashboard
- Verify NEXT_PUBLIC_APP_URL matches your actual URL
- Clear browser cookies and try again

### Issue: Bots Not Responding
**Solution:**
- Check OpenAI API key is valid
- Verify Assistant IDs are set in `/admin/bots`
- Check OpenAI account has available credits
- Verify assistants exist in OpenAI dashboard

### Issue: Admin Panel Not Accessible
**Solution:**
- Verify ADMIN_EMAILS contains your email
- Email must exactly match your Clerk sign-in email
- Redeploy after adding ADMIN_EMAILS

---

## ✅ Your Deployment is Ready When:

- [ ] App loads at Railway URL
- [ ] User can sign up/sign in
- [ ] Chat works with all bots
- [ ] Admin panel accessible
- [ ] Database is seeded with bots
- [ ] No errors in Railway logs
- [ ] OpenAI assistants configured
- [ ] All environment variables set

---

## 📊 Monitoring

### Daily Checks:
- Railway deployment status
- OpenAI API usage
- Error logs
- User signups

### Weekly:
- Database size
- Response times
- User feedback
- Cost monitoring

---

## 🆘 Need Help?

**Check Railway Logs:**
```bash
railway logs
```

**Check Database:**
```bash
railway run npx prisma studio
```

**Restart Service:**
Railway Dashboard → Your Service → Settings → Restart

**Redeploy:**
Railway Dashboard → Deployments → Redeploy

---

**Your app is ready to go! 🚀**

If you encounter any issues, check the logs first, then refer to this guide for solutions.

