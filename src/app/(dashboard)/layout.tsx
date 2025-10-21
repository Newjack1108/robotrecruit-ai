import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { MessageSquare, Bot, Crown, Sparkles, Users, Gamepad2 } from 'lucide-react';
import { UserButtonWrapper } from '@/components/auth/UserButtonWrapper';
import { Logo } from '@/components/ui/Logo';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { AchievementListener } from '@/components/achievements/AchievementListener';
import { StreakCounter } from '@/components/streaks/StreakCounter';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  // Try to get email from session claims first, then fetch from Clerk API if needed
  let clerkEmail = sessionClaims?.email as string || '';
  
  if (!clerkEmail) {
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      clerkEmail = clerkUser.emailAddresses[0]?.emailAddress || '';
    } catch (error) {
      console.error('Failed to fetch email from Clerk:', error);
    }
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: clerkEmail,
        tier: 1,
      },
    });
  } else if (!user.email && clerkEmail) {
    // Update user email if it's missing but we have it from Clerk
    user = await prisma.user.update({
      where: { id: user.id },
      data: { email: clerkEmail },
    });
  }

  // Check if promo tier is active
  let effectiveTier = user.tier;
  if (user.promoTierUpgrade && user.promoExpiresAt) {
    if (new Date(user.promoExpiresAt) > new Date()) {
      effectiveTier = user.promoTierUpgrade;
    } else {
      // Promo expired, reset user tier
      await prisma.user.update({
        where: { id: user.id },
        data: {
          promoTierUpgrade: null,
          promoExpiresAt: null,
        },
      });
    }
  }

  const getTierBadge = (tier: number, isPromo: boolean) => {
    const badges = {
      1: { name: 'Free', color: 'bg-gray-700/80 text-gray-300 border-gray-600', icon: '⚡' },
      2: { name: isPromo ? 'Pro (Promo)' : 'Pro', color: 'bg-blue-600/80 text-blue-100 border-blue-500', icon: '🚀' },
      3: { name: isPromo ? 'Premium (Promo)' : 'Premium', color: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400', icon: '👑' },
    };
    return badges[tier as keyof typeof badges] || badges[1];
  };

  const isPromo = effectiveTier !== user.tier;
  const tierBadge = getTierBadge(effectiveTier, isPromo);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-950">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Animated Grid */}
      <div className="fixed inset-0 z-0 opacity-5">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-50 bg-gray-900/50 backdrop-blur-xl border-b border-cyan-500/20 sticky top-0">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500/30 blur-lg rounded-full group-hover:bg-cyan-400/40 transition-all"></div>
                  <Bot className="w-8 h-8 text-cyan-400 relative" />
                </div>
                <Logo size="md" />
              </Link>

              {/* Nav Links */}
              <nav className="hidden md:flex items-center gap-6">
                <Link 
                  href="/dashboard"
                  className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors group"
                >
                  <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                  <span className="font-orbitron font-medium">Dashboard</span>
                </Link>

                <Link 
                  href="/chat"
                  className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors group"
                >
                  <MessageSquare className="w-4 h-4 group-hover:animate-pulse" />
                  <span className="font-orbitron font-medium">Chat</span>
                </Link>
                
                <Link 
                  href="/bots"
                  className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors group"
                >
                  <Bot className="w-4 h-4 group-hover:animate-pulse" />
                  <span className="font-orbitron font-medium">Bots</span>
                </Link>

                <Link 
                  href="/arcade"
                  className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors group"
                >
                  <Gamepad2 className="w-4 h-4 group-hover:animate-pulse" />
                  <span className="font-orbitron font-medium">Arcade</span>
                </Link>

                <Link 
                  href="/community"
                  className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors group"
                >
                  <Users className="w-4 h-4 group-hover:animate-pulse" />
                  <span className="font-orbitron font-medium">Community</span>
                </Link>

                <Link 
                  href="/support"
                  className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors group"
                >
                  <svg className="w-4 h-4 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="font-orbitron font-medium">Support</span>
                </Link>
              </nav>
            </div>

            {/* User Section */}
            <div className="flex items-center gap-4">
              <Link href="/subscription">
                <div className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 border ${tierBadge.color} hover:scale-105 transition-transform cursor-pointer backdrop-blur-sm`}>
                  <span>{tierBadge.icon}</span>
                  <span>{tierBadge.name}</span>
                  {user.tier < 3 && <Sparkles className="w-3 h-3" />}
                </div>
              </Link>
              
              <StreakCounter variant="header" />
              
              <NotificationBell />
              
              <UserButtonWrapper />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-4 pb-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 bg-gray-900/80 backdrop-blur-xl mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-gray-400 text-sm">
              <span>© 2024 Robot Recruit AI</span>
              <span className="hidden md:inline">|</span>
              <Link href="/privacy" className="hover:text-cyan-400 transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-cyan-400 transition-colors">
                Terms & Conditions
              </Link>
            </div>
            <div className="text-gray-500 text-xs">
              Made with 🤖 by Robot Recruit AI
            </div>
          </div>
        </div>
      </footer>

      {/* Gradient Vignette */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-0"></div>

      {/* Achievement Unlock Listener */}
      <AchievementListener />
    </div>
  );
}
