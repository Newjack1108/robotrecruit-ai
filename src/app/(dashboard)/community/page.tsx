import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ForumCategoryCard } from '@/components/community/ForumCategoryCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, MessageSquare, UserPlus } from 'lucide-react';

export default async function CommunityPage() {
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

  // Fetch all categories with post counts
  const categories = await prisma.forumCategory.findMany({
    orderBy: {
      order: 'asc',
    },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  // Get total stats
  const totalPosts = await prisma.forumPost.count();
  const totalReplies = await prisma.forumReply.count();

  // Get recent activity (last 5 posts)
  const recentPosts = await prisma.forumPost.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      author: {
        select: {
          email: true,
        },
      },
      category: {
        select: {
          name: true,
          slug: true,
          icon: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-orbitron font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            💬 Community Forum
          </h1>
          <p className="text-xl text-gray-300">
            Connect, share tips, and learn from fellow bot enthusiasts
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>{totalPosts} Posts</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>{totalReplies} Replies</span>
            </div>
          </div>
        </div>

        {/* Friends & Social */}
        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/friends" className="group">
            <div className="bg-gradient-to-br from-purple-600/30 via-blue-600/20 to-cyan-500/20 border border-purple-400/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 hover:border-purple-300 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-orbitron font-bold text-white">Friends Lounge</h2>
                  <p className="text-sm text-gray-300">
                    Add fellow recruiters, compare streaks, and cheer each other on.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-gray-200">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">Track streaks together</span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">Share arcade high scores</span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">Friendly kudos & shout-outs</span>
              </div>
              <Button className="self-start bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white font-semibold">
                Open Friends
              </Button>
            </div>
          </Link>
        </div>

        {/* Categories Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-orbitron font-bold text-white">
              📚 Categories
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <ForumCategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-orbitron font-bold text-white mb-6">
            ⚡ Recent Activity
          </h2>

          <div className="space-y-3">
            {recentPosts.length === 0 ? (
              <div className="bg-gray-900/50 border border-gray-700/30 rounded-xl p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  No posts yet. Be the first to start a discussion!
                </p>
              </div>
            ) : (
              recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/community/${post.category.slug}/${post.id}`}
                  className="block"
                >
                  <div className="bg-gray-900/50 border border-gray-700/30 hover:border-cyan-500/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{post.category.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate hover:text-cyan-300 transition-colors">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span>{post.author.email.split('@')[0]}</span>
                          <span>•</span>
                          <span>{post.category.name}</span>
                          <span>•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

