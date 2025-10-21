# Admin Panel Setup Guide

## Overview
The admin panel allows you to securely manage OpenAI Assistant IDs for your bots. All assistant IDs are stored in the database and can be updated through a secure web interface.

## 🔐 Security Features

1. **Email-based Authentication**: Only users with emails listed in `ADMIN_EMAILS` environment variable can access the admin panel
2. **Server-side Validation**: All updates are validated on the server before being saved
3. **Masked Display**: Assistant IDs are partially masked in the UI for security
4. **API Key Protection**: Your OpenAI API key remains secure in environment variables
5. **Format Validation**: Ensures assistant IDs start with `asst_` before saving

## 📋 Setup Instructions

### Step 1: Set Admin Email(s)

Add your admin email(s) to your `.env.local` file:

```env
# Add this line to your .env.local
ADMIN_EMAILS=your-email@example.com,another-admin@example.com
```

**Note**: Use the same email you use to sign in with Clerk.

### Step 2: Create OpenAI Assistants

1. Go to [OpenAI Platform](https://platform.openai.com/assistants)
2. Click "Create Assistant" for each bot
3. Configure each assistant with:
   - **Name**: (e.g., "Boss Bot", "Bee Bot", "Equi Bot")
   - **Instructions**: Detailed system prompt for the bot's role
   - **Model**: Choose `gpt-4o` or `gpt-3.5-turbo`
   - **Tools**: Enable any tools you want (Code Interpreter, File Search, etc.)
4. Copy the Assistant ID (starts with `asst_`)

#### Recommended Instructions for Each Bot:

**Boss Bot:**
```
You are Boss Bot, an intelligent assistant router. Your role is to help users by directing them to the right specialist or providing general assistance. You're friendly, helpful, and knowledgeable about various topics. When users ask specific questions that would be better answered by a specialist, guide them to the appropriate bot.
```

**Bee Bot:**
```
You are Bee Bot, an expert in beekeeping, apiculture, and honey production. You have extensive knowledge about:
- Bee colony management and care
- Hive construction and maintenance
- Honey extraction and processing
- Bee health and disease prevention
- Seasonal beekeeping practices
- Equipment and tools for beekeeping
- Pollination and environmental benefits

Provide detailed, practical advice based on best practices in beekeeping.
```

**Equi Bot:**
```
You are Equi Bot, a specialist in equestrian care, training, and horse management. You have expertise in:
- Horse health and veterinary care
- Training techniques and methods
- Stable management and care routines
- Nutrition and feeding programs
- Riding and safety practices
- Equipment and tack
- Breeding and genetics

Provide professional advice based on current equestrian best practices.
```

### Step 3: Access Admin Panel

1. Sign in to your application
2. Navigate to `/admin` in your browser
3. If you're not an admin, you'll be redirected to the chat page
4. If you are an admin, you'll see the admin dashboard

### Step 4: Update Assistant IDs

1. Go to `/admin/bots` to see all bots
2. For each bot:
   - Click the eye icon to reveal the current Assistant ID
   - Replace the placeholder with your real OpenAI Assistant ID
   - Click "Save"
3. You should see a success message

## 🎯 Admin Panel Features

### Dashboard (`/admin`)
- View total number of bots
- View total number of users
- View total number of conversations

### Manage Bots (`/admin/bots`)
- View all bots with their configurations
- Update OpenAI Assistant IDs
- Show/hide Assistant IDs for security
- Real-time validation of Assistant ID format

## 🔧 API Endpoints

### `PATCH /api/admin/bots`

Update a bot's OpenAI Assistant ID.

**Request Body:**
```json
{
  "botId": "string",
  "openaiAssistantId": "asst_..."
}
```

**Security:**
- Requires authentication (Clerk)
- Validates user is admin (email in ADMIN_EMAILS)
- Validates Assistant ID format
- Server-side only (no client-side bypass)

## 🚨 Troubleshooting

### "Forbidden: Admin access required"
- Check that your email is in the `ADMIN_EMAILS` environment variable
- Make sure you're signed in with the correct account
- Restart your dev server after changing environment variables

### "Invalid assistant ID format"
- Assistant IDs must start with `asst_`
- Copy the full ID from OpenAI Platform
- Example: `asst_abc123xyz789`

### Chats Not Working
- Make sure you've updated all bot Assistant IDs
- Verify your `OPENAI_API_KEY` is set in `.env.local`
- Check the OpenAI Assistants are active on the platform
- Look at server logs for specific errors

## 📝 Database Structure

The `openaiAssistantId` field is stored in the `Bot` table:

```prisma
model Bot {
  id                String   @id @default(cuid())
  name              String
  slug              String   @unique
  openaiAssistantId String   @unique  // <- Stored here
  // ... other fields
}
```

## 🔄 Updating Assistants

When you need to change an assistant's behavior:

1. **Option 1 - Update on OpenAI Platform:**
   - Go to [OpenAI Assistants](https://platform.openai.com/assistants)
   - Edit the assistant's instructions
   - No need to update anything in your app

2. **Option 2 - Create New Assistant:**
   - Create a new assistant on OpenAI Platform
   - Copy the new Assistant ID
   - Update it in the admin panel
   - Old assistant can be deleted or kept as backup

## 💡 Best Practices

1. **Keep Assistant IDs Secret**: Don't commit them to git
2. **Use Descriptive Names**: Name assistants clearly on OpenAI Platform
3. **Test Before Production**: Test assistant behavior before updating IDs
4. **Backup Configuration**: Document your assistant instructions
5. **Monitor Usage**: Check OpenAI dashboard for API usage and costs

## 🎨 Customization

Want to add more admin features? Here's the structure:

```
src/app/(dashboard)/admin/
├── layout.tsx          # Admin layout with auth check
├── page.tsx            # Dashboard
└── bots/
    └── page.tsx        # Bot management

src/components/admin/
└── BotEditForm.tsx     # Form for editing bots

src/app/api/admin/
└── bots/
    └── route.ts        # Secure API endpoint
```

## 🆘 Support

If you encounter issues:
1. Check server logs for error messages
2. Verify environment variables are set correctly
3. Ensure OpenAI API key has access to Assistants API
4. Check that Assistant IDs are active on OpenAI Platform



