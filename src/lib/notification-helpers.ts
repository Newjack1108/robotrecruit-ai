import { prisma } from '@/lib/db';

/**
 * Notification helper functions for consistent notification creation
 */

export interface NotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata?: any;
}

export async function createNotification(data: NotificationData) {
  return await prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      metadata: data.metadata,
    },
  });
}

// Notification templates
export const NotificationTemplates = {
  streakReminder: (userId: string, currentStreak: number, hoursLeft: number) => ({
    userId,
    type: 'streak_reminder',
    title: '🔥 Don't Lose Your Streak!',
    message: `Your ${currentStreak}-day streak expires in ${hoursLeft} hours! Check in now to keep it going.`,
    link: '/dashboard',
  }),

  challengeAvailable: (userId: string, challengeName: string) => ({
    userId,
    type: 'challenge_reminder',
    title: '🎯 New Daily Challenge!',
    message: `Today's challenge: ${challengeName}. Complete it to earn bonus points!`,
    link: '/dashboard',
  }),

  friendBeatScore: (userId: string, friendEmail: string, game: string, score: number) => ({
    userId,
    type: 'friend_activity',
    title: '🏆 Friend Beat Your Score!',
    message: `${friendEmail} scored ${score} in ${game}!`,
    link: '/arcade',
  }),

  tournamentEnding: (userId: string, tournamentName: string, hoursLeft: number) => ({
    userId,
    type: 'tournament_reminder',
    title: '⏰ Tournament Ending Soon!',
    message: `${tournamentName} ends in ${hoursLeft} hours! Make your final push for the leaderboard!`,
    link: '/tournaments',
  }),

  dailyWheelAvailable: (userId: string, spinsAvailable: number) => ({
    userId,
    type: 'wheel_reminder',
    title: '🎰 Daily Wheel Spins Available!',
    message: `You have ${spinsAvailable} free spin${spinsAvailable > 1 ? 's' : ''} available. Spin now for rewards!`,
    link: '/wheel',
  }),

  newFriend: (userId: string, friendEmail: string) => ({
    userId,
    type: 'friend_activity',
    title: '👥 New Friend Added!',
    message: `You're now friends with ${friendEmail}! Check out their stats and compete together.`,
    link: '/friends',
  }),
};

/**
 * Send notification to user (wrapper for consistency)
 */
export async function sendNotification(template: ReturnType<typeof NotificationTemplates[keyof typeof NotificationTemplates]>) {
  return await createNotification(template);
}

/**
 * Bulk send notifications to multiple users
 */
export async function sendBulkNotifications(notifications: NotificationData[]) {
  return await prisma.notification.createMany({
    data: notifications,
  });
}

