import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { BotFileManager } from '@/components/bots/BotFileManager';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BotFilesPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BotFilesPage({ params }: BotFilesPageProps) {
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

  const { slug } = await params;

  const bot = await prisma.bot.findUnique({
    where: { slug },
    include: {
      files: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!bot) {
    redirect('/bots');
  }

  // Check if user owns the bot
  if (bot.creatorId !== user.id && bot.isSystemBot) {
    redirect('/bots');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/bots"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">{bot.name} - Knowledge Base</h1>
          <p className="text-gray-400">Upload files to enhance your bot's knowledge</p>
        </div>
      </div>

      <BotFileManager bot={bot} initialFiles={bot.files} />
    </div>
  );
}



