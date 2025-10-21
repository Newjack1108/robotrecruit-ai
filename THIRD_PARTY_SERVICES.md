# Third-Party Services & Integrations

This document lists all third-party services, APIs, and tools used in the RobotRecruit AI application.

## 🔐 Authentication & User Management

### Clerk
- **Purpose**: User authentication, session management, and user profiles
- **Website**: https://clerk.com
- **Documentation**: https://clerk.com/docs
- **Dashboard**: https://dashboard.clerk.com
- **Pricing**: Free tier available, paid plans for scale
- **Features Used**:
  - Email/password authentication
  - Social login (Google, GitHub, etc.)
  - User profile management
  - Session handling
  - Webhooks for user events
- **Environment Variables**:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
- **Required**: ✅ Yes

---

## 🤖 AI & Machine Learning

### OpenAI
- **Purpose**: ChatGPT API for bot conversations and AI assistants
- **Website**: https://openai.com
- **Documentation**: https://platform.openai.com/docs
- **Dashboard**: https://platform.openai.com
- **Pricing**: Pay-as-you-go based on token usage
- **Features Used**:
  - GPT-4/GPT-3.5 chat completions
  - Assistants API with vector stores
  - File uploads and analysis
  - Streaming responses
  - Function calling
- **Environment Variables**:
  - `OPENAI_API_KEY`
- **Required**: ✅ Yes

---

## 💳 Payments & Subscriptions

### Stripe
- **Purpose**: Payment processing and subscription management
- **Website**: https://stripe.com
- **Documentation**: https://stripe.com/docs
- **Dashboard**: https://dashboard.stripe.com
- **Pricing**: Transaction fees (2.9% + 30¢ for cards)
- **Features Used**:
  - Recurring subscriptions
  - Checkout sessions
  - Customer portal
  - Webhooks for payment events
  - Invoice management
- **Environment Variables**:
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`
  - `NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID`
- **Required**: ⚠️ Optional (for subscriptions)

---

## 🗄️ Database & ORM

### Prisma
- **Purpose**: Database ORM, migrations, and type-safe queries
- **Website**: https://prisma.io
- **Documentation**: https://www.prisma.io/docs
- **Dashboard**: Prisma Studio (local)
- **Pricing**: Free and open-source
- **Features Used**:
  - Schema management
  - Database migrations
  - Type-safe database queries
  - Prisma Studio for data visualization
  - Connection pooling
- **Environment Variables**:
  - `DATABASE_URL`
- **Required**: ✅ Yes

### Database Provider
- **Recommended**: PostgreSQL, MySQL, or MongoDB
- **Options**:
  - **Supabase** (https://supabase.com) - Free tier available
  - **PlanetScale** (https://planetscale.com) - Serverless MySQL
  - **Railway** (https://railway.app) - Easy PostgreSQL hosting
  - **Vercel Postgres** (https://vercel.com/storage/postgres) - Integrated with Vercel

---

## 🖼️ Media Storage & CDN

### ImgBB
- **Purpose**: Image hosting and CDN for user uploads
- **Website**: https://imgbb.com
- **Documentation**: https://api.imgbb.com
- **Pricing**: Free tier available
- **Features Used**:
  - Image uploads via API
  - CDN delivery
  - Automatic optimization
  - Direct URL access
- **Environment Variables**:
  - `IMGBB_API_KEY`
- **Required**: ⚠️ Optional (for image uploads)
- **Alternatives**: Cloudinary, AWS S3, Vercel Blob Storage

---

## 🔍 Web Search (Optional)

### SerpAPI
- **Purpose**: Web search API for bot web search power-up
- **Website**: https://serpapi.com
- **Documentation**: https://serpapi.com/docs
- **Dashboard**: https://serpapi.com/dashboard
- **Pricing**: Free tier: 100 searches/month, paid plans available
- **Features Used**:
  - Google search results
  - Real-time web search
  - JSON formatted results
- **Environment Variables**:
  - `SERPAPI_API_KEY`
- **Required**: ❌ Optional (feature enhancement)
- **Alternatives**: Bing Search API, Google Custom Search

---

## 🚀 Hosting & Deployment

### Vercel
- **Purpose**: Application hosting, serverless functions, and deployment
- **Website**: https://vercel.com
- **Documentation**: https://vercel.com/docs
- **Dashboard**: https://vercel.com/dashboard
- **Pricing**: Free hobby tier, paid plans for teams/production
- **Features Used**:
  - Next.js hosting
  - Serverless API routes
  - Edge runtime
  - Automatic deployments from Git
  - Preview deployments
  - Environment variable management
- **Environment Variables**: Managed in Vercel dashboard
- **Required**: ✅ Yes (or alternative hosting)
- **Alternatives**: Netlify, Railway, AWS Amplify

---

## 🎨 Frontend & Styling

### Next.js
- **Purpose**: React framework for production
- **Website**: https://nextjs.org
- **Documentation**: https://nextjs.org/docs
- **Pricing**: Free and open-source
- **Features Used**:
  - App Router
  - Server components
  - API routes
  - Image optimization
  - File-based routing
- **Required**: ✅ Yes (core framework)

### Tailwind CSS
- **Purpose**: Utility-first CSS framework
- **Website**: https://tailwindcss.com
- **Documentation**: https://tailwindcss.com/docs
- **Pricing**: Free and open-source
- **Features Used**:
  - Utility classes
  - Responsive design
  - Custom color schemes
  - Animations
- **Required**: ✅ Yes (styling)

### shadcn/ui
- **Purpose**: Re-usable UI components built with Radix UI
- **Website**: https://ui.shadcn.com
- **Documentation**: https://ui.shadcn.com/docs
- **Pricing**: Free and open-source
- **Features Used**:
  - Button, Card, Badge components
  - Form components
  - Dialog, Modal components
- **Required**: ✅ Yes (UI components)

---

## 📦 Package Management & Build Tools

### npm
- **Purpose**: Node package manager
- **Website**: https://www.npmjs.com
- **Required**: ✅ Yes
- **Alternatives**: yarn, pnpm

---

## 🔧 Development Tools

### TypeScript
- **Purpose**: Type-safe JavaScript
- **Website**: https://www.typescriptlang.org
- **Required**: ✅ Yes

### ESLint
- **Purpose**: Code linting and quality
- **Website**: https://eslint.org
- **Required**: ⚠️ Recommended

---

## 📊 Cost Estimation (Monthly)

### Minimum Required (for MVP):
- **Clerk**: Free (up to 10k MAU)
- **OpenAI**: ~$20-100 (depending on usage)
- **Database**: Free tier (Supabase/PlanetScale)
- **Vercel**: Free (hobby plan)
- **Total**: ~$20-100/month

### With Optional Services:
- **Stripe**: 2.9% + 30¢ per transaction
- **ImgBB**: Free (or ~$5/month for more storage)
- **SerpAPI**: Free (100 searches) or ~$50/month
- **Total**: ~$75-200/month + transaction fees

### At Scale (1000+ users):
- **Clerk**: ~$25/month
- **OpenAI**: ~$500-1000/month
- **Database**: ~$20-50/month
- **Vercel**: ~$20/month (Pro plan)
- **Stripe**: ~$100-500/month (processing fees)
- **Total**: ~$665-1595/month + transaction fees

---

## 🔐 Security & Compliance

### Data Storage:
- User data: Clerk (US/EU data residency options)
- Application data: Your database provider
- File uploads: ImgBB (or alternative)
- Conversations: Your database + OpenAI (stored for 30 days)

### Compliance:
- **GDPR**: Clerk provides GDPR compliance tools
- **PCI DSS**: Stripe handles all payment data
- **Data Deletion**: Implement user data deletion via Clerk webhooks

---

## 📝 Environment Variables Reference

Create a `.env.local` file with the following:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# OpenAI
OPENAI_API_KEY=sk-...

# Database
DATABASE_URL=postgresql://...

# Stripe (Optional - for subscriptions)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_...

# ImgBB (Optional - for image uploads)
IMGBB_API_KEY=...

# SerpAPI (Optional - for web search)
SERPAPI_API_KEY=...

# Admin
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

---

## 🆘 Support & Resources

- **Clerk Support**: https://clerk.com/support
- **OpenAI Support**: https://help.openai.com
- **Stripe Support**: https://support.stripe.com
- **Prisma Support**: https://www.prisma.io/docs/support
- **Vercel Support**: https://vercel.com/support

---

## 📅 Last Updated

**Date**: January 2025  
**Version**: 1.0

**Note**: This document should be updated whenever new services are added or existing ones are modified.

