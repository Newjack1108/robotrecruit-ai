import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { StripeSettingsForm } from '@/components/admin/StripeSettingsForm';
import { prisma } from '@/lib/db';
import { CreditCard, Webhook, TrendingUp, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminStripePage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect('/sign-in');
  }

  // Check if user is admin
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  const userEmail = user?.emailAddresses[0]?.emailAddress || '';
  const isAdmin = adminEmails.includes(userEmail);
  
  if (!isAdmin) {
    redirect('/dashboard');
  }

  // Get subscription stats
  const [totalSubscriptions, activeSubscriptions, revenue] = await Promise.all([
    prisma.user.count({
      where: {
        stripeSubscriptionId: { not: null }
      }
    }),
    prisma.user.count({
      where: {
        subscriptionStatus: 'active'
      }
    }),
    // This is a rough estimate - you'd want to get actual revenue from Stripe
    prisma.user.count({
      where: {
        subscriptionStatus: 'active',
        tier: 2
      }
    }).then(proCount => 
      prisma.user.count({
        where: {
          subscriptionStatus: 'active',
          tier: 3
        }
      }).then(premiumCount => (proCount * 9.99) + (premiumCount * 19.99))
    )
  ]);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-3xl font-orbitron font-bold text-white mb-2">
          Stripe Configuration
        </h2>
        <p className="text-gray-400">
          Manage your payment settings and subscription plans
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/10 backdrop-blur-sm border border-green-700/30 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <CreditCard className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active Subscriptions</p>
              <p className="text-3xl font-bold text-white">{activeSubscriptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/10 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Subscriptions</p>
              <p className="text-3xl font-bold text-white">{totalSubscriptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/10 backdrop-blur-sm border border-purple-700/30 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Est. Monthly Revenue</p>
              <p className="text-3xl font-bold text-white">£{revenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-yellow-400 font-semibold mb-1">Important Security Note</h3>
          <p className="text-gray-300 text-sm">
            Changes to Stripe configuration require environment variables to be updated. 
            Use this interface to configure settings, then update your <code className="bg-black/30 px-1 rounded">.env.local</code> file 
            and restart your server for changes to take effect.
          </p>
        </div>
      </div>

      {/* Main Configuration Form */}
      <StripeSettingsForm 
        currentProPriceId={process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || ''}
        currentPremiumPriceId={process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || ''}
        currentPublishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}
        webhookSecret={process.env.STRIPE_WEBHOOK_SECRET || ''}
      />
    </div>
  );
}

