# 🤖 RobotRecruit.AI

A modern AI chatbot platform with multi-tier subscriptions, custom bot creation, and knowledge base file uploads.

## 🚀 **Quick Start**

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

Create `.env.local`:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/chat
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/chat

# Database
DATABASE_URL=postgresql://...

# OpenAI
OPENAI_API_KEY=sk-...

# Admin Access
ADMIN_EMAILS=your-email@example.com
```

### 3. Initialize Database
```bash
npx prisma migrate dev
npx prisma db seed
```

### 4. Create OpenAI Assistants
1. Go to https://platform.openai.com/assistants
2. Create 3 assistants (Boss Bot, Bee Bot, Equi Bot)
3. Enable "File search" tool for each
4. Copy their Assistant IDs

### 5. Configure Bot Assistant IDs
1. Start dev server: `npm run dev`
2. Sign in to the app
3. Go to `/admin/bots`
4. Update each bot's Assistant ID
5. Click Save

### 6. Start Using!
- Chat with bots at `/chat`
- Create custom bots at `/bots/create` (Pro+)
- Create promo codes at `/admin/promo-codes`
- Upload knowledge files to custom bots

---

## ✨ **Features**

### 🤖 **AI Chat System**
- Real-time conversations with OpenAI Assistants
- Thread-based context management
- Full conversation history
- Phone-style modern UI
- Multiple specialized bots

### 👥 **User Management**
- Clerk authentication
- 3-tier subscription system (Free, Pro, Premium)
- Promo code redemption for trials
- Automatic tier expiry handling

### 🎨 **Custom Bot Creation** (Pro/Premium)
- Create unlimited custom AI assistants
- Upload knowledge files (PDFs, docs, images)
- OpenAI Vector Store integration
- File search capabilities
- Vision support for images

### 🎟️ **Promo Code System**
- Admin-created promotional codes
- Temporary tier upgrades
- Usage limits and tracking
- Auto-expiry
- Copy/share functionality

### 🔐 **Admin Panel**
- Secure email-based access
- Dashboard with metrics
- Bot configuration management
- Promo code management
- Usage analytics per bot

---

## 📁 **Project Structure**

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── admin/              # Admin panel
│   │   │   ├── bots/           # Bot management
│   │   │   └── promo-codes/    # Promo management
│   │   ├── bots/               # Bot listing & creation
│   │   │   ├── create/         # Create custom bot
│   │   │   └── [slug]/files/   # File management
│   │   ├── chat/               # Chat interface
│   │   └── subscription/       # Plans & promo redemption
│   ├── api/
│   │   ├── admin/              # Admin API routes
│   │   ├── bots/               # Bot API routes
│   │   ├── chat/               # Chat API
│   │   └── promo/              # Promo redemption
│   └── sign-in/, sign-up/      # Auth pages
├── components/
│   ├── admin/                  # Admin components
│   ├── auth/                   # Auth components
│   ├── bots/                   # Bot components
│   ├── chat/                   # Chat components
│   ├── user/                   # User components
│   └── ui/                     # UI components
└── lib/
    ├── db.ts                   # Prisma client
    ├── openai.ts               # OpenAI helpers
    └── stripe.ts               # Stripe integration
```

---

## 📚 **Documentation**

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup instructions
- **[ADMIN_SETUP.md](./ADMIN_SETUP.md)** - Admin panel guide
- **[FEATURES.md](./FEATURES.md)** - Detailed feature overview

---

## 🛠️ **Tech Stack**

- **Framework**: Next.js 15 (App Router)
- **Authentication**: Clerk
- **Database**: PostgreSQL + Prisma
- **AI**: OpenAI Assistants API
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Fonts**: Orbitron (headings), Geist (body)
- **Payments**: Stripe (optional)

---

## 🎯 **User Flows**

### New User
1. Sign up → Free tier (Tier 1)
2. Chat with Boss Bot & Bee Bot
3. View subscription plans
4. Redeem promo code for trial
5. Upgrade to Pro/Premium

### Pro User
1. Create custom bots
2. Upload knowledge files
3. Chat with enhanced bots
4. Access all specialty bots

### Admin
1. Sign in with admin email
2. Access `/admin` panel
3. Configure bot Assistant IDs
4. Create promo codes
5. Monitor usage metrics

---

## 🔒 **Security**

- Server-side authentication checks
- Admin email verification
- Input validation on all forms
- File type and size validation
- Secure API key storage
- No client-side bypasses
- Masked sensitive data in UI

---

## 📊 **Database Models**

- **User** - User accounts with tier system
- **Bot** - System & custom bots with OpenAI config
- **Conversation** - Chat threads
- **Message** - Individual messages
- **PromoCode** - Promotional codes
- **PromoRedemption** - Code usage tracking
- **BotFile** - Uploaded knowledge files

---

## 🚢 **Deployment**

See `SETUP_GUIDE.md` for production deployment instructions.

**Important**: 
- Use production API keys
- Set up proper environment variables
- Configure database backups
- Monitor OpenAI API usage

---

## 📝 **License**

Proprietary - All rights reserved

---

## 🆘 **Support**

For setup help, see the documentation files:
- Setup issues → `SETUP_GUIDE.md`
- Admin features → `ADMIN_SETUP.md`
- Feature details → `FEATURES.md`

---

**Built with ❤️ using Next.js, OpenAI, and modern web technologies**
