import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import ShowcaseGallery from '@/components/showcases/ShowcaseGallery';

export default async function CommunityShowcasesPage() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Community Showcases
          </h1>
          <p className="text-gray-400 text-lg">
            See what amazing achievements our community has accomplished with their AI bots! 🎉
          </p>
        </div>

        {/* Featured Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⭐</span>
            <h2 className="text-2xl font-bold text-white">Featured Achievements</h2>
          </div>
          <ShowcaseGallery currentUserId={user.id} />
        </div>
      </div>
    </div>
  );
}

