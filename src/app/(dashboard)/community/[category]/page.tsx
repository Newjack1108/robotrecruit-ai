import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ForumPostCard } from '@/components/community/ForumPostCard';
import { CategoryPageClient } from '@/components/community/CategoryPageClient';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
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

  const { category: categorySlug } = await params;

  // Find category
  const category = await prisma.forumCategory.findUnique({
    where: { slug: categorySlug },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  if (!category) {
    redirect('/community');
  }

  // Fetch posts for this category
  const posts = await prisma.forumPost.findMany({
    where: {
      categoryId: category.id,
    },
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
          slug: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Link href="/community">
            <Button
              variant="outline"
              className="mb-4 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 hover:border-gray-600 text-gray-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Categories
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{category.icon}</span>
            <div>
              <h1 className="text-4xl font-orbitron font-bold text-white">
                {category.name}
              </h1>
              <p className="text-gray-400 mt-1">{category.description}</p>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            {category._count.posts} {category._count.posts === 1 ? 'post' : 'posts'}
          </div>
        </div>

        {/* Client-side interactive section */}
        <CategoryPageClient categorySlug={categorySlug} posts={posts} />
      </div>
    </div>
  );
}
