import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { BotCreateForm } from '@/components/bots/BotCreateForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function CreateBotPage() {
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

  // Check user tier - custom bots require tier 2+
  let effectiveTier = user.tier;
  if (user.promoTierUpgrade && user.promoExpiresAt) {
    if (new Date(user.promoExpiresAt) > new Date()) {
      effectiveTier = user.promoTierUpgrade;
    }
  }

  if (effectiveTier < 2) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h1 className="text-3xl font-orbitron font-bold text-white">Upgrade Required</h1>
        <p className="text-gray-400 text-lg">
          Creating custom bots requires a Pro or Premium subscription.
        </p>
        <Link
          href="/subscription"
          className="inline-block bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-8 py-4 rounded-xl"
        >
          View Plans
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/bots"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">Create Custom Bot</h1>
          <p className="text-gray-400">Build your own AI assistant with specialized knowledge</p>
        </div>
      </div>

      <BotCreateForm userId={user.id} />
    </div>
  );
}



