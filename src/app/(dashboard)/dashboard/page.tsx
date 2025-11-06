import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Zap, Crown, TrendingUp, Lock, Sparkles, Users, Image as ImageIcon, Plus, Bot } from 'lucide-react';
import Link from 'next/link';
import { BotHireCard } from '@/components/dashboard/BotHireCard';
import { CustomBotCard } from '@/components/dashboard/CustomBotCard';
import { TutorialWrapper } from '@/components/tutorial/TutorialWrapper';
import { ProfileStatsCard } from '@/components/dashboard/ProfileStatsCard';
import { DailyChallengeCard } from '@/components/challenges/DailyChallengeCard';
import { StreakCounter } from '@/components/streaks/StreakCounter';
import { RemindersCard } from '@/components/dashboard/RemindersCard';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      conversations: {
        include: {
          bot: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      },
      hiredBots: {
        include: {
          bot: true,
        },
        orderBy: {
          hiredAt: 'desc',
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

  // Get all system bots
  const allBots = await prisma.bot.findMany({
    where: {
      isSystemBot: true,
    },
    orderBy: {
      tier: 'asc',
    },
  });

  // Get user's custom bots
  const customBots = await prisma.bot.findMany({
    where: {
      isSystemBot: false,
      creatorId: user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Get hired bots
  const hiredBotIds = new Set(user.hiredBots.map(hb => hb.botId));
  const hiredBots = user.hiredBots.map(hb => hb.bot);
  const availableToHire = allBots.filter(bot => !hiredBotIds.has(bot.id) && bot.slug !== 'boss-bot');
  
  // Hiring limits and total available bots
  const TIER_LIMITS: Record<number, number> = {
    1: 2,
    2: 5,
    3: 999,
  };
  const tierHireLimit = TIER_LIMITS[effectiveTier] || TIER_LIMITS[1];
  const totalAvailableBots = allBots.filter(bot => bot.slug !== 'boss-bot').length;
  const hireLimit = Math.min(tierHireLimit, totalAvailableBots); // Show total bots if tier allows more
  const hiresRemaining = hireLimit - hiredBots.length;

  // Count messages
  const totalMessages = await prisma.message.count({
    where: {
      conversation: {
        userId: user.id,
      },
    },
  });

  const getTierName = (tier: number) => {
    switch (tier) {
      case 1: return 'Free';
      case 2: return 'Pro';
      case 3: return 'Enterprise';
      default: return 'Unknown';
    }
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 2: return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 3: return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  // Get power-up credits (remaining)
  const remainingCredits = user.powerUpAllowance - user.powerUpUsed;

  // Get arcade stats
  const arcadeGamesPlayed = await (prisma as any).gameScore.count({
    where: { userId: user.id }
  });

  // Determine if we should show tutorial (new users who haven't completed it)
  const shouldShowTutorial = !(user as any).tutorialCompleted && (user as any).tutorialStep === 0;
  const tutorialStep = (user as any).tutorialStep || 1;

  return (
    <div className="max-w-7xl mx-auto space-y-5 dashboard-content">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-900/30 via-blue-900/30 to-purple-900/30 border border-cyan-500/30 p-5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-orbitron font-bold text-white mb-1">
                Welcome Back, Boss! 👔
              </h1>
              <p className="text-gray-300 text-sm md:text-base">
                Your AI workforce is standing by
              </p>
            </div>
            <div className="text-right">
              <Badge className={`${getTierColor(effectiveTier)} border text-sm px-3 py-1 mb-1`}>
                {getTierName(effectiveTier)}
              </Badge>
              <p className="text-[10px] text-gray-400">Agency</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className={`grid grid-cols-1 ${arcadeGamesPlayed > 0 ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-3 mt-4`}>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="bg-cyan-500/20 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Active Employees</p>
                  <p className="text-xl font-bold text-white">{hiredBots.length}/{hireLimit}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Tasks Delegated</p>
                  <p className="text-xl font-bold text-white">{totalMessages}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Credits Remaining</p>
                  <p className={`text-xl font-bold ${
                    remainingCredits === 0 ? 'text-red-400' : 
                    remainingCredits < 5 ? 'text-yellow-400' : 
                    'text-white'
                  }`}>{remainingCredits}</p>
                </div>
              </div>
            </div>

            {arcadeGamesPlayed > 0 && (
              <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 backdrop-blur-sm rounded-lg p-3 border border-yellow-500/30">
                <div className="flex items-center gap-2.5">
                  <div className="bg-yellow-500/20 p-2 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-yellow-400/70 text-xs font-semibold">Lifetime Record</p>
                    {/* @ts-expect-error - Prisma type refresh needed */}
                    <p className="text-xl font-black text-yellow-400 font-mono">{user.lifetimeHighScore.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats & Community Section - Aligned Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile & Achievements - 2 columns */}
        <div className="lg:col-span-2">
          <ProfileStatsCard 
            userName={user.clerkId}
            userTier={effectiveTier}
          />
        </div>

        {/* Right Column: Streak + Community Builder + Reminders stacked */}
        <div className="flex flex-col gap-4">
          <StreakCounter variant="dashboard" />
          <DailyChallengeCard />
          <RemindersCard />
        </div>
      </div>

      {/* Hired Bots */}
      {hiredBots.length > 0 && (
        <div>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-orbitron font-bold text-white mb-2">💼 Your Loyal Employees – Programmed to Please</h2>
            <p className="text-gray-400 mb-2">
              {hiredBots.length}/{hireLimit} employees on payroll
              {hiresRemaining > 0 && <span className="text-green-400"> • {hiresRemaining} positions open</span>}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hiredBots.map((bot) => (
              <BotHireCard
                key={bot.id}
                bot={bot}
                isHired={true}
                canHire={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Custom Bots Section */}
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-orbitron font-bold text-white mb-2">✨ Your Custom AI Specialists</h2>
            <p className="text-gray-400 text-lg">Bots you've created with specialized knowledge</p>
          </div>
          {effectiveTier >= 2 && (
            <Link href="/bots/create">
              <Button className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 text-white font-bold group">
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                Create Custom Bot
              </Button>
            </Link>
          )}
        </div>

        {customBots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {customBots.map((bot) => (
              <CustomBotCard key={bot.id} bot={bot} />
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/30 via-pink-900/30 to-orange-900/30 border border-purple-500/30 p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 text-center space-y-6">
              <Bot className="w-20 h-20 text-purple-400/50 mx-auto" />
              <div>
                <h3 className="text-2xl font-orbitron font-bold text-white mb-2">
                  No Custom Bots Yet
                </h3>
                <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                  {effectiveTier >= 2 
                    ? "Create your first custom AI assistant trained on your own data and specialized for your unique needs!"
                    : "Custom bots require a Pro or Premium subscription. Upgrade to create specialized AI assistants trained on your own data!"
                  }
                </p>
              </div>
              
              {effectiveTier >= 2 ? (
                <Link href="/bots/create">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg px-8 py-6">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Bot
                  </Button>
                </Link>
              ) : (
                <Link href="/subscription">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg px-8 py-6">
                    <Crown className="w-5 h-5 mr-2" />
                    Upgrade to Create Bots
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Available to Hire */}
      {availableToHire.length > 0 && (
        <div className="unemployed-bots-section">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-orbitron font-bold text-white mb-2">🎯 The Unemployed Division – Full of Potential and Dust</h2>
            <p className="text-gray-400 text-lg mb-4">
              {hiresRemaining > 0 
                ? `${availableToHire.length} candidates ready to join • ${hiresRemaining} positions available`
                : `Payroll full! Expand your agency to recruit more talent.`
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {availableToHire.map((bot) => (
              <BotHireCard
                key={bot.id}
                bot={bot}
                isHired={false}
                canHire={hiresRemaining > 0}
                disabledReason={hiresRemaining <= 0 ? "Hiring limit reached. Upgrade to hire more bots!" : undefined}
              />
            ))}
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
            <p className="text-yellow-400 font-bold text-center text-2xl">
              &quot;Just one subscription can lift a bot out of unemployment. Act now!!&quot;
            </p>
          </div>
        </div>
      )}

      {/* Upgrade CTA - If at hiring limit */}
      {hiresRemaining <= 0 && availableToHire.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-orange-900/50 border border-purple-500/50 p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 text-center">
            <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-3xl font-orbitron font-bold text-white mb-2">
              Expand Your Agency
            </h3>
            <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
              You've reached your hiring limit! Upgrade to recruit more specialists and build a bigger team.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-6 mb-6 text-lg">
              <div className="flex items-center gap-2 text-green-400">
                <Users className="w-6 h-6" />
                <span className="font-semibold">Free: 2 Bots</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400">
                <Users className="w-6 h-6" />
                <span className="font-semibold">Pro: 5 Bots</span>
              </div>
              <div className="flex items-center gap-2 text-purple-400">
                <Users className="w-6 h-6" />
                <span className="font-semibold">Enterprise: Unlimited</span>
              </div>
            </div>

            <Link href="/subscription">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg px-8 py-6">
                <Crown className="w-5 h-5 mr-2" />
                Expand My Agency
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/bots">
          <Card className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-500/30 hover:border-cyan-400/50 transition-all cursor-pointer group">
            <CardHeader>
              <Users className="w-12 h-12 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-white">Talent Directory</CardTitle>
              <CardDescription className="text-gray-300">
                View all available AI specialists
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/subscription">
          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer group">
            <CardHeader>
              <Crown className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-white">Expand Agency</CardTitle>
              <CardDescription className="text-gray-300">
                Grow your workforce capacity
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/support">
          <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30 hover:border-green-400/50 transition-all cursor-pointer group">
            <CardHeader>
              <MessageSquare className="w-12 h-12 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-white">Executive Support</CardTitle>
              <CardDescription className="text-gray-300">
                Your dedicated support team
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Tutorial */}
      <TutorialWrapper
        shouldShowTutorial={shouldShowTutorial}
        initialStep={tutorialStep}
      />
    </div>
  );
}

