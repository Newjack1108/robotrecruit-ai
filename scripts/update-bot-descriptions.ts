/**
 * Script to update Email Bot and Social Media Bot descriptions
 * Run with: railway run npx ts-node scripts/update-bot-descriptions.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating bot descriptions...');

  // Update Email Bot
  await prisma.bot.update({
    where: { slug: 'email-bot' },
    data: {
      description: '📧 Your professional email writing assistant that crafts perfect business correspondence in seconds! Expert in formal business emails, client proposals, follow-ups, meeting requests, apologies, thank-you notes, and networking outreach. Features one-click integration with Gmail and all major email clients, smart subject line generation, professional tone adjustment, CC/BCC management, and instant copy-to-clipboard functionality. Perfect for busy professionals, entrepreneurs, job seekers, and anyone who wants to communicate with clarity and confidence. Never struggle with email etiquette again!',
    },
  });
  console.log('✅ Email Bot description updated');

  // Update Social Media Bot
  await prisma.bot.update({
    where: { slug: 'social-media-bot' },
    data: {
      description: '🌐 Your social media marketing expert that creates viral-worthy content for Twitter/X, LinkedIn, Facebook, Instagram, and Threads! Master of platform-specific optimization with automatic character count validation, trending hashtag suggestions, engagement-boosting emoji placement, and best-time-to-post recommendations. Specializes in product launches, brand storytelling, thought leadership, promotional campaigns, and audience engagement strategies. Features beautiful preview cards, one-click copy-to-clipboard, direct platform composer links, and multi-platform quick access. Perfect for entrepreneurs, marketers, influencers, small business owners, and content creators who want maximum reach and engagement. Transform your social media presence today!',
    },
  });
  console.log('✅ Social Media Bot description updated');

  console.log('\n🎉 All bot descriptions updated successfully!');
}

main()
  .catch((e) => {
    console.error('Error updating bot descriptions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

