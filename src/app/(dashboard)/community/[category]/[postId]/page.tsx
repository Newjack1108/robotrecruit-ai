import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ForumPostDetail } from '@/components/community/ForumPostDetail';
import { ForumReplyForm } from '@/components/community/ForumReplyForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ category: string; postId: string }>;
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

  const { category: categorySlug, postId } = await params;

  // Fetch post with replies
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          tier: true,
        },
      },
      category: {
        select: {
          name: true,
          slug: true,
          icon: true,
        },
      },
      replies: {
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              tier: true,
            },
          },
        },
      },
    },
  });

  if (!post) {
    redirect('/community');
  }

  // Increment view count (fire and forget)
  fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/forum/posts/${postId}/views`, {
    method: 'POST',
  }).catch(() => {
    // Ignore errors
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Link href={`/community/${categorySlug}`}>
            <Button
              variant="outline"
              className="mb-4 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 hover:border-gray-600 text-gray-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {post.category.name}
            </Button>
          </Link>
        </div>

        {/* Post Detail */}
        <ForumPostDetail post={post} currentUserId={user.id} />

        {/* Reply Form */}
        {!post.isLocked && (
          <div className="bg-gray-900/50 border border-gray-700/30 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-orbitron font-bold text-white mb-4">
              💬 Add Your Reply
            </h3>
            <ForumReplyForm postId={postId} />
          </div>
        )}

        {post.isLocked && (
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-6 text-center">
            <p className="text-yellow-400">
              🔒 This post is locked and cannot accept new replies.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

