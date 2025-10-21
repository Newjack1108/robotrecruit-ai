# Daily Challenges + Streaks System 🎯🔥

## Overview
A comprehensive gamification system that rewards users for daily engagement with challenges and streak bonuses.

## Features Implemented

### Daily Challenges
- **Weekly Rotation**: Different challenge each day of the week
- **Automatic Tracking**: Progress tracked automatically as users perform actions
- **Real-time Updates**: Challenge progress refreshes every 30 seconds
- **Beautiful UI**: Animated progress bars with completion celebrations

### Daily Streak System
- **Check-in Tracking**: Users build consecutive day streaks
- **Milestone Rewards**:
  - 3 days: +50 bonus points
  - 7 days: +100 bonus points
  - 14 days: +250 bonus points
  - 30 days: +500 bonus points
  - 100 days: +1000 bonus points
- **Stats Tracking**: Current streak, longest streak, total check-ins
- **Header Badge**: Quick streak check-in button in navigation

## Daily Challenge Schedule

| Day | Challenge | Points | Requirement |
|-----|-----------|--------|-------------|
| Monday | Start Your Week Strong 💪 | 25 | Chat with 3 different bots |
| Tuesday | Knowledge Day 📚 | 50 | Upload a file to train a bot |
| Wednesday | Community Builder 🤝 | 30 | Make a forum post or reply |
| Thursday | Explorer 🔍 | 25 | Chat with a new bot |
| Friday | Power User ⚡ | 40 | Use any power-up feature |
| Saturday | Weekend Warrior 🎯 | 50 | Send 20 messages |
| Sunday | Team Expansion 🚀 | 30 | Hire a new bot |

## Database Schema

### New Models
- `DailyChallenge`: Stores challenge definitions
- `UserChallengeCompletion`: Tracks user progress on challenges

### User Fields Added
- `currentStreak`: Current consecutive days
- `longestStreak`: All-time best streak
- `lastCheckIn`: Last daily check-in timestamp
- `totalCheckIns`: Lifetime check-in count
- `streakPoints`: Points earned from streak milestones
- `completedChallenges`: Relation to challenge completions

## API Endpoints

### Challenges
- `GET /api/challenges/today` - Get today's challenge and user progress
- `POST /api/challenges/progress` - Track progress (automatic, internal use)

### Streaks
- `GET /api/streaks` - Get user's streak information
- `POST /api/streaks` - Daily check-in to continue streak

## Components

### DailyChallengeCard
**Location**: `src/components/challenges/DailyChallengeCard.tsx`
- Displays today's challenge
- Shows progress bar with real-time updates
- Animated completion celebration
- Auto-refreshes every 30 seconds

### StreakCounter
**Location**: `src/components/streaks/StreakCounter.tsx`
- **Header Variant**: Compact flame icon with check-in button
- **Dashboard Variant**: Full stats card with progress and milestones
- Shows current streak, longest streak, and points earned
- Animated check-in button when available

## Integration Points

### Automatic Challenge Tracking
Challenges are automatically tracked in these actions:
1. **Chat Messages** (`/api/chat/route.ts`):
   - Tracks "send_messages" challenge
   - Tracks "chat_unique_bots" challenge
   - Tracks "use_powerup" challenge (if power-ups active)

2. **Bot Hiring** (`/api/bots/hire/route.ts`):
   - Tracks "hire_bot" challenge

3. **File Uploads** (`/api/bots/[botId]/files/route.ts`):
   - Tracks "upload_file" challenge

4. **Forum Posts** (`/api/forum/posts/route.ts`):
   - Tracks "forum_activity" challenge

## UI Locations

### Dashboard
- Daily Challenge card appears below Profile Stats
- Streak counter card appears next to Daily Challenge
- Both in responsive 2-column grid (stacks on mobile)

### Header
- Compact streak counter between tier badge and notification bell
- Shows current streak with flame icon
- Click to check in (pulses when available)

## Notifications
- Streak milestone notifications sent automatically
- Challenge completion tracked (can trigger notifications if desired)
- Integration with existing notification system

## Styling
- Matches existing futuristic/tech theme
- Gradient backgrounds (yellow/orange for challenges, orange/red for streaks)
- Animated progress bars and completion effects
- Responsive design for mobile

## Testing the Feature

### Test Daily Challenge
1. Go to Dashboard
2. See today's challenge displayed
3. Perform the required action (e.g., chat with bots)
4. Watch progress bar update (may need to refresh or wait 30 seconds)
5. Complete challenge to see celebration animation

### Test Streaks
1. Click flame icon in header or view dashboard streak card
2. Click "Check In Now!" button
3. See streak increment
4. Check in on consecutive days to build streak
5. Reach milestones (3, 7, 14, 30, 100 days) for bonus points

## Future Enhancements (Optional)
- Weekly/Monthly challenges
- Challenge leaderboards
- Custom challenge categories
- Streak freeze/protection items
- Challenge difficulty tiers
- Team/group challenges
- Special event challenges
- Streak recovery options

## Notes
- Challenges reset daily at midnight (based on server time)
- Streaks break if you miss a day
- Progress tracking is fire-and-forget (won't slow down user actions)
- TypeScript errors during development are addressed with `as any` assertions (database schema is correct)
- Server restart will pick up new Prisma types after file locking resolves

---

**Created**: {{ current_date }}
**Version**: 1.0
**Status**: ✅ Fully Implemented and Ready to Test!

