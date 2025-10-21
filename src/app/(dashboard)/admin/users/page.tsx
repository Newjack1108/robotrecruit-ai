import { prisma } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CreditCard, Calendar, MessageSquare, Bot } from 'lucide-react';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      _count: {
        select: {
          conversations: true,
          customBots: true,
          tickets: true,
        },
      },
    },
  });

  const getTierBadge = (tier: number) => {
    const badges = {
      1: { name: 'Free', color: 'bg-gray-700 text-gray-300' },
      2: { name: 'Pro', color: 'bg-blue-600 text-blue-100' },
      3: { name: 'Premium', color: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' },
    };
    return badges[tier as keyof typeof badges] || badges[1];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-orbitron font-bold text-white mb-2">User Management</h2>
        <p className="text-gray-400">View and manage all registered users</p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-white/5 backdrop-blur-sm border border-gray-700/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white">{users.length}</p>
              </div>
              <Users className="w-10 h-10 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border border-gray-700/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pro Users</p>
                <p className="text-3xl font-bold text-blue-400">
                  {users.filter((u) => u.tier === 2).length}
                </p>
              </div>
              <CreditCard className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border border-gray-700/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Premium Users</p>
                <p className="text-3xl font-bold text-purple-400">
                  {users.filter((u) => u.tier === 3).length}
                </p>
              </div>
              <CreditCard className="w-10 h-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border border-gray-700/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Chats</p>
                <p className="text-3xl font-bold text-green-400">
                  {users.reduce((sum, u) => sum + u._count.conversations, 0)}
                </p>
              </div>
              <MessageSquare className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-white/5 backdrop-blur-sm border border-gray-700/30">
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-orbitron text-sm">User</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-orbitron text-sm">Tier</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-orbitron text-sm">Stripe</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-orbitron text-sm">Chats</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-orbitron text-sm">Bots</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-orbitron text-sm">Tickets</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-orbitron text-sm">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const tierBadge = getTierBadge(user.tier);
                  const hasPromo = user.promoTierUpgrade && user.promoExpiresAt && new Date(user.promoExpiresAt) > new Date();
                  
                  return (
                    <tr key={user.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-medium">{user.email}</p>
                          <p className="text-xs text-gray-500 font-mono">{user.clerkId.substring(0, 20)}...</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <Badge className={`${tierBadge.color} font-semibold`}>
                            {tierBadge.name}
                          </Badge>
                          {hasPromo && (
                            <Badge className="bg-green-600/20 text-green-400 border-green-500/50 border">
                              Promo: Tier {user.promoTierUpgrade}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {user.stripeCustomerId ? (
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-green-400" />
                            <span className="text-xs text-gray-400 font-mono">
                              {user.stripeCustomerId.substring(0, 15)}...
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-600 text-sm">No payment</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-cyan-400 font-bold">{user._count.conversations}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-purple-400 font-bold">{user._count.customBots}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-orange-400 font-bold">{user._count.tickets}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Calendar className="w-4 h-4" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



