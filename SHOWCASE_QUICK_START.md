# Achievement Showcases - Quick Start Guide 🚀

## For Users

### Creating Your First Showcase
1. Navigate to `/profile`
2. Scroll to "Achievement Showcases" section
3. Click "Add Achievement" button
4. Upload a photo (max 5MB)
5. Add a title (max 100 chars)
6. Tell your story (max 1000 chars)
7. Select a category
8. Link to a bot (optional)
9. Click "Share Achievement"

### Viewing Community Showcases
- Visit `/community/showcases`
- Filter by category
- Give kudos by clicking ❤️
- Click on bots to learn more

## For Admins

### Featuring a Showcase
Currently, featuring requires direct database access. Use Prisma Studio:

```bash
npx prisma studio
```

Then update the `UserShowcase` table and set `featured` to `true` for the showcase you want to highlight.

**Future Enhancement**: Admin panel UI for featuring showcases.

## Categories

| Emoji | Category | Key |
|-------|----------|-----|
| 🎣 | Fishing Catch | `fishing` |
| 🐝 | Apiary Success | `beekeeping` |
| 👨‍🍳 | Culinary Creation | `cooking` |
| 🌱 | Garden Harvest | `garden` |
| 💪 | Fitness Milestone | `fitness` |
| 🔨 | DIY Project | `diy` |
| ⚽ | Sports Achievement | `sport` |
| 🎨 | Artistic Work | `art` |
| ⭐ | Other Achievement | `other` |

## Achievements

| Name | Tier | Points | Requirement |
|------|------|--------|-------------|
| 📸 Show Off | Bronze | 15 | Share 1 showcase |
| 🌟 Rising Star | Silver | 35 | Share 10 showcases |
| ⭐ Community Star | Gold | 100 | Receive 100 kudos |
| 🏅 Featured Achiever | Gold | 250 | Get featured by admin |

## API Endpoints

### GET `/api/showcases`
Query params:
- `category` - Filter by category
- `userId` - Filter by user
- `featured=true` - Only featured
- `limit` - Max results (default: 20)
- `offset` - Pagination offset

### POST `/api/showcases`
Body:
```json
{
  "title": "My First Beehive!",
  "description": "After months of learning with Bee Bot...",
  "imageUrl": "https://i.ibb.co/...",
  "category": "beekeeping",
  "relatedBotId": "bot-id-here"
}
```

### GET `/api/showcases/[showcaseId]`
Returns showcase with full details

### DELETE `/api/showcases/[showcaseId]`
Owner only - deletes showcase

### POST `/api/showcases/[showcaseId]/kudos`
Give kudos to a showcase

### DELETE `/api/showcases/[showcaseId]/kudos`
Remove your kudos

## Component Usage

### ShowcaseGallery
```tsx
<ShowcaseGallery
  userId="optional-user-id"           // Filter to specific user
  currentUserId="logged-in-user-id"   // For kudos/delete permissions
  allowUpload={true}                   // Show upload button
  limit={20}                           // Max showcases to show
  availableBots={botsArray}            // For upload form dropdown
/>
```

### ShowcaseCard
```tsx
<ShowcaseCard
  showcase={showcaseData}
  currentUserId="user-id"
  onDelete={() => refetch()}
  onKudosToggle={(hasKudos) => console.log(hasKudos)}
/>
```

### ShowcaseUploadForm
```tsx
<ShowcaseUploadForm
  onSuccess={() => closeModal()}
  onCancel={() => closeModal()}
  availableBots={botsArray}
/>
```

## Database Schema

### UserShowcase
- `id` - Unique ID
- `userId` - Owner
- `title` - Achievement title
- `description` - Story
- `imageUrl` - Photo URL
- `category` - Category key
- `relatedBotId` - Optional bot link
- `kudosCount` - Total kudos
- `featured` - Admin feature flag
- `createdAt` - Creation date

### ShowcaseKudos
- `id` - Unique ID
- `showcaseId` - Showcase reference
- `userId` - User who gave kudos
- `createdAt` - When kudos given

## Tips for Users

### Great Showcase Photos
- **High Quality**: Clear, well-lit photos
- **Context**: Show the achievement in context
- **Before/After**: Consider showing progress
- **Action Shots**: Dynamic photos engage better

### Engaging Stories
- **The Challenge**: What were you trying to achieve?
- **Bot's Help**: How did your bot assist you?
- **The Process**: What steps did you take?
- **The Result**: What did you accomplish?
- **Lessons Learned**: What would you do differently?

### Category Selection
Choose the category that best fits your achievement. When in doubt, use "Other" - admins can recategorize if needed.

## Moderation

### Content Guidelines
- Keep it appropriate
- Real achievements only
- No spam or promotional content
- Credit the bot that helped

### Reporting (Future)
Reporting system to be implemented. For now, contact admin via support tickets.

## Testing Locally

1. Create a showcase from your profile
2. View it in your gallery
3. Give it kudos from another account
4. Check achievement unlocks
5. Test category filtering
6. Try deleting it

## Troubleshooting

### "Failed to upload image"
- Check file size (max 5MB)
- Ensure it's an image file
- Try a different browser

### "Failed to create showcase"
- Verify all required fields are filled
- Check title/description length
- Ensure you're logged in

### "Achievement not unlocking"
- Achievements check on showcase creation
- Refresh your profile page
- Check `/api/user/stats` endpoint

## Next Steps

1. **Seed Data**: Create a few sample showcases to get started
2. **Promote**: Tell users about the feature
3. **Feature**: Highlight great showcases
4. **Iterate**: Gather feedback and improve

---

**Need Help?** Check the full documentation in `ACHIEVEMENT_SHOWCASES_GUIDE.md`

**Happy Showcasing!** 🎉

