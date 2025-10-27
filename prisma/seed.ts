import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create Boss Bot
  await prisma.bot.upsert({
    where: { slug: 'boss-bot' },
    update: {},
    create: {
      name: 'Boss Bot',
      slug: 'boss-bot',
      description: 'Your intelligent assistant router. Ask me anything and I\'ll direct you to the right specialist.',
      imageUrl: '/bots/boss-bot.png',
      avatarUrl: '/bots/boss-bot-avatar.png',
      openaiAssistantId: 'asst_REPLACE_WITH_YOUR_BOSS_BOT_ID',
      isSystemBot: true,
      knowledgeArea: 'Routing and General Assistance',
      tier: 1,
    },
  })

  // Create Bee Bot
  await prisma.bot.upsert({
    where: { slug: 'bee-bot' },
    update: {},
    create: {
      name: 'Bee Bot',
      slug: 'bee-bot',
      description: 'Expert in beekeeping, apiculture, and honey production.',
      imageUrl: '/bots/bee-bot.png',
      avatarUrl: '/bots/bee-bot-avatar.png',
      openaiAssistantId: 'asst_REPLACE_WITH_YOUR_BEE_BOT_ID',
      isSystemBot: true,
      knowledgeArea: 'Beekeeping',
      tier: 1,
    },
  })

  // Create Equi Bot
  await prisma.bot.upsert({
    where: { slug: 'equi-bot' },
    update: {},
    create: {
      name: 'Equi Bot',
      slug: 'equi-bot',
      description: 'Specialist in equestrian care, training, and horse management.',
      imageUrl: '/bots/equi-bot.png',
      avatarUrl: '/bots/equi-bot-avatar.png',
      openaiAssistantId: 'asst_REPLACE_WITH_YOUR_EQUI_BOT_ID',
      isSystemBot: true,
      knowledgeArea: 'Equestrian',
      tier: 1,
    },
  })

  // Create Chef Bot
  await prisma.bot.upsert({
    where: { slug: 'chef-bot' },
    update: {},
    create: {
      name: 'Chef Bot',
      slug: 'chef-bot',
      description: 'Master chef and culinary expert for recipes, cooking techniques, and meal planning.',
      imageUrl: '/bots/chef-bot.png',
      avatarUrl: '/bots/chef-bot-avatar.png',
      openaiAssistantId: 'asst_REPLACE_WITH_YOUR_CHEF_BOT_ID',
      isSystemBot: true,
      knowledgeArea: 'Culinary Arts & Cooking',
      tier: 1,
    },
  })

  // Create Art Bot
  await prisma.bot.upsert({
    where: { slug: 'art-bot' },
    update: {},
    create: {
      name: 'Art Bot',
      slug: 'art-bot',
      description: 'Creative companion for painting, drawing, crafts, and unleashing your artistic side.',
      imageUrl: '/bots/art-bot.png',
      avatarUrl: '/bots/art-bot-avatar.png',
      openaiAssistantId: 'asst_REPLACE_WITH_YOUR_ART_BOT_ID',
      isSystemBot: true,
      knowledgeArea: 'Arts & Crafts',
      tier: 1,
      imageRecognition: true,
    },
  })

  // Create Garden Bot
  await prisma.bot.upsert({
    where: { slug: 'garden-bot' },
    update: {},
    create: {
      name: 'Garden Bot',
      slug: 'garden-bot',
      description: 'Green-thumbed expert for gardening tips, plant care, and growing your own food.',
      imageUrl: '/bots/garden-bot.png',
      avatarUrl: '/bots/garden-bot-avatar.png',
      openaiAssistantId: 'asst_REPLACE_WITH_YOUR_GARDEN_BOT_ID',
      isSystemBot: true,
      knowledgeArea: 'Gardening & Plants',
      tier: 1,
    },
  })

  // Create Scout Bot
  await prisma.bot.upsert({
    where: { slug: 'scout-bot' },
    update: {},
    create: {
      name: 'Scout Bot',
      slug: 'scout-bot',
      description: 'Adventure guide for hiking, camping, outdoor skills, and exploring the great outdoors.',
      imageUrl: '/bots/scout-bot.png',
      avatarUrl: '/bots/scout-bot-avatar.png',
      openaiAssistantId: 'asst_REPLACE_WITH_YOUR_SCOUT_BOT_ID',
      isSystemBot: true,
      knowledgeArea: 'Adventure & Outdoors',
      tier: 1,
    },
  })

  // Create Brewster Bot
  await prisma.bot.upsert({
    where: { slug: 'brewster-bot' },
    update: {},
    create: {
      name: 'Brewster Bot',
      slug: 'brewster-bot',
      description: 'Home brewing expert for craft beer, wine making, and perfecting your homebrews.',
      imageUrl: '/bots/brewster-bot.png',
      avatarUrl: '/bots/brewster-bot-avatar.png',
      openaiAssistantId: 'asst_REPLACE_WITH_YOUR_BREWSTER_BOT_ID',
      isSystemBot: true,
      knowledgeArea: 'Home Brewing & Beverages',
      tier: 1,
    },
  })

  // Create Melody Bot
  await prisma.bot.upsert({
    where: { slug: 'melody-bot' },
    update: {},
    create: {
      name: 'Melody Bot',
      slug: 'melody-bot',
      description: 'Music mentor for learning instruments, music theory, and discovering your musical talent.',
      imageUrl: '/bots/melody-bot.png',
      avatarUrl: '/bots/melody-bot-avatar.png',
      openaiAssistantId: 'asst_REPLACE_WITH_YOUR_MELODY_BOT_ID',
      isSystemBot: true,
      knowledgeArea: 'Music & Performance',
      tier: 1,
    },
  })

  // Create Fit Bot
  await prisma.bot.upsert({
    where: { slug: 'fit-bot' },
    update: {},
    create: {
      name: 'Fit Bot',
      slug: 'fit-bot',
      description: 'Personal trainer and nutrition expert for fitness plans, workouts, and healthy living.',
      imageUrl: '/bots/fit-bot.png',
      avatarUrl: '/bots/fit-bot-avatar.png',
      openaiAssistantId: 'asst_REPLACE_WITH_YOUR_FIT_BOT_ID',
      isSystemBot: true,
      knowledgeArea: 'Fitness & Wellness',
      tier: 1,
    },
  })

  // Create Game Bot
  await prisma.bot.upsert({
    where: { slug: 'game-bot' },
    update: {},
    create: {
      name: 'Game Bot',
      slug: 'game-bot',
      description: 'Gaming guru for strategies, walkthroughs, reviews, and discovering your next favorite game.',
      imageUrl: '/bots/game-bot.png',
      avatarUrl: '/bots/game-bot-avatar.png',
      openaiAssistantId: 'asst_REPLACE_WITH_YOUR_GAME_BOT_ID',
      isSystemBot: true,
      knowledgeArea: 'Gaming & Entertainment',
      tier: 1,
    },
  })

  // Create Fishing Bot
  await prisma.bot.upsert({
    where: { slug: 'fishing-bot' },
    update: {},
    create: {
      name: 'Fishing Bot',
      slug: 'fishing-bot',
      description: 'Angling expert for fishing techniques, tackle advice, best spots, and catching the big one.',
      imageUrl: '/bots/fishing-bot.png',
      avatarUrl: '/bots/fishing-bot-avatar.png',
      openaiAssistantId: 'asst_REPLACE_WITH_YOUR_FISHING_BOT_ID',
      isSystemBot: true,
      knowledgeArea: 'Fishing & Angling',
      tier: 1,
    },
  })

  // Create DIY Bot
  await prisma.bot.upsert({
    where: { slug: 'diy-bot' },
    update: {},
    create: {
      name: 'DIY Bot',
      slug: 'diy-bot',
      description: 'Home improvement and DIY expert for projects, repairs, tools, and making things yourself.',
      imageUrl: '/bots/diy-bot.png',
      avatarUrl: '/bots/diy-bot-avatar.png',
      openaiAssistantId: 'asst_REPLACE_WITH_YOUR_DIY_BOT_ID',
      isSystemBot: true,
      knowledgeArea: 'DIY & Home Improvement',
      tier: 1,
    },
  })

  // Create Email Bot
  await prisma.bot.upsert({
    where: { slug: 'email-bot' },
    update: {
      imageUrl: '/bots/email-bot.png',
      avatarUrl: '/bots/email-bot-avatar.png',
    },
    create: {
      name: 'Email Bot',
      slug: 'email-bot',
      description: 'Professional email writer that crafts perfect emails and opens them directly in your email client.',
      imageUrl: '/bots/email-bot.png',
      avatarUrl: '/bots/email-bot-avatar.png',
      openaiAssistantId: 'asst_Sw5f1t80j4vkmc6WPhK2FWq7',
      isSystemBot: true,
      knowledgeArea: 'Email Composition & Communication',
      tier: 1,
    },
  })

  console.log('Database seeded with all bots!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })