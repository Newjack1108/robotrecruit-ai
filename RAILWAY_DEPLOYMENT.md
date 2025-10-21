# 🚂 Railway Deployment Checklist

## ✅ Pre-Deployment (Completed)

- [x] `railway.toml` configuration created
- [x] `.railwayignore` created
- [x] `.gitignore` updated
- [x] Health check endpoint created (`/api/health`)

---

## 📋 Deployment Steps

### 1. Commit Changes

```bash
git add railway.toml .railwayignore .gitignore src/app/api/health/
git commit -m "Add Railway deployment configuration"
git push origin main
```

### 2. Create Railway Project

**Option A: Railway Dashboard**
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Provision PostgreSQL"
4. Click "New" → "GitHub Repo"
5. Select `robotrecruit-ai` repository

**Option B: Railway CLI**
```bash
npm install -g @railway/cli
railway login
railway init
railway add -d postgres
railway up
```

### 3. Set Environment Variables

In Railway Dashboard → Your Service → Variables, add:

**Required:**
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://robotrecruit-ai-production.up.railway.app
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
OPENAI_API_KEY=sk-...
```

**Stripe (after creating products):**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_WEBHOOK_SECRET_POWERUP=whsec_...
NEXT_PUBLIC_STRIPE_POWERUP_10_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_POWERUP_50_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_POWERUP_100_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_POWERUP_250_PRICE_ID=price_...
```

**Optional:**
```bash
IMGBB_API_KEY=...
SERPAPI_API_KEY=...
ADMIN_EMAILS=admin@robotrecruit.ai
```

### 4. Run Database Migrations

```bash
railway link
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

### 5. Add Custom Domain

1. Railway Dashboard → Settings → Domains
2. Add `robotrecruit.ai`
3. Update DNS with provided records
4. Wait for SSL certificate (5-10 minutes)

### 6. Update NEXT_PUBLIC_APP_URL

After custom domain is working:
```bash
NEXT_PUBLIC_APP_URL=https://robotrecruit.ai
```

### 7. Configure Stripe Webhooks

**Endpoint 1:** `https://robotrecruit.ai/api/stripe/webhook`
- Events: subscription.*, invoice.payment_*

**Endpoint 2:** `https://robotrecruit.ai/api/stripe/webhook-powerup`
- Events: checkout.session.completed

### 8. Update Clerk Settings

- Domains: Add `https://robotrecruit.ai`
- Redirect URLs: Set to production domain

---

## 🧪 Testing

Test these features:
- [ ] Sign up / Sign in
- [ ] Dashboard loads
- [ ] Chat with bots
- [ ] Power-ups activation
- [ ] PDF export
- [ ] Payment flow
- [ ] Community forums

---

## 📊 Monitoring

```bash
# View logs
railway logs

# Check status
railway status

# View metrics
railway metrics

# Database management
railway run npx prisma studio
```

---

## 🆘 Troubleshooting

**Build fails:**
```bash
railway logs --build
```

**Database connection issues:**
```bash
railway run npx prisma db push
```

**App crashes:**
```bash
railway logs
railway restart
```

---

## 💰 Expected Costs

**Month 1-3:** ~$15-20/month
**Growing:** ~$30-45/month

---

## 🚀 You're Live When:

- [ ] Custom domain works with SSL
- [ ] All environment variables set
- [ ] Database migrated and seeded
- [ ] Stripe webhooks configured
- [ ] Test user can sign up and use features
- [ ] Payment tested successfully

---

**Good luck with your launch! 🤖🚀**

