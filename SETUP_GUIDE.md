# 🚀 RobotRecruit.AI - Complete Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [OpenAI Assistants Setup](#openai-assistants-setup)
4. [Admin Panel Setup](#admin-panel-setup)
5. [Feature Overview](#feature-overview)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- **Clerk Account**: For authentication (https://clerk.com)
- **OpenAI Account**: For AI assistants (https://platform.openai.com)
- **PostgreSQL Database**: Railway, Supabase, or similar
- **Stripe Account** (Optional): For payments

### Required API Keys
You'll need the following environment variables:

---

## Environment Setup

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/chat
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/chat

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# OpenAI
OPENAI_API_KEY=sk-...

# Image Upload (for Image Recognition power-up)
# Get your free API key from: https://api.imgbb.com/
IMGBB_API_KEY=your_imgbb_api_key_here

# Admin Access (comma-separated emails)
ADMIN_EMAILS=your-email@example.com,another-admin@example.com

# Stripe (Optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID_TIER_2=price_...
STRIPE_PRICE_ID_TIER_3=price_...
```

---

## OpenAI Assistants Setup

### Step 1: Create Assistants on OpenAI Platform

Go to https://platform.openai.com/assistants and create 3 assistants:

#### 1. Boss Bot (General Assistant)
```
Name: Boss Bot
Model: gpt-4o (or gpt-3.5-turbo)
Instructions:
You are Boss Bot, an intelligent assistant router. Your role is to help users by directing them to the right specialist or providing general assistance. You're friendly, helpful, and knowledgeable about various topics. When users ask specific questions that would be better answered by a specialist, guide them to the appropriate bot.

Tools: Enable "File search"
```

#### 2. Bee Bot (Beekeeping Expert)
```
Name: Bee Bot
Model: gpt-4o
Instructions:
You are Bee Bot, an expert in beekeeping, apiculture, and honey production. You have extensive knowledge about:
- Bee colony management and care
- Hive construction and maintenance
- Honey extraction and processing
- Bee health and disease prevention
- Seasonal beekeeping practices
- Equipment and tools for beekeeping
- Pollination and environmental benefits

Provide detailed, practical advice based on best practices in beekeeping.

Tools: Enable "File search"
```

#### 3. Equi Bot (Equestrian Specialist)
```
Name: Equi Bot
Model: gpt-4o
Instructions:
You are Equi Bot, a specialist in equestrian care, training, and horse management. You have expertise in:
- Horse health and veterinary care
- Training techniques and methods
- Stable management and care routines
- Nutrition and feeding programs
- Riding and safety practices
- Equipment and tack
- Breeding and genetics

Provide professional advice based on current equestrian best practices.

Tools: Enable "File search"
```

### Step 2: Copy Assistant IDs

After creating each assistant, copy the Assistant ID (starts with `asst_...`)

---

## Admin Panel Setup

### Step 1: Access Admin Panel

1. Make sure your email is in the `ADMIN_EMAILS` environment variable
2. Sign in to your application
3. Navigate to `/admin`

### Step 2: Configure Bot Assistant IDs

1. Go to `/admin/bots`
2. For each bot (Boss Bot, Bee Bot, Equi Bot):
   - Click the eye icon to reveal the Assistant ID field
   - Replace the placeholder with your real Assistant ID from OpenAI
   - Click "Save"
3. Verify all bots show "Bot updated successfully!" message

### Step 3: Test Chat Functionality

1. Go to `/chat`
2. Send a test message to any bot
3. Verify you receive a response from OpenAI

---

## Feature Overview

### 🤖 **Bot Management**

#### System Bots
- **Boss Bot** (Tier 1): General assistant
- **Bee Bot** (Tier 1): Beekeeping expert
- **Equi Bot** (Tier 2): Equestrian specialist

#### Custom Bots (Pro/Premium Only)
- Create unlimited custom bots
- Upload knowledge files (PDFs, docs, images)
- Each bot gets its own OpenAI Assistant + Vector Store
- Full file search capabilities

### 🎟️ **Promo Code System**

#### Admin Features (`/admin/promo-codes`)
- Generate unique promo codes
- Set tier upgrade (Pro or Premium)
- Set duration (e.g., 7, 30, 90 days)
- Set max uses (or unlimited)
- Set code expiry date
- Track usage and redemptions
- Activate/deactivate codes
- Delete codes

#### User Features (`/subscription`)
- Redeem promo codes
- Instant tier upgrade
- Automatic expiry handling
- Badge shows "(Promo)" during trial period

### 📁 **Knowledge Base Files**

#### Upload Files to Bots
- **Supported**: PDF, TXT, MD, DOC, DOCX, JPG, PNG, WEBP, GIF
- **Max Size**: 20MB per file
- **Features**:
  - Automatic indexing in OpenAI Vector Store
  - File search enabled in conversations
  - Image analysis with GPT-4 Vision
  - Persistent knowledge across conversations

#### How to Add Files
1. Create a custom bot (`/bots/create`)
2. Go to bot card and click "📁 Manage Knowledge"
3. Upload files
4. Chat with the bot - it can now reference your files!

### 👥 **User Tiers**

#### Tier 1 - Free
- Access to Boss Bot
- Access to 1 specialty bot (Bee Bot)
- Basic features

#### Tier 2 - Pro
- Access to all specialty bots
- Create custom bots
- Upload knowledge files
- Priority support

#### Tier 3 - Premium
- Everything in Pro
- Unlimited custom bots
- Advanced analytics
- API access (coming soon)

---

## Troubleshooting

### Chats Not Working

**Error**: "This bot is not fully configured yet"
- **Solution**: Go to `/admin/bots` and update the Assistant ID for that bot

**Error**: "Invalid assistant_id"
- **Solution**: Make sure the Assistant ID starts with `asst_` and is copied correctly from OpenAI Platform

**Error**: "401 Unauthorized"
- **Solution**: Check your `OPENAI_API_KEY` is set correctly in `.env.local`

### File Upload Issues

**Error**: "File too large"
- **Solution**: Files must be under 20MB. Compress or split large files

**Error**: "Invalid file type"
- **Solution**: Only PDF, TXT, MD, DOC, DOCX, and images are supported

**Error**: "Failed to upload file"
- **Solution**: Check your OpenAI API key has access to Files API

### Image Upload Issues (Image Recognition Power-up)

**Error**: "Image upload service not configured"
- **Solution**: Add `IMGBB_API_KEY` to your `.env.local` file
- Get a free API key at https://api.imgbb.com/
- Restart your dev server after adding the key

**Error**: "Failed to upload to image host"
- **Solution**: Check that your imgbb API key is valid
- Verify the key is correctly set in environment variables
- Check imgbb service status if issues persist

### Promo Codes Not Working

**Error**: "Forbidden: Admin access required"
- **Solution**: Verify your email is in `ADMIN_EMAILS` environment variable

**Error**: "Already redeemed"
- **Solution**: Users can only redeem each code once

**Error**: "Code expired"
- **Solution**: Check the code's expiry date in admin panel

### Admin Panel Access

**Issue**: Redirected to chat when accessing `/admin`
- **Solution**: 
  1. Check `ADMIN_EMAILS` is set in `.env.local`
  2. Verify the email matches your Clerk sign-in email exactly
  3. Restart dev server after changing environment variables

---

## Quick Start Checklist

- [ ] Set up all environment variables in `.env.local`
- [ ] Create 3 OpenAI Assistants (Boss Bot, Bee Bot, Equi Bot)
- [ ] Run `npm install`
- [ ] Run `npx prisma migrate dev`
- [ ] Run `npx prisma db seed`
- [ ] Add your email to `ADMIN_EMAILS`
- [ ] Start dev server: `npm run dev`
- [ ] Sign in to the app
- [ ] Go to `/admin/bots` and update all Assistant IDs
- [ ] Test chat functionality
- [ ] Create a promo code (optional)
- [ ] Create a custom bot (optional)

---

## Advanced Features

### Creating Custom Bots with Knowledge

1. **Upgrade to Pro/Premium** (or use promo code)
2. **Create Bot**:
   - Go to `/bots`
   - Click "✨ Create New Bot"
   - Fill in name, description, knowledge area, and instructions
   - Bot is automatically created with OpenAI Assistant + Vector Store

3. **Upload Knowledge Files**:
   - Click "📁 Manage Knowledge" on your custom bot
   - Upload relevant files (PDFs, docs, images)
   - Files are automatically indexed

4. **Start Chatting**:
   - Go to `/chat?bot=your-bot-slug`
   - Bot now has access to all uploaded files
   - Responses include information from your documents

### Monitoring Bot Usage

Go to `/admin/bots` to see:
- **Active Users**: Number of unique users chatting with each bot
- **Total Chats**: Total conversations started
- Real-time metrics

---

## Security Best Practices

1. **Keep API Keys Secret**: Never commit `.env.local` to git
2. **Use Strong Passwords**: For all accounts
3. **Limit Admin Access**: Only add trusted emails to `ADMIN_EMAILS`
4. **Monitor Usage**: Check OpenAI dashboard for API usage
5. **Review Promo Codes**: Regularly check and deactivate unused codes
6. **Production Keys**: Use production keys when deploying (not test keys)

---

## Production Deployment

Before deploying to production:

1. **Update Environment Variables**:
   - Use production Clerk keys
   - Use production OpenAI API key
   - Use production database URL
   - Set production admin emails

2. **Security**:
   - Enable HTTPS
   - Set secure cookie settings
   - Review CORS settings
   - Enable rate limiting

3. **Database**:
   - Run migrations: `npx prisma migrate deploy`
   - Back up database regularly
   - Monitor database size

4. **OpenAI**:
   - Monitor API usage and costs
   - Set usage limits
   - Review assistant performance
   - Clean up old threads periodically

---

## Support

For issues or questions:
1. Check this guide
2. Review `ADMIN_SETUP.md` for admin-specific features
3. Check OpenAI documentation: https://platform.openai.com/docs
4. Check Clerk documentation: https://clerk.com/docs

---

## License

Proprietary - All rights reserved



