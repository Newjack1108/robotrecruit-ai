import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ChatInterface } from '@/components/chat/ChatInterface';
import Link from 'next/link';
import { Bot, Sparkles, ArrowRight } from 'lucide-react';
import Image from 'next/image';

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
        include: {
          bot: true,
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
  const botSlug = params.bot;

  // If no bot is specified, show the bot selection screen
  if (!botSlug) {
    // Get Boss Bot (always available)
    const bossBotData = await prisma.bot.findUnique({
      where: { slug: 'boss-bot' },
    });

    // Combine Boss Bot with hired bots
    const allAvailableBots = [
      ...(bossBotData ? [bossBotData] : []),
      ...user.hiredBots.map(hb => hb.bot),
    ];

    return (
      <div className="min-h-screen pb-12">
        {/* Striking Header */}
        <div className="relative mb-12 pt-8">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-3xl"></div>
          <div className="relative container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400/30 blur-xl rounded-full animate-pulse"></div>
                <Bot className="w-12 h-12 text-cyan-400 relative" />
              </div>
              <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-4 tracking-tight">
              YOUR STAFF
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              Select a team member to delegate tasks and get things done
            </p>
          </div>
        </div>

        {/* Bot Grid */}
        <div className="container mx-auto px-4">
          {allAvailableBots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allAvailableBots.map((bot) => (
                <Link
                  key={bot.id}
                  href={`/chat?bot=${bot.slug}`}
                  className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1"
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 rounded-xl transition-all duration-300"></div>
                  
                  <div className="relative">
                    {/* Bot Avatar */}
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-md group-hover:blur-lg transition-all"></div>
                      <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-cyan-400/50 transition-all">
                        <Image
                          src={bot.avatarUrl || bot.imageUrl}
                          alt={bot.name}
                          fill
                          className="object-cover object-[center_20%]"
                        />
                      </div>
                    </div>

                    {/* Bot Name */}
                    <h3 className="text-xl font-orbitron font-bold text-white text-center mb-2 group-hover:text-cyan-400 transition-colors">
                      {bot.name}
                    </h3>

                    {/* Bot Description */}
                    <p className="text-gray-400 text-sm text-center mb-4 line-clamp-2 min-h-[2.5rem]">
                      {bot.description || 'Ready to help with your tasks'}
                    </p>

                    {/* Chat Button */}
                    <div className="flex items-center justify-center gap-2 text-cyan-400 font-medium text-sm group-hover:gap-3 transition-all">
                      <span>Start Chat</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            // Empty state (shouldn't happen since Boss Bot is always available)
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-orbitron font-bold text-gray-400 mb-2">
                No Bots Available
              </h3>
              <p className="text-gray-500 mb-6">
                Hire some bots to get started!
              </p>
              <Link
                href="/bots"
                className="inline-block bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-lg transition-all"
              >
                Browse Bots
              </Link>
            </div>
          )}

          {/* Hire More Bots CTA */}
          {allAvailableBots.length > 0 && (
            <div className="mt-12 text-center">
              <Link
                href="/bots"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors font-orbitron font-medium"
              >
                <Sparkles className="w-4 h-4" />
                <span>Hire More Team Members</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Bot is specified - show the chat interface
  const bot = await prisma.bot.findUnique({
    where: { slug: botSlug },
  });

  if (!bot) {
    redirect('/chat');
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