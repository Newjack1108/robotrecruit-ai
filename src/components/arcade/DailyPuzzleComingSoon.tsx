'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, CalendarCheck, Sparkles } from 'lucide-react';

type PuzzleResponse = {
  puzzle: {
    id: string;
    date: string;
    config: Record<string, any>;
    hasSolution: boolean;
  };
  submission: {
    score: number;
    moves: number | null;
    durationSeconds: number | null;
    completedAt: string;
  } | null;
};

export function DailyPuzzleComingSoon() {
  const [data, setData] = useState<PuzzleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPuzzle() {
      try {
        const response = await fetch('/api/arcade/daily-puzzle');

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const json = (await response.json()) as PuzzleResponse;
        if (isMounted) {
          setData(json);
        }
      } catch (err) {
        if (isMounted) {
          setError('Unable to load today\'s puzzle. Please try again soon.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPuzzle();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-gray-900/60 border-cyan-500/30 p-6 flex flex-col items-center justify-center text-center min-h-[220px]">
        <Loader2 className="w-8 h-8 text-cyan-300 animate-spin mb-3" />
        <p className="text-sm text-gray-400">Preparing today&apos;s puzzle...</p>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-gray-900/60 border-red-500/30 p-6 text-center min-h-[220px]">
        <p className="text-sm text-red-300">{error ?? 'Something went wrong. Please try again later.'}</p>
      </Card>
    );
  }

  const puzzleDate = new Date(data.puzzle.date);
  const formattedDate = puzzleDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const hasCompleted = Boolean(data.submission);

  return (
    <Card className="bg-gray-900/60 border-cyan-500/30 p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6 text-cyan-300" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Today&apos;s Puzzle</h2>
            <p className="text-sm text-gray-400">{formattedDate}</p>
          </div>
        </div>

        {hasCompleted ? (
          <div className="flex items-center gap-2 text-emerald-300 text-sm bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-lg">
            <Sparkles className="w-4 h-4" />
            <span>Puzzle completed — great job!</span>
          </div>
        ) : (
          <div className="text-sm text-gray-300 bg-gray-800/60 border border-gray-700 px-3 py-2 rounded-lg">
            Puzzle challenge unlocks soon. Check back later today!
          </div>
        )}
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
        <p className="text-sm text-gray-300">
          We&apos;re finishing up the new daily puzzle experience. Your progress will count toward streaks and arcade points as soon as it launches.
        </p>
        <ul className="text-sm text-gray-400 list-disc list-inside space-y-1">
          <li>One puzzle every day — short, strategic, and mobile-friendly.</li>
          <li>Complete it to boost your daily streak and earn arcade rewards.</li>
          <li>Leaderboards and history tracking arrive with the launch.</li>
        </ul>
      </div>
    </Card>
  );
}

