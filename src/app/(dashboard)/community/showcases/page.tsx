import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import ShowcaseGallery from '@/components/showcases/ShowcaseGallery';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function CommunityShowcasesPage({
  searchParams,
}: {
  searchParams: Promise<{ bot?: string }>;
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

  const params = await searchParams;
  const botSlug = params.bot;
  
  let selectedBot = null;
  if (botSlug) {
    selectedBot = await prisma.bot.findUnique({
      where: { slug: botSlug },
      select: { id: true, name: true, slug: true, avatarUrl: true },
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {selectedBot && (
            <Link 
              href={`/bots/${selectedBot.slug}`}
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {selectedBot.name}'s CV
            </Link>
          )}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            {selectedBot ? `${selectedBot.name} Success Stories` : 'Community Showcases'}
          </h1>
          <p className="text-gray-400 text-lg">
            {selectedBot 
              ? `See achievements made with ${selectedBot.name}'s help! 🎉`
              : 'See what amazing achievements our community has accomplished with their AI bots! 🎉'
            }
          </p>
        </div>

        {/* Showcases */}
        <div className="mb-8">
          <ShowcaseGallery 
            currentUserId={user.id}
            botId={selectedBot?.id}
          />
        </div>
      </div>
    </div>
  );
}

