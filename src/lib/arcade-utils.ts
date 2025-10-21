/**
 * Arcade Game Utilities
 * Shared logic for arcade games including scoring, bot selection, and shuffling
 */

export interface BotCard {
  id: string;
  slug: string;
  name: string;
  avatarUrl: string;
}

/**
 * Bots to use for the memory game
 * Using bots with the best avatar images
 */
export const GAME_BOTS: BotCard[] = [
  {
    id: 'boss-bot',
    slug: 'boss-bot',
    name: 'Boss Bot',
    avatarUrl: '/bots/boss-bot-avatar.png'
  },
  {
    id: 'bee-bot',
    slug: 'bee-bot',
    name: 'Bee Bot',
    avatarUrl: '/bots/bee-bot-avatar.png'
  },
  {
    id: 'chef-bot',
    slug: 'chef-bot',
    name: 'Chef Bot',
    avatarUrl: '/bots/chef-bot-avatar.png'
  },
  {
    id: 'diy-bot',
    slug: 'diy-bot',
    name: 'DIY Bot',
    avatarUrl: '/bots/diy-bot-avatar.png'
  },
  {
    id: 'scout-bot',
    slug: 'scout-bot',
    name: 'Scout Bot',
    avatarUrl: '/bots/scout-bot-avatar.png'
  },
  {
    id: 'garden-bot',
    slug: 'garden-bot',
    name: 'Garden Bot',
    avatarUrl: '/bots/garden-bot-avatar.png'
  }
];

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Create a deck of cards for the memory game
 * Returns pairs of cards shuffled randomly
 */
export function createCardDeck(bots: BotCard[]) {
  // Create pairs
  const pairs = bots.flatMap(bot => [
    { ...bot, cardId: `${bot.id}-1` },
    { ...bot, cardId: `${bot.id}-2` }
  ]);
  
  // Shuffle the deck
  return shuffleArray(pairs);
}

/**
 * Calculate score for Bot Memory Match
 * @param moves - Total number of card flips (pairs attempted)
 * @param timeSeconds - Time taken to complete the game
 * @param totalPairs - Total number of pairs in the game
 * @returns Final score
 */
export function calculateScore(
  moves: number,
  timeSeconds: number,
  totalPairs: number
): number {
  const baseScore = totalPairs * 100;
  const movePenalty = Math.max(0, (moves - totalPairs) * 5); // Only penalize extra moves
  const timePenalty = Math.floor(timeSeconds / 2);
  const perfectBonus = (moves === totalPairs) ? 500 : 0; // Perfect game = no wrong moves
  
  const finalScore = Math.max(0, baseScore - movePenalty - timePenalty + perfectBonus);
  return finalScore;
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get performance rating based on score
 */
export function getPerformanceRating(score: number): {
  label: string;
  color: string;
  emoji: string;
} {
  if (score >= 900) {
    return { label: 'Perfect!', color: 'text-yellow-400', emoji: '⭐' };
  } else if (score >= 700) {
    return { label: 'Excellent', color: 'text-cyan-400', emoji: '🎯' };
  } else if (score >= 500) {
    return { label: 'Great', color: 'text-blue-400', emoji: '👍' };
  } else if (score >= 300) {
    return { label: 'Good', color: 'text-green-400', emoji: '✓' };
  } else {
    return { label: 'Keep Trying', color: 'text-gray-400', emoji: '💪' };
  }
}

// ==================== BOT BATTLE ARENA ====================

export interface RoundConfig {
  roundNumber: number;
  durationSeconds: number;
  minBots: number;
  maxBots: number;
  hitsToChangeTarget: number;
}

/**
 * Round configurations for Bot Battle Arena
 * Progressive difficulty: faster rounds, more bots, targets change more often
 */
export const BATTLE_ROUND_CONFIGS: RoundConfig[] = [
  { roundNumber: 1, durationSeconds: 20, minBots: 1, maxBots: 2, hitsToChangeTarget: 5 },
  { roundNumber: 2, durationSeconds: 20, minBots: 1, maxBots: 2, hitsToChangeTarget: 5 },
  { roundNumber: 3, durationSeconds: 18, minBots: 1, maxBots: 2, hitsToChangeTarget: 4 },
  { roundNumber: 4, durationSeconds: 18, minBots: 1, maxBots: 3, hitsToChangeTarget: 4 },
  { roundNumber: 5, durationSeconds: 15, minBots: 2, maxBots: 3, hitsToChangeTarget: 3 },
];

/**
 * Calculate score for a single click in Bot Battle
 */
export function calculateClickScore(
  isCorrect: boolean,
  reactionTimeMs: number,
  currentStreak: number
): number {
  if (!isCorrect) return -50;
  
  let score = 100;
  
  // Speed bonus: faster clicks = more points (max +50)
  if (reactionTimeMs < 500) {
    score += Math.floor((500 - reactionTimeMs) / 10);
  }
  
  // Streak multiplier: 3+ correct in a row = 1.5x
  if (currentStreak >= 3) {
    score = Math.floor(score * 1.5);
  }
  
  return score;
}

/**
 * Calculate perfect round bonus
 */
export function calculatePerfectRoundBonus(correctHits: number, wrongHits: number): number {
  return wrongHits === 0 && correctHits > 0 ? 300 : 0;
}

/**
 * Select a random bot excluding the current target
 */
export function selectRandomBot(excludeBot?: BotCard): BotCard {
  const availableBots = excludeBot 
    ? GAME_BOTS.filter(b => b.id !== excludeBot.id)
    : GAME_BOTS;
  
  const randomIndex = Math.floor(Math.random() * availableBots.length);
  return availableBots[randomIndex];
}

/**
 * Select multiple random bots for spawning
 */
export function selectMultipleBots(count: number, targetBot?: BotCard): BotCard[] {
  const bots: BotCard[] = [];
  
  // 40% chance to include target bot
  if (targetBot && Math.random() < 0.4) {
    bots.push(targetBot);
  }
  
  // Fill remaining slots with random bots (avoiding duplicates in same spawn)
  while (bots.length < count) {
    const bot = selectRandomBot();
    // Avoid duplicates in current spawn
    if (!bots.some(b => b.id === bot.id)) {
      bots.push(bot);
    }
  }
  
  return bots;
}

/**
 * Get random spawn duration (how long bot stays visible)
 */
export function getSpawnDuration(): number {
  return 3500 + Math.random() * 1500; // 3.5-5 seconds - longer visibility for easier gameplay
}

/**
 * Get Bot Battle performance rating
 */
export function getBattlePerformanceRating(score: number): {
  label: string;
  color: string;
  emoji: string;
} {
  if (score >= 1500) {
    return { label: 'Legendary!', color: 'text-yellow-400', emoji: '👑' };
  } else if (score >= 1000) {
    return { label: 'Amazing!', color: 'text-cyan-400', emoji: '⚡' };
  } else if (score >= 700) {
    return { label: 'Great!', color: 'text-blue-400', emoji: '🎯' };
  } else if (score >= 400) {
    return { label: 'Good!', color: 'text-green-400', emoji: '👍' };
  } else {
    return { label: 'Keep Training!', color: 'text-gray-400', emoji: '💪' };
  }
}

