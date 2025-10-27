# Email Bot - Complete Implementation Guide 📧

## Overview
The Email Bot is an AI assistant that crafts professional emails and opens them directly in your email client. Users can generate emails through conversation and launch them with one click.

## Features Implemented

### ✅ Email Composition
- **Natural Language Input**: "Write an email to john@example.com about tomorrow's meeting"
- **Professional Templates**: Business emails, follow-ups, thank you notes, etc.
- **Smart Parsing**: Extracts To, Subject, CC, BCC, and Body from bot responses

### ✅ Email Actions
- **Open in Email Client** (mailto:) - Opens default email app on any device
- **Open in Gmail** - Direct link to Gmail compose with pre-filled content
- **Copy to Clipboard** - Full email text for manual pasting

### ✅ Email Preview
- Clean visual preview before sending
- Shows To, CC, BCC, Subject, and Body
- Formatted in a card-style layout

## How It Works

### 1. Bot Detection
The system detects when Email Bot generates an email by looking for indicators:
- "To:", "Subject:", "Body:" headers
- Phrases like "Here's your email" or "I've drafted an email"
- JSON format: ```json { "to": "...", "subject": "...", "body": "..." } ```

### 2. Email Parsing
The `parseEmailFromMessage()` function extracts:
```typescript
{
  to: "recipient@example.com",
  cc: "cc@example.com", // optional
  bcc: "bcc@example.com", // optional
  subject: "Email Subject",
  body: "Email content..."
}
```

### 3. Action Buttons
Three options are provided:
1. **Open in Email Client** - Uses `mailto:` protocol (works on mobile too!)
2. **Open in Gmail** - Web-based Gmail compose
3. **Copy to Clipboard** - Fallback option

## Usage Examples

### Basic Email
```
User: "Write an email to sarah@company.com about the project update"

Bot: 
To: sarah@company.com
Subject: Project Update

Hi Sarah,

I wanted to provide you with a quick update on our project...

[Email Preview + Action Buttons Appear]
```

### Email with CC/BCC
```
User: "Draft an email to team@company.com, cc: manager@company.com about 
the meeting tomorrow"

Bot: 
To: team@company.com
CC: manager@company.com
Subject: Tomorrow's Team Meeting

Hi Team,

This is a reminder about our meeting tomorrow...

[Email Preview + Action Buttons Appear]
```

### Professional Email
```
User: "Write a professional follow-up email after an interview"

Bot: 
To: [You provide the email]
Subject: Thank You - Interview Follow-up

Dear [Interviewer Name],

Thank you for taking the time to meet with me yesterday...

[Email Preview + Action Buttons Appear]
```

## Files Created

### 1. `prisma/seed.ts`
- Added Email Bot to database seed
- Configuration:
  - **Slug**: `email-bot`
  - **Name**: Email Bot
  - **Tier**: 1 (available to all users)
  - **Knowledge Area**: Email Composition & Communication

### 2. `src/components/chat/EmailActions.tsx`
- Email action buttons component
- Email preview component
- Handles mailto:, Gmail, and clipboard actions

### 3. `src/lib/email-parser.ts`
- Parses email content from bot messages
- Supports multiple formats (JSON, structured, natural)
- Validates and extracts email components

### 4. `src/components/chat/ChatInterface.tsx` (Modified)
- Added email detection logic
- Renders EmailPreview and EmailActions for Email Bot
- Integrated alongside existing bot features (like Chef Bot ingredients)

## Technical Details

### Mailto Protocol Limitations
- **Character Limit**: ~2000 characters
- **Fallback**: Copy-to-clipboard when email is too long
- **Mobile Support**: Automatically opens native email apps

### Email Formats Supported

**Format 1: Structured**
```
To: recipient@example.com
Subject: Email Subject
Body:
Email content here...
```

**Format 2: JSON**
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "body": "Email content..."
}
```

**Format 3: Natural**
```
Here's your email:

To: recipient@example.com
Subject: Email Subject

Email content starts here...
```

## Setting Up the Email Bot

### 1. Run Database Migration
```bash
npx prisma db seed
```

This adds Email Bot to your database.

### 2. Create OpenAI Assistant
You'll need to create an Email Bot assistant in OpenAI:

**System Prompt Example:**
```
You are a professional email writing assistant. When users ask you to write 
an email, format your response like this:

To: recipient@example.com
Subject: Clear subject line
Body:
[Email content]

Always be professional, concise, and clear. Adapt your tone based on the 
context (formal business, casual colleague, thank you note, etc.).
```

### 3. Update Assistant ID
In your database or environment, update:
```sql
UPDATE Bot 
SET openaiAssistantId = 'asst_YOUR_ACTUAL_EMAIL_BOT_ID'
WHERE slug = 'email-bot';
```

### 4. Deploy
```bash
git add .
git commit -m "Add Email Bot with mailto integration"
git push origin main
```

## User Experience Flow

1. **User hires Email Bot** from the bot marketplace
2. **Starts conversation**: "Write an email about..."
3. **Bot generates email** with proper formatting
4. **Email preview appears** in chat
5. **User clicks** "Open in Email Client"
6. **Native email app opens** with pre-filled email
7. **User reviews and sends** from their email client

## Benefits

✅ **Time Saver** - Draft emails in seconds
✅ **Professional** - AI-crafted professional language
✅ **Convenient** - One-click to email client
✅ **Mobile Friendly** - Works on all devices
✅ **Privacy First** - No email sent without user approval
✅ **Flexible** - Multiple sending options

## Future Enhancements

Possible additions:
- **Email Templates** - Pre-defined templates (resignation, cold outreach, etc.)
- **Signature Integration** - Auto-append user signature
- **Attachments** - Handle file attachments
- **Email Threading** - Reply to existing conversations
- **Save Drafts** - Store drafts in database
- **Analytics** - Track email open rates (with user permission)

## Troubleshooting

### Email doesn't open
- **Issue**: mailto: links blocked
- **Solution**: Use "Copy to Clipboard" button

### Email truncated
- **Issue**: Character limit exceeded
- **Solution**: Email parser shows warning, use clipboard

### Formatting lost
- **Issue**: Email client removes formatting
- **Solution**: Keep formatting simple (plain text works best)

## Conclusion

The Email Bot feature is now fully integrated and ready to use! Users can generate professional emails through natural conversation and launch them in their preferred email client with one click.

---

**Status**: ✅ Complete and Ready to Deploy
**Platform**: Web + Mobile Compatible
**User Tier**: Available to all (Tier 1)

