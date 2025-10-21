'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Medal, Award, Timer, MousePointerClick } from 'lucide-react';
import { formatTime } from '@/lib/arcade-utils';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  tier: number;
  score: number;
  moves: number;
  timeSeconds: number;
  createdAt: string;
}

interface LeaderboardProps {
  gameType?: string;
  period?: 'daily' | 'weekly' | 'alltime';
  limit?: number;
  showStats?: boolean;
}

export function Leaderboard({
  gameType = 'bot_memory_match',
  period = 'daily',
  limit = 10,
  showStats = true
}: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [gameType, period, limit]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/arcade/leaderboard?gameType=${gameType}&period=${period}&limit=${limit}`
      );
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
  };

  const getTierBadge = (tier: number) => {
    const colors = {
      1: 'bg-gray-600',
      2: 'bg-blue-600',
      3: 'bg-purple-600'
    };
    const labels = {
      1: 'Free',
      2: 'Pro',
      3: 'Premium'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-bold ${colors[tier as keyof typeof colors]}`}>
        {labels[tier as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700/50 rounded" />
          ))}
        </div>
      </Card>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700 p-6 text-center">
        <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No scores yet. Be the first to play!</p>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700 overflow-hidden">
      <div className="space-y-1">
        {leaderboard.map((entry, index) => (
          <div
            key={`${entry.userId}-${entry.createdAt}`}
            className={`
              p-4 flex items-center gap-4 transition-colors
              ${index < 3 ? 'bg-gradient-to-r from-cyan-900/20 to-transparent' : ''}
              ${index % 2 === 0 ? 'bg-gray-900/20' : 'bg-gray-900/10'}
              hover:bg-cyan-900/10
            `}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-12 flex justify-center">
              {getRankIcon(entry.rank)}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white truncate">{entry.userName}</span>
                {getTierBadge(entry.tier)}
              </div>
            </div>

            {/* Stats */}
            {showStats && (
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-400">
                  <MousePointerClick className="w-4 h-4" />
                  <span>{entry.moves}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <Timer className="w-4 h-4" />
                  <span>{formatTime(entry.timeSeconds)}</span>
                </div>
              </div>
            )}

            {/* Score */}
            <div className="flex-shrink-0">
              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {entry.score}
                </div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

