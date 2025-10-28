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
      description: '🌐 Your personal social media assistant that helps you share your hobbies, passions, and life moments online! Creates engaging posts for Twitter/X, LinkedIn, Facebook, Instagram, and Threads with smart hashtag suggestions and emoji placement. Whether you\'re sharing your latest hobby project, celebrating achievements, posting vacation photos, or just want to connect with friends and followers - I\'ll help you craft the perfect post every time! Features beautiful preview cards, automatic character counting for each platform, one-click copy-to-clipboard, and direct links to post on your favorite platforms. Perfect for anyone who wants to share their story, grow their following, and engage with their community without spending hours crafting the perfect caption!',
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

