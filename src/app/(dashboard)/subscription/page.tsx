import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { PromoCodeRedeem } from '@/components/user/PromoCodeRedeem';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
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

  // For now, assume subscription is active if user has stripe customer ID and is tier 2+
  const hasActiveSubscription = 
    user.stripeCustomerId && 
    effectiveTier > 1;

  const params = await searchParams;
  const showSuccess = params.success === 'true';
  const showCanceled = params.canceled === 'true';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Success/Cancel Messages */}
      {showSuccess && (
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-400">Subscription Activated!</h3>
            <p className="text-sm text-gray-300">
              Your subscription is now active. Enjoy your upgraded features!
            </p>
          </div>
        </div>
      )}

      {showCanceled && (
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-400">Checkout Canceled</h3>
            <p className="text-sm text-gray-300">
              Your payment was canceled. No charges were made.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-orbitron">
          Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Plan</span>
        </h1>
        <p className="text-xl text-gray-400">
          Unlock more bots and features with a subscription
        </p>
        {effectiveTier > 1 && (
          <div className="inline-block bg-cyan-900/20 border border-cyan-500/30 rounded-lg px-4 py-2">
            <p className="text-sm text-cyan-400">
              Currently on: <span className="font-bold font-orbitron">
                {effectiveTier === 2 ? 'Pro' : 'Premium'} Plan
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Promo Code Redemption */}
      <div className="max-w-md mx-auto">
        <PromoCodeRedeem />
      </div>

      {/* Subscription Plans */}
      <SubscriptionPlans 
        currentTier={effectiveTier}
        hasActiveSubscription={Boolean(hasActiveSubscription)}
        stripeCustomerId={user.stripeCustomerId}
      />
    </div>
  );
}