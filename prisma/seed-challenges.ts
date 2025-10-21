import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const dailyChallenges = [
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

