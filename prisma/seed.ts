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
      description: '📧 Your professional email writing assistant that crafts perfect business correspondence in seconds! Expert in formal business emails, client proposals, follow-ups, meeting requests, apologies, thank-you notes, and networking outreach. Features one-click integration with Gmail and all major email clients, smart subject line generation, professional tone adjustment, CC/BCC management, and instant copy-to-clipboard functionality. Perfect for busy professionals, entrepreneurs, job seekers, and anyone who wants to communicate with clarity and confidence. Never struggle with email etiquette again!',
    },
    create: {
      name: 'Email Bot',
      slug: 'email-bot',
      description: '📧 Your professional email writing assistant that crafts perfect business correspondence in seconds! Expert in formal business emails, client proposals, follow-ups, meeting requests, apologies, thank-you notes, and networking outreach. Features one-click integration with Gmail and all major email clients, smart subject line generation, professional tone adjustment, CC/BCC management, and instant copy-to-clipboard functionality. Perfect for busy professionals, entrepreneurs, job seekers, and anyone who wants to communicate with clarity and confidence. Never struggle with email etiquette again!',
      imageUrl: '/bots/email-bot.png',
      avatarUrl: '/bots/email-bot-avatar.png',
      openaiAssistantId: 'asst_Sw5f1t80j4vkmc6WPhK2FWq7',
      isSystemBot: true,
      knowledgeArea: 'Email Composition & Communication',
      tier: 1,
    },
  })

  // Create Social Media Bot
  await prisma.bot.upsert({
    where: { slug: 'social-media-bot' },
    update: {
      imageUrl: '/bots/social-media-bot.png',
      avatarUrl: '/bots/social-media-bot-avatar.png',
      description: '🌐 Your personal social media assistant that helps you share your hobbies, passions, and life moments online! Creates engaging posts for Twitter/X, LinkedIn, Facebook, Instagram, and Threads with smart hashtag suggestions and emoji placement. Whether you\'re sharing your latest hobby project, celebrating achievements, posting vacation photos, or just want to connect with friends and followers - I\'ll help you craft the perfect post every time! Features beautiful preview cards, automatic character counting for each platform, one-click copy-to-clipboard, and direct links to post on your favorite platforms. Perfect for anyone who wants to share their story, grow their following, and engage with their community without spending hours crafting the perfect caption!',
    },
    create: {
      name: 'Social Media Bot',
      slug: 'social-media-bot',
      description: '🌐 Your personal social media assistant that helps you share your hobbies, passions, and life moments online! Creates engaging posts for Twitter/X, LinkedIn, Facebook, Instagram, and Threads with smart hashtag suggestions and emoji placement. Whether you\'re sharing your latest hobby project, celebrating achievements, posting vacation photos, or just want to connect with friends and followers - I\'ll help you craft the perfect post every time! Features beautiful preview cards, automatic character counting for each platform, one-click copy-to-clipboard, and direct links to post on your favorite platforms. Perfect for anyone who wants to share their story, grow their following, and engage with their community without spending hours crafting the perfect caption!',
      imageUrl: '/bots/social-media-bot.png',
      avatarUrl: '/bots/social-media-bot-avatar.png',
      openaiAssistantId: 'asst_NUUtQ0OqkbeWeuePpIFHUy4V',
      isSystemBot: true,
      knowledgeArea: 'Social Media & Content Marketing',
      tier: 1,
    },
  })

  // Create Manual Bot
  await prisma.bot.upsert({
    where: { slug: 'manual-bot' },
    update: {
      imageUrl: '/bots/manual-bot.png',
      avatarUrl: '/bots/manual-bot-avatar.png',
      description: '📖 Never struggle with confusing instruction manuals again! I\'m your personal manual assistant that turns frustrating product documentation into clear, easy-to-follow guidance. Upload any instruction manual (PDF, DOC, DOCX) and I\'ll help you find exactly what you need - no more flipping through endless pages! Expert in answering questions about appliances, furniture assembly, electronics, power tools, kitchen gadgets, smart home devices, and any product with a manual. I provide step-by-step troubleshooting, quick reference guides for common tasks, maintenance schedule extraction, and translate technical jargon into plain English. Perfect for DIY enthusiasts, homeowners, tech users, and anyone who\'s ever thrown a manual across the room in frustration. Upload your manual and ask me anything - I\'ll find the answer in seconds!',
      fileUpload: true,
    },
    create: {
      name: 'Manual Bot',
      slug: 'manual-bot',
      description: '📖 Never struggle with confusing instruction manuals again! I\'m your personal manual assistant that turns frustrating product documentation into clear, easy-to-follow guidance. Upload any instruction manual (PDF, DOC, DOCX) and I\'ll help you find exactly what you need - no more flipping through endless pages! Expert in answering questions about appliances, furniture assembly, electronics, power tools, kitchen gadgets, smart home devices, and any product with a manual. I provide step-by-step troubleshooting, quick reference guides for common tasks, maintenance schedule extraction, and translate technical jargon into plain English. Perfect for DIY enthusiasts, homeowners, tech users, and anyone who\'s ever thrown a manual across the room in frustration. Upload your manual and ask me anything - I\'ll find the answer in seconds!',
      imageUrl: '/bots/manual-bot.png',
      avatarUrl: '/bots/manual-bot-avatar.png',
      openaiAssistantId: 'asst_DwU48uSPcMb1GPfuNpqYUdB2',
      isSystemBot: true,
      knowledgeArea: 'Instruction Manuals & Product Documentation',
      tier: 1,
      fileUpload: true,
    },
  })

  // Create Auto Bot
  await prisma.bot.upsert({
    where: { slug: 'auto-bot' },
    update: {
      imageUrl: '/bots/auto-bot.png',
      avatarUrl: '/bots/auto-bot-avatar.png',
      description: '🛠️ Keep your car running smoothly with instant maintenance guidance! I\'m your garage-side assistant for diagnosing warning lights, planning service intervals, checking fluid changes, and tackling basic DIY repairs. From oil changes and brake checks to seasonal prep and emergency fixes, I walk you through every step with clear checklists, torque specs, and safety tips. Perfect for new drivers, weekend wrenchers, and anyone who wants to save money at the garage.',
      imageRecognition: true,
    },
    create: {
      name: 'Auto Bot',
      slug: 'auto-bot',
      description: '🛠️ Keep your car running smoothly with instant maintenance guidance! I\'m your garage-side assistant for diagnosing warning lights, planning service intervals, checking fluid changes, and tackling basic DIY repairs. From oil changes and brake checks to seasonal prep and emergency fixes, I walk you through every step with clear checklists, torque specs, and safety tips. Perfect for new drivers, weekend wrenchers, and anyone who wants to save money at the garage.',
      imageUrl: '/bots/auto-bot.png',
      avatarUrl: '/bots/auto-bot-avatar.png',
      openaiAssistantId: 'asst_xdY4bWW9tABjqTvGA9OgCN0e',
      isSystemBot: true,
      knowledgeArea: 'Automotive Maintenance & Repair',
      tier: 1,
      imageRecognition: true,
    },
  })

  // Create Apply Bot
  await prisma.bot.upsert({
    where: { slug: 'apply-bot' },
    update: {
      imageUrl: '/bots/apply-bot.png',
      avatarUrl: '/bots/apply-bot-avatar.png',
      description: '🎯 Land your dream job with professional CVs and cover letters! I\'m your personal career assistant who helps you stand out from the crowd. Expert in ATS-friendly CV writing, persuasive cover letters, and tailoring applications for specific roles. I\'ll help you highlight your achievements, use powerful action verbs, and format everything professionally. Perfect for job seekers, career changers, graduates, and professionals looking to advance. Upload existing CVs for review, or start from scratch - I\'ll guide you every step of the way. Export your polished CV as PDF when ready!',
      dataExport: true,
    },
    create: {
      name: 'Apply Bot',
      slug: 'apply-bot',
      description: '🎯 Land your dream job with professional CVs and cover letters! I\'m your personal career assistant who helps you stand out from the crowd. Expert in ATS-friendly CV writing, persuasive cover letters, and tailoring applications for specific roles. I\'ll help you highlight your achievements, use powerful action verbs, and format everything professionally. Perfect for job seekers, career changers, graduates, and professionals looking to advance. Upload existing CVs for review, or start from scratch - I\'ll guide you every step of the way. Export your polished CV as PDF when ready!',
      imageUrl: '/bots/apply-bot.png',
      avatarUrl: '/bots/apply-bot-avatar.png',
      openaiAssistantId: 'asst_raCoX8L5hPhwYAdLra5VkDfM',
      isSystemBot: true,
      knowledgeArea: 'CV Writing & Career Applications',
      tier: 2, // Pro only
      dataExport: true, // Enable PDF export
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