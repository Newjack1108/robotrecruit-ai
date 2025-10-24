import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Calendar, Clock, Fish, ChefHat, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default async function ToolsPage() {
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

  // Get all tool data for user's conversations
  // @ts-expect-error - Prisma type needs refresh
  const toolData = await prisma.botToolData.findMany({
    where: {
      conversation: {
        userId: user.id,
      },
    },
    include: {
      conversation: {
        include: {
          bot: {
            select: {
              id: true,
              name: true,
              slug: true,
              avatarUrl: true,
              imageUrl: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Group by conversation
  const conversationsWithTools = toolData.reduce((acc: any, tool: any) => {
    const convId = tool.conversationId;
    if (!acc[convId]) {
      acc[convId] = {
        conversation: tool.conversation,
        tools: [],
      };
    }
    acc[convId].tools.push(tool);
    return acc;
  }, {});

  const sessions = Object.values(conversationsWithTools);

  const getBotIcon = (slug: string) => {
    switch (slug) {
      case 'chef-bot':
        return <ChefHat className="w-6 h-6 text-orange-400" />;
      case 'fishing-bot':
        return <Fish className="w-6 h-6 text-blue-400" />;
      case 'bee-bot':
        return <span className="text-2xl">🐝</span>;
      default:
        return <Clock className="w-6 h-6 text-cyan-400" />;
    }
  };

  const getToolSummary = (tools: any[]) => {
    const summaries: string[] = [];
    
    tools.forEach((tool: any) => {
      if (tool.toolType === 'timers') {
        summaries.push('🍳 Timers used');
      } else if (tool.toolType === 'ingredients') {
        const count = Array.isArray(tool.data) ? tool.data.length : 0;
        if (count > 0) summaries.push(`📝 ${count} ingredients`);
      } else if (tool.toolType === 'recipe') {
        if (tool.data) summaries.push('📖 Recipe notes');
      } else if (tool.toolType === 'venue') {
        if (tool.data) summaries.push(`📍 ${tool.data}`);
      } else if (tool.toolType === 'catches') {
        const count = Array.isArray(tool.data) ? tool.data.length : 0;
        if (count > 0) summaries.push(`🎣 ${count} catches`);
      } else if (tool.toolType === 'inspections') {
        const count = Array.isArray(tool.data) ? tool.data.length : 0;
        if (count > 0) summaries.push(`🐝 ${count} inspections`);
      }
    });
    
    return summaries.join(' • ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white font-orbitron mb-2 flex items-center gap-3">
            <Clock className="w-10 h-10 text-cyan-400" />
            Bot Tools Dashboard
          </h1>
          <p className="text-gray-400">
            View and access all your bot-specific tool sessions
          </p>
        </div>

        {/* Tool Sessions */}
        {sessions.length === 0 ? (
          <Card className="p-12 bg-gray-900/50 border-gray-700 text-center">
            <div className="text-6xl mb-4">🛠️</div>
            <h3 className="text-2xl font-semibold text-white mb-2">No Tool Data Yet</h3>
            <p className="text-gray-400 mb-6">
              Start using bot-specific tools in your conversations with Chef Bot, Fishing Bot, or Bee Bot!
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-all"
            >
              Start Chatting
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {sessions.map((session: any) => {
              const bot = session.conversation.bot;
              const lastUpdated = new Date(
                Math.max(...session.tools.map((t: any) => new Date(t.updatedAt).getTime()))
              );

              return (
                <Link
                  key={session.conversation.id}
                  href={`/chat?bot=${bot.slug}&conversation=${session.conversation.id}`}
                >
                  <Card className="p-6 bg-gray-900/50 border-gray-700 hover:border-cyan-500/50 transition-all cursor-pointer group">
                    <div className="flex items-start gap-4">
                      {/* Bot Avatar */}
                      <div className="relative">
                        <img
                          src={bot.avatarUrl || bot.imageUrl}
                          alt={bot.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500/30 group-hover:border-cyan-500 transition-all"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-1 border-2 border-cyan-500/30">
                          {getBotIcon(bot.slug)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-semibold text-white font-orbitron">
                            {bot.name}
                          </h3>
                          <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                        </div>

                        {/* Tool Summary */}
                        <p className="text-gray-400 text-sm mb-3">
                          {getToolSummary(session.tools)}
                        </p>

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {lastUpdated.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lastUpdated.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div className="bg-gray-800 px-2 py-1 rounded">
                            {session.tools.length} tool{session.tools.length !== 1 ? 's' : ''} used
                          </div>
                        </div>

                        {/* Detailed Data Preview */}
                        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {session.tools.slice(0, 4).map((tool: any, idx: number) => (
                              <div key={idx} className="text-gray-400">
                                <span className="text-cyan-400 font-medium">
                                  {tool.toolType}:
                                </span>{' '}
                                {tool.toolType === 'ingredients' && Array.isArray(tool.data) && (
                                  <span>{tool.data.length} items</span>
                                )}
                                {tool.toolType === 'catches' && Array.isArray(tool.data) && (
                                  <span>{tool.data.length} logged</span>
                                )}
                                {tool.toolType === 'inspections' && Array.isArray(tool.data) && (
                                  <span>{tool.data.length} completed</span>
                                )}
                                {tool.toolType === 'venue' && typeof tool.data === 'string' && (
                                  <span className="truncate">{tool.data}</span>
                                )}
                                {tool.toolType === 'recipe' && typeof tool.data === 'string' && (
                                  <span>Notes saved</span>
                                )}
                                {tool.toolType === 'timers' && <span>Active</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

