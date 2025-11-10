import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const baseChallenges = [
  // Monday - Start week strong
  {
    key: 'monday_chat_3_bots',
    title: 'Start Your Week Strong',
    description: 'Chat with 3 different bots to kick off your week',
    dayOfWeek: 1, // Monday
    points: 25,
    icon: '💪',
    requirement: { type: 'chat_unique_bots', count: 3 },
    isActive: true,
  },
  
  // Tuesday - Knowledge building
  {
    key: 'tuesday_upload_file',
    title: 'Knowledge Day',
    description: 'Upload a file to train a custom bot',
    dayOfWeek: 2, // Tuesday
    points: 50,
    icon: '📚',
    requirement: { type: 'upload_file', count: 1 },
    isActive: true,
  },
  
  // Wednesday - Community engagement
  {
    key: 'wednesday_forum_activity',
    title: 'Community Builder',
    description: 'Make a forum post or reply to engage with the community',
    dayOfWeek: 3, // Wednesday
    points: 30,
    icon: '🤝',
    requirement: { type: 'forum_activity', count: 1 },
    isActive: true,
  },
  
  // Thursday - Exploration
  {
    key: 'thursday_new_bot',
    title: 'Explorer',
    description: 'Chat with a bot you\'ve never used before',
    dayOfWeek: 4, // Thursday
    points: 25,
    icon: '🔍',
    requirement: { type: 'chat_new_bot', count: 1 },
    isActive: true,
  },
  
  // Friday - Power user
  {
    key: 'friday_use_powerup',
    title: 'Power User',
    description: 'Use any power-up feature to enhance your chat',
    dayOfWeek: 5, // Friday
    points: 40,
    icon: '⚡',
    requirement: { type: 'use_powerup', count: 1 },
    isActive: true,
  },
  
  // Saturday - High volume
  {
    key: 'saturday_send_messages',
    title: 'Weekend Warrior',
    description: 'Send 20 messages to your bots',
    dayOfWeek: 6, // Saturday
    points: 50,
    icon: '🎯',
    requirement: { type: 'send_messages', count: 20 },
    isActive: true,
  },
  
  // Sunday - Social day
  {
    key: 'sunday_hire_bot',
    title: 'Team Expansion',
    description: 'Hire a new bot to join your team',
    dayOfWeek: 0, // Sunday
    points: 30,
    icon: '🚀',
    requirement: { type: 'hire_bot', count: 1 },
    isActive: true,
  },
];

const puzzleChallenges = [
  {
    key: 'monday_daily_puzzle',
    title: 'Puzzle Commander',
    description: 'Complete the daily strategy puzzle to prove your tactical edge.',
    dayOfWeek: 1,
    points: 35,
    icon: '🧩',
    requirement: { type: 'daily_puzzle', count: 1 },
    isActive: true,
  },
  {
    key: 'tuesday_daily_puzzle',
    title: 'Tactical Thinker',
    description: 'Complete the daily strategy puzzle to keep your streak alive.',
    dayOfWeek: 2,
    points: 35,
    icon: '🧩',
    requirement: { type: 'daily_puzzle', count: 1 },
    isActive: true,
  },
  {
    key: 'wednesday_daily_puzzle',
    title: 'Midweek Mastermind',
    description: 'Solve the daily puzzle and claim your reward.',
    dayOfWeek: 3,
    points: 35,
    icon: '🧩',
    requirement: { type: 'daily_puzzle', count: 1 },
    isActive: true,
  },
  {
    key: 'thursday_daily_puzzle',
    title: 'Strategist Supreme',
    description: 'Complete the daily puzzle to stay sharp.',
    dayOfWeek: 4,
    points: 35,
    icon: '🧩',
    requirement: { type: 'daily_puzzle', count: 1 },
    isActive: true,
  },
  {
    key: 'friday_daily_puzzle',
    title: 'Friday Formation',
    description: 'Solve the daily puzzle and secure the weekend bonus.',
    dayOfWeek: 5,
    points: 40,
    icon: '🧩',
    requirement: { type: 'daily_puzzle', count: 1 },
    isActive: true,
  },
  {
    key: 'saturday_daily_puzzle',
    title: 'Weekend Warden',
    description: 'Daily puzzle victories keep the arcade streak alive.',
    dayOfWeek: 6,
    points: 40,
    icon: '🧩',
    requirement: { type: 'daily_puzzle', count: 1 },
    isActive: true,
  },
  {
    key: 'sunday_daily_puzzle',
    title: 'Sunday Solver',
    description: 'Close out the week with a successful puzzle plan.',
    dayOfWeek: 0,
    points: 40,
    icon: '🧩',
    requirement: { type: 'daily_puzzle', count: 1 },
    isActive: true,
  },
];

const dailyChallenges = [...baseChallenges, ...puzzleChallenges];

async function main() {
  console.log('🌱 Seeding daily challenges...');
  
  for (const challenge of dailyChallenges) {
    await prisma.dailyChallenge.upsert({
      where: { key: challenge.key },
      update: challenge,
      create: challenge,
    });
    console.log(`✅ Created/Updated challenge: ${challenge.title}`);
  }
  
  console.log('🎉 Daily challenges seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

