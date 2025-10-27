'use client';

import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, BarChart3, Target, Zap, Heart, Clock } from 'lucide-react';
import Link from 'next/link';

interface BotRunnerGameOverModalProps {
  score: number;
  stats: {
    tasksCollected: number;
    totalTasks: number;
    bugsDebugged: number;
    livesRemaining: number;
    timeRemaining: number;
    rating: string;
  };
  onPlayAgain: () => void;
}

export function BotRunnerGameOverModal({
  score,
  stats,
  onPlayAgain,
}: BotRunnerGameOverModalProps) {
  const completionRate = Math.round((stats.tasksCollected / stats.totalTasks) * 100);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-cyan-500/50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-cyan-500/20 rounded-full mb-4">
            <Trophy className="w-12 h-12 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-orbitron font-bold text-white mb-2">
            Game Over!
          </h2>
          <p className="text-xl text-cyan-400 font-bold">{stats.rating}</p>
        </div>

        {/* Score */}
        <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-xl p-6 mb-6 text-center">
          <p className="text-sm text-gray-400 mb-1">Final Score</p>
          <p className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {score.toLocaleString()}
          </p>
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              <span className="text-gray-300">Tasks Collected</span>
            </div>
            <span className="font-bold text-white">
              {stats.tasksCollected}/{stats.totalTasks} ({completionRate}%)
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-400" />
              <span className="text-gray-300">Bugs Debugged</span>
            </div>
            <span className="font-bold text-white">{stats.bugsDebugged}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="text-gray-300">Lives Remaining</span>
            </div>
            <span className="font-bold text-white">{stats.livesRemaining}/3</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300">Time Remaining</span>
            </div>
            <span className="font-bold text-white">{stats.timeRemaining}s</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={onPlayAgain}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-bold py-6"
            size="lg"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>

          <Link href="/arcade" className="block">
            <Button
              variant="outline"
              className="w-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Leaderboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

