import { prisma } from '@/lib/db';
import { BotEditFormWrapper } from '@/components/admin/BotEditFormWrapper';

export default async function AdminBotsPage() {
  const bots = await prisma.bot.findMany({
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      _count: {
        select: {
          conversations: true,
        },
      },
    },
  });

  // Get unique user count per bot
  const botsWithUserCounts = await Promise.all(
    bots.map(async (bot) => {
      const uniqueUsers = await prisma.conversation.findMany({
        where: { botId: bot.id },
        distinct: ['userId'],
        select: { userId: true },
      });
      
      return {
        ...bot,
        uniqueUserCount: uniqueUsers.length,
      };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-orbitron font-bold text-white mb-2">Manage Bots</h2>
        <p className="text-gray-400">Update OpenAI Assistant IDs and bot configurations</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {botsWithUserCounts.map((bot) => (
          <div
            key={bot.id}
            className="bg-white/5 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6"
          >
            <div className="flex items-start gap-6">
              <img
                src={bot.imageUrl}
                alt={bot.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-orbitron font-bold text-white">{bot.name}</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">{bot.uniqueUserCount}</div>
                      <div className="text-xs text-gray-500">Active Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{bot._count.conversations}</div>
                      <div className="text-xs text-gray-500">Total Chats</div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 mb-4">{bot.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Slug:</span>
                    <span className="text-white ml-2 font-mono">{bot.slug}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tier:</span>
                    <span className="text-white ml-2">{bot.tier}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Knowledge Area:</span>
                    <span className="text-white ml-2">{bot.knowledgeArea}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <BotEditFormWrapper bot={bot} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

