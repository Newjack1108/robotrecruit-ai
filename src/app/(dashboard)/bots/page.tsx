import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { BotSelector } from '@/components/bots/BotSelector';
import { BotAdvisorToggle } from '@/components/bots/BotAdvisorToggle';

export const dynamic = 'force-dynamic';

export default async function BotsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
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

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-900/30 via-blue-900/30 to-purple-900/30 border border-cyan-500/30 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center space-y-4">
          <div className="inline-block">
            <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-2 tracking-tight">
              AI RECRUITMENT CENTRAL
            </h1>
            <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
          
          <p className="text-xl md:text-2xl text-white font-bold">
            "Your Next Employee Never Sleeps, Never Complains, Always Delivers!"
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <span className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-300 font-semibold">
              ✨ 24/7 Availability
            </span>
            <span className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-full text-purple-300 font-semibold">
              🚀 Instant Onboarding
            </span>
            <span className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-full text-blue-300 font-semibold">
              💯 Zero Drama
            </span>
          </div>

          {/* Boss Bot Advisor - Collapsible */}
          <div className="pt-4">
            <BotAdvisorToggle />
          </div>
        </div>
      </div>

      {/* Bot Selection */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-orbitron font-bold text-white mb-3">Available Specialists</h2>
          <p className="text-gray-400 text-lg">Select a candidate to view their CV and recruit them to your team</p>
        </div>
        <BotSelector userTier={effectiveTier} />
      </div>
    </div>
  );
}