# 🚀 RobotRecruit.AI - Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. Code Ready
- [x] next.config.ts is complete
- [ ] All features tested locally
- [ ] All changes committed to git

### 2. Required Accounts (Sign Up First!)
- [ ] **Railway Account** → https://railway.app (for hosting)
- [ ] **Clerk Account** → https://clerk.com (for authentication)
- [ ] **OpenAI Account** → https://platform.openai.com (for AI)
- [ ] **Stripe Account** → https://stripe.com (optional, for payments)
- [ ] **ImgBB Account** → https://api.imgbb.com (optional, for image uploads)
- [ ] **SerpAPI Account** → https://serpapi.com (optional, for web search)

---

## 📝 Step-by-Step Deployment Guide

### STEP 1: Commit Your Code

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

---

### STEP 2: Set Up Railway Project

#### Option A: Railway Dashboard (Recommended)
1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your GitHub account
5. Select the `robotrecruit-ai` repository
6. Click **"Add variables"** (we'll add them in Step 3)

#### Option B: Railway CLI
```bash
npm install -g @railway/cli
railway login
railway init
railway link
```

---

### STEP 3: Add PostgreSQL Database

1. In your Railway project, click **"New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically create a database
4. Note: `DATABASE_URL` will be automatically available

---

### STEP 4: Configure Environment Variables

Go to your Railway project → **Variables** tab and add these:

#### 🔐 Required Variables

```bash
# Database (automatically provided by Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Node Environment
NODE_ENV=production

# App URL (use your Railway URL first, update with custom domain later)
NEXT_PUBLIC_APP_URL=https://robotrecruit-ai-production.up.railway.app

# Clerk Authentication (Get from https://dashboard.clerk.com)
# Use PRODUCTION keys, not test keys!
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/chat
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/chat

# OpenAI API (Get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-...

# Admin Access (your email address)
ADMIN_EMAILS=your-email@example.com
```

#### 💳 Optional: Stripe (For Payments)

```bash
# Get from https://dashboard.stripe.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Create products in Stripe first, then add these:
NEXT_PUBLIC_STRIPE_POWERUP_10_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_POWERUP_50_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_POWERUP_100_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_POWERUP_250_PRICE_ID=price_...

# Webhook secrets (set up in Step 6)
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_WEBHOOK_SECRET_POWERUP=whsec_...
```

#### 🎨 Optional: Image & Web Search Features

```bash
# ImgBB (for image uploads)
IMGBB_API_KEY=...

# SerpAPI (for web search power-up)
SERPAPI_API_KEY=...
```

---

### STEP 5: Deploy to Railway

1. Railway should automatically deploy when you push to GitHub
2. Check the **Deployments** tab for progress
3. Wait for build to complete (5-10 minutes)

#### If deployment fails:
```bash
railway logs
```

---

### STEP 6: Run Database Migrations

After first deployment, you need to set up the database:

```bash
# Install Railway CLI if not already installed
npm install -g @railway/cli

# Link to your project
railway link

# Run migrations
railway run npx prisma migrate deploy

# Seed the database with initial data
railway run npx prisma db seed
```

---

### STEP 7: Create OpenAI Assistants

1. Go to https://platform.openai.com/assistants
2. Create 3 assistants with these configurations:

#### Boss Bot
- **Name**: Boss Bot
- **Model**: gpt-4o
- **Instructions**: "You are Boss Bot, an intelligent assistant router..."
- **Tools**: Enable "File search"
- **Copy the Assistant ID** (starts with `asst_...`)

#### Bee Bot
- **Name**: Bee Bot  
- **Model**: gpt-4o
- **Instructions**: "You are Bee Bot, an expert in beekeeping..."
- **Tools**: Enable "File search"
- **Copy the Assistant ID**

#### Equi Bot
- **Name**: Equi Bot
- **Model**: gpt-4o
- **Instructions**: "You are Equi Bot, a specialist in equestrian care..."
- **Tools**: Enable "File search"
- **Copy the Assistant ID**

📝 *See SETUP_GUIDE.md for full instructions for each bot*

---

### STEP 8: Configure Bots in Admin Panel

1. Visit your Railway URL (e.g., `https://robotrecruit-ai-production.up.railway.app`)
2. Sign up with your admin email
3. Go to `/admin/bots`
4. For each bot:
   - Click the eye icon to reveal the Assistant ID field
   - Paste the Assistant ID from OpenAI
   - Click "Save"

---

### STEP 9: Configure Clerk for Production

1. Go to https://dashboard.clerk.com
2. Select your application
3. Go to **Domains** → Add your production URL
4. Update **Redirect URLs**:
   - Sign-in redirect: `https://your-domain.com/chat`
   - Sign-up redirect: `https://your-domain.com/chat`
5. Copy your **production keys** (pk_live_... and sk_live_...)
6. Update them in Railway environment variables

---

### STEP 10: Test Your Deployment ✨

Test these features:
- [ ] Sign up / Sign in works
- [ ] Dashboard loads correctly
- [ ] Chat with Boss Bot works
- [ ] Chat with Bee Bot works
- [ ] Create a promo code
- [ ] Redeem a promo code
- [ ] Create a custom bot (if using Pro tier)
- [ ] Upload a file to a bot

---

## 🌐 OPTIONAL: Add Custom Domain

### Step 1: Add Domain in Railway
1. Railway Dashboard → Your service → **Settings**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `robotrecruit.ai`)

### Step 2: Update DNS Records
Railway will provide DNS records. Add them to your domain provider:
- **Type**: CNAME
- **Name**: @ (or your subdomain)
- **Value**: (provided by Railway)

### Step 3: Update Environment Variables
After domain is active:
```bash
NEXT_PUBLIC_APP_URL=https://robotrecruit.ai
```

### Step 4: Update Clerk
Add your custom domain in Clerk dashboard

---

## 💳 OPTIONAL: Configure Stripe Webhooks

### If you're using Stripe for payments:

1. Go to https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**

#### Webhook 1: Subscriptions
- **URL**: `https://your-domain.com/api/stripe/webhook`
- **Events**: 
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- Copy the **Signing Secret** → Add to Railway as `STRIPE_WEBHOOK_SECRET`

#### Webhook 2: Power-ups
- **URL**: `https://your-domain.com/api/stripe/webhook-powerup`
- **Events**:
  - `checkout.session.completed`
- Copy the **Signing Secret** → Add to Railway as `STRIPE_WEBHOOK_SECRET_POWERUP`

---

## 📊 Monitoring & Maintenance

### View Logs
```bash
railway logs
```

### Check Status
```bash
railway status
```

### Restart Service
```bash
railway restart
```

### Database Management
```bash
railway run npx prisma studio
```

---

## 🆘 Troubleshooting

### Build Fails
```bash
railway logs --build
```

Common issues:
- Missing environment variables
- TypeScript/ESLint errors (should be ignored by config)
- Dependency issues

### App Crashes on Startup
Check logs:
```bash
railway logs
```

Common issues:
- Database connection failed (check DATABASE_URL)
- Missing required environment variables
- OpenAI API key invalid

### Chats Not Working
- Check OpenAI API key is valid
- Verify Assistant IDs are set in admin panel
- Check OpenAI API usage limits

### Authentication Issues
- Verify Clerk keys are production keys (pk_live_...)
- Check domain is added in Clerk dashboard
- Verify redirect URLs match your domain

---

## 💰 Expected Costs

### Railway
- **Hobby Plan**: $5/month (500 hours)
- **Pro Plan**: $20/month (recommended for production)
- PostgreSQL: $5-10/month

### OpenAI
- Depends on usage
- GPT-4o: ~$10-50/month for small apps
- Set usage limits in OpenAI dashboard

### Clerk
- **Free**: 10,000 MAU (Monthly Active Users)
- **Pro**: $25/month for more features

### Total: ~$20-100/month depending on usage

---

## ✅ You're Live When:

- [ ] Railway deployment successful
- [ ] Database migrated and seeded
- [ ] Environment variables all set
- [ ] OpenAI assistants created and configured
- [ ] Clerk authentication working
- [ ] Test user can sign up
- [ ] Test user can chat with bots
- [ ] Admin panel accessible
- [ ] (Optional) Stripe payments working
- [ ] (Optional) Custom domain working

---

## 🎉 Post-Launch

### Marketing
- Share your app URL
- Set up social media
- Create demo videos
- Write blog posts

### Monitoring
- Monitor Railway metrics
- Check OpenAI usage daily
- Review user feedback
- Monitor error logs

### Maintenance
- Regular database backups
- Update dependencies monthly
- Monitor API costs
- Add new features

---

## 📞 Support Resources

- **Railway Docs**: https://docs.railway.app
- **Clerk Docs**: https://clerk.com/docs
- **OpenAI Docs**: https://platform.openai.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**Good luck with your launch! 🚀**

Need help? Check the other documentation files:
- `SETUP_GUIDE.md` - Local development setup
- `RAILWAY_DEPLOYMENT.md` - Railway-specific instructions
- `ADMIN_SETUP.md` - Admin panel configuration
- `STRIPE_SETUP_INSTRUCTIONS.md` - Stripe integration


