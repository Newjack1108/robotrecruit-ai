import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedForumCategories() {
  console.log('Seeding forum categories...');

  const categories = [
    {
      name: 'General Discussion',
      slug: 'general',
      description: 'General bot questions and community chat',
      icon: '💬',
      order: 1,
    },
    {
      name: 'Bee Bot Hive',
      slug: 'bee-bot',
      description: 'Beekeeping tips and apiary management',
      icon: '🐝',
      order: 2,
    },
    {
      name: 'Chef Bot Kitchen',
      slug: 'chef-bot',
      description: 'Recipes, cooking tips, and culinary AI',
      icon: '👨‍🍳',
      order: 3,
    },
    {
      name: 'DIY Bot Workshop',
      slug: 'diy-bot',
      description: 'Project ideas and building guides',
      icon: '🔧',
      order: 4,
    },
    {
      name: 'Custom Bot Lab',
      slug: 'custom-bots',
      description: 'Share your custom bot creations and training tips',
      icon: '✨',
      order: 5,
    },
    {
      name: 'Feature Requests',
      slug: 'feature-requests',
      description: 'Suggest new features and improvements',
      icon: '💡',
      order: 6,
    },
  ];

  for (const category of categories) {
    await prisma.forumCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log('✅ Forum categories seeded successfully!');
}

seedForumCategories()
  .catch((e) => {
    console.error('Error seeding forum categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

