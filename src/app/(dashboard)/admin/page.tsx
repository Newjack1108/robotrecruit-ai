import { prisma } from '@/lib/db';
import { Bot, Users, MessageSquare } from 'lucide-react';

export default async function AdminDashboard() {
  const [botCount, userCount, conversationCount] = await Promise.all([
    prisma.bot.count(),
    prisma.user.count(),
    prisma.conversation.count(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-orbitron font-bold text-white mb-2">Dashboard</h2>
        <p className="text-gray-400">Welcome to the admin panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/20 rounded-lg">
              <Bot className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Bots</p>
              <p className="text-3xl font-bold text-white">{botCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-white">{userCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <MessageSquare className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Conversations</p>
              <p className="text-3xl font-bold text-white">{conversationCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



