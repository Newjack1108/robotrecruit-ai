import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ProfileStats } from '@/components/profile/ProfileStats';
import ShowcaseGallery from '@/components/showcases/ShowcaseGallery';

export default async function ProfilePage() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    redirect('/sign-in');
  }

  // Try to get email from session claims first, then fetch from Clerk API
  let clerkEmail = sessionClaims?.email as string || '';
  
  if (!clerkEmail) {
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      clerkEmail = clerkUser.emailAddresses[0]?.emailAddress || 'No email found';
    } catch (error) {
      console.error('Failed to fetch email from Clerk:', error);
      clerkEmail = 'Error fetching email';
    }
  }
  
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  const isAdmin = adminEmails.includes(user.email);

  // Get user's hired bots for showcase upload
  const hiredBots = await prisma.hiredBot.findMany({
    where: { userId: user.id },
    include: {
      bot: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  const availableBots = hiredBots.map(hb => hb.bot);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* User Info Header */}
      <div className="bg-gradient-to-r from-cyan-900/30 via-blue-900/30 to-purple-900/30 border border-cyan-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-orbitron font-bold text-white mb-2">Your Profile</h1>
            <p className="text-gray-300">{clerkEmail}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Tier</div>
            <div className="text-4xl font-bold text-cyan-400">{user.tier}</div>
          </div>
        </div>
      </div>

      {/* Stats and Achievements */}
      <ProfileStats />

      {/* Achievement Showcases */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/30 rounded-xl p-6">
        <ShowcaseGallery
          userId={user.id}
          currentUserId={user.id}
          allowUpload={true}
          availableBots={availableBots}
        />
      </div>

      {/* Admin Section - Collapsed by default */}
      <details className="bg-white/5 backdrop-blur-sm border border-gray-700/30 rounded-xl">
        <summary className="p-6 cursor-pointer text-white font-semibold hover:bg-white/5">
          🔧 Admin & Debug Info
        </summary>
        <div className="p-6 pt-0 space-y-4">
          <div className="bg-white/5 backdrop-blur-sm border border-gray-700/30 rounded-xl p-8">
        <h2 className="text-2xl font-orbitron font-bold text-white mb-6">Account Details</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Email in Database</label>
            <p className="text-lg text-white font-mono bg-gray-900/50 p-2 rounded">
              {user.email || 'NO EMAIL IN DATABASE'}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-500">Email from Clerk Session</label>
            <p className="text-lg text-cyan-300 font-mono bg-gray-900/50 p-2 rounded">
              {clerkEmail}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-500">User ID</label>
            <p className="text-sm text-gray-400 font-mono">{user.id}</p>
          </div>

          <div>
            <label className="text-sm text-gray-500">Clerk ID</label>
            <p className="text-sm text-gray-400 font-mono">{user.clerkId}</p>
          </div>

          <div>
            <label className="text-sm text-gray-500">Current Tier</label>
            <p className="text-lg text-white">Tier {user.tier}</p>
          </div>

          <div>
            <label className="text-sm text-gray-500">Admin Status</label>
            <p className={`text-lg font-bold ${isAdmin ? 'text-green-400' : 'text-red-400'}`}>
              {isAdmin ? '✅ Admin Access Granted' : '❌ Not an Admin'}
            </p>
          </div>

          {!isAdmin && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mt-4">
              <p className="text-yellow-300 text-sm">
                <strong>To get admin access:</strong><br />
                Add this email to your .env.local file:<br />
                <code className="block mt-2 bg-gray-900/50 p-2 rounded">
                  ADMIN_EMAILS={user.email}
                </code>
              </p>
            </div>
          )}

          {isAdmin && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mt-4">
              <p className="text-green-300 text-sm">
                <strong>✨ You have admin access!</strong><br />
                Visit <a href="/admin" className="underline hover:text-green-200">/admin</a> to access the admin panel.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
        <h3 className="text-lg font-orbitron font-bold text-blue-300 mb-2">🔍 Debug Info</h3>
        <div className="space-y-2 text-sm text-blue-200">
          <div>
            <strong>ADMIN_EMAILS from .env.local:</strong><br />
            <code className="bg-gray-900/50 px-2 py-1 rounded block mt-1">
              {process.env.ADMIN_EMAILS || 'NOT SET IN .env.local'}
            </code>
          </div>
          <div className="mt-3">
            <strong>Parsed admin emails array:</strong><br />
            <code className="bg-gray-900/50 px-2 py-1 rounded block mt-1">
              {adminEmails.length > 0 ? `[${adminEmails.map(e => `"${e}"`).join(', ')}]` : '[]'}
            </code>
          </div>
          <div className="mt-3">
            <strong>Match check:</strong><br />
            <code className="bg-gray-900/50 px-2 py-1 rounded block mt-1">
              DB Email: "{user.email}"<br />
              Matches: {adminEmails.map((e, i) => `"${e}" === "${user.email}" ? ${e === user.email}`).join(' | ')}
            </code>
          </div>
        </div>
      </div>
        </div>
      </details>
    </div>
  );
}

