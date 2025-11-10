import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DailyPuzzleGame } from '@/components/arcade/DailyPuzzleGame';
import { ArrowLeft, Puzzle, Trophy } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DailyPuzzlePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-850 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Puzzle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-orbitron font-bold text-white">Daily Strategy Puzzle</h1>
              <p className="text-gray-400 text-sm">Check in each day, solve the puzzle, and keep your streak alive.</p>
            </div>
          </div>

          <Link href="/arcade" className="self-start md:self-center">
            <Button variant="ghost" className="text-gray-300 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Arcade
            </Button>
          </Link>
        </div>

        <div className="bg-gray-900/60 border border-cyan-500/30 rounded-xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Daily Rewards
              </h2>
              <p className="text-sm text-gray-400 max-w-2xl">
                Finish the daily puzzle to secure your streak bonus, earn arcade points, and unlock limited-time powerup credits. Puzzles reset every day at midnight UTC.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
              <div className="bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2 text-center">
                <p className="text-sm text-white font-semibold">+25</p>
                <p>Arcade Points</p>
              </div>
              <div className="bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2 text-center">
                <p className="text-sm text-white font-semibold">+1</p>
                <p>Powerup Credit</p>
              </div>
              <div className="bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2 text-center">
                <p className="text-sm text-white font-semibold">Streak</p>
                <p>Daily Check-In</p>
              </div>
              <div className="bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2 text-center">
                <p className="text-sm text-white font-semibold">Leaderboard</p>
                <p>Coming Soon</p>
              </div>
            </div>
          </div>
        </div>

        <DailyPuzzleGame />
      </div>
    </div>
  );
}

