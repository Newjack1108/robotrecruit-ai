import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ChatInterface } from '@/components/chat/ChatInterface';

interface ChatPageProps {
  searchParams: Promise<{
    bot?: string;
    conversation?: string;
  }>;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      hiredBots: {
        select: {
          botId: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/sign-in');
  }

  // Check if promo tier is active
  let effectiveTier = user.tier;
  if (user.promoTierUpgrade && user.promoExpiresAt) {
    if (new Date(user.promoExpiresAt) > new Date()) {
      effectiveTier = user.promoTierUpgrade;
    }
  }

  const params = await searchParams;
  const botSlug = params.bot || 'boss-bot';
  
  const bot = await prisma.bot.findUnique({
    where: { slug: botSlug },
  });

  if (!bot) {
    redirect('/chat?bot=boss-bot');
  }

  // Check if bot is hired (skip for Boss Bot - always available)
  const isHired = bot.slug === 'boss-bot' || user.hiredBots.some(hb => hb.botId === bot.id);
  
  if (!isHired) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">💼</div>
          <h1 className="text-3xl font-orbitron font-bold text-white">Not on Your Roster</h1>
          <p className="text-gray-400 text-lg">
            {bot.name} isn't part of your team yet. Recruit them to start delegating tasks!
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="/dashboard" 
              className="inline-block bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-lg transition-all"
            >
              View My Team
            </a>
            <a 
              href="/bots" 
              className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-bold px-6 py-3 rounded-lg transition-all border border-gray-700"
            >
              Recruitment Pool
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Only show powerups that admin has enabled for this bot
  // Users activate them per-conversation using credits
  
  return (
    <ChatInterface
      botId={bot.id}
      botName={bot.name}
      botImage={bot.imageUrl}  // Large hero image
      botAvatar={bot.avatarUrl || bot.imageUrl}  // Small avatar for messages
      botSlug={bot.slug}
      botIntroAudio={bot.introAudioUrl}
      imageRecognitionEnabled={bot.imageRecognition}
      conversationId={params.conversation}
      isSystemBot={bot.isSystemBot}
      powerUps={{
        // Only show powerups enabled by admin for this specific bot
        imageRecognition: bot.imageRecognition,
        voiceResponse: bot.voiceResponse,
        fileUpload: bot.fileUpload,
        webSearch: bot.webSearch,
        scheduling: bot.scheduling,
        dataExport: bot.dataExport,
      }}
    />
  );
}