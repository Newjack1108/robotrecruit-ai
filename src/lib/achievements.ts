// Achievement definitions and unlock logic

export interface AchievementDefinition {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: 'getting_started' | 'social' | 'power_user' | 'collector' | 'showcase' | 'arcade';
  tier: 1 | 2 | 3; // Bronze, Silver, Gold
  points: number;
  requirement: Record<string, any>;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Getting Started (Bronze)
  {
    key: 'first_hire',
    name: 'First Recruit',
    description: 'Hire your first bot',
    icon: '🎯',
    category: 'getting_started',
    tier: 1,
    points: 10,
    requirement: { hiredBots: 1 },
  },
  {
    key: 'first_chat',
    name: 'Conversation Starter',
    description: 'Send your first message',
    icon: '💬',
    category: 'getting_started',
    tier: 1,
    points: 10,
    requirement: { conversations: 1 },
  },
  {
    key: 'tutorial_complete',
    name: 'Quick Learner',
    description: 'Complete the tutorial',
    icon: '📚',
    category: 'getting_started',
    tier: 1,
    points: 15,
    requirement: { tutorialCompleted: true },
  },

  // Social (Bronze → Gold)
  {
    key: 'first_post',
    name: 'Community Member',
    description: 'Create your first forum post',
    icon: '✍️',
    category: 'social',
    tier: 1,
    points: 15,
    requirement: { forumPosts: 1 },
  },
  {
    key: 'helpful',
    name: 'Helpful',
    description: 'Reply to 5 forum posts',
    icon: '🤝',
    category: 'social',
    tier: 2,
    points: 25,
    requirement: { forumReplies: 5 },
  },
  {
    key: 'forum_veteran',
    name: 'Forum Veteran',
    description: 'Create 25 forum posts',
    icon: '👑',
    category: 'social',
    tier: 3,
    points: 50,
    requirement: { forumPosts: 25 },
  },

  // Power User (Silver → Gold)
  {
    key: 'power_user',
    name: 'Power User',
    description: 'Activate a power-up',
    icon: '⚡',
    category: 'power_user',
    tier: 2,
    points: 20,
    requirement: { powerUpUsed: 1 },
  },
  {
    key: 'custom_creator',
    name: 'Bot Creator',
    description: 'Create your first custom bot',
    icon: '🤖',
    category: 'power_user',
    tier: 2,
    points: 30,
    requirement: { customBots: 1 },
  },
  {
    key: 'chat_master',
    name: 'Chat Master',
    description: 'Have 100 conversations',
    icon: '💯',
    category: 'power_user',
    tier: 3,
    points: 50,
    requirement: { conversations: 100 },
  },

  // Collector (Bronze → Gold)
  {
    key: 'team_builder',
    name: 'Team Builder',
    description: 'Hire 3 bots',
    icon: '👥',
    category: 'collector',
    tier: 1,
    points: 20,
    requirement: { hiredBots: 3 },
  },
  {
    key: 'full_roster',
    name: 'Full Roster',
    description: 'Hire 10 bots',
    icon: '🏆',
    category: 'collector',
    tier: 2,
    points: 40,
    requirement: { hiredBots: 10 },
  },
  {
    key: 'collector',
    name: 'Ultimate Collector',
    description: 'Hire all system bots',
    icon: '👑',
    category: 'collector',
    tier: 3,
    points: 100,
    requirement: { allSystemBotsHired: true },
  },

  // Showcase (Bronze → Gold)
  {
    key: 'first_showcase',
    name: 'Show Off',
    description: 'Share your first achievement showcase',
    icon: '📸',
    category: 'showcase',
    tier: 1,
    points: 15,
    requirement: { showcases: 1 },
  },
  {
    key: 'show_off',
    name: 'Rising Star',
    description: 'Share 10 achievement showcases',
    icon: '🌟',
    category: 'showcase',
    tier: 2,
    points: 35,
    requirement: { showcases: 10 },
  },
  {
    key: 'community_star',
    name: 'Community Star',
    description: 'Receive 100 kudos on your showcases',
    icon: '⭐',
    category: 'showcase',
    tier: 3,
    points: 100,
    requirement: { totalKudosReceived: 100 },
  },
  {
    key: 'featured',
    name: 'Featured Achiever',
    description: 'Have a showcase featured by admins',
    icon: '🏅',
    category: 'showcase',
    tier: 3,
    points: 250,
    requirement: { featuredShowcase: true },
  },

  // Arcade (Bronze → Gold)
  {
    key: 'first_game',
    name: 'Game On',
    description: 'Play your first arcade game',
    icon: '🎮',
    category: 'arcade',
    tier: 1,
    points: 10,
    requirement: { arcadeGamesPlayed: 1 },
  },
  {
    key: 'perfect_game',
    name: 'Perfect Memory',
    description: 'Complete a game with no wrong moves',
    icon: '🧠',
    category: 'arcade',
    tier: 2,
    points: 30,
    requirement: { perfectGame: true },
  },
  {
    key: 'high_scorer',
    name: 'High Scorer',
    description: 'Score 700+ points in Bot Memory Match',
    icon: '🏆',
    category: 'arcade',
    tier: 2,
    points: 40,
    requirement: { arcadeHighScore: 700 },
  },
  {
    key: 'arcade_champion',
    name: 'Arcade Champion',
    description: 'Reach the top 3 on the daily leaderboard',
    icon: '👑',
    category: 'arcade',
    tier: 3,
    points: 100,
    requirement: { leaderboardTop3: true },
  },

  // Bot Battle Arena specific
  {
    key: 'lightning_reflexes',
    name: 'Lightning Reflexes',
    description: 'Score 1000+ in Bot Battle Arena',
    icon: '⚡',
    category: 'arcade',
    tier: 2,
    points: 40,
    requirement: { botBattleHighScore: 1000 },
  },
  {
    key: 'flawless_victory',
    name: 'Flawless Victory',
    description: 'Complete all 5 rounds without a single mistake',
    icon: '💯',
    category: 'arcade',
    tier: 3,
    points: 100,
    requirement: { botBattlePerfectGame: true },
  },
  {
    key: 'streak_master',
    name: 'Streak Master',
    description: 'Achieve a 10+ hit streak in Bot Battle',
    icon: '🔥',
    category: 'arcade',
    tier: 2,
    points: 50,
    requirement: { botBattleMaxStreak: 10 },
  },

  // Referral Achievements (Bronze → Gold)
  {
    key: 'first_referral',
    name: 'Social Butterfly',
    description: 'Invite your first friend to join',
    icon: '🦋',
    category: 'social',
    tier: 1,
    points: 10,
    requirement: { referralsSent: 1 },
  },
  {
    key: 'referral_master',
    name: 'Influencer',
    description: 'Successfully refer 5 friends',
    icon: '🌟',
    category: 'social',
    tier: 2,
    points: 50,
    requirement: { referralsSent: 5 },
  },
  {
    key: 'referral_legend',
    name: 'Ambassador',
    description: 'Successfully refer 10 friends',
    icon: '👑',
    category: 'social',
    tier: 3,
    points: 100,
    requirement: { referralsSent: 10 },
  },
];

// Tier colors and names for UI
export const TIER_INFO = {
  1: { name: 'Bronze', color: 'text-orange-600', bg: 'bg-orange-600/20', border: 'border-orange-600/50' },
  2: { name: 'Silver', color: 'text-gray-300', bg: 'bg-gray-300/20', border: 'border-gray-300/50' },
  3: { name: 'Gold', color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-400/50' },
} as const;

// Category names for UI
export const CATEGORY_NAMES = {
  getting_started: 'Getting Started',
  social: 'Social',
  power_user: 'Power User',
  collector: 'Collector',
  showcase: 'Showcase Master',
  arcade: 'Arcade Master',
} as const;

