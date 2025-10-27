import { prisma } from '@/lib/db';
import { ACHIEVEMENT_DEFINITIONS } from './achievements';
import { createNotification } from './notifications';

export interface UserStats {
  hiredBots: number;
  conversations: number;
  forumPosts: number;
  forumReplies: number;
  powerUpUsed: number;
  customBots: number;
  tutorialCompleted: boolean;
  allSystemBotsHired: boolean;
  showcases: number;
  totalKudosReceived: number;
  featuredShowcase: boolean;
  arcadeGamesPlayed: number;
  perfectGame: boolean;
  arcadeHighScore: number;
  leaderboardTop3: boolean;
  botBattleHighScore: number;
  botBattlePerfectGame: boolean;
  botBattleMaxStreak: number;
  botSlotsHighScore: number;
  botSlotsJackpots: number;
  botSlotsCreditsWon: number;
  botRunnerHighScore: number;
  botRunnerGamesPlayed: number;
  botRunnerPerfectGame: boolean;
  botRunnerTotalTasks: number;
  totalPoints: number;
}

/**
 * Calculate user stats from database
 */
export async function calculateUserStats(userId: string): Promise<UserStats> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      hiredBots: true,
      conversations: true,
      customBots: {
        where: { creatorId: userId }
      },
    },
  }) as any; // Type assertion for Prisma client regeneration

  if (!user) {
    throw new Error('User not found');
  }
  
  // Get power-up usage count separately to avoid relation issues
  const powerUpUsageCount = await prisma.powerUpUsage.count({
    where: { userId },
  }).catch(() => 0); // Gracefully handle if table doesn't exist yet

  // Get achievements separately
  const userAchievements = await (prisma as any).userAchievement.findMany({
    where: { userId },
    include: {
      achievement: true,
    },
  });

  // Get forum stats separately (since they may not be in the include due to Prisma client regeneration)
  const forumPosts = await (prisma as any).forumPost.count({
    where: { authorId: userId },
  });

  const forumReplies = await (prisma as any).forumReply.count({
    where: { authorId: userId },
  });

  // Count system bots
  const systemBots = await prisma.bot.count({
    where: { isSystemBot: true },
  });

  const hiredSystemBots = user.hiredBots.filter((hb: any) => {
    // Need to check if bot is system bot
    return true; // TODO: Need bot info in hiredBots
  }).length;

  const allSystemBotsHired = hiredSystemBots >= systemBots;

  // Get showcase stats
  const userShowcases = await (prisma as any).userShowcase.findMany({
    where: { userId },
    select: {
      id: true,
      kudosCount: true,
      featured: true,
    },
  });

  const totalKudosReceived = userShowcases.reduce((sum: number, showcase: any) => sum + showcase.kudosCount, 0);
  const featuredShowcase = userShowcases.some((showcase: any) => showcase.featured);

  // Get arcade stats - all games
  const allArcadeScores = await (prisma as any).gameScore.findMany({
    where: { userId },
  });
  
  const arcadeGamesPlayed = allArcadeScores.length;

  // Get arcade stats - Bot Memory Match only
  const arcadeScores = await (prisma as any).gameScore.findMany({
    where: { 
      userId,
      gameType: 'bot_memory_match'
    },
    orderBy: { score: 'desc' },
  });
  const perfectGame = arcadeScores.some((score: any) => score.moves === 6); // 6 pairs = perfect game for Memory Match
  const arcadeHighScore = arcadeScores.length > 0 ? arcadeScores[0].score : 0;

  // Check if user is in top 3 today (for any game)
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const dailyLeaderboard = await (prisma as any).gameScore.findMany({
    where: {
      gameType: 'bot_memory_match',
      createdAt: { gte: startOfDay },
    },
    orderBy: [
      { score: 'desc' },
      { timeSeconds: 'asc' },
      { createdAt: 'asc' },
    ],
    take: 3,
  });
  const leaderboardTop3 = dailyLeaderboard.some((entry: any) => entry.userId === userId);

  // Get Bot Battle Arena specific stats
  const battleScores = await (prisma as any).gameScore.findMany({
    where: { 
      userId,
      gameType: 'bot_battle_arena'
    },
    orderBy: { score: 'desc' },
  });

  const botBattleHighScore = battleScores.length > 0 ? battleScores[0].score : 0;
  
  // Check for perfect game (all 5 rounds with no mistakes)
  const botBattlePerfectGame = battleScores.some((score: any) => {
    const metadata = score.metadata as any;
    return metadata?.wrongHits === 0 && metadata?.correctHits > 0;
  });
  
  // Get max streak from any Bot Battle game
  const botBattleMaxStreak = battleScores.reduce((max: number, score: any) => {
    const metadata = score.metadata as any;
    return Math.max(max, metadata?.maxStreak || 0);
  }, 0);

  // Get Bot Slots specific stats
  const slotScores = await (prisma as any).gameScore.findMany({
    where: { 
      userId,
      gameType: 'bot_slots'
    },
    orderBy: { score: 'desc' },
  });

  const slotHistory = await (prisma as any).slotSpinHistory.findMany({
    where: { userId },
    select: {
      result: true,
      creditsWon: true,
    },
  });

  const botSlotsHighScore = slotScores.length > 0 ? slotScores[0].score : 0;
  
  // Count jackpots (all three matching)
  const botSlotsJackpots = slotHistory.filter((spin: any) => {
    const result = spin.result;
    return result[0] === result[1] && result[1] === result[2];
  }).length;
  
  // Sum credits won
  const botSlotsCreditsWon = slotHistory.reduce((sum: number, spin: any) => sum + (spin.creditsWon || 0), 0);

  // Get Bot Runner specific stats
  const runnerScores = await (prisma as any).gameScore.findMany({
    where: { 
      userId,
      gameType: 'bot_runner'
    },
    orderBy: { score: 'desc' },
  });

  const botRunnerHighScore = runnerScores.length > 0 ? runnerScores[0].score : 0;
  const botRunnerGamesPlayed = runnerScores.length;
  
  // Check for perfect game (collected all tasks with 3 lives remaining)
  const botRunnerPerfectGame = runnerScores.some((score: any) => {
    const metadata = score.metadata as any;
    return metadata?.tasksCollected === metadata?.totalTasks && metadata?.livesRemaining === 3;
  });
  
  // Get total tasks collected across all games
  const botRunnerTotalTasks = runnerScores.reduce((sum: number, score: any) => {
    const metadata = score.metadata as any;
    return sum + (metadata?.tasksCollected || 0);
  }, 0);

  const totalPoints = userAchievements.reduce((sum: number, ua: any) => sum + ua.achievement.points, 0);

  return {
    hiredBots: user.hiredBots.length,
    conversations: user.conversations.length,
    forumPosts,
    forumReplies,
    powerUpUsed: powerUpUsageCount,
    customBots: user.customBots?.length || 0,
    tutorialCompleted: user.tutorialCompleted,
    allSystemBotsHired,
    showcases: userShowcases.length,
    totalKudosReceived,
    featuredShowcase,
    arcadeGamesPlayed,
    perfectGame,
    arcadeHighScore,
    leaderboardTop3,
    botBattleHighScore,
    botBattlePerfectGame,
    botBattleMaxStreak,
    botSlotsHighScore,
    botSlotsJackpots,
    botSlotsCreditsWon,
    botRunnerHighScore,
    botRunnerGamesPlayed,
    botRunnerPerfectGame,
    botRunnerTotalTasks,
    totalPoints,
  };
}

/**
 * Check and unlock achievements for a user
 * Returns array of newly unlocked achievements
 */
export async function checkAchievements(userId: string): Promise<string[]> {
  const stats = await calculateUserStats(userId);
  const newlyUnlocked: string[] = [];

  // Get already unlocked achievements
  const unlockedAchievements = await (prisma as any).userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });

  const unlockedIds = new Set(unlockedAchievements.map((ua: any) => ua.achievementId));

  // Check each achievement definition
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    // Get achievement from database
    const achievement = await (prisma as any).achievement.findUnique({
      where: { key: def.key },
    });

    if (!achievement) continue;
    if (unlockedIds.has(achievement.id)) continue; // Already unlocked

    // Check if requirements are met
    const requirementsMet = checkRequirements(stats, def.requirement);

    if (requirementsMet) {
      // Unlock achievement
      await (prisma as any).userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          progress: 100,
        },
      });

      newlyUnlocked.push(achievement.id);

      // Send notification
      await createNotification({
        userId,
        type: 'bot_update', // Using bot_update for now, could add 'achievement_unlock' type
        title: '🎉 Achievement Unlocked!',
        message: `You earned "${def.name}" (+${def.points} points)`,
        link: '/profile',
        metadata: { achievementKey: def.key },
      }).catch(err => console.error('Failed to send achievement notification:', err));
    }
  }

  return newlyUnlocked;
}

/**
 * Check if requirements are met
 */
function checkRequirements(stats: UserStats, requirements: Record<string, any>): boolean {
  for (const [key, value] of Object.entries(requirements)) {
    const statValue = stats[key as keyof UserStats];

    if (typeof value === 'boolean') {
      if (statValue !== value) return false;
    } else if (typeof value === 'number') {
      if (typeof statValue === 'number' && statValue < value) return false;
    }
  }

  return true;
}

/**
 * Seed achievements into database
 */
export async function seedAchievements() {
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    await (prisma as any).achievement.upsert({
      where: { key: def.key },
      create: {
        key: def.key,
        name: def.name,
        description: def.description,
        icon: def.icon,
        category: def.category,
        tier: def.tier,
        points: def.points,
        requirement: def.requirement,
      },
      update: {
        name: def.name,
        description: def.description,
        icon: def.icon,
        category: def.category,
        tier: def.tier,
        points: def.points,
        requirement: def.requirement,
      },
    });
  }

  console.log(`✅ Seeded ${ACHIEVEMENT_DEFINITIONS.length} achievements`);
}

