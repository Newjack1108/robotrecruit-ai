'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { POWERUP_PACKAGES, getPricePerCredit } from '@/lib/powerup-packages';
import { Check, Zap, Loader2, ArrowLeft, Gift, Crown, Rocket } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PurchasePowerUpsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<{
    allowance: number;
    used: number;
    remaining: number;
  } | null>(null);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const response = await fetch('/api/user/powerup-allowance');
      if (response.ok) {
        const data = await response.json();
        setUserStats({
          allowance: data.allowance,
          used: data.used,
          remaining: data.allowance - data.used,
        });
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const handlePurchase = async (packageId: string) => {
    setLoading(packageId);
    
    try {
      const response = await fetch('/api/stripe/create-powerup-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error: any) {
      console.error('Purchase error:', error);
      alert(error.message || 'Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-4 relative">
              {/* Animated Zap Icon */}
              <div className="relative animate-bounce">
                <Zap className="w-16 h-16 text-yellow-400 animate-pulse relative z-10" />
                {/* Glow effect */}
                <div className="absolute inset-0 w-16 h-16 bg-yellow-400/30 rounded-full blur-xl animate-ping" />
                <div className="absolute inset-0 w-16 h-16 bg-yellow-400/20 rounded-full blur-2xl animate-pulse" />
              </div>
            </div>
            <h1 className="text-5xl font-orbitron font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent animate-fade-in">
              Power-Up Credits
            </h1>
            <p className="text-xl text-gray-400 mb-6">
              Unlock advanced AI features for your conversations
            </p>

            {/* Current Balance */}
            {userStats && (
              <div className="inline-flex items-center gap-4 bg-gray-800/50 backdrop-blur-sm px-8 py-4 rounded-2xl border border-gray-700">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Current Balance</p>
                  <p className="text-3xl font-bold text-cyan-400">{userStats.remaining}</p>
                  <p className="text-xs text-gray-500">credits</p>
                </div>
                <div className="h-12 w-px bg-gray-700" />
                <div className="text-center">
                  <p className="text-sm text-gray-400">Used This Month</p>
                  <p className="text-2xl font-bold text-gray-300">{userStats.used} / {userStats.allowance}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Bot Avatars Section */}
        <div className="relative mb-12 overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-gray-900/95 via-cyan-900/10 to-blue-900/10 backdrop-blur-xl p-8">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 animate-pulse" />
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-glow-pulse" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-orbitron font-bold text-white mb-2">
                🤖 Empower Your Entire Bot Team
              </h2>
              <p className="text-gray-300 text-lg">
                One credit unlocks any powerup on any bot • Activate once per conversation
              </p>
            </div>

            {/* Animated Bot Avatars Grid */}
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4 mb-6">
              {[
                { name: 'Boss Bot', avatar: '/bots/boss-bot-avatar.png' },
                { name: 'Bee Bot', avatar: '/bots/bee-bot-avatar.png' },
                { name: 'Chef Bot', avatar: '/bots/chef-bot-avatar.png' },
                { name: 'Melody Bot', avatar: '/bots/melody-bot-avatar.png' },
                { name: 'Fit Bot', avatar: '/bots/fit-bot-avatar.png' },
                { name: 'Art Bot', avatar: '/bots/art-bot-avatar.png' },
                { name: 'DIY Bot', avatar: '/bots/diy-bot-avatar.png' },
                { name: 'Scout Bot', avatar: '/bots/scout-bot-avatar.png' },
              ].map((bot, index) => (
                <div
                  key={bot.name}
                  className="relative group"
                  style={{ 
                    animation: `float ${3 + (index % 3)}s ease-in-out infinite`,
                    animationDelay: `${index * 0.2}s` 
                  }}
                >
                  {/* Glow Ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/30 to-blue-400/30 blur-md group-hover:blur-lg transition-all animate-pulse" />
                  
                  {/* Bot Avatar */}
                  <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-cyan-400/50 bg-gray-800 p-1 group-hover:scale-110 group-hover:border-cyan-300 transition-all duration-300 overflow-hidden">
                    <img 
                      src={bot.avatar} 
                      alt={bot.name}
                      className="w-full h-full object-contain filter group-hover:brightness-110 transition-all"
                    />
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <span className="text-xs text-cyan-300 font-semibold">{bot.name}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <div className="px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm font-semibold">
                ✓ All Bots
              </div>
              <div className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm font-semibold">
                ✓ All Features
              </div>
              <div className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm font-semibold">
                ✓ Conversation Persistence
              </div>
              <div className="px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm font-semibold">
                ✓ No Expiration
              </div>
            </div>
          </div>
        </div>

        {/* Free Credits Info Banner */}
        <div className="mb-12 grid md:grid-cols-3 gap-6">
          <div className="relative overflow-hidden rounded-2xl border-2 border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 hover:border-gray-600 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <Gift className="w-10 h-10 text-gray-400 mb-3" />
              <h3 className="text-xl font-orbitron font-bold text-white mb-2">Free Tier</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-gray-300">5</span>
                <span className="text-gray-400">credits on signup</span>
              </div>
              <p className="text-sm text-gray-500">Try out powerup features</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border-2 border-blue-500/50 bg-gradient-to-br from-blue-900/30 to-blue-800/30 p-6 hover:border-blue-400 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl" />
            <div className="relative">
              <Rocket className="w-10 h-10 text-blue-400 mb-3" />
              <h3 className="text-xl font-orbitron font-bold text-white mb-2">Pro Tier</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-blue-300">20</span>
                <span className="text-gray-300">credits on upgrade</span>
              </div>
              <p className="text-sm text-blue-200">Regular powerup usage</p>
              <Link href="/subscription">
                <Button size="sm" className="mt-3 w-full bg-blue-600 hover:bg-blue-500">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border-2 border-purple-500/50 bg-gradient-to-br from-purple-900/30 via-pink-900/30 to-purple-800/30 p-6 hover:border-purple-400 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />
            <div className="relative">
              <Crown className="w-10 h-10 text-purple-400 mb-3" />
              <h3 className="text-xl font-orbitron font-bold text-white mb-2">Premium Tier</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-purple-300">50</span>
                <span className="text-gray-300">credits on upgrade</span>
              </div>
              <p className="text-sm text-purple-200">Power user allocation</p>
              <Link href="/subscription">
                <Button size="sm" className="mt-3 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500">
                  Upgrade to Premium
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-orbitron font-bold text-white mb-2">Need More Credits?</h2>
          <p className="text-gray-400">Purchase additional powerup credits anytime</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {POWERUP_PACKAGES.map((pkg, index) => {
            const pricePerCredit = getPricePerCredit(pkg);
            const isLoading = loading === pkg.id;

            return (
              <div
                key={pkg.id}
                className={`relative rounded-3xl p-8 backdrop-blur-sm transition-all duration-300 hover:scale-105 animate-scale-in ${
                  pkg.popular
                    ? 'bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border-2 border-cyan-500'
                    : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}

                {pkg.savings && (
                  <div className="absolute top-4 right-4 bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/50">
                    {pkg.savings}
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-orbitron font-bold mb-2">{pkg.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{pkg.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-5xl font-bold">£{pkg.price}</span>
                    <span className="text-gray-400 text-lg">/pack</span>
                  </div>

                  <div className="bg-gray-900/50 rounded-xl p-4 mb-4">
                    <p className="text-3xl font-bold text-cyan-400">{pkg.credits}</p>
                    <p className="text-sm text-gray-400">Power-Up Credits</p>
                    <p className="text-xs text-gray-500 mt-2">
                      £{pricePerCredit.toFixed(2)} per credit
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={isLoading}
                  className={`w-full font-bold py-6 ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Purchase Now'
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Features List */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-3xl p-8 border border-gray-700">
          <h2 className="text-2xl font-orbitron font-bold mb-6 text-center">
            What can you do with Power-Ups?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-1">📷 Image Recognition</h3>
                <p className="text-sm text-gray-400">Upload and analyze images with AI vision</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-1">🎤 Voice Response</h3>
                <p className="text-sm text-gray-400">Speak to your AI and get voice responses</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-1">📁 File Upload</h3>
                <p className="text-sm text-gray-400">Analyze documents and files in real-time</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-1">🌐 Web Search</h3>
                <p className="text-sm text-gray-400">Access current information from the internet</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-1">📅 Scheduling</h3>
                <p className="text-sm text-gray-400">Set reminders and schedule tasks</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-1">💾 Data Export</h3>
                <p className="text-sm text-gray-400">Export conversations with AI summaries</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <p className="text-sm text-blue-300 text-center">
              💡 <strong>Pro Tip:</strong> Credits are charged once per power-up per conversation. 
              Use them multiple times in the same chat without extra charges!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

