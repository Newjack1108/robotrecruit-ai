# Social Media Bot - User Guide 🌐

## Overview

The **Social Media Bot** is a professional social media post writer that helps you create engaging content for Twitter/X, LinkedIn, Facebook, Instagram, and Threads. It generates platform-optimized posts complete with hashtags and best-time recommendations.

---

## Features

✨ **Platform-Specific Content**
- Twitter/X: Concise, punchy posts (280 char limit)
- LinkedIn: Professional networking content (3000 chars)
- Facebook: Engaging conversational posts
- Instagram: Visual-focused with emoji optimization
- Threads: Authentic discussion starters
- General: Multi-platform adaptable posts

🎯 **Smart Post Generation**
- Platform-optimized tone and style
- Hashtag recommendations
- Character count validation
- Best posting time suggestions

📋 **Easy Publishing**
- Copy to clipboard with one click
- Direct links to platform compose pages
- Platform-specific formatting
- Multi-platform preview

---

## How to Use

### 1. Select Social Media Bot
Navigate to the Chat page and select the **Social Media Bot** from the bot grid.

### 2. Request a Post
Ask the bot to create a post for your specific platform:

```
Write a Twitter post about launching our new product
```

```
Create a LinkedIn post about my career achievement in data science
```

```
Draft an Instagram caption for a coffee shop opening
```

### 3. Review Your Post
The bot will generate:
- **Post Content**: Optimized for your platform
- **Hashtags**: Relevant and trending
- **Character Count**: With limit warnings
- **Best Time**: Suggested posting schedule
- **Platform Tips**: Quick optimization advice

### 4. Publish Your Post
Use the action buttons:
- **Copy Post**: Copy to clipboard for pasting anywhere
- **Open in [Platform]**: Direct link to compose page with pre-filled text
- **Quick Access**: Buttons for Twitter, LinkedIn, Facebook

---

## Request Examples

### Twitter/X
```
"Write a Twitter post announcing our new AI feature"
```

### LinkedIn
```
"Create a professional LinkedIn post about my promotion to senior engineer"
```

### Facebook
```
"Write a Facebook post for our restaurant's new menu"
```

### Instagram
```
"Create an Instagram caption for a beach vacation photo"
```

### General Multi-Platform
```
"Write a social media post about climate change that works on all platforms"
```

---

## Advanced Features

### Custom Platform Formatting
The bot automatically formats posts based on the platform:
- Twitter: Short, impactful, emoji-friendly
- LinkedIn: Professional, detailed, value-driven
- Facebook: Conversational, question-based
- Instagram: Visual-focused, emoji-rich, line breaks
- Threads: Authentic, discussion-starting

### Hashtag Optimization
The bot generates relevant hashtags and displays them as interactive tags in the preview.

### Character Limit Warnings
Real-time character count with three status levels:
- 🟢 **Safe**: Under 90% of limit
- 🟡 **Warning**: 90-100% of limit
- 🔴 **Over**: Exceeds platform limit

### Best Posting Times
The bot suggests optimal posting times based on platform best practices and your content type.

---

## Platform Compose URLs

### Twitter/X
Opens Twitter compose with pre-filled text:
```
https://twitter.com/intent/tweet?text=[your-post]
```

### LinkedIn
Opens LinkedIn feed (manual paste required):
```
https://www.linkedin.com/feed/
```

### Facebook
Opens Facebook share dialog:
```
https://www.facebook.com/sharer/sharer.php?quote=[your-post]
```

### Instagram
Opens Instagram (manual paste required):
```
https://www.instagram.com/
```

**Note**: Instagram and LinkedIn don't support pre-filled posts via URL due to API restrictions. Use the "Copy Post" button and paste manually.

---

## Tips for Best Results

### Be Specific
❌ "Write a post"
✅ "Write a Twitter post about our product launch with excitement"

### Include Context
❌ "Post about my job"
✅ "Write a LinkedIn post celebrating my promotion to Senior Developer at TechCorp, focusing on growth and learning"

### Specify Tone
- Professional (LinkedIn, business Twitter)
- Casual (Facebook, Instagram)
- Inspirational (motivational content)
- Informative (educational posts)
- Promotional (product launches)

### Request Revisions
```
"Make it more professional"
"Add more emojis"
"Keep it under 200 characters"
"Make it more engaging"
```

---

## Technical Details

### Integration Points

**Parser**: `src/lib/social-media-parser.ts`
- Extracts platform, content, hashtags, character count
- Validates against platform limits
- Generates compose URLs

**Preview**: `src/components/chat/SocialMediaPreview.tsx`
- Platform-specific styling
- Character count validation
- Hashtag display
- Platform tips

**Actions**: `src/components/chat/SocialMediaActions.tsx`
- Copy to clipboard
- Platform compose links
- Multi-platform quick access

**Integration**: `src/components/chat/ChatInterface.tsx`
- Automatic post detection
- Conditional rendering for social-media-bot

### OpenAI Assistant
**Assistant ID**: `asst_NUUtQ0OqkbeWeuePpIFHUy4V`
- Trained on social media best practices
- Platform-specific tone optimization
- Hashtag strategy expertise

---

## Troubleshooting

### Post Not Detected
Make sure the bot response includes:
- Platform indication
- Clear post content
- Format markers (e.g., "Platform:", "Content:")

### Copy Not Working
- Ensure clipboard permissions are enabled in browser
- Try clicking "Copy Post" again
- Check browser console for errors

### Platform Link Not Opening
- Check popup blocker settings
- Ensure third-party cookies are enabled
- Try right-click → "Open in new tab"

### Character Count Shows Red
Your post exceeds the platform limit. Options:
1. Ask the bot to shorten it
2. Edit manually before posting
3. Consider a different platform with higher limits

---

## Future Enhancements (OAuth)

For direct posting to social media (coming soon):
1. **OAuth Integration**: Secure platform authentication
2. **Direct Posting**: Post without leaving the app
3. **Schedule Posts**: Set future posting times
4. **Analytics**: Track post performance
5. **Multi-Account**: Manage multiple profiles

To enable OAuth posting, see the implementation guide in the codebase.

---

## Platform Character Limits

| Platform | Character Limit |
|----------|----------------|
| Twitter/X | 280 |
| LinkedIn | 3,000 |
| Facebook | 63,206 |
| Instagram | 2,200 |
| Threads | 500 |

---

## Need Help?

**Common Issues**:
1. Post format not recognized → Ask bot to use standard format
2. Hashtags not showing → Request explicitly: "Include hashtags"
3. Character limit concerns → Specify: "Keep under [X] characters"

**Contact Support**: For technical issues or feature requests

---

## Example Conversation

**User**: *"Write a Twitter post announcing our new AI chatbot feature"*

**Bot**: 
```
Platform: Twitter

🚀 Excited to announce our NEW AI Chatbot feature! 

Get instant, intelligent responses 24/7. Powered by cutting-edge AI to help you work smarter, not harder. 

Try it now! 👇

Hashtags: #AI #Chatbot #Innovation #TechNews #ProductLaunch
```

**Result**: Beautiful preview card with:
- Twitter branding
- 178/280 character count (green)
- Hashtag tags
- "Copy Post" and "Open in Twitter" buttons

---

Enjoy creating amazing social media content! 🎉

