import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const arcadeAchievements = [
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
];

async function main() {
  console.log('Seeding arcade achievements...');

  for (const achievement of arcadeAchievements) {
    const existing = await prisma.achievement.findUnique({
      where: { key: achievement.key },
    });

    if (existing) {
      console.log(`✓ Achievement "${achievement.name}" already exists, skipping...`);
    } else {
      await prisma.achievement.create({
        data: achievement,
      });
      console.log(`✓ Created achievement: ${achievement.name}`);
    }
  }

  console.log('Arcade achievements seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

